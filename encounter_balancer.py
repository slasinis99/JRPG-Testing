#!/usr/bin/env python3
"""
JRPG Encounter Balancer
=======================

A project-specific balancing helper for RPG Maker MZ.

What it does
------------
- Reads the RPG Maker database JSON directly from either a /data folder or a ZIP
  containing the JSON files.
- Reads key custom plugin constants from either a /js/plugins folder or a ZIP
  containing the JS files.
- Mirrors the formulas from SL_JobLevelStats.js and SL_DamageFormulas.js.
- Parses class notetags such as <JobStatFormula: Warrior> and <SL Attack Hits>.
- Estimates level-appropriate party baselines.
- Recommends enemy MHP, MMP, ATK, DEF, MAT, MDF, and AGI from design targets.

Typical project usage
---------------------
From inside your RPG Maker project root:

    python jrpg_encounter_balancer.py recommend --level 25 --damage-pct 0.18 --attacker physical

Using exported ZIPs:

    python jrpg_encounter_balancer.py --data _data.zip --plugins _plugins.zip baseline --level 25

Run with no command for an interactive menu:

    python jrpg_encounter_balancer.py

Notes
-----
- The script intentionally does not edit Enemies.json in place. It prints an
  editor params array as a fallback and a recommended enemy stat notetag for
  true values that can exceed RPG Maker editor limits.
- When inspecting existing enemies, enemy stats are read from notetags first and
  the editor params array is used only as a fallback for missing values.
- Accessories are ignored for normal defensive baselines by default because this
  project's balancing guideline treats accessories as build utility rather than
  expected raw DEF/MDF progression.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import re
import statistics
import sys
import zipfile
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Iterable, Literal

STAT_NAMES = ("MHP", "MMP", "ATK", "DEF", "MAT", "MDF", "AGI")
RMMZ_PARAM_ORDER = ("MHP", "MMP", "ATK", "DEF", "MAT", "MDF", "AGI", "LUK")

# ---------------------------------------------------------------------------
# Baked fallback constants. These are used only if plugin parsing fails.
# The script still attempts to read the actual current plugins first.
# ---------------------------------------------------------------------------

FALLBACK_MILESTONE_LEVELS = [1, 10, 25, 50, 75, 99, 125, 150, 199, 300, 500, 750, 999]

FALLBACK_MILESTONE_MIN = {
    "MHP": {1: 220, 10: 480, 25: 950, 50: 1750, 75: 2700, 99: 3800, 125: 5800, 150: 8000, 199: 12500, 300: 18500, 500: 28000, 750: 38000, 999: 46000},
    "MMP": {1: 25, 10: 60, 25: 130, 50: 260, 75: 420, 99: 620, 125: 900, 150: 1250, 199: 1900, 300: 2700, 500: 3700, 750: 4600, 999: 5300},
    "ATK": {1: 14, 10: 35, 25: 80, 50: 170, 75: 300, 99: 475, 125: 700, 150: 950, 199: 1400, 300: 1900, 500: 2600, 750: 3200, 999: 3700},
    "DEF": {1: 12, 10: 30, 25: 65, 50: 130, 75: 220, 99: 330, 125: 500, 150: 700, 199: 1050, 300: 1500, 500: 2100, 750: 2650, 999: 3100},
    "MAT": {1: 14, 10: 35, 25: 80, 50: 170, 75: 300, 99: 475, 125: 700, 150: 950, 199: 1400, 300: 1900, 500: 2600, 750: 3200, 999: 3700},
    "MDF": {1: 12, 10: 30, 25: 65, 50: 130, 75: 220, 99: 330, 125: 500, 150: 700, 199: 1050, 300: 1500, 500: 2100, 750: 2650, 999: 3100},
    "AGI": {1: 16, 10: 24, 25: 36, 50: 52, 75: 66, 99: 80, 125: 95, 150: 110, 199: 135, 300: 155, 500: 175, 750: 190, 999: 200},
}

FALLBACK_MULTIPLIERS = {
    "Warrior":       {"MHP": 1.35, "MMP": 0.70, "ATK": 1.45, "DEF": 1.25, "MAT": 0.60, "MDF": 0.95, "AGI": 1.10},
    "Knight":        {"MHP": 1.50, "MMP": 0.75, "ATK": 1.20, "DEF": 1.55, "MAT": 0.55, "MDF": 1.20, "AGI": 1.00},
    "Dark Knight":   {"MHP": 1.40, "MMP": 0.90, "ATK": 1.55, "DEF": 1.20, "MAT": 0.95, "MDF": 1.05, "AGI": 1.05},
    "Monk":          {"MHP": 1.25, "MMP": 0.65, "ATK": 1.30, "DEF": 1.15, "MAT": 0.65, "MDF": 1.15, "AGI": 1.30},
    "Dragoon":       {"MHP": 1.30, "MMP": 0.70, "ATK": 1.40, "DEF": 1.20, "MAT": 0.55, "MDF": 0.95, "AGI": 1.20},
    "Ranger":        {"MHP": 1.15, "MMP": 0.80, "ATK": 1.25, "DEF": 1.05, "MAT": 0.65, "MDF": 1.00, "AGI": 1.40},
    "Thief":         {"MHP": 1.05, "MMP": 0.75, "ATK": 1.10, "DEF": 1.00, "MAT": 0.60, "MDF": 0.95, "AGI": 1.60},
    "Gunslinger":    {"MHP": 1.10, "MMP": 0.80, "ATK": 1.35, "DEF": 1.00, "MAT": 0.65, "MDF": 0.95, "AGI": 1.25},
    "Priest":        {"MHP": 1.10, "MMP": 1.30, "ATK": 0.75, "DEF": 1.05, "MAT": 1.15, "MDF": 1.45, "AGI": 1.05},
    "White Mage":    {"MHP": 1.00, "MMP": 1.45, "ATK": 0.60, "DEF": 1.00, "MAT": 1.20, "MDF": 1.50, "AGI": 1.10},
    "Black Mage":    {"MHP": 1.00, "MMP": 1.50, "ATK": 0.55, "DEF": 0.95, "MAT": 1.55, "MDF": 1.25, "AGI": 1.00},
    "Red Mage":      {"MHP": 1.15, "MMP": 1.15, "ATK": 1.05, "DEF": 1.10, "MAT": 1.15, "MDF": 1.15, "AGI": 1.20},
}

FALLBACK_GROWTH_SHAPES = {
    "MHP": "smooth",
    "MMP": "smooth_late",
    "ATK": "smooth_early",
    "DEF": "linear_soft",
    "MAT": "smooth_early",
    "MDF": "linear_soft",
    "AGI": "linear",
}

FALLBACK_DAMAGE_SETTINGS = {
    "minimum_damage": 1,
    "minimum_mitigation_rate": 0.05,
    "maximum_mitigation_rate": 1.00,
    "player_physical_offense_coef": 8.00,
    "player_magical_offense_coef": 8.00,
    "player_level_coef": 25.00,
    "player_physical_defense_divisor": 20.00,
    "player_magical_defense_divisor": 20.00,
    "enemy_physical_offense_coef": 2.50,
    "enemy_magical_offense_coef": 2.50,
    "enemy_level_coef": 12.00,
    "enemy_physical_defense_divisor": 8.00,
    "enemy_magical_defense_divisor": 8.00,
}

FALLBACK_XP_MILESTONE_LEVELS = [1, 10, 25, 50, 75, 99, 125, 150, 199, 300, 500, 750, 999]

FALLBACK_XP_TO_NEXT_MILESTONE = {
    1: 25,
    10: 105,
    25: 520,
    50: 2200,
    75: 6200,
    99: 14000,
    125: 32000,
    150: 70000,
    199: 220000,
    300: 650000,
    500: 900000,
    750: 1200000,
    999: 1500000,
}

# Approximate target pacing for a full, level-appropriate normal encounter.
# A single recommended enemy is treated as the full encounter by default. For a
# troop of three equal enemies, use xp_share ~= 0.333 for each enemy.
FALLBACK_BATTLES_PER_LEVEL = [
    (1, 5.0),
    (10, 6.0),
    (25, 8.0),
    (50, 10.0),
    (75, 12.0),
    (99, 14.0),
    (125, 16.0),
    (150, 18.0),
    (199, 22.0),
    (300, 30.0),
    (500, 40.0),
    (750, 55.0),
    (999, 70.0),
]

# Actor share values are the actor/class portion of Total ATK or MAT.
# Total offensive stat = Actor/Class stat / Actor Share.
ATK_ACTOR_SHARE_TABLE = {
    "Warrior":       [(1, .75), (25, .70), (50, .65), (75, .60), (99, .58)],
    "Knight":        [(1, .80), (25, .77), (50, .74), (75, .72), (99, .70)],
    "Dark Knight":   [(1, .70), (25, .60), (50, .52), (75, .45), (99, .40)],
    "Monk":          [(1, .85), (25, .87), (50, .88), (75, .89), (99, .90)],
    "Dragoon":       [(1, .75), (25, .70), (50, .67), (75, .64), (99, .62)],
    "Ranger":        [(1, .80), (25, .78), (50, .76), (75, .76), (99, .76)],
    "Thief":         [(1, .88), (25, .88), (50, .88), (75, .88), (99, .88)],
    "Gunslinger":    [(1, .82), (25, .80), (50, .78), (75, .78), (99, .78)],
    "Priest":        [(1, .90), (25, .90), (50, .88), (75, .88), (99, .88)],
    "White Mage":    [(1, .95), (25, .95), (50, .95), (75, .95), (99, .95)],
    "Black Mage":    [(1, .95), (25, .95), (50, .95), (75, .95), (99, .95)],
    "Red Mage":      [(1, .80), (25, .75), (50, .72), (75, .70), (99, .70)],
}

MAT_ACTOR_SHARE_TABLE = {
    "Warrior":       [(1, .95), (99, .95)],
    "Knight":        [(1, .95), (99, .95)],
    "Monk":          [(1, .95), (99, .95)],
    "Dragoon":       [(1, .95), (99, .95)],
    "Ranger":        [(1, .95), (99, .95)],
    "Thief":         [(1, .95), (99, .95)],
    "Gunslinger":    [(1, .95), (99, .95)],
    "Dark Knight":   [(1, .85), (25, .80), (50, .75), (75, .70), (99, .65)],
    "Priest":        [(1, .75), (25, .70), (50, .66), (75, .62), (99, .60)],
    "White Mage":    [(1, .75), (25, .70), (50, .65), (75, .60), (99, .58)],
    "Black Mage":    [(1, .70), (25, .65), (50, .60), (75, .55), (99, .50)],
    "Red Mage":      [(1, .80), (25, .75), (50, .70), (75, .65), (99, .62)],
}

DEFAULT_MARTIAL_CLASSES = [
    "Warrior", "Knight", "Dark Knight", "Monk", "Dragoon", "Ranger", "Thief", "Gunslinger", "Red Mage"
]
DEFAULT_CASTER_CLASSES = ["Priest", "White Mage", "Black Mage", "Red Mage"]

# This is used only for estimating expected defensive equipment. It is not a
# replacement for reading real armor once you have armor fully populated.
ARMOR_MULTIPLIERS = {
    "General Armor": {"DEF": 1.00, "MDF": 1.00},
    "Light Armor":   {"DEF": 0.75, "MDF": 0.80},
    "Heavy Armor":   {"DEF": 1.40, "MDF": 0.80},
    "Magic Armor":   {"DEF": 0.625, "MDF": 1.50},
    "Shield":        {"DEF": 0.475, "MDF": 0.375},
    "Accessory":     {"DEF": 0.075, "MDF": 0.10},
}

CLASS_DEFENSIVE_GEAR = {
    "Warrior":       ["Heavy Armor", "General Armor"],
    "Knight":        ["Heavy Armor", "Shield"],
    "Dark Knight":   ["Heavy Armor", "General Armor"],
    "Monk":          ["Light Armor", "General Armor"],
    "Dragoon":       ["Heavy Armor", "General Armor"],
    "Ranger":        ["Light Armor", "General Armor"],
    "Thief":         ["Light Armor"],
    "Gunslinger":    ["Light Armor", "General Armor"],
    "Priest":        ["Magic Armor", "General Armor"],
    "White Mage":    ["Magic Armor"],
    "Black Mage":    ["Magic Armor"],
    "Red Mage":      ["General Armor", "Magic Armor", "Light Armor"],
}

STAT_PROFILE_MULTIPLIERS = {
    "paper": 0.50,
    "squishy": 0.65,
    "lightweight": 0.82,
    "medium": 1.00,
    "bulky": 1.20,
    "tanky": 1.45,
    "wall": 1.70,
}

HP_PROFILE_MULTIPLIERS = {
    "paper": 0.50,
    "squishy": 0.70,
    "lightweight": 0.85,
    "medium": 1.00,
    "bulky": 1.25,
    "tanky": 1.55,
    "elite": 2.10,
    "boss": 3.25,
}

SPEED_PROFILE_MULTIPLIERS = {
    "very_slow": 0.65,
    "slow": 0.80,
    "steady": 0.92,
    "average": 1.00,
    "quick": 1.15,
    "fast": 1.35,
    "very_fast": 1.55,
}

MMP_ATTACKER_MULTIPLIERS = {
    "physical": 0.15,
    "magical": 0.85,
    "hybrid": 0.55,
}

# ---------------------------------------------------------------------------
# File access
# ---------------------------------------------------------------------------

class ProjectFileError(RuntimeError):
    pass


class FileSource:
    """Read database/plugin files from either a folder or a ZIP archive."""

    def __init__(self, path: str | Path | None, default_folder: str):
        if path is None:
            # Prefer local RPG Maker-style folders, then current directory.
            candidates = [Path.cwd() / default_folder, Path.cwd()]
        else:
            candidates = [Path(path)]

        self.path: Path | None = None
        self.kind: Literal["dir", "zip", "missing"] = "missing"
        self._zip: zipfile.ZipFile | None = None

        for candidate in candidates:
            if candidate.is_dir():
                self.path = candidate
                self.kind = "dir"
                return
            if candidate.is_file() and candidate.suffix.lower() == ".zip":
                self.path = candidate
                self.kind = "zip"
                self._zip = zipfile.ZipFile(candidate)
                return

    def exists(self, name: str) -> bool:
        if self.kind == "dir" and self.path:
            return (self.path / name).exists()
        if self.kind == "zip" and self._zip:
            return name in self._zip.namelist() or any(p.endswith("/" + name) for p in self._zip.namelist())
        return False

    def read_text(self, name: str, required: bool = True) -> str | None:
        if self.kind == "dir" and self.path:
            path = self.path / name
            if path.exists():
                return path.read_text(encoding="utf-8-sig")
        elif self.kind == "zip" and self._zip:
            names = self._zip.namelist()
            chosen = None
            if name in names:
                chosen = name
            else:
                suffix = "/" + name
                matches = [p for p in names if p.endswith(suffix)]
                if matches:
                    chosen = matches[0]
            if chosen:
                return self._zip.read(chosen).decode("utf-8-sig")

        if required:
            where = str(self.path) if self.path else "<missing>"
            raise ProjectFileError(f"Could not read {name!r} from {where}.")
        return None

    def read_json(self, name: str, required: bool = True) -> Any:
        text = self.read_text(name, required=required)
        if text is None:
            return None
        return json.loads(text)


@dataclass
class Database:
    classes: list[dict[str, Any]] = field(default_factory=list)
    skills: list[dict[str, Any]] = field(default_factory=list)
    enemies: list[dict[str, Any]] = field(default_factory=list)
    system: dict[str, Any] = field(default_factory=dict)

    @classmethod
    def load(cls, source: FileSource) -> "Database":
        return cls(
            classes=source.read_json("Classes.json"),
            skills=source.read_json("Skills.json"),
            enemies=source.read_json("Enemies.json", required=False) or [],
            system=source.read_json("System.json", required=False) or {},
        )


# ---------------------------------------------------------------------------
# Plugin parsing and formula mirroring
# ---------------------------------------------------------------------------

def normalize_name(name: str | None) -> str:
    return re.sub(r"[^a-z0-9]", "", str(name or "").strip().lower())


def round_half_to_even(value: float) -> int:
    # Python's round already matches the plugin's half-to-even logic for positive stats.
    return int(round(value))


def clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(value, hi))


def _parse_number_pairs(body: str) -> dict[int, float]:
    result: dict[int, float] = {}
    for k, v in re.findall(r"(\d+)\s*:\s*([+-]?(?:\d+\.?\d*|\.\d+))", body):
        result[int(k)] = float(v)
    return result


def _parse_stat_float_pairs(body: str) -> dict[str, float]:
    result: dict[str, float] = {}
    for key, value in re.findall(r"([A-Z]{3})\s*:\s*([+-]?(?:\d+\.?\d*|\.\d+))", body):
        result[key] = float(value)
    return result


def parse_job_stats_plugin(text: str | None) -> tuple[list[int], dict[str, dict[int, float]], dict[str, dict[str, float]], dict[str, str]]:
    if not text:
        return FALLBACK_MILESTONE_LEVELS, FALLBACK_MILESTONE_MIN, FALLBACK_MULTIPLIERS, FALLBACK_GROWTH_SHAPES

    try:
        levels_match = re.search(r"JLS\.MILESTONE_LEVELS\s*=\s*(\[[^\]]+\])\s*;", text)
        levels = json.loads(levels_match.group(1)) if levels_match else FALLBACK_MILESTONE_LEVELS

        milestone_min: dict[str, dict[int, float]] = {}
        mm_match = re.search(r"JLS\.MILESTONE_MIN\s*=\s*\{([\s\S]*?)\n\s*\};\s*\n\s*JLS\.MULTIPLIERS", text)
        if mm_match:
            mm_body = mm_match.group(1)
            for stat in STAT_NAMES:
                stat_match = re.search(rf"{stat}\s*:\s*\{{([^}}]+)\}}", mm_body)
                if stat_match:
                    milestone_min[stat] = {k: v for k, v in _parse_number_pairs(stat_match.group(1)).items()}
        if not milestone_min:
            milestone_min = FALLBACK_MILESTONE_MIN

        multipliers: dict[str, dict[str, float]] = {}
        mult_match = re.search(r"JLS\.MULTIPLIERS\s*=\s*\{([\s\S]*?)\n\s*\};\s*\n\s*JLS\.STAT_GROWTH_SHAPES", text)
        if mult_match:
            mult_body = mult_match.group(1)
            entry_re = re.compile(r"(?:\"([^\"]+)\"|([A-Za-z][A-Za-z ]*?))\s*:\s*\{([^}]+)\}\s*,?", re.S)
            for quoted, bare, inner in entry_re.findall(mult_body):
                name = (quoted or bare).strip()
                values = _parse_stat_float_pairs(inner)
                if values:
                    multipliers[name] = values
        if not multipliers:
            multipliers = FALLBACK_MULTIPLIERS

        shapes: dict[str, str] = {}
        shapes_match = re.search(r"JLS\.STAT_GROWTH_SHAPES\s*=\s*\{([\s\S]*?)\n\s*\};", text)
        if shapes_match:
            for stat, shape in re.findall(r"([A-Z]{3})\s*:\s*\"([^\"]+)\"", shapes_match.group(1)):
                shapes[stat] = shape
        if not shapes:
            shapes = FALLBACK_GROWTH_SHAPES

        return levels, milestone_min, multipliers, shapes
    except Exception as exc:
        print(f"Warning: could not fully parse SL_JobLevelStats.js; using fallbacks. Reason: {exc}", file=sys.stderr)
        return FALLBACK_MILESTONE_LEVELS, FALLBACK_MILESTONE_MIN, FALLBACK_MULTIPLIERS, FALLBACK_GROWTH_SHAPES


def _camel_to_snake(name: str) -> str:
    return re.sub(r"(?<!^)(?=[A-Z])", "_", name).lower()


def parse_damage_plugin(text: str | None) -> dict[str, float]:
    settings = dict(FALLBACK_DAMAGE_SETTINGS)
    if not text:
        return settings

    # Parse the fallback values in DF.settings. This respects changes in the plugin
    # parameters' default fallback values.
    for camel, default in re.findall(r'([a-zA-Z][a-zA-Z0-9]*)\s*:\s*[^\n]*?numberParam\(\s*"[^"]+"\s*,\s*([+-]?(?:\d+\.?\d*|\.\d+))', text):
        key = _camel_to_snake(camel)
        if key in settings:
            settings[key] = float(default)
    return settings


@dataclass
class JobFormulaSet:
    milestone_levels: list[int]
    milestone_min: dict[str, dict[int, float]]
    multipliers: dict[str, dict[str, float]]
    growth_shapes: dict[str, str]

    @classmethod
    def load_from_plugins(cls, plugins: FileSource) -> "JobFormulaSet":
        text = plugins.read_text("SL_JobLevelStats.js", required=False)
        levels, mins, multipliers, shapes = parse_job_stats_plugin(text)
        return cls(levels, mins, multipliers, shapes)

    def canonical_job_name(self, name: str | None) -> str | None:
        alias_map = {normalize_name(k): k for k in self.multipliers}
        return alias_map.get(normalize_name(name))

    def progress(self, t: float, style: str) -> float:
        s = t * t * (3 - 2 * t)
        if style == "linear":
            return t
        if style == "linear_soft":
            return 0.75 * t + 0.25 * s
        if style == "smooth":
            return s
        if style == "smooth_early":
            return s ** 0.85
        if style == "smooth_late":
            return s ** 1.15
        if style == "very_early":
            return s ** 0.70
        if style == "very_late":
            return s ** 1.35
        return s

    def clamp_level(self, level: int | float) -> float:
        return clamp(float(level), self.milestone_levels[0], self.milestone_levels[-1])

    def bracket_level(self, level: int | float) -> tuple[int, int]:
        level = self.clamp_level(level)
        for candidate in self.milestone_levels:
            if candidate > level:
                idx = self.milestone_levels.index(candidate)
                return self.milestone_levels[idx - 1], candidate
        return self.milestone_levels[-2], self.milestone_levels[-1]

    def interpolate_stat(self, level: int | float, stat: str) -> float:
        stat = stat.upper()
        milestones = self.milestone_min[stat]
        style = self.growth_shapes[stat]
        level = self.clamp_level(level)
        start, end = self.bracket_level(level)
        if end == start:
            return milestones[start]
        t = (level - start) / (end - start)
        p = self.progress(t, style)
        return milestones[start] + (milestones[end] - milestones[start]) * p

    def actor_stat(self, job_name: str, level: int | float, stat: str) -> int:
        canonical = self.canonical_job_name(job_name)
        if canonical is None:
            raise KeyError(f"Unknown job/class for stat formula: {job_name!r}")
        stat = stat.upper()
        return round_half_to_even(self.interpolate_stat(level, stat) * self.multipliers[canonical][stat])


@dataclass
class DamageFormulaSet:
    settings: dict[str, float]

    @classmethod
    def load_from_plugins(cls, plugins: FileSource) -> "DamageFormulaSet":
        text = plugins.read_text("SL_DamageFormulas.js", required=False)
        return cls(parse_damage_plugin(text))

    def mitigation(self, defense: float, divisor: float) -> float:
        raw = 100 / (100 + max(0.0, defense) / max(0.0001, divisor))
        return clamp(
            raw,
            self.settings["minimum_mitigation_rate"],
            self.settings["maximum_mitigation_rate"],
        )

    def finish(self, value: float) -> int:
        if not math.isfinite(value) or value <= 0:
            return 0
        return max(int(self.settings["minimum_damage"]), round_half_to_even(value))

    def player_physical(self, atk: float, level: int, enemy_def: float, power: float = 1.0) -> int:
        s = self.settings
        base = atk * s["player_physical_offense_coef"] + level * s["player_level_coef"]
        reduced = base * power * self.mitigation(enemy_def, s["player_physical_defense_divisor"])
        return self.finish(reduced)

    def player_magical(self, mat: float, level: int, enemy_mdf: float, power: float = 1.0) -> int:
        s = self.settings
        base = mat * s["player_magical_offense_coef"] + level * s["player_level_coef"]
        reduced = base * power * self.mitigation(enemy_mdf, s["player_magical_defense_divisor"])
        return self.finish(reduced)

    def enemy_physical(self, atk: float, level: int, actor_def: float, power: float = 1.0) -> int:
        s = self.settings
        base = atk * s["enemy_physical_offense_coef"] + level * s["enemy_level_coef"]
        reduced = base * power * self.mitigation(actor_def, s["enemy_physical_defense_divisor"])
        return self.finish(reduced)

    def enemy_magical(self, mat: float, level: int, actor_mdf: float, power: float = 1.0) -> int:
        s = self.settings
        base = mat * s["enemy_magical_offense_coef"] + level * s["enemy_level_coef"]
        reduced = base * power * self.mitigation(actor_mdf, s["enemy_magical_defense_divisor"])
        return self.finish(reduced)

    def enemy_hybrid(self, atk: float, mat: float, level: int, actor_def: float, actor_mdf: float, power: float = 1.0) -> int:
        return self.finish((self.enemy_physical(atk, level, actor_def, power) + self.enemy_magical(mat, level, actor_mdf, power)) / 2)

    def solve_enemy_atk_for_damage(self, target_damage: float, level: int, actor_def: float, power: float = 1.0) -> int:
        s = self.settings
        rate = self.mitigation(actor_def, s["enemy_physical_defense_divisor"])
        raw_needed = target_damage / max(0.0001, power * rate)
        atk = (raw_needed - level * s["enemy_level_coef"]) / max(0.0001, s["enemy_physical_offense_coef"])
        return max(1, math.ceil(atk))

    def solve_enemy_mat_for_damage(self, target_damage: float, level: int, actor_mdf: float, power: float = 1.0) -> int:
        s = self.settings
        rate = self.mitigation(actor_mdf, s["enemy_magical_defense_divisor"])
        raw_needed = target_damage / max(0.0001, power * rate)
        mat = (raw_needed - level * s["enemy_level_coef"]) / max(0.0001, s["enemy_magical_offense_coef"])
        return max(1, math.ceil(mat))


@dataclass
class ExpCurveSet:
    """Mirror SL_CustomExpCurve.js for reward recommendations."""

    milestone_levels: list[int]
    xp_to_next_milestone: dict[int, int]
    max_level: int = 999
    battles_per_level: list[tuple[int, float]] = field(default_factory=lambda: list(FALLBACK_BATTLES_PER_LEVEL))

    @classmethod
    def load_from_plugins(cls, plugins: FileSource) -> "ExpCurveSet":
        text = plugins.read_text("SL_CustomExpCurve.js", required=False)
        if not text:
            return cls(list(FALLBACK_XP_MILESTONE_LEVELS), dict(FALLBACK_XP_TO_NEXT_MILESTONE))

        try:
            levels_match = re.search(r"XP_MILESTONE_LEVELS\s*=\s*(\[[^\]]+\])\s*;", text)
            levels = json.loads(levels_match.group(1)) if levels_match else list(FALLBACK_XP_MILESTONE_LEVELS)

            xp_match = re.search(r"XP_TO_NEXT_MILESTONE\s*=\s*\{([\s\S]*?)\n\s*\};", text)
            xp_to_next: dict[int, int] = {}
            if xp_match:
                for k, v in re.findall(r"(\d+)\s*:\s*(\d+)", xp_match.group(1)):
                    xp_to_next[int(k)] = int(v)
            if not xp_to_next:
                xp_to_next = dict(FALLBACK_XP_TO_NEXT_MILESTONE)

            max_match = re.search(r"Max Level[\s\S]*?@default\s+(\d+)", text)
            max_level = int(max_match.group(1)) if max_match else max(levels)

            return cls(levels, xp_to_next, max_level=max_level)
        except Exception as exc:
            print(f"Warning: could not parse SL_CustomExpCurve.js; using EXP fallbacks. Reason: {exc}", file=sys.stderr)
            return cls(list(FALLBACK_XP_MILESTONE_LEVELS), dict(FALLBACK_XP_TO_NEXT_MILESTONE))

    def clamp_level(self, level: int | float) -> int:
        if not math.isfinite(float(level)):
            return 1
        return max(1, min(int(math.floor(float(level))), self.max_level))

    def _start_end_level(self, level: int) -> tuple[int, int]:
        level = self.clamp_level(level)
        for milestone in self.milestone_levels:
            if milestone > level:
                idx = self.milestone_levels.index(milestone)
                return self.milestone_levels[max(0, idx - 1)], milestone
        return self.milestone_levels[-2], self.milestone_levels[-1]

    @staticmethod
    def _log_interpolate(start_value: float, end_value: float, t: float) -> float:
        start_value = max(1e-9, start_value)
        end_value = max(1e-9, end_value)
        start_log = math.log(start_value)
        end_log = math.log(end_value)
        return math.exp(start_log + (end_log - start_log) * t)

    def xp_to_next_level(self, level: int | float) -> int:
        level = self.clamp_level(level)
        if level >= self.max_level:
            return 0
        start_level, end_level = self._start_end_level(level)
        start_xp = self.xp_to_next_milestone.get(start_level, FALLBACK_XP_TO_NEXT_MILESTONE.get(start_level, 1))
        end_xp = self.xp_to_next_milestone.get(end_level, FALLBACK_XP_TO_NEXT_MILESTONE.get(end_level, start_xp))
        t = (level - start_level) / max(1, end_level - start_level)
        return int(round(self._log_interpolate(start_xp, end_xp, t)))

    def total_exp_for_level(self, level: int | float) -> int:
        level = self.clamp_level(level)
        total = 0
        for lv in range(1, level):
            total += self.xp_to_next_level(lv)
        return total

    def target_battles_per_level(self, level: int | float) -> float:
        return interpolate_table(self.battles_per_level, level)

    def recommended_enemy_exp(
        self,
        level: int,
        durability: str = "medium",
        def_profile: str = "medium",
        mdf_profile: str = "medium",
        speed_profile: str = "average",
        turns_to_defeat: float = 4.0,
        xp_share: float = 1.0,
        xp_scale: float = 1.0,
    ) -> tuple[int, dict[str, float | int]]:
        """Recommend database EXP for one enemy.

        The method first budgets a full level-appropriate encounter as a fraction
        of the actor XP-to-next-level curve, then scales that encounter by enemy
        toughness and by xp_share. Use xp_share < 1 when several enemies split a
        troop's reward budget.
        """
        level = self.clamp_level(level)
        xp_next = self.xp_to_next_level(level)
        battles = max(1.0, self.target_battles_per_level(level))
        base_encounter_xp = xp_next / battles if xp_next > 0 else 0.0

        hp_factor = HP_PROFILE_MULTIPLIERS.get(durability, 1.0)
        def_factor = STAT_PROFILE_MULTIPLIERS.get(def_profile, 1.0)
        mdf_factor = STAT_PROFILE_MULTIPLIERS.get(mdf_profile, 1.0)
        speed_factor = SPEED_PROFILE_MULTIPLIERS.get(speed_profile, 1.0)

        # Keep the reward mostly tied to expected level pacing. Tougher profiles
        # matter, but with square roots so XP does not explode for bosses/tanks.
        durability_factor = math.sqrt(max(0.01, hp_factor))
        defense_factor = math.sqrt(max(0.01, (def_factor + mdf_factor) / 2.0))
        speed_reward_factor = math.sqrt(max(0.01, speed_factor))
        turn_factor = math.sqrt(max(0.1, turns_to_defeat) / 4.0)
        difficulty_factor = durability_factor * defense_factor * speed_reward_factor * turn_factor

        raw = base_encounter_xp * difficulty_factor * max(0.0, xp_share) * max(0.0, xp_scale)
        reward = max(0, int(round(raw)))
        diagnostics: dict[str, float | int] = {
            "xp_to_next_level": xp_next,
            "target_battles_per_level": round(battles, 2),
            "base_full_encounter_xp": round(base_encounter_xp, 2),
            "xp_difficulty_factor": round(difficulty_factor, 3),
            "xp_share": round(xp_share, 3),
            "xp_scale": round(xp_scale, 3),
            "recommended_full_encounter_xp": int(round(base_encounter_xp * difficulty_factor * max(0.0, xp_scale))),
        }
        return reward, diagnostics


# ---------------------------------------------------------------------------
# Database-derived class and skill helpers
# ---------------------------------------------------------------------------

@dataclass
class ClassInfo:
    id: int
    database_name: str
    job_name: str
    note: str
    attack_hits: list[tuple[int, int, int]] = field(default_factory=list)
    job_level_skills: list[tuple[int, int]] = field(default_factory=list)

    def attack_hit_range(self, job_level: int) -> tuple[int, int]:
        if not self.attack_hits:
            return 1, 1
        chosen = self.attack_hits[0]
        for row in self.attack_hits:
            if job_level >= row[0]:
                chosen = row
            else:
                break
        return chosen[1], chosen[2]

    def expected_hits(self, job_level: int) -> float:
        lo, hi = self.attack_hit_range(job_level)
        return (lo + hi) / 2


def parse_job_stat_formula(note: str, fallback_name: str) -> str:
    match = re.search(r"<\s*(?:JRPGJob|JRPG Job|JobStatFormula|Job Stat Formula)\s*:\s*([^>]+)>", note or "", re.I)
    return match.group(1).strip() if match else fallback_name


def parse_attack_hits(note: str) -> list[tuple[int, int, int]]:
    match = re.search(r"<SL ATTACK HITS>([\s\S]*?)</SL ATTACK HITS>", note or "", re.I)
    if not match:
        return []
    rows: list[tuple[int, int, int]] = []
    for line in match.group(1).splitlines():
        line_match = re.match(r"\s*(\d+)\s*:\s*(\d+)\s*-\s*(\d+)\s*$", line)
        if line_match:
            level, lo, hi = map(int, line_match.groups())
            rows.append((max(1, level), max(1, lo), max(1, hi)))
    rows.sort(key=lambda r: r[0])
    return rows



def parse_job_level_skills(note: str) -> list[tuple[int, int]]:
    match = re.search(r"<JOB LEVEL SKILLS>([\s\S]*?)</JOB LEVEL SKILLS>", note or "", re.I)
    if not match:
        return []
    rows: list[tuple[int, int]] = []
    for line in match.group(1).splitlines():
        line_match = re.match(r"\s*(\d+)\s*:\s*(\d+)\s*$", line)
        if line_match:
            level, skill_id = map(int, line_match.groups())
            rows.append((max(1, level), max(1, skill_id)))
    rows.sort(key=lambda r: r[0])
    return rows

def load_classes(db: Database, formulas: JobFormulaSet) -> list[ClassInfo]:
    classes: list[ClassInfo] = []
    for raw in db.classes:
        if not raw:
            continue
        note = raw.get("note") or ""
        raw_job = parse_job_stat_formula(note, raw.get("name", ""))
        job = formulas.canonical_job_name(raw_job)
        if not job:
            # Skip non-job placeholder classes.
            continue
        classes.append(ClassInfo(
            id=int(raw.get("id", 0)),
            database_name=str(raw.get("name", job)),
            job_name=job,
            note=note,
            attack_hits=parse_attack_hits(note),
            job_level_skills=parse_job_level_skills(note),
        ))
    return classes


def parse_sl_damage_formula(formula: str) -> tuple[str, float] | None:
    """Return ('phys'|'mag'|'hybrid', power) for common SL_DMG formulas."""
    formula = formula or ""
    match = re.search(r"SL_DMG\.(phys|physical|pAtk|mag|magical|pMag|hybrid)\s*\(\s*a\s*,\s*b\s*,\s*([+-]?(?:\d+\.?\d*|\.\d+))", formula, re.I)
    if not match:
        return None
    kind_raw = match.group(1).lower()
    power = float(match.group(2))
    if kind_raw in {"phys", "physical", "patk"}:
        return "physical", power
    if kind_raw in {"mag", "magical", "pmag"}:
        return "magical", power
    return "hybrid", power


def infer_median_skill_power(db: Database, kind: Literal["physical", "magical", "hybrid"], fallback: float) -> float:
    powers: list[float] = []
    for skill in db.skills:
        if not skill:
            continue
        dmg = skill.get("damage") or {}
        # RPG Maker damage.type 1 is HP Damage. Ignore healing and non-damage skills.
        if int(dmg.get("type", 0) or 0) != 1:
            continue
        parsed = parse_sl_damage_formula(str(dmg.get("formula", "")))
        if parsed and parsed[0] == kind:
            powers.append(parsed[1])
    if not powers:
        return fallback
    return float(statistics.median(powers))


def attack_skill_variance(db: Database) -> int:
    try:
        attack = db.skills[1]
        return int((attack.get("damage") or {}).get("variance", 20) or 20)
    except Exception:
        return 20


def enemy_level_from_note(note: str) -> int | None:
    for key in ["SL Enemy Level", "Enemy Level", "SL Level", "Level"]:
        match = re.search(rf"<\s*{re.escape(key)}\s*:\s*(\d+)\s*>", note or "", re.I)
        if match:
            return int(match.group(1))
    return None


def _clean_stat_number(value: str) -> int:
    """Parse an RPG Maker notetag number, allowing commas for readability."""
    value = value.strip().replace(",", "")
    return int(float(value))


def _enemy_stat_alias(raw_stat: str) -> str | None:
    key = normalize_name(raw_stat)
    aliases = {
        "mhp": "MHP",
        "hp": "MHP",
        "maxhp": "MHP",
        "maxhitpoints": "MHP",
        "mmp": "MMP",
        "mp": "MMP",
        "maxmp": "MMP",
        "maxmagicpoints": "MMP",
        "atk": "ATK",
        "attack": "ATK",
        "def": "DEF",
        "defense": "DEF",
        "mat": "MAT",
        "magicattack": "MAT",
        "mdf": "MDF",
        "magicdefense": "MDF",
        "agi": "AGI",
        "agility": "AGI",
        "luk": "LUK",
        "luck": "LUK",
    }
    return aliases.get(key)


def enemy_stat_tag_name(stat: str) -> str:
    stat = stat.upper()
    if stat == "MHP":
        return "MaxHP"
    if stat == "MMP":
        return "MaxMP"
    return stat


def parse_enemy_stat_notetags(note: str) -> dict[str, int]:
    """Read true enemy params from note tags.

    The project's true enemy stat format is individual notetags:

        <MaxHP: 5742>
        <MaxMP: 4>
        <ATK: 9>
        <DEF: 27>
        <MAT: 4>
        <MDF: 28>
        <AGI: 21>
        <LUK: 10>

    For compatibility with older drafts, this parser still accepts MHP/MMP, block
    tags, and compact param arrays. Any note values override the editor params;
    missing note values fall back to the editor values.
    """
    note = note or ""
    found: dict[str, int] = {}
    stat_alias_pattern = r"MaxHP|MaxMP|MHP|MMP|HP|MP|ATK|Attack|DEF|Defense|MAT|Magic Attack|MDF|Magic Defense|AGI|Agility|LUK|Luck"

    # Block style tags retained for backward compatibility.
    block_re = re.compile(
        r"<\s*(?:SL\s+)?(?:Enemy\s+)?(?:Stats?|Params?)\s*>"
        r"([\s\S]*?)"
        r"</\s*(?:SL\s+)?(?:Enemy\s+)?(?:Stats?|Params?)\s*>",
        re.I,
    )
    for block in block_re.findall(note):
        for raw_stat, value in re.findall(
            rf"\b({stat_alias_pattern})\b\s*(?::|=|,)\s*([+-]?(?:\d[\d,]*\.?\d*|\.\d+))",
            block,
            re.I,
        ):
            stat = _enemy_stat_alias(raw_stat)
            if stat:
                found[stat] = max(0, _clean_stat_number(value))

    # Compact param array/list style retained for backward compatibility.
    array_re = re.compile(
        r"<\s*(?:SL\s+)?(?:Enemy\s+)?(?:Stats?|Params?)\s*:\s*\[?([^>\]]+)\]?\s*>",
        re.I,
    )
    for body in array_re.findall(note):
        # In compact arrays, commas are separators rather than thousands marks.
        numbers = re.findall(r"[+-]?(?:\d+\.?\d*|\.\d+)", body.replace(",", " "))
        if len(numbers) >= 2:
            for stat, value in zip(RMMZ_PARAM_ORDER, numbers):
                found[stat] = max(0, _clean_stat_number(value))

    # Individual true stat tags. This is the preferred project format.
    for raw_stat, value in re.findall(
        rf"<\s*({stat_alias_pattern})\s*:\s*([+-]?(?:\d[\d,]*\.?\d*|\.\d+))\s*>",
        note,
        re.I,
    ):
        stat = _enemy_stat_alias(raw_stat)
        if stat:
            found[stat] = max(0, _clean_stat_number(value))

    return {stat: found[stat] for stat in RMMZ_PARAM_ORDER if stat in found}


def enemy_editor_params(enemy: dict[str, Any]) -> dict[str, int]:
    params = enemy.get("params") or []
    result: dict[str, int] = {}
    for i, stat in enumerate(RMMZ_PARAM_ORDER):
        try:
            result[stat] = int(params[i] or 0) if i < len(params) else 0
        except (TypeError, ValueError):
            result[stat] = 0
    return result


def enemy_true_params(enemy: dict[str, Any]) -> tuple[dict[str, int], str, dict[str, int]]:
    """Return enemy params, their source, and the note overrides found.

    The editor array is always loaded first because it is still useful for small
    early enemies and as a fallback. Any stat notetag values then override it.
    """
    editor = enemy_editor_params(enemy)
    note_stats = parse_enemy_stat_notetags(str(enemy.get("note", "")))
    merged = dict(editor)
    merged.update(note_stats)
    source = "notetags overriding editor params" if note_stats else "editor params fallback"
    return merged, source, note_stats


def enemy_stats_notetag(params: dict[str, int], level: int | None = None) -> str:
    lines: list[str] = []
    if level is not None:
        lines.append(f"<Level: {level}>")
    for stat in RMMZ_PARAM_ORDER:
        lines.append(f"<{enemy_stat_tag_name(stat)}: {int(params.get(stat, 0))}>")
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Balancing model
# ---------------------------------------------------------------------------

def interpolate_table(table: list[tuple[int, float]], x: int | float) -> float:
    rows = sorted(table, key=lambda r: r[0])
    x = float(x)
    if x <= rows[0][0]:
        return rows[0][1]
    if x >= rows[-1][0]:
        return rows[-1][1]
    for (x0, y0), (x1, y1) in zip(rows, rows[1:]):
        if x0 <= x <= x1:
            if x1 == x0:
                return y0
            t = (x - x0) / (x1 - x0)
            return y0 + (y1 - y0) * t
    return rows[-1][1]


def actor_share(job: str, stat: Literal["ATK", "MAT"], job_level: int) -> float:
    table = ATK_ACTOR_SHARE_TABLE if stat == "ATK" else MAT_ACTOR_SHARE_TABLE
    if job not in table:
        return 0.95
    return interpolate_table(table[job], clamp(job_level, 1, 99))


def estimated_equipment_defense(actor_stat: float, job: str, stat: Literal["DEF", "MDF"], gear_share: float) -> float:
    """
    Estimate normal armor/shield contribution from the current armor guidelines.

    gear_share is interpreted as the target share that a balanced General Armor
    chest piece would contribute to total defense, before armor-type multipliers.

    Example: gear_share=.35 means General Armor ~= actor_stat * .35/.65.
    """
    gear_share = clamp(gear_share, 0.0, 0.85)
    if gear_share <= 0:
        return 0.0
    baseline = actor_stat * gear_share / max(0.0001, 1.0 - gear_share)
    gear_types = CLASS_DEFENSIVE_GEAR.get(job, ["General Armor"])

    chest_types = [t for t in gear_types if t != "Shield"]
    if not chest_types:
        chest_types = ["General Armor"]
    chest_mult = sum(ARMOR_MULTIPLIERS[t][stat] for t in chest_types) / len(chest_types)

    value = baseline * chest_mult
    if "Shield" in gear_types:
        value += baseline * ARMOR_MULTIPLIERS["Shield"][stat]
    return value


@dataclass
class ClassStatRow:
    job: str
    class_id: int
    database_name: str
    level: int
    job_level: int
    mhp: int
    mmp: int
    actor_atk: int
    total_atk: int
    actor_def: int
    total_def: int
    actor_mat: int
    total_mat: int
    actor_mdf: int
    total_mdf: int
    agi: int
    attack_hits_min: int
    attack_hits_max: int
    attack_hits_expected: float


@dataclass
class PartyBaseline:
    level: int
    job_level: int
    class_rows: list[ClassStatRow]
    martial_classes: list[str]
    caster_classes: list[str]
    avg_mhp: float
    avg_mmp: float
    avg_atk: float
    avg_def: float
    avg_mat: float
    avg_mdf: float
    avg_agi: float
    avg_martial_expected_hits: float
    avg_martial_basic_damage_vs_medium: float = 0
    avg_caster_spell_damage_vs_medium: float = 0

    def as_dict(self) -> dict[str, float | int]:
        return {
            "level": self.level,
            "job_level": self.job_level,
            "avg_mhp": self.avg_mhp,
            "avg_mmp": self.avg_mmp,
            "avg_atk": self.avg_atk,
            "avg_def": self.avg_def,
            "avg_mat": self.avg_mat,
            "avg_mdf": self.avg_mdf,
            "avg_agi": self.avg_agi,
            "avg_martial_expected_hits": self.avg_martial_expected_hits,
            "avg_martial_basic_damage_vs_medium": self.avg_martial_basic_damage_vs_medium,
            "avg_caster_spell_damage_vs_medium": self.avg_caster_spell_damage_vs_medium,
        }


@dataclass
class EnemyRecommendation:
    level: int
    job_level: int
    attacker: Literal["physical", "magical", "hybrid"]
    damage_pct: float
    target_damage: float
    durability: str
    def_profile: str
    mdf_profile: str
    speed_profile: str
    turns_to_defeat: float
    params: dict[str, int]
    exp_reward: int
    diagnostics: dict[str, float | int | str]

    def rmmz_params_array(self) -> list[int]:
        return [self.params.get(stat, 0) for stat in RMMZ_PARAM_ORDER]


class EncounterBalancer:
    def __init__(
        self,
        db: Database,
        job_formulas: JobFormulaSet,
        damage_formulas: DamageFormulaSet,
        exp_curve: ExpCurveSet | None = None,
        def_gear_share: float = 0.35,
        mdf_gear_share: float = 0.35,
    ):
        self.db = db
        self.job_formulas = job_formulas
        self.damage_formulas = damage_formulas
        self.exp_curve = exp_curve or ExpCurveSet(list(FALLBACK_XP_MILESTONE_LEVELS), dict(FALLBACK_XP_TO_NEXT_MILESTONE))
        self.classes = load_classes(db, job_formulas)
        self.def_gear_share = def_gear_share
        self.mdf_gear_share = mdf_gear_share
        if not self.classes:
            # Last-resort fallback from formula class names.
            self.classes = [ClassInfo(i + 1, name, name, "", []) for i, name in enumerate(job_formulas.multipliers)]

    def class_rows(self, level: int, job_level: int) -> list[ClassStatRow]:
        rows: list[ClassStatRow] = []
        for cls in self.classes:
            job = cls.job_name
            mhp = self.job_formulas.actor_stat(job, level, "MHP")
            mmp = self.job_formulas.actor_stat(job, level, "MMP")
            atk = self.job_formulas.actor_stat(job, level, "ATK")
            defense = self.job_formulas.actor_stat(job, level, "DEF")
            mat = self.job_formulas.actor_stat(job, level, "MAT")
            mdf = self.job_formulas.actor_stat(job, level, "MDF")
            agi = self.job_formulas.actor_stat(job, level, "AGI")

            total_atk = round_half_to_even(atk / actor_share(job, "ATK", job_level))
            total_mat = round_half_to_even(mat / actor_share(job, "MAT", job_level))
            total_def = round_half_to_even(defense + estimated_equipment_defense(defense, job, "DEF", self.def_gear_share))
            total_mdf = round_half_to_even(mdf + estimated_equipment_defense(mdf, job, "MDF", self.mdf_gear_share))
            hit_min, hit_max = cls.attack_hit_range(job_level)

            rows.append(ClassStatRow(
                job=job,
                class_id=cls.id,
                database_name=cls.database_name,
                level=level,
                job_level=job_level,
                mhp=mhp,
                mmp=mmp,
                actor_atk=atk,
                total_atk=total_atk,
                actor_def=defense,
                total_def=total_def,
                actor_mat=mat,
                total_mat=total_mat,
                actor_mdf=mdf,
                total_mdf=total_mdf,
                agi=agi,
                attack_hits_min=hit_min,
                attack_hits_max=hit_max,
                attack_hits_expected=(hit_min + hit_max) / 2,
            ))
        return rows

    def class_info_by_job(self, job: str) -> ClassInfo | None:
        norm = normalize_name(job)
        for cls in self.classes:
            if normalize_name(cls.job_name) == norm:
                return cls
        return None

    def learned_skill_ids(self, job: str, job_level: int) -> list[int]:
        cls = self.class_info_by_job(job)
        if not cls:
            return []
        return [skill_id for level, skill_id in cls.job_level_skills if job_level >= level]

    def skill_by_id(self, skill_id: int) -> dict[str, Any] | None:
        if 0 <= skill_id < len(self.db.skills):
            skill = self.db.skills[skill_id]
            return skill if skill else None
        return None

    def best_learned_damage_action(
        self,
        row: ClassStatRow,
        enemy_def: float,
        enemy_mdf: float,
        allowed_kinds: set[str] | None = None,
        override_magic_power: float | None = None,
    ) -> tuple[float, str]:
        """Best available learned damaging skill for a class, or a reasonable fallback.

        The fallback for martial classes is the normal Attack command with expected
        attack repeats. The fallback for caster classes without a learned damaging
        spell is 0 damage, because those characters are often healing/supporting.
        """
        allowed_kinds = allowed_kinds or {"physical", "magical", "hybrid"}
        best_damage = 0.0
        best_label = "no learned damaging action"

        for skill_id in self.learned_skill_ids(row.job, row.job_level):
            skill = self.skill_by_id(skill_id)
            if not skill:
                continue
            damage_data = skill.get("damage") or {}
            if int(damage_data.get("type", 0) or 0) != 1:
                continue
            parsed = parse_sl_damage_formula(str(damage_data.get("formula", "")))
            if not parsed:
                continue
            kind, power = parsed
            if kind not in allowed_kinds:
                continue
            if override_magic_power is not None and kind in {"magical", "hybrid"}:
                power = override_magic_power
            if kind == "physical":
                damage = self.damage_formulas.player_physical(row.total_atk, row.level, enemy_def, power=power)
            elif kind == "magical":
                damage = self.damage_formulas.player_magical(row.total_mat, row.level, enemy_mdf, power=power)
            else:
                physical = self.damage_formulas.player_physical(row.total_atk, row.level, enemy_def, power=power)
                magical = self.damage_formulas.player_magical(row.total_mat, row.level, enemy_mdf, power=power)
                damage = self.damage_formulas.finish((physical + magical) / 2)
            if damage > best_damage:
                best_damage = float(damage)
                best_label = f"{skill.get('name', 'Skill')} #{skill_id} ({kind}, power {power:g})"

        return best_damage, best_label

    def martial_basic_damage(self, row: ClassStatRow, enemy_def: float) -> float:
        return self.damage_formulas.player_physical(row.total_atk, row.level, enemy_def, power=1.0) * row.attack_hits_expected

    def baseline(
        self,
        level: int,
        job_level: int | None = None,
        martial_classes: Iterable[str] = DEFAULT_MARTIAL_CLASSES,
        caster_classes: Iterable[str] = DEFAULT_CASTER_CLASSES,
        player_magic_power: float | None = None,
    ) -> PartyBaseline:
        level = int(level)
        job_level = int(job_level if job_level is not None else min(level, 99))
        martial_set = {normalize_name(x) for x in martial_classes}
        caster_set = {normalize_name(x) for x in caster_classes}
        rows = self.class_rows(level, job_level)

        if not rows:
            raise ProjectFileError("No usable job/classes were found.")

        martial_rows = [r for r in rows if normalize_name(r.job) in martial_set]
        caster_rows = [r for r in rows if normalize_name(r.job) in caster_set]
        if not martial_rows:
            martial_rows = rows
        if not caster_rows:
            caster_rows = rows

        def avg(values: Iterable[float]) -> float:
            values = list(values)
            return sum(values) / len(values) if values else 0.0

        avg_mhp = avg(r.mhp for r in rows)
        avg_mmp = avg(r.mmp for r in rows)
        avg_atk = avg(r.total_atk for r in martial_rows)
        avg_def = avg(r.total_def for r in rows)
        avg_mat = avg(r.total_mat for r in caster_rows)
        avg_mdf = avg(r.total_mdf for r in rows)
        avg_agi = avg(r.agi for r in rows)
        avg_hits = avg(r.attack_hits_expected for r in martial_rows)

        # Add reference DPR against a medium enemy at this level. Martial
        # reference damage is the normal Attack command with expected repeats.
        # Caster reference damage uses the best learned magical/hybrid damaging
        # action available at the current job level.
        medium_def = avg_def
        medium_mdf = avg_mdf

        martial_damages = [self.martial_basic_damage(r, medium_def) for r in martial_rows]
        caster_damages = []
        for r in caster_rows:
            damage, _label = self.best_learned_damage_action(
                r, medium_def, medium_mdf, allowed_kinds={"magical", "hybrid"}, override_magic_power=player_magic_power
            )
            if damage > 0:
                caster_damages.append(damage)
        if not caster_damages and player_magic_power is not None:
            caster_damages = [
                self.damage_formulas.player_magical(r.total_mat, level, medium_mdf, power=player_magic_power)
                for r in caster_rows
            ]

        return PartyBaseline(
            level=level,
            job_level=job_level,
            class_rows=rows,
            martial_classes=[r.job for r in martial_rows],
            caster_classes=[r.job for r in caster_rows],
            avg_mhp=avg_mhp,
            avg_mmp=avg_mmp,
            avg_atk=avg_atk,
            avg_def=avg_def,
            avg_mat=avg_mat,
            avg_mdf=avg_mdf,
            avg_agi=avg_agi,
            avg_martial_expected_hits=avg_hits,
            avg_martial_basic_damage_vs_medium=avg(martial_damages),
            avg_caster_spell_damage_vs_medium=avg(caster_damages),
        )

    def recommend_enemy(
        self,
        level: int,
        damage_pct: float,
        attacker: Literal["physical", "magical", "hybrid"] = "physical",
        job_level: int | None = None,
        durability: str = "medium",
        def_profile: str = "medium",
        mdf_profile: str = "medium",
        speed_profile: str = "average",
        turns_to_defeat: float = 4.0,
        party_size: int = 4,
        physical_action_weight: float = 0.60,
        enemy_attack_power: float = 1.0,
        player_magic_power: float | None = None,
        xp_share: float = 1.0,
        xp_scale: float = 1.0,
        martial_classes: Iterable[str] = DEFAULT_MARTIAL_CLASSES,
        caster_classes: Iterable[str] = DEFAULT_CASTER_CLASSES,
    ) -> EnemyRecommendation:
        attacker = attacker.lower()  # type: ignore[assignment]
        if attacker not in {"physical", "magical", "hybrid"}:
            raise ValueError("attacker must be physical, magical, or hybrid")
        for label, profile, table in [
            ("durability", durability, HP_PROFILE_MULTIPLIERS),
            ("def_profile", def_profile, STAT_PROFILE_MULTIPLIERS),
            ("mdf_profile", mdf_profile, STAT_PROFILE_MULTIPLIERS),
            ("speed_profile", speed_profile, SPEED_PROFILE_MULTIPLIERS),
        ]:
            if profile not in table:
                raise ValueError(f"Unknown {label}: {profile!r}. Valid: {', '.join(table)}")

        baseline = self.baseline(level, job_level, martial_classes, caster_classes, player_magic_power)
        level = baseline.level
        job_level = baseline.job_level

        enemy_def = round_half_to_even(baseline.avg_def * STAT_PROFILE_MULTIPLIERS[def_profile])
        enemy_mdf = round_half_to_even(baseline.avg_mdf * STAT_PROFILE_MULTIPLIERS[mdf_profile])
        enemy_agi = round_half_to_even(baseline.avg_agi * SPEED_PROFILE_MULTIPLIERS[speed_profile])
        target_damage = baseline.avg_mhp * damage_pct

        recommended_atk = 1
        recommended_mat = 1
        if attacker in {"physical", "hybrid"}:
            recommended_atk = self.damage_formulas.solve_enemy_atk_for_damage(
                target_damage, level, baseline.avg_def, enemy_attack_power
            )
        if attacker in {"magical", "hybrid"}:
            recommended_mat = self.damage_formulas.solve_enemy_mat_for_damage(
                target_damage, level, baseline.avg_mdf, enemy_attack_power
            )

        # Give non-primary offense a reasonable small value so the params do not look nonsensical.
        if attacker == "physical":
            recommended_mat = max(1, round_half_to_even(recommended_atk * 0.45))
        elif attacker == "magical":
            recommended_atk = max(1, round_half_to_even(recommended_mat * 0.45))

        actual_phys = self.damage_formulas.enemy_physical(recommended_atk, level, baseline.avg_def, enemy_attack_power)
        actual_mag = self.damage_formulas.enemy_magical(recommended_mat, level, baseline.avg_mdf, enemy_attack_power)
        actual_hybrid = self.damage_formulas.enemy_hybrid(recommended_atk, recommended_mat, level, baseline.avg_def, baseline.avg_mdf, enemy_attack_power)

        # Estimate party DPR against this enemy.
        physical_weight = clamp(physical_action_weight, 0.0, 1.0)
        magical_weight = 1.0 - physical_weight

        martial_set = {normalize_name(x) for x in martial_classes}
        caster_set = {normalize_name(x) for x in caster_classes}
        martial_rows = [r for r in baseline.class_rows if normalize_name(r.job) in martial_set] or baseline.class_rows
        caster_rows = [r for r in baseline.class_rows if normalize_name(r.job) in caster_set] or baseline.class_rows

        martial_action_damages = [self.martial_basic_damage(r, enemy_def) for r in martial_rows]
        caster_action_damages: list[float] = []
        caster_action_labels: list[str] = []
        for r in caster_rows:
            damage, label = self.best_learned_damage_action(
                r, enemy_def, enemy_mdf, allowed_kinds={"magical", "hybrid"}, override_magic_power=player_magic_power
            )
            if damage > 0:
                caster_action_damages.append(damage)
                caster_action_labels.append(f"{r.job}: {label}")

        avg_martial_action = sum(martial_action_damages) / len(martial_action_damages)
        avg_caster_action = (sum(caster_action_damages) / len(caster_action_damages)) if caster_action_damages else 0.0
        expected_member_dpr = avg_martial_action * physical_weight + avg_caster_action * magical_weight
        party_dpr = max(1.0, expected_member_dpr * party_size)
        enemy_mhp = round_half_to_even(party_dpr * turns_to_defeat * HP_PROFILE_MULTIPLIERS[durability])
        enemy_mmp = round_half_to_even(baseline.avg_mmp * MMP_ATTACKER_MULTIPLIERS[attacker])

        params = {
            "MHP": max(1, enemy_mhp),
            "MMP": max(0, enemy_mmp),
            "ATK": max(1, recommended_atk),
            "DEF": max(1, enemy_def),
            "MAT": max(1, recommended_mat),
            "MDF": max(1, enemy_mdf),
            "AGI": max(1, enemy_agi),
            "LUK": 10,
        }

        exp_reward, exp_diagnostics = self.exp_curve.recommended_enemy_exp(
            level=level,
            durability=durability,
            def_profile=def_profile,
            mdf_profile=mdf_profile,
            speed_profile=speed_profile,
            turns_to_defeat=turns_to_defeat,
            xp_share=xp_share,
            xp_scale=xp_scale,
        )

        variance = attack_skill_variance(self.db)
        expected_attack = {"physical": actual_phys, "magical": actual_mag, "hybrid": actual_hybrid}[attacker]
        diagnostics: dict[str, float | int | str] = {
            "avg_party_mhp": round(baseline.avg_mhp, 2),
            "avg_party_mmp": round(baseline.avg_mmp, 2),
            "avg_party_atk_martials": round(baseline.avg_atk, 2),
            "avg_party_mat_casters": round(baseline.avg_mat, 2),
            "avg_party_def": round(baseline.avg_def, 2),
            "avg_party_mdf": round(baseline.avg_mdf, 2),
            "avg_party_agi": round(baseline.avg_agi, 2),
            "recommended_exp_reward": exp_reward,
            **exp_diagnostics,
            "enemy_expected_attack_damage": expected_attack,
            "enemy_expected_attack_pct_of_avg_mhp": round(expected_attack / max(1, baseline.avg_mhp), 4),
            "enemy_attack_variance_pct": variance,
            "enemy_attack_variance_min_approx": round(expected_attack * (1 - variance / 100), 2),
            "enemy_attack_variance_max_approx": round(expected_attack * (1 + variance / 100), 2),
            "enemy_physical_damage_if_used": actual_phys,
            "enemy_magical_damage_if_used": actual_mag,
            "enemy_hybrid_damage_if_used": actual_hybrid,
            "avg_martial_action_damage_vs_enemy": round(avg_martial_action, 2),
            "avg_caster_action_damage_vs_enemy": round(avg_caster_action, 2),
            "estimated_party_dpr": round(party_dpr, 2),
            "estimated_turns_to_defeat": round(params["MHP"] / party_dpr, 2),
            "player_magic_power_override": "none; using learned skill powers" if player_magic_power is None else player_magic_power,
            "caster_actions_used": "; ".join(caster_action_labels) if caster_action_labels else "none",
            "minimum_possible_physical_damage_at_atk_1": self.damage_formulas.enemy_physical(1, level, baseline.avg_def, enemy_attack_power),
            "minimum_possible_magical_damage_at_mat_1": self.damage_formulas.enemy_magical(1, level, baseline.avg_mdf, enemy_attack_power),
            "physical_action_weight": physical_weight,
            "magical_action_weight": magical_weight,
        }

        return EnemyRecommendation(
            level=level,
            job_level=job_level,
            attacker=attacker,  # type: ignore[arg-type]
            damage_pct=damage_pct,
            target_damage=target_damage,
            durability=durability,
            def_profile=def_profile,
            mdf_profile=mdf_profile,
            speed_profile=speed_profile,
            turns_to_defeat=turns_to_defeat,
            params=params,
            exp_reward=exp_reward,
            diagnostics=diagnostics,
        )


# ---------------------------------------------------------------------------
# Printing / CLI
# ---------------------------------------------------------------------------

def fmt_num(value: float | int, decimals: int = 2) -> str:
    if isinstance(value, int) or abs(float(value) - round(float(value))) < 1e-9:
        return str(int(round(float(value))))
    return f"{float(value):.{decimals}f}"


def print_kv_table(rows: list[tuple[str, Any]]) -> None:
    width = max((len(k) for k, _ in rows), default=0)
    for key, value in rows:
        print(f"{key:<{width}} : {value}")


def print_baseline(baseline: PartyBaseline, show_classes: bool = True) -> None:
    print(f"\nParty baseline — Actor Lv {baseline.level}, Job Lv {baseline.job_level}")
    print("=" * 72)
    print_kv_table([
        ("Avg MHP", fmt_num(baseline.avg_mhp)),
        ("Avg MMP", fmt_num(baseline.avg_mmp)),
        ("Avg ATK, martial total", fmt_num(baseline.avg_atk)),
        ("Avg DEF, geared estimate", fmt_num(baseline.avg_def)),
        ("Avg MAT, caster total", fmt_num(baseline.avg_mat)),
        ("Avg MDF, geared estimate", fmt_num(baseline.avg_mdf)),
        ("Avg AGI", fmt_num(baseline.avg_agi)),
        ("Avg martial attack hits", fmt_num(baseline.avg_martial_expected_hits)),
        ("Avg martial basic damage vs medium", fmt_num(baseline.avg_martial_basic_damage_vs_medium)),
        ("Avg caster spell damage vs medium", fmt_num(baseline.avg_caster_spell_damage_vs_medium)),
        ("Martial classes", ", ".join(baseline.martial_classes)),
        ("Caster classes", ", ".join(baseline.caster_classes)),
    ])

    if show_classes:
        print("\nBy class")
        headers = ["Class", "MHP", "MMP", "ATK", "DEF", "MAT", "MDF", "AGI", "Hits"]
        rows = []
        for r in baseline.class_rows:
            rows.append([
                r.job,
                r.mhp,
                r.mmp,
                r.total_atk,
                r.total_def,
                r.total_mat,
                r.total_mdf,
                r.agi,
                f"{r.attack_hits_min}-{r.attack_hits_max}",
            ])
        print_table(headers, rows)


def print_table(headers: list[str], rows: list[list[Any]]) -> None:
    widths = [len(h) for h in headers]
    for row in rows:
        for i, item in enumerate(row):
            widths[i] = max(widths[i], len(str(item)))
    print("  ".join(h.ljust(widths[i]) for i, h in enumerate(headers)))
    print("  ".join("-" * widths[i] for i in range(len(headers))))
    for row in rows:
        print("  ".join(str(item).ljust(widths[i]) for i, item in enumerate(row)))


def print_recommendation(rec: EnemyRecommendation) -> None:
    print(f"\nEnemy recommendation — Lv {rec.level} {rec.attacker} attacker")
    print("=" * 72)
    print_kv_table([
        ("Target normal attack", f"{rec.damage_pct:.1%} of avg party MHP ≈ {fmt_num(rec.target_damage)} damage"),
        ("Durability / DEF / MDF", f"{rec.durability} / {rec.def_profile} / {rec.mdf_profile}"),
        ("Speed profile", rec.speed_profile),
        ("Target turns to defeat", fmt_num(rec.turns_to_defeat)),
        ("Recommended EXP", rec.exp_reward),
    ])

    print("\nRecommended enemy params")
    param_rows = [[stat, rec.params[stat]] for stat in RMMZ_PARAM_ORDER]
    print_table(["Param", "Value"], param_rows)

    print("\nEditor params array fallback")
    print(rec.rmmz_params_array())

    print("\nRecommended database EXP reward")
    print(rec.exp_reward)

    print("\nSuggested enemy notetag for true stats")
    print(enemy_stats_notetag(rec.params, rec.level))

    print("\nDiagnostics")
    diag_rows = [(k.replace("_", " "), v) for k, v in rec.diagnostics.items()]
    print_kv_table(diag_rows)


def parse_class_list(value: str | None, fallback: list[str]) -> list[str]:
    if not value:
        return fallback
    return [x.strip() for x in value.split(",") if x.strip()]


def build_balancer(args: argparse.Namespace) -> EncounterBalancer:
    data_path = getattr(args, "data", None)
    plugins_path = getattr(args, "plugins", None)
    data_source = FileSource(data_path, default_folder="data")
    plugins_source = FileSource(plugins_path, default_folder="js/plugins")
    if data_source.kind == "missing":
        raise ProjectFileError("Could not find a database source. Use --data /path/to/data or --data _data.zip.")
    db = Database.load(data_source)
    job_formulas = JobFormulaSet.load_from_plugins(plugins_source)
    damage_formulas = DamageFormulaSet.load_from_plugins(plugins_source)
    exp_curve = ExpCurveSet.load_from_plugins(plugins_source)
    return EncounterBalancer(
        db,
        job_formulas,
        damage_formulas,
        exp_curve,
        def_gear_share=float(getattr(args, "def_gear_share", 0.35)),
        mdf_gear_share=float(getattr(args, "mdf_gear_share", 0.35)),
    )


def add_common_args(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--data", default=None, help="Path to RPG Maker /data folder or a ZIP containing database JSON files.")
    parser.add_argument("--plugins", default=None, help="Path to /js/plugins folder or a ZIP containing plugin JS files.")
    parser.add_argument("--def-gear-share", type=float, default=0.35, help="Estimated General Armor share of total DEF. Default: 0.35")
    parser.add_argument("--mdf-gear-share", type=float, default=0.35, help="Estimated General Armor share of total MDF. Default: 0.35")


def make_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="JRPG RPG Maker MZ encounter balancing helper.")
    add_common_args(parser)
    parser.add_argument("--menu", action="store_true", help="Launch the interactive menu even if no subcommand is supplied.")
    sub = parser.add_subparsers(dest="command")

    p = sub.add_parser("baseline", help="Show level-appropriate party baseline stats.")
    p.add_argument("--level", type=int, required=True)
    p.add_argument("--job-level", type=int, default=None)
    p.add_argument("--martial-classes", default=None, help="Comma-separated class list for ATK averaging.")
    p.add_argument("--caster-classes", default=None, help="Comma-separated class list for MAT averaging.")
    p.add_argument("--no-class-table", action="store_true")

    p = sub.add_parser("recommend", help="Recommend enemy params from a target level and design profile.")
    p.add_argument("--level", type=int, required=True, help="Actor level the players ought to be.")
    p.add_argument("--job-level", type=int, default=None, help="Expected party job level. Defaults to min(level, 99).")
    p.add_argument("--damage-pct", type=float, required=True, help="Target normal attack damage as fraction of avg party MHP, e.g. 0.18.")
    p.add_argument("--attacker", choices=["physical", "magical", "hybrid"], default="physical")
    p.add_argument("--durability", choices=list(HP_PROFILE_MULTIPLIERS), default="medium", help="MHP profile.")
    p.add_argument("--def-profile", choices=list(STAT_PROFILE_MULTIPLIERS), default="medium")
    p.add_argument("--mdf-profile", choices=list(STAT_PROFILE_MULTIPLIERS), default="medium")
    p.add_argument("--speed-profile", choices=list(SPEED_PROFILE_MULTIPLIERS), default="average")
    p.add_argument("--turns", type=float, default=4.0, help="Expected turns for a 4-member party to defeat the enemy.")
    p.add_argument("--party-size", type=int, default=4)
    p.add_argument("--physical-action-weight", type=float, default=0.60, help="DPR blend: 0=all caster spells, 1=all martial attacks. Default .60.")
    p.add_argument("--enemy-attack-power", type=float, default=1.0, help="Power used for the enemy normal attack formula. Default 1.0.")
    p.add_argument("--player-magic-power", type=float, default=None, help="Caster action power for MHP/TTK estimate. Defaults to median SL_DMG.mag skill power.")
    p.add_argument("--xp-share", type=float, default=1.0, help="Share of a full encounter XP budget assigned to this enemy. Use 1/N for N equal enemies.")
    p.add_argument("--xp-scale", type=float, default=1.0, help="Global reward multiplier for the XP recommendation.")
    p.add_argument("--martial-classes", default=None)
    p.add_argument("--caster-classes", default=None)

    p = sub.add_parser("recommend-exp", help="Recommend an EXP reward using the current custom EXP curve.")
    p.add_argument("--level", type=int, required=True)
    p.add_argument("--durability", choices=list(HP_PROFILE_MULTIPLIERS), default="medium")
    p.add_argument("--def-profile", choices=list(STAT_PROFILE_MULTIPLIERS), default="medium")
    p.add_argument("--mdf-profile", choices=list(STAT_PROFILE_MULTIPLIERS), default="medium")
    p.add_argument("--speed-profile", choices=list(SPEED_PROFILE_MULTIPLIERS), default="average")
    p.add_argument("--turns", type=float, default=4.0)
    p.add_argument("--xp-share", type=float, default=1.0)
    p.add_argument("--xp-scale", type=float, default=1.0)

    p = sub.add_parser("inspect-enemy", help="Read an existing enemy from Enemies.json and show damage diagnostics.")
    p.add_argument("--enemy-id", type=int, required=True)
    p.add_argument("--level", type=int, default=None, help="Override expected party/enemy level. Defaults to enemy notetag level or 1.")
    p.add_argument("--job-level", type=int, default=None)

    p = sub.add_parser("export-baselines", help="Export baseline stats for many levels to CSV.")
    p.add_argument("--output", required=True)
    p.add_argument("--levels", default="1,3,5,10,15,20,25,30,40,50,75,99,125,150,199,300,500,750,999")
    p.add_argument("--job-level-mode", choices=["same", "cap99"], default="cap99")

    sub.add_parser("menu", help="Launch the interactive menu.")

    return parser


def run_baseline(args: argparse.Namespace) -> None:
    balancer = build_balancer(args)
    martial = parse_class_list(args.martial_classes, DEFAULT_MARTIAL_CLASSES)
    caster = parse_class_list(args.caster_classes, DEFAULT_CASTER_CLASSES)
    baseline = balancer.baseline(args.level, args.job_level, martial, caster)
    print_baseline(baseline, show_classes=not args.no_class_table)


def run_recommend(args: argparse.Namespace) -> None:
    balancer = build_balancer(args)
    martial = parse_class_list(args.martial_classes, DEFAULT_MARTIAL_CLASSES)
    caster = parse_class_list(args.caster_classes, DEFAULT_CASTER_CLASSES)
    rec = balancer.recommend_enemy(
        level=args.level,
        job_level=args.job_level,
        damage_pct=args.damage_pct,
        attacker=args.attacker,
        durability=args.durability,
        def_profile=args.def_profile,
        mdf_profile=args.mdf_profile,
        speed_profile=args.speed_profile,
        turns_to_defeat=args.turns,
        party_size=args.party_size,
        physical_action_weight=args.physical_action_weight,
        enemy_attack_power=args.enemy_attack_power,
        player_magic_power=args.player_magic_power,
        xp_share=args.xp_share,
        xp_scale=args.xp_scale,
        martial_classes=martial,
        caster_classes=caster,
    )
    print_recommendation(rec)


def run_recommend_exp(args: argparse.Namespace) -> None:
    balancer = build_balancer(args)
    print_exp_recommendation(
        balancer,
        level=args.level,
        durability=args.durability,
        def_profile=args.def_profile,
        mdf_profile=args.mdf_profile,
        speed_profile=args.speed_profile,
        turns=args.turns,
        xp_share=args.xp_share,
        xp_scale=args.xp_scale,
    )


def run_inspect_enemy(args: argparse.Namespace) -> None:
    balancer = build_balancer(args)
    db = balancer.db
    enemy = None
    for raw in db.enemies:
        if raw and int(raw.get("id", 0)) == args.enemy_id:
            enemy = raw
            break
    if not enemy:
        raise ProjectFileError(f"Enemy ID {args.enemy_id} not found.")

    note_level = enemy_level_from_note(enemy.get("note", ""))
    level = args.level or note_level or 1
    baseline = balancer.baseline(level, args.job_level)
    stat, stat_source, note_stats = enemy_true_params(enemy)
    dmg = balancer.damage_formulas
    phys = dmg.enemy_physical(stat.get("ATK", 0), level, baseline.avg_def)
    mag = dmg.enemy_magical(stat.get("MAT", 0), level, baseline.avg_mdf)
    hyb = dmg.enemy_hybrid(stat.get("ATK", 0), stat.get("MAT", 0), level, baseline.avg_def, baseline.avg_mdf)

    print(f"\nExisting enemy — ID {enemy.get('id')} {enemy.get('name')}")
    print("=" * 72)
    print_kv_table([
        ("Level used", level),
        ("Param source", stat_source),
        ("Note stat overrides", note_stats or "none"),
        ("True params used", stat),
        ("Physical attack vs avg party DEF", f"{phys} ({phys / max(1, baseline.avg_mhp):.1%} avg MHP)"),
        ("Magical attack vs avg party MDF", f"{mag} ({mag / max(1, baseline.avg_mhp):.1%} avg MHP)"),
        ("Hybrid attack", f"{hyb} ({hyb / max(1, baseline.avg_mhp):.1%} avg MHP)"),
        ("Avg party MHP", fmt_num(baseline.avg_mhp)),
        ("Avg party DEF", fmt_num(baseline.avg_def)),
        ("Avg party MDF", fmt_num(baseline.avg_mdf)),
    ])


def run_export_baselines(args: argparse.Namespace) -> None:
    balancer = build_balancer(args)
    levels = [int(x.strip()) for x in args.levels.split(",") if x.strip()]
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", newline="", encoding="utf-8") as f:
        fieldnames = [
            "level", "job_level", "avg_mhp", "avg_mmp", "avg_atk", "avg_def", "avg_mat", "avg_mdf", "avg_agi",
            "avg_martial_expected_hits", "avg_martial_basic_damage_vs_medium", "avg_caster_spell_damage_vs_medium",
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for level in levels:
            job_level = level if args.job_level_mode == "same" else min(level, 99)
            baseline = balancer.baseline(level, job_level)
            writer.writerow({k: baseline.as_dict()[k] for k in fieldnames})
    print(f"Exported {len(levels)} baseline rows to {output}")



def prompt_int(label: str, default: int | None = None, minimum: int | None = None, maximum: int | None = None) -> int:
    while True:
        raw = input(f"{label}" + (f" [{default}]" if default is not None else "") + ": ").strip()
        if raw == "" and default is not None:
            value = default
        else:
            try:
                value = int(raw)
            except ValueError:
                print("Please enter an integer.")
                continue
        if minimum is not None and value < minimum:
            print(f"Please enter a value at least {minimum}.")
            continue
        if maximum is not None and value > maximum:
            print(f"Please enter a value no greater than {maximum}.")
            continue
        return value


def prompt_float(label: str, default: float | None = None, minimum: float | None = None, maximum: float | None = None) -> float:
    while True:
        raw = input(f"{label}" + (f" [{default}]" if default is not None else "") + ": ").strip()
        if raw == "" and default is not None:
            value = default
        else:
            try:
                value = float(raw)
            except ValueError:
                print("Please enter a number.")
                continue
        if minimum is not None and value < minimum:
            print(f"Please enter a value at least {minimum}.")
            continue
        if maximum is not None and value > maximum:
            print(f"Please enter a value no greater than {maximum}.")
            continue
        return value


def prompt_str(label: str, default: str | None = None, allow_blank: bool = False) -> str:
    while True:
        raw = input(f"{label}" + (f" [{default}]" if default is not None else "") + ": ").strip()
        if raw == "" and default is not None:
            return default
        if raw or allow_blank:
            return raw
        print("Please enter a value.")


def prompt_optional_float(label: str, default: float | None = None) -> float | None:
    while True:
        default_text = "blank = auto" if default is None else str(default)
        raw = input(f"{label} [{default_text}]: ").strip()
        if raw == "":
            return default
        if raw.lower() in {"none", "auto", "default"}:
            return None
        try:
            return float(raw)
        except ValueError:
            print("Please enter a number, or leave blank for auto.")


def prompt_choice(label: str, choices: Iterable[str], default: str) -> str:
    choices = list(choices)
    choice_map = {str(i + 1): value for i, value in enumerate(choices)}
    normalized_map = {value.lower(): value for value in choices}
    print(f"\n{label}:")
    for i, value in enumerate(choices, start=1):
        marker = " *" if value == default else ""
        print(f"  {i}) {value}{marker}")
    while True:
        raw = input(f"Choose {label.lower()} [{default}]: ").strip().lower()
        if raw == "":
            return default
        if raw in choice_map:
            return choice_map[raw]
        if raw in normalized_map:
            return normalized_map[raw]
        print("Please choose one of the listed options.")


def prompt_yes_no(label: str, default: bool = False) -> bool:
    suffix = "Y/n" if default else "y/N"
    while True:
        raw = input(f"{label} ({suffix}): ").strip().lower()
        if raw == "":
            return default
        if raw in {"y", "yes"}:
            return True
        if raw in {"n", "no"}:
            return False
        print("Please enter yes or no.")


def prompt_class_list(label: str, default: list[str]) -> list[str]:
    print(f"\n{label}")
    print("Default:", ", ".join(default))
    raw = input("Comma-separated class names, or blank for default: ").strip()
    return parse_class_list(raw, default)


def prompt_level_list(default: str) -> str:
    while True:
        raw = prompt_str("Levels to export, comma-separated", default)
        try:
            values = [int(x.strip()) for x in raw.split(",") if x.strip()]
        except ValueError:
            print("Please enter levels like 1,3,5,10,25.")
            continue
        if values:
            return ",".join(str(x) for x in values)
        print("Please enter at least one level.")


def pause() -> None:
    input("\nPress Enter to return to the menu...")


def _args_with(args: argparse.Namespace, **updates: Any) -> argparse.Namespace:
    data = vars(args).copy()
    data.update(updates)
    return argparse.Namespace(**data)


def _source_status(args: argparse.Namespace) -> list[tuple[str, Any]]:
    data_source = FileSource(getattr(args, "data", None), default_folder="data")
    plugins_source = FileSource(getattr(args, "plugins", None), default_folder="js/plugins")
    return [
        ("Database source", f"{data_source.kind}: {data_source.path}" if data_source.kind != "missing" else "missing"),
        ("Plugin source", f"{plugins_source.kind}: {plugins_source.path}" if plugins_source.kind != "missing" else "missing / using fallback constants where needed"),
        ("DEF gear share", getattr(args, "def_gear_share", 0.35)),
        ("MDF gear share", getattr(args, "mdf_gear_share", 0.35)),
    ]


def configure_sources(args: argparse.Namespace, first_run: bool = False) -> argparse.Namespace:
    """Let the user set database/plugin paths and gear-share assumptions."""
    if first_run:
        data_source = FileSource(getattr(args, "data", None), default_folder="data")
        if data_source.kind != "missing":
            return args
        print("I could not automatically find your RPG Maker data folder or data ZIP.")
        print("Enter the path to your project data folder or a ZIP containing the database JSON files.")

    while True:
        print("\nCurrent source/settings")
        print("=" * 72)
        print_kv_table(_source_status(args))
        print("\n1) Set database source")
        print("2) Set plugin source")
        print("3) Set DEF/MDF gear-share assumptions")
        print("4) Done")
        choice = input("Choose an option: ").strip().lower()

        if choice == "1":
            current = getattr(args, "data", None)
            value = prompt_str("Path to /data folder or _data.zip", str(current) if current else None)
            args.data = value
        elif choice == "2":
            current = getattr(args, "plugins", None)
            value = prompt_str("Path to /js/plugins folder or _plugins.zip", str(current) if current else None, allow_blank=True)
            args.plugins = value or None
        elif choice == "3":
            args.def_gear_share = prompt_float("General Armor DEF share", float(getattr(args, "def_gear_share", 0.35)), 0.0, 0.85)
            args.mdf_gear_share = prompt_float("General Armor MDF share", float(getattr(args, "mdf_gear_share", 0.35)), 0.0, 0.85)
        elif choice == "4" or choice in {"q", "quit", "exit"}:
            return args
        else:
            print("Please choose 1, 2, 3, or 4.")


def build_balancer_interactive(args: argparse.Namespace) -> EncounterBalancer:
    """Build the balancer, prompting for paths if the database cannot be found."""
    while True:
        try:
            return build_balancer(args)
        except ProjectFileError as exc:
            print(f"\nError: {exc}")
            args = configure_sources(args, first_run=True)


def menu_party_baseline(balancer: EncounterBalancer) -> None:
    level = prompt_int("Actor level", minimum=1)
    job_level = prompt_int("Job level", min(level, 99), minimum=1, maximum=99)
    use_custom_classes = prompt_yes_no("Customize martial/caster class groups", False)
    martial = DEFAULT_MARTIAL_CLASSES
    caster = DEFAULT_CASTER_CLASSES
    if use_custom_classes:
        martial = prompt_class_list("Martial classes used for ATK average", DEFAULT_MARTIAL_CLASSES)
        caster = prompt_class_list("Caster classes used for MAT average", DEFAULT_CASTER_CLASSES)
    show_classes = prompt_yes_no("Show the by-class table", True)
    baseline = balancer.baseline(level, job_level, martial, caster)
    print_baseline(baseline, show_classes=show_classes)
    pause()


def _enemy_option_rows(options: dict[str, Any]) -> list[tuple[str, Any]]:
    player_magic = options.get("player_magic_power")
    return [
        ("Actor/enemy level", options["level"]),
        ("Expected job level", options["job_level"]),
        ("Attacker type", options["attacker"]),
        ("Normal attack damage target", f"{float(options['damage_pct']):.1%} of avg party MHP"),
        ("Enemy attack formula power", options["enemy_attack_power"]),
        ("MHP durability", options["durability"]),
        ("DEF profile", options["def_profile"]),
        ("MDF profile", options["mdf_profile"]),
        ("Speed profile", options["speed_profile"]),
        ("Expected turns to defeat", options["turns"]),
        ("Party size", options["party_size"]),
        ("Physical action weight", options["physical_action_weight"]),
        ("Caster action power", "auto from learned skills" if player_magic is None else player_magic),
        ("XP share", options["xp_share"]),
        ("XP scale", options["xp_scale"]),
        ("Martial classes", ", ".join(options["martial"])),
        ("Caster classes", ", ".join(options["caster"])),
    ]


def _default_enemy_options() -> dict[str, Any]:
    return {
        "level": 1,
        "job_level": 1,
        "damage_pct": 0.18,
        "attacker": "physical",
        "durability": "medium",
        "def_profile": "medium",
        "mdf_profile": "medium",
        "speed_profile": "average",
        "turns": 4.0,
        "party_size": 4,
        "physical_action_weight": 0.60,
        "enemy_attack_power": 1.0,
        "player_magic_power": None,
        "xp_share": 1.0,
        "xp_scale": 1.0,
        "martial": list(DEFAULT_MARTIAL_CLASSES),
        "caster": list(DEFAULT_CASTER_CLASSES),
    }


def _sync_job_level_default(options: dict[str, Any]) -> None:
    options["job_level"] = max(1, min(int(options["job_level"]), 99, int(options["level"])))


def menu_enemy_level_options(options: dict[str, Any]) -> None:
    print("\nLevel settings")
    print("=" * 72)
    options["level"] = prompt_int("Actor/enemy level", int(options["level"]), minimum=1)
    suggested_job = min(int(options["level"]), 99)
    options["job_level"] = prompt_int("Expected party job level", suggested_job, minimum=1, maximum=99)
    _sync_job_level_default(options)


def menu_enemy_offense_options(options: dict[str, Any]) -> None:
    while True:
        print("\nEnemy offense settings")
        print("=" * 72)
        print_kv_table([
            ("Attacker type", options["attacker"]),
            ("Normal attack damage target", f"{float(options['damage_pct']):.1%} of avg party MHP"),
            ("Enemy attack formula power", options["enemy_attack_power"]),
        ])
        print("\n1) Change attacker type")
        print("2) Change normal attack damage target")
        print("3) Change enemy attack formula power")
        print("4) Done")
        choice = input("Choose an option: ").strip().lower()
        if choice == "1":
            options["attacker"] = prompt_choice("Attacker type", ["physical", "magical", "hybrid"], str(options["attacker"]))
        elif choice == "2":
            options["damage_pct"] = prompt_float("Damage as decimal of avg MHP, e.g. 0.18 for 18%", float(options["damage_pct"]), 0.0)
        elif choice == "3":
            options["enemy_attack_power"] = prompt_float("Enemy normal attack formula power", float(options["enemy_attack_power"]), 0.0)
        elif choice == "4" or choice in {"q", "quit", "exit", "back"}:
            return
        else:
            print("Please choose 1, 2, 3, or 4.")


def menu_enemy_defense_options(options: dict[str, Any]) -> None:
    while True:
        print("\nEnemy durability / defense settings")
        print("=" * 72)
        print_kv_table([
            ("MHP durability", options["durability"]),
            ("DEF profile", options["def_profile"]),
            ("MDF profile", options["mdf_profile"]),
            ("Speed profile", options["speed_profile"]),
            ("Expected turns to defeat", options["turns"]),
        ])
        print("\n1) Change MHP durability profile")
        print("2) Change DEF profile")
        print("3) Change MDF profile")
        print("4) Change speed profile")
        print("5) Change expected turns to defeat")
        print("6) Done")
        choice = input("Choose an option: ").strip().lower()
        if choice == "1":
            options["durability"] = prompt_choice("MHP durability profile", HP_PROFILE_MULTIPLIERS.keys(), str(options["durability"]))
        elif choice == "2":
            options["def_profile"] = prompt_choice("DEF profile", STAT_PROFILE_MULTIPLIERS.keys(), str(options["def_profile"]))
        elif choice == "3":
            options["mdf_profile"] = prompt_choice("MDF profile", STAT_PROFILE_MULTIPLIERS.keys(), str(options["mdf_profile"]))
        elif choice == "4":
            options["speed_profile"] = prompt_choice("Speed profile", SPEED_PROFILE_MULTIPLIERS.keys(), str(options["speed_profile"]))
        elif choice == "5":
            options["turns"] = prompt_float("Expected turns for the party to defeat this enemy", float(options["turns"]), 0.1)
        elif choice == "6" or choice in {"q", "quit", "exit", "back"}:
            return
        else:
            print("Please choose 1 through 6.")


def menu_enemy_party_options(options: dict[str, Any]) -> None:
    while True:
        print("\nParty / player DPR settings")
        print("=" * 72)
        print_kv_table([
            ("Party size", options["party_size"]),
            ("Physical action weight", options["physical_action_weight"]),
            ("Caster action power", "auto from learned skills" if options["player_magic_power"] is None else options["player_magic_power"]),
        ])
        print("\n1) Change party size")
        print("2) Change physical action weight")
        print("3) Change caster action power override")
        print("4) Clear caster action power override / use learned skills")
        print("5) Done")
        choice = input("Choose an option: ").strip().lower()
        if choice == "1":
            options["party_size"] = prompt_int("Party size", int(options["party_size"]), minimum=1)
        elif choice == "2":
            options["physical_action_weight"] = prompt_float("Physical action weight for party DPR, 0 to 1", float(options["physical_action_weight"]), 0.0, 1.0)
        elif choice == "3":
            options["player_magic_power"] = prompt_float("Caster action power override", 1.0, 0.0)
        elif choice == "4":
            options["player_magic_power"] = None
            print("Caster damage will use learned skill powers when possible.")
        elif choice == "5" or choice in {"q", "quit", "exit", "back"}:
            return
        else:
            print("Please choose 1 through 5.")


def menu_enemy_xp_options(options: dict[str, Any], balancer: EncounterBalancer | None = None) -> None:
    while True:
        print("\nEXP reward settings")
        print("=" * 72)
        print_kv_table([
            ("XP share", options["xp_share"]),
            ("XP scale", options["xp_scale"]),
            ("Level used", options["level"]),
            ("MHP/DEF/MDF/Speed", f"{options['durability']} / {options['def_profile']} / {options['mdf_profile']} / {options['speed_profile']}"),
            ("Turns", options["turns"]),
        ])
        if balancer is not None:
            reward, diag = balancer.exp_curve.recommended_enemy_exp(
                level=int(options["level"]),
                durability=str(options["durability"]),
                def_profile=str(options["def_profile"]),
                mdf_profile=str(options["mdf_profile"]),
                speed_profile=str(options["speed_profile"]),
                turns_to_defeat=float(options["turns"]),
                xp_share=float(options["xp_share"]),
                xp_scale=float(options["xp_scale"]),
            )
            print("\nCurrent EXP preview")
            print_kv_table([
                ("Recommended enemy EXP", reward),
                ("XP to next level", diag["xp_to_next_level"]),
                ("Target battles per level", diag["target_battles_per_level"]),
                ("Base full encounter XP", diag["base_full_encounter_xp"]),
                ("Difficulty factor", diag["xp_difficulty_factor"]),
                ("Full encounter XP after scaling", diag["recommended_full_encounter_xp"]),
            ])
        print("\n1) Change XP share")
        print("2) Change XP scale")
        print("3) Done")
        choice = input("Choose an option: ").strip().lower()
        if choice == "1":
            options["xp_share"] = prompt_float("XP share of full encounter budget, e.g. 1 solo, 0.333 three equal enemies", float(options["xp_share"]), 0.0)
        elif choice == "2":
            options["xp_scale"] = prompt_float("Global XP reward scale", float(options["xp_scale"]), 0.0)
        elif choice == "3" or choice in {"q", "quit", "exit", "back"}:
            return
        else:
            print("Please choose 1, 2, or 3.")


def menu_enemy_class_groups(options: dict[str, Any]) -> None:
    while True:
        print("\nClass group settings")
        print("=" * 72)
        print_kv_table([
            ("Martial classes", ", ".join(options["martial"])),
            ("Caster classes", ", ".join(options["caster"])),
        ])
        print("\n1) Change martial classes")
        print("2) Change caster classes")
        print("3) Reset to defaults")
        print("4) Done")
        choice = input("Choose an option: ").strip().lower()
        if choice == "1":
            options["martial"] = prompt_class_list("Martial classes used for ATK/DPR", DEFAULT_MARTIAL_CLASSES)
        elif choice == "2":
            options["caster"] = prompt_class_list("Caster classes used for MAT/DPR", DEFAULT_CASTER_CLASSES)
        elif choice == "3":
            options["martial"] = list(DEFAULT_MARTIAL_CLASSES)
            options["caster"] = list(DEFAULT_CASTER_CLASSES)
            print("Class groups reset to defaults.")
        elif choice == "4" or choice in {"q", "quit", "exit", "back"}:
            return
        else:
            print("Please choose 1 through 4.")


def menu_recommend_enemy(balancer: EncounterBalancer) -> None:
    options = _default_enemy_options()
    while True:
        print("\nEnemy recommendation builder")
        print("=" * 72)
        print_kv_table(_enemy_option_rows(options))
        print("\n1) Level settings")
        print("2) Offense settings")
        print("3) Durability / defense settings")
        print("4) Party / player DPR settings")
        print("5) EXP reward settings")
        print("6) Martial/caster class groups")
        print("7) Generate recommendation")
        print("8) Reset options")
        print("9) Back to main menu")
        choice = input("Choose an option: ").strip().lower()

        if choice == "1":
            menu_enemy_level_options(options)
        elif choice == "2":
            menu_enemy_offense_options(options)
        elif choice == "3":
            menu_enemy_defense_options(options)
        elif choice == "4":
            menu_enemy_party_options(options)
        elif choice == "5":
            menu_enemy_xp_options(options, balancer)
        elif choice == "6":
            menu_enemy_class_groups(options)
        elif choice == "7":
            rec = balancer.recommend_enemy(
                level=int(options["level"]),
                job_level=int(options["job_level"]),
                damage_pct=float(options["damage_pct"]),
                attacker=str(options["attacker"]),  # type: ignore[arg-type]
                durability=str(options["durability"]),
                def_profile=str(options["def_profile"]),
                mdf_profile=str(options["mdf_profile"]),
                speed_profile=str(options["speed_profile"]),
                turns_to_defeat=float(options["turns"]),
                party_size=int(options["party_size"]),
                physical_action_weight=float(options["physical_action_weight"]),
                enemy_attack_power=float(options["enemy_attack_power"]),
                player_magic_power=options["player_magic_power"],
                xp_share=float(options["xp_share"]),
                xp_scale=float(options["xp_scale"]),
                martial_classes=options["martial"],
                caster_classes=options["caster"],
            )
            print_recommendation(rec)
            pause()
        elif choice == "8":
            options = _default_enemy_options()
            print("Options reset.")
        elif choice == "9" or choice in {"q", "quit", "exit", "back"}:
            return
        else:
            print("Please choose a menu option from 1 to 9.")


def print_exp_recommendation(
    balancer: EncounterBalancer,
    level: int,
    durability: str,
    def_profile: str,
    mdf_profile: str,
    speed_profile: str,
    turns: float,
    xp_share: float,
    xp_scale: float,
) -> None:
    reward, diag = balancer.exp_curve.recommended_enemy_exp(
        level=level,
        durability=durability,
        def_profile=def_profile,
        mdf_profile=mdf_profile,
        speed_profile=speed_profile,
        turns_to_defeat=turns,
        xp_share=xp_share,
        xp_scale=xp_scale,
    )
    print(f"\nEXP recommendation — Lv {level}")
    print("=" * 72)
    print_kv_table([
        ("Recommended enemy EXP", reward),
        ("XP to next level", diag["xp_to_next_level"]),
        ("Target battles per level", diag["target_battles_per_level"]),
        ("Base full encounter XP", diag["base_full_encounter_xp"]),
        ("Difficulty factor", diag["xp_difficulty_factor"]),
        ("XP share", diag["xp_share"]),
        ("XP scale", diag["xp_scale"]),
        ("Recommended full encounter XP", diag["recommended_full_encounter_xp"]),
    ])


def menu_recommend_exp(balancer: EncounterBalancer) -> None:
    options = _default_enemy_options()
    while True:
        print("\nEXP reward calculator")
        print("=" * 72)
        reward, diag = balancer.exp_curve.recommended_enemy_exp(
            level=int(options["level"]),
            durability=str(options["durability"]),
            def_profile=str(options["def_profile"]),
            mdf_profile=str(options["mdf_profile"]),
            speed_profile=str(options["speed_profile"]),
            turns_to_defeat=float(options["turns"]),
            xp_share=float(options["xp_share"]),
            xp_scale=float(options["xp_scale"]),
        )
        print_kv_table([
            ("Level", options["level"]),
            ("MHP/DEF/MDF/Speed", f"{options['durability']} / {options['def_profile']} / {options['mdf_profile']} / {options['speed_profile']}"),
            ("Turns", options["turns"]),
            ("XP share", options["xp_share"]),
            ("XP scale", options["xp_scale"]),
            ("Current recommended EXP", reward),
            ("XP to next level", diag["xp_to_next_level"]),
            ("Target battles per level", diag["target_battles_per_level"]),
        ])
        print("\n1) Change level")
        print("2) Change durability / defense / speed profile")
        print("3) Change expected turns")
        print("4) Change XP share / scale")
        print("5) Print full EXP recommendation")
        print("6) Back to main menu")
        choice = input("Choose an option: ").strip().lower()
        if choice == "1":
            options["level"] = prompt_int("Enemy level", int(options["level"]), minimum=1)
            _sync_job_level_default(options)
        elif choice == "2":
            menu_enemy_defense_options(options)
        elif choice == "3":
            options["turns"] = prompt_float("Expected turns to defeat", float(options["turns"]), 0.1)
        elif choice == "4":
            menu_enemy_xp_options(options, balancer)
        elif choice == "5":
            print_exp_recommendation(
                balancer,
                int(options["level"]),
                str(options["durability"]),
                str(options["def_profile"]),
                str(options["mdf_profile"]),
                str(options["speed_profile"]),
                float(options["turns"]),
                float(options["xp_share"]),
                float(options["xp_scale"]),
            )
            pause()
        elif choice == "6" or choice in {"q", "quit", "exit", "back"}:
            return
        else:
            print("Please choose 1 through 6.")


def menu_inspect_enemy(balancer: EncounterBalancer, args: argparse.Namespace) -> None:
    show_list = prompt_yes_no("Show enemy ID/name list first", True)
    if show_list:
        rows = []
        for raw in balancer.db.enemies:
            if raw:
                params, source, note_stats = enemy_true_params(raw)
                level = enemy_level_from_note(raw.get("note", "")) or "?"
                source_label = "note" if note_stats else "editor"
                rows.append([raw.get("id"), raw.get("name"), level, params.get("MHP", "?"), source_label])
        print("\nEnemies")
        print_table(["ID", "Name", "Lv", "MHP", "Stats"], rows)
    enemy_id = prompt_int("Enemy ID", minimum=1)
    level_override = None
    job_level_override = None
    if prompt_yes_no("Override level/job level for diagnostics", False):
        level_override = prompt_int("Level override", minimum=1)
        job_level_override = prompt_int("Job level override", min(level_override, 99), minimum=1, maximum=99)
    ns = _args_with(args, enemy_id=enemy_id, level=level_override, job_level=job_level_override)
    run_inspect_enemy(ns)
    pause()


def menu_export_baselines(balancer: EncounterBalancer, args: argparse.Namespace) -> None:
    default_levels = "1,3,5,10,15,20,25,30,40,50,75,99,125,150,199,300,500,750,999"
    output = prompt_str("Output CSV path", "jrpg_party_baselines.csv")
    levels = prompt_level_list(default_levels)
    mode = prompt_choice("Job level mode", ["cap99", "same"], "cap99")
    ns = _args_with(args, output=output, levels=levels, job_level_mode=mode)
    run_export_baselines(ns)
    pause()


def menu_list_classes(balancer: EncounterBalancer) -> None:
    rows = []
    for cls in balancer.classes:
        hit_ranges = ", ".join(f"Lv {lv}: {lo}-{hi}" for lv, lo, hi in cls.attack_hits) or "1-1"
        skills = ", ".join(f"Lv {lv}->#{sid}" for lv, sid in cls.job_level_skills[:8])
        if len(cls.job_level_skills) > 8:
            skills += ", ..."
        rows.append([cls.class_id, cls.database_name, cls.job_name, hit_ranges, skills or "none"])
    print("\nLoaded classes")
    print_table(["ID", "DB Name", "Formula", "Attack Hits", "Job Skills"], rows)
    pause()


def menu_show_profiles(balancer: EncounterBalancer | None = None) -> None:
    print("\nDurability / MHP profiles")
    print_kv_table([(k, v) for k, v in HP_PROFILE_MULTIPLIERS.items()])
    print("\nDEF/MDF profiles")
    print_kv_table([(k, v) for k, v in STAT_PROFILE_MULTIPLIERS.items()])
    print("\nSpeed profiles")
    print_kv_table([(k, v) for k, v in SPEED_PROFILE_MULTIPLIERS.items()])
    if balancer is not None:
        print("\nEXP pacing samples")
        rows = []
        for level in [1, 3, 5, 10, 25, 50, 75, 99, 125, 150, 199]:
            if level <= balancer.exp_curve.max_level:
                rows.append([
                    level,
                    balancer.exp_curve.xp_to_next_level(level),
                    fmt_num(balancer.exp_curve.target_battles_per_level(level)),
                    fmt_num(balancer.exp_curve.xp_to_next_level(level) / max(1, balancer.exp_curve.target_battles_per_level(level))),
                ])
        print_table(["Lv", "XP to next", "Battles/lv", "Base encounter XP"], rows)
    pause()


def interactive_menu(args: argparse.Namespace) -> None:
    print("JRPG Encounter Balancer")
    print("=" * 72)
    args = configure_sources(args, first_run=True)
    balancer = build_balancer_interactive(args)

    while True:
        print("\nMain menu")
        print("=" * 72)
        print("1) Party baseline")
        print("2) Recommend enemy stats")
        print("3) EXP reward calculator")
        print("4) Inspect existing enemy")
        print("5) Export baseline CSV")
        print("6) List loaded classes")
        print("7) Show profile multipliers / EXP pacing")
        print("8) Source/settings")
        print("9) Quit")
        choice = input("Choose an option: ").strip().lower()

        try:
            if choice == "1":
                menu_party_baseline(balancer)
            elif choice == "2":
                menu_recommend_enemy(balancer)
            elif choice == "3":
                menu_recommend_exp(balancer)
            elif choice == "4":
                menu_inspect_enemy(balancer, args)
            elif choice == "5":
                menu_export_baselines(balancer, args)
            elif choice == "6":
                menu_list_classes(balancer)
            elif choice == "7":
                menu_show_profiles(balancer)
            elif choice == "8":
                args = configure_sources(args)
                balancer = build_balancer_interactive(args)
            elif choice == "9" or choice in {"q", "quit", "exit"}:
                return
            else:
                print("Please choose a menu option from 1 to 9.")
        except (ProjectFileError, ValueError, KeyError) as exc:
            print(f"\nError: {exc}")
            pause()


def main(argv: list[str] | None = None) -> int:
    parser = make_parser()
    args = parser.parse_args(argv)
    try:
        if args.menu or args.command in {None, "menu"}:
            interactive_menu(args)
        elif args.command == "baseline":
            run_baseline(args)
        elif args.command == "recommend":
            run_recommend(args)
        elif args.command == "recommend-exp":
            run_recommend_exp(args)
        elif args.command == "inspect-enemy":
            run_inspect_enemy(args)
        elif args.command == "export-baselines":
            run_export_baselines(args)
        else:
            parser.print_help()
            return 1
        return 0
    except ProjectFileError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 2
    except KeyboardInterrupt:
        print("\nCancelled.", file=sys.stderr)
        return 130


if __name__ == "__main__":
    raise SystemExit(main())
