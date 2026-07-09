/*:
 * @target MZ
 * @plugindesc Overrides actor base parameters with JRPG job + level milestone formulas. v1.0.0
 * @author ChatGPT
 *
 * @help
 * JRPG_JobLevelStats.js
 *
 * This plugin replaces actor base parameters for Max HP, Max MP, ATK, DEF,
 * MAT, MDF, and AGI using the custom job/level formulas designed for this
 * project. It does not override LUK because the current formula file does not
 * define Luck values.
 *
 * Place this plugin below VisuStella Core Engine and below any job/class plugin
 * that changes Game_Actor.prototype.paramBase.
 *
 * The plugin reads the actor's current class as the actor's job.
 * By default, the RPG Maker class name must match one of these job names:
 *
 * Warrior
 * Knight
 * Dark Knight
 * Monk
 * Dragoon
 * Ranger
 * Thief
 * Gunslinger
 * Priest
 * White Mage
 * Black Mage
 * Red Mage
 *
 * You can also put this notetag in a Class note box to map the class to a job:
 *
 *   <JRPGJob: Warrior>
 *
 * or:
 *
 *   <JobStatFormula: Warrior>
 *
 * Unknown jobs/classes fall back to RPG Maker's normal database parameters.
 * LUK also falls back to RPG Maker's normal database parameter.
 *
 * Script calls for testing:
 *
 *   JRPG.JobLevelStats.getStat("Warrior", 34, "ATK")
 *   JRPG.JobLevelStats.getStat("Black Mage", 999, "MAT")
 *
 * This plugin intentionally overrides paramBase, not param. That means
 * equipment, traits, states, buffs, debuffs, and parameter rates are still
 * applied normally by RPG Maker after the custom base parameter is calculated.
 *
 * There are no plugin commands.
 */

(() => {
  "use strict";

  window.JRPG = window.JRPG || {};
  JRPG.JobLevelStats = JRPG.JobLevelStats || {};

  const JLS = JRPG.JobLevelStats;

  JLS.MILESTONE_LEVELS = [1, 10, 25, 50, 75, 99, 125, 150, 199, 300, 500, 750, 999];

  JLS.MILESTONE_MIN = {
    MHP: { 1: 220, 10: 480, 25: 950, 50: 1750, 75: 2700, 99: 3800, 125: 5800, 150: 8000, 199: 12500, 300: 18500, 500: 28000, 750: 38000, 999: 46000 },
    MMP: { 1: 25, 10: 60, 25: 130, 50: 260, 75: 420, 99: 620, 125: 900, 150: 1250, 199: 1900, 300: 2700, 500: 3700, 750: 4600, 999: 5300 },
    ATK: { 1: 14, 10: 35, 25: 80, 50: 170, 75: 300, 99: 475, 125: 700, 150: 950, 199: 1400, 300: 1900, 500: 2600, 750: 3200, 999: 3700 },
    DEF: { 1: 12, 10: 30, 25: 65, 50: 130, 75: 220, 99: 330, 125: 500, 150: 700, 199: 1050, 300: 1500, 500: 2100, 750: 2650, 999: 3100 },
    MAT: { 1: 14, 10: 35, 25: 80, 50: 170, 75: 300, 99: 475, 125: 700, 150: 950, 199: 1400, 300: 1900, 500: 2600, 750: 3200, 999: 3700 },
    MDF: { 1: 12, 10: 30, 25: 65, 50: 130, 75: 220, 99: 330, 125: 500, 150: 700, 199: 1050, 300: 1500, 500: 2100, 750: 2650, 999: 3100 },
    AGI: { 1: 16, 10: 24, 25: 36, 50: 52, 75: 66, 99: 80, 125: 95, 150: 110, 199: 135, 300: 155, 500: 175, 750: 190, 999: 200 }
  };

  JLS.MULTIPLIERS = {
    Warrior:       { MHP: 1.35, MMP: 0.70, ATK: 1.45, DEF: 1.25, MAT: 0.60, MDF: 0.95, AGI: 1.10 },
    Knight:        { MHP: 1.50, MMP: 0.75, ATK: 1.20, DEF: 1.55, MAT: 0.55, MDF: 1.20, AGI: 1.00 },
    "Dark Knight": { MHP: 1.40, MMP: 0.90, ATK: 1.55, DEF: 1.20, MAT: 0.95, MDF: 1.05, AGI: 1.05 },
    Monk:          { MHP: 1.25, MMP: 0.65, ATK: 1.30, DEF: 1.15, MAT: 0.65, MDF: 1.15, AGI: 1.30 },
    Dragoon:       { MHP: 1.30, MMP: 0.70, ATK: 1.40, DEF: 1.20, MAT: 0.55, MDF: 0.95, AGI: 1.20 },
    Ranger:        { MHP: 1.15, MMP: 0.80, ATK: 1.25, DEF: 1.05, MAT: 0.65, MDF: 1.00, AGI: 1.40 },
    Thief:         { MHP: 1.05, MMP: 0.75, ATK: 1.10, DEF: 1.00, MAT: 0.60, MDF: 0.95, AGI: 1.60 },
    Gunslinger:    { MHP: 1.10, MMP: 0.80, ATK: 1.35, DEF: 1.00, MAT: 0.65, MDF: 0.95, AGI: 1.25 },
    Priest:        { MHP: 1.10, MMP: 1.30, ATK: 0.75, DEF: 1.05, MAT: 1.15, MDF: 1.45, AGI: 1.05 },
    "White Mage":  { MHP: 1.00, MMP: 1.45, ATK: 0.60, DEF: 1.00, MAT: 1.20, MDF: 1.50, AGI: 1.10 },
    "Black Mage":  { MHP: 1.00, MMP: 1.50, ATK: 0.55, DEF: 0.95, MAT: 1.55, MDF: 1.25, AGI: 1.00 },
    "Red Mage":    { MHP: 1.15, MMP: 1.15, ATK: 1.05, DEF: 1.10, MAT: 1.15, MDF: 1.15, AGI: 1.20 }
  };

  JLS.STAT_GROWTH_SHAPES = {
    MHP: "smooth",
    MMP: "smooth_late",
    ATK: "smooth_early",
    DEF: "linear_soft",
    MAT: "smooth_early",
    MDF: "linear_soft",
    AGI: "linear"
  };

  JLS.PARAM_ID_TO_STAT = {
    0: "MHP",
    1: "MMP",
    2: "ATK",
    3: "DEF",
    4: "MAT",
    5: "MDF",
    6: "AGI",
    7: "LUK"
  };

  function normalizeName(name) {
    return String(name || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  }

  JLS.JOB_ALIASES = {};
  for (const jobName of Object.keys(JLS.MULTIPLIERS)) {
    JLS.JOB_ALIASES[normalizeName(jobName)] = jobName;
  }

  function clampNumber(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  // Matches Python's round() behavior for positive stat values: halves round to even.
  function roundHalfToEven(value) {
    const floor = Math.floor(value);
    const diff = value - floor;
    const epsilon = 1e-9;

    if (diff > 0.5 + epsilon) return floor + 1;
    if (diff < 0.5 - epsilon) return floor;

    return floor % 2 === 0 ? floor : floor + 1;
  }

  JLS.growthProgress = function(t, style) {
    const s = t * t * (3 - 2 * t);

    switch (style) {
      case "linear":
        return t;
      case "linear_soft":
        return 0.75 * t + 0.25 * s;
      case "smooth":
        return s;
      case "smooth_early":
        return Math.pow(s, 0.85);
      case "smooth_late":
        return Math.pow(s, 1.15);
      case "very_early":
        return Math.pow(s, 0.70);
      case "very_late":
        return Math.pow(s, 1.35);
      default:
        return s;
    }
  };

  JLS.getStartLevel = function(level) {
    const clampedLevel = clampNumber(
      Number(level) || 1,
      JLS.MILESTONE_LEVELS[0],
      JLS.MILESTONE_LEVELS[JLS.MILESTONE_LEVELS.length - 1]
    );

    for (let i = 0; i < JLS.MILESTONE_LEVELS.length; i++) {
      if (JLS.MILESTONE_LEVELS[i] > clampedLevel) {
        return JLS.MILESTONE_LEVELS[i - 1];
      }
    }

    return JLS.MILESTONE_LEVELS[JLS.MILESTONE_LEVELS.length - 2];
  };

  JLS.getEndLevel = function(level) {
    const clampedLevel = clampNumber(
      Number(level) || 1,
      JLS.MILESTONE_LEVELS[0],
      JLS.MILESTONE_LEVELS[JLS.MILESTONE_LEVELS.length - 1]
    );

    for (let i = 0; i < JLS.MILESTONE_LEVELS.length; i++) {
      if (JLS.MILESTONE_LEVELS[i] > clampedLevel) {
        return JLS.MILESTONE_LEVELS[i];
      }
    }

    return JLS.MILESTONE_LEVELS[JLS.MILESTONE_LEVELS.length - 1];
  };

  JLS.interpolateStat = function(level, stat) {
    const statKey = String(stat || "").toUpperCase();
    const milestones = JLS.MILESTONE_MIN[statKey];
    const style = JLS.STAT_GROWTH_SHAPES[statKey];

    if (!milestones || !style) return null;

    const clampedLevel = clampNumber(
      Number(level) || 1,
      JLS.MILESTONE_LEVELS[0],
      JLS.MILESTONE_LEVELS[JLS.MILESTONE_LEVELS.length - 1]
    );

    const startLevel = JLS.getStartLevel(clampedLevel);
    const endLevel = JLS.getEndLevel(clampedLevel);
    const startValue = milestones[startLevel];
    const endValue = milestones[endLevel];

    const t = (clampedLevel - startLevel) / (endLevel - startLevel);
    const p = JLS.growthProgress(t, style);

    return startValue + (endValue - startValue) * p;
  };

  JLS.canonicalJobName = function(jobName) {
    return JLS.JOB_ALIASES[normalizeName(jobName)] || null;
  };

  JLS.getStat = function(jobName, level, stat) {
    const canonicalJob = JLS.canonicalJobName(jobName);
    const statKey = String(stat || "").toUpperCase();

    if (!canonicalJob) return null;
    if (!JLS.MULTIPLIERS[canonicalJob][statKey]) return null;

    const base = JLS.interpolateStat(level, statKey);
    if (base === null) return null;

    return roundHalfToEven(JLS.MULTIPLIERS[canonicalJob][statKey] * base);
  };

  JLS.classJobName = function(classData) {
    if (!classData) return null;

    const note = classData.note || "";
    const notetagMatch = note.match(/<\s*(?:JRPGJob|JRPG Job|JobStatFormula|Job Stat Formula)\s*:\s*([^>]+)>/i);
    const rawJobName = notetagMatch ? notetagMatch[1].trim() : classData.name;

    return JLS.canonicalJobName(rawJobName);
  };

  const _Game_Actor_paramBase = Game_Actor.prototype.paramBase;

  Game_Actor.prototype.paramBase = function(paramId) {
    const statKey = JLS.PARAM_ID_TO_STAT[paramId];

    // LUK is intentionally not overridden until a Luck formula is added.
    if (!statKey || statKey === "LUK") {
      return _Game_Actor_paramBase.call(this, paramId);
    }

    const classData = this.currentClass ? this.currentClass() : null;
    const jobName = JLS.classJobName(classData);

    if (!jobName) {
      return _Game_Actor_paramBase.call(this, paramId);
    }

    const level = Number(this._level || 1);
    const formulaValue = JLS.getStat(jobName, level, statKey);

    if (formulaValue === null || !Number.isFinite(formulaValue)) {
      return _Game_Actor_paramBase.call(this, paramId);
    }

    return formulaValue;
  };
})();