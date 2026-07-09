import csv
from pathlib import Path

MILESTONE_LEVELS: list[int] = [1, 10, 25, 50, 75, 99, 125, 150, 199, 300, 500, 750, 999]
MILESTONE_MIN_MHP: dict[int, int] = {1:220, 10:480, 25:950, 50:1750, 75:2700, 99:3800, 125:5800, 150:8000, 199:12500, 300:18500, 500:28000, 750:38000, 999:46000}
MILESTONE_MIN_MMP: dict[int, int] = {1:25, 10:60, 25:130, 50:260, 75:420, 99:620, 125:900, 150:1250, 199:1900, 300:2700, 500:3700, 750:4600, 999:5300}
MILESTONE_MIN_ATK: dict[int, int] = {1:14, 10:35, 25:80, 50:170, 75:300, 99:475, 125:700, 150:950, 199:1400, 300:1900, 500:2600, 750:3200, 999:3700}
MILESTONE_MIN_DEF: dict[int, int] = {1:12, 10:30, 25:65, 50:130, 75:220, 99:330, 125:500, 150:700, 199:1050, 300:1500, 500:2100, 750:2650, 999:3100}
MILESTONE_MIN_MAT: dict[int, int] = {1:14, 10:35, 25:80, 50:170, 75:300, 99:475, 125:700, 150:950, 199:1400, 300:1900, 500:2600, 750:3200, 999:3700}
MILESTONE_MIN_MDF: dict[int, int] = {1:12, 10:30, 25:65, 50:130, 75:220, 99:330, 125:500, 150:700, 199:1050, 300:1500, 500:2100, 750:2650, 999:3100}
MILESTONE_MIN_AGI: dict[int, int] = {1:16, 10:24, 25:36, 50:52, 75:66, 99:80, 125:95, 150:110, 199:135, 300:155, 500:175, 750:190, 999:200}

STAT_TO_MILESTONE_MIN: dict[str, dict[int, int]] = {
    "MHP": MILESTONE_MIN_MHP,
    "MMP": MILESTONE_MIN_MMP,
    "ATK": MILESTONE_MIN_ATK,
    "DEF": MILESTONE_MIN_DEF,
    "MAT": MILESTONE_MIN_MAT,
    "MDF": MILESTONE_MIN_MDF,
    "AGI": MILESTONE_MIN_AGI,
}

WARRIOR_MULTIPLIERS: dict[str, float] =     {"MHP":1.35, "MMP":0.70, "ATK":1.45, "DEF":1.25, "MAT":0.60, "MDF":0.95, "AGI":1.10}
KNIGHT_MULTIPLIERS: dict[str, float] =      {"MHP":1.50, "MMP":0.75, "ATK":1.20, "DEF":1.55, "MAT":0.55, "MDF":1.20, "AGI":1.00}
DARK_KNIGHT_MULTIPLIERS: dict[str, float] = {"MHP":1.40, "MMP":0.90, "ATK":1.55, "DEF":1.20, "MAT":0.95, "MDF":1.05, "AGI":1.05}
MONK_MULTIPLIERS: dict[str, float] =        {"MHP":1.25, "MMP":0.65, "ATK":1.30, "DEF":1.15, "MAT":0.65, "MDF":1.15, "AGI":1.30}
DRAGOON_MULTIPLIERS: dict[str, float] =     {"MHP":1.30, "MMP":0.70, "ATK":1.40, "DEF":1.20, "MAT":0.55, "MDF":0.95, "AGI":1.20}
RANGER_MULTIPLIERS: dict[str, float] =      {"MHP":1.15, "MMP":0.80, "ATK":1.25, "DEF":1.05, "MAT":0.65, "MDF":1.00, "AGI":1.40}
THIEF_MULTIPLIERS: dict[str, float] =       {"MHP":1.05, "MMP":0.75, "ATK":1.10, "DEF":1.00, "MAT":0.60, "MDF":0.95, "AGI":1.60}
GUNSLINGER_MULTIPLIERS: dict[str, float] =  {"MHP":1.10, "MMP":0.80, "ATK":1.35, "DEF":1.00, "MAT":0.65, "MDF":0.95, "AGI":1.25}
PRIEST_MULTIPLIERS: dict[str, float] =      {"MHP":1.10, "MMP":1.30, "ATK":0.75, "DEF":1.05, "MAT":1.15, "MDF":1.45, "AGI":1.05}
WHITE_MAGE_MULTIPLIERS: dict[str, float] =  {"MHP":1.00, "MMP":1.45, "ATK":0.60, "DEF":1.00, "MAT":1.20, "MDF":1.50, "AGI":1.10}
BLACK_MAGE_MULTIPLIERS: dict[str, float] =  {"MHP":1.00, "MMP":1.50, "ATK":0.55, "DEF":0.95, "MAT":1.55, "MDF":1.25, "AGI":1.00}
RED_MAGE_MULTIPLIERS: dict[str, float] =    {"MHP":1.15, "MMP":1.15, "ATK":1.05, "DEF":1.10, "MAT":1.15, "MDF":1.15, "AGI":1.20}

JOB_TO_MULTIPLIERS: dict[str, dict[str, float]] = {
    "Warrior": WARRIOR_MULTIPLIERS,
    "Knight": KNIGHT_MULTIPLIERS,
    "Dark Knight": DARK_KNIGHT_MULTIPLIERS,
    "Monk": MONK_MULTIPLIERS,
    "Dragoon": DRAGOON_MULTIPLIERS,
    "Ranger": RANGER_MULTIPLIERS,
    "Thief": THIEF_MULTIPLIERS,
    "Gunslinger": GUNSLINGER_MULTIPLIERS,
    "Priest": PRIEST_MULTIPLIERS,
    "White Mage": WHITE_MAGE_MULTIPLIERS,
    "Black Mage": BLACK_MAGE_MULTIPLIERS,
    "Red Mage": RED_MAGE_MULTIPLIERS,
}

STAT_GROWTH_SHAPES: dict[str, str] = {
    "MHP": "smooth",
    "MMP": "smooth_late",
    "ATK": "smooth_early",
    "DEF": "linear_soft",
    "MAT": "smooth_early",
    "MDF": "linear_soft",
    "AGI": "linear",
}

JOBS: list[str] = list(JOB_TO_MULTIPLIERS.keys())
STATS: list[str] = ["MHP", "MMP", "ATK", "DEF", "MAT", "MDF", "AGI"]

MIN_LEVEL = 1
MAX_LEVEL = 999
MIN_JOB_LEVEL = 1
MAX_JOB_LEVEL = 99

# These match the recommended <SL Attack Hits> class notetags.
# Each entry is: (minimum job level, minimum hits, maximum hits).
CLASS_ATTACK_HIT_RANGES: dict[str, list[tuple[int, int, int]]] = {
    "Warrior": [
        (1, 1, 1),
        (30, 1, 2),
        (70, 1, 3),
        (99, 2, 3),
    ],
    "Knight": [
        (1, 1, 1),
        (50, 1, 2),
        (99, 2, 2),
    ],
    "Dark Knight": [
        (1, 1, 1),
        (60, 1, 2),
        (99, 1, 3),
    ],
    "Monk": [
        (1, 1, 1),
        (15, 1, 2),
        (35, 2, 3),
        (65, 3, 4),
        (99, 4, 5),
    ],
    "Dragoon": [
        (1, 1, 1),
        (35, 1, 2),
        (70, 2, 3),
        (99, 3, 3),
    ],
    "Ranger": [
        (1, 1, 1),
        (25, 1, 2),
        (55, 2, 3),
        (85, 2, 4),
        (99, 3, 4),
    ],
    "Thief": [
        (1, 1, 2),
        (30, 2, 3),
        (60, 2, 4),
        (85, 3, 5),
        (99, 4, 6),
    ],
    "Gunslinger": [
        (1, 1, 1),
        (20, 1, 2),
        (45, 2, 3),
        (75, 2, 4),
        (99, 3, 5),
    ],
    "Priest": [
        (1, 1, 1),
        (99, 1, 2),
    ],
    "White Mage": [
        (1, 1, 1),
    ],
    "Black Mage": [
        (1, 1, 1),
    ],
    "Red Mage": [
        (1, 1, 1),
        (40, 1, 2),
        (75, 2, 2),
        (99, 2, 3),
    ],
}

# These match the defaults from SL_DamageFormulas.js.
PLAYER_OFFENSE_COEF = 8.0
PLAYER_LEVEL_COEF = 25.0
PLAYER_DEFENSE_DIVISOR = 20.0

ENEMY_OFFENSE_COEF = 2.5
ENEMY_LEVEL_COEF = 12.0
ENEMY_DEFENSE_DIVISOR = 8.0

MINIMUM_DAMAGE = 1
MINIMUM_MITIGATION_RATE = 0.05
MAXIMUM_MITIGATION_RATE = 1.0


def growth_progress(t: float, style: str) -> float:
    s = t * t * (3 - 2 * t)

    if style == "linear":
        return t
    elif style == "linear_soft":
        return 0.75 * t + 0.25 * s
    elif style == "smooth":
        return s
    elif style == "smooth_early":
        return s**0.85
    elif style == "smooth_late":
        return s**1.15
    elif style == "very_early":
        return s**0.70
    elif style == "very_late":
        return s**1.35
    else:
        return s


def clamp_int(value: int, minimum: int, maximum: int) -> int:
    return max(minimum, min(value, maximum))


def get_start_level(level: int) -> int:
    for i, v in enumerate(MILESTONE_LEVELS):
        if v > level:
            return MILESTONE_LEVELS[i - 1]
    return MILESTONE_LEVELS[-2]


def get_end_level(level: int) -> int:
    for v in MILESTONE_LEVELS:
        if v > level:
            return v
    return MILESTONE_LEVELS[-1]


def interpolate_stat(level: int, stat: str) -> float:
    level = clamp_int(level, MIN_LEVEL, MAX_LEVEL)
    stat = stat.upper()

    start_level = get_start_level(level)
    end_level = get_end_level(level)
    start_value = STAT_TO_MILESTONE_MIN[stat][start_level]
    end_value = STAT_TO_MILESTONE_MIN[stat][end_level]
    style = STAT_GROWTH_SHAPES[stat]

    t = (level - start_level) / (end_level - start_level)
    p = growth_progress(t, style)
    return start_value + (end_value - start_value) * p


def get_stat(job: str, level: int, stat: str) -> int:
    return round(JOB_TO_MULTIPLIERS[job][stat] * interpolate_stat(level, stat))


def mitigation(defense: int | float, divisor: int | float) -> float:
    safe_defense = max(0.0, float(defense))
    safe_divisor = max(0.01, float(divisor))
    raw_rate = 100 / (100 + safe_defense / safe_divisor)
    return max(MINIMUM_MITIGATION_RATE, min(raw_rate, MAXIMUM_MITIGATION_RATE))


def finish_damage(value: float) -> int:
    if value <= 0:
        return 0
    return max(MINIMUM_DAMAGE, round(value))


def player_damage_physical(player_level: int, player_atk: int, enemy_def: int, power: float) -> int:
    base = player_atk * PLAYER_OFFENSE_COEF + player_level * PLAYER_LEVEL_COEF
    return finish_damage(base * power * mitigation(enemy_def, PLAYER_DEFENSE_DIVISOR))


def player_damage_magical(player_level: int, player_mat: int, enemy_mdf: int, power: float) -> int:
    base = player_mat * PLAYER_OFFENSE_COEF + player_level * PLAYER_LEVEL_COEF
    return finish_damage(base * power * mitigation(enemy_mdf, PLAYER_DEFENSE_DIVISOR))


def enemy_damage_physical(enemy_level: int, enemy_atk: int, player_def: int, power: float) -> int:
    base = enemy_atk * ENEMY_OFFENSE_COEF + enemy_level * ENEMY_LEVEL_COEF
    return finish_damage(base * power * mitigation(player_def, ENEMY_DEFENSE_DIVISOR))


def enemy_damage_magical(enemy_level: int, enemy_mat: int, player_mdf: int, power: float) -> int:
    base = enemy_mat * ENEMY_OFFENSE_COEF + enemy_level * ENEMY_LEVEL_COEF
    return finish_damage(base * power * mitigation(player_mdf, ENEMY_DEFENSE_DIVISOR))


def get_attack_hit_range(job: str, job_level: int) -> tuple[int, int]:
    """Return the normal Attack hit range for a class at a given Job Level."""
    entries = CLASS_ATTACK_HIT_RANGES.get(job)
    if not entries:
        return (1, 1)

    safe_job_level = clamp_int(job_level, MIN_JOB_LEVEL, MAX_JOB_LEVEL)
    chosen = entries[0]

    for entry in entries:
        threshold, _min_hits, _max_hits = entry
        if safe_job_level >= threshold:
            chosen = entry
        else:
            break

    _threshold, min_hits, max_hits = chosen
    return (min_hits, max_hits)


def expected_hits(min_hits: int, max_hits: int) -> float:
    return (min_hits + max_hits) / 2


def expected_total_damage(damage_per_hit: int, min_hits: int, max_hits: int) -> float:
    return damage_per_hit * expected_hits(min_hits, max_hits)


def prompt_hit_range(attacker_type: str, damage_type: str) -> tuple[str, int, int, str | None, int | None]:
    """Prompt for hit-count behavior and return mode, min hits, max hits, job, job level."""
    choices = ["Single Hit", "Manual Hit Range"]

    if attacker_type == "Player" and damage_type == "Physical":
        choices.insert(1, "Class Normal Attack")

    print()
    print("Hit count mode:")
    for i, choice in enumerate(choices, start=1):
        print(f"  {i}. {choice}")
    hit_mode = prompt_choice("Choose hit count mode: ", choices)

    if hit_mode == "Single Hit":
        return (hit_mode, 1, 1, None, None)

    if hit_mode == "Class Normal Attack":
        print("\nChoose the attacker's current class:")
        for i, job in enumerate(JOBS, start=1):
            print(f"  {i}. {job}")

        job = prompt_choice("Class: ", JOBS)
        job_level = prompt_int(f"Job Level ({MIN_JOB_LEVEL}-{MAX_JOB_LEVEL}): ", MIN_JOB_LEVEL, MAX_JOB_LEVEL)
        min_hits, max_hits = get_attack_hit_range(job, job_level)
        return (hit_mode, min_hits, max_hits, job, job_level)

    min_hits = prompt_int("Minimum hits: ", 1)
    max_hits = prompt_int("Maximum hits: ", min_hits)
    return (hit_mode, min_hits, max_hits, None, None)


def prompt_int(prompt: str, minimum: int | None = None, maximum: int | None = None) -> int:
    while True:
        raw = input(prompt).strip()

        try:
            value = int(raw)
        except ValueError:
            print("Please enter a whole number.")
            continue

        if minimum is not None and value < minimum:
            print(f"Please enter a value of at least {minimum}.")
            continue

        if maximum is not None and value > maximum:
            print(f"Please enter a value no greater than {maximum}.")
            continue

        return value


def prompt_float(prompt: str, minimum: float | None = None, maximum: float | None = None) -> float:
    while True:
        raw = input(prompt).strip()

        try:
            value = float(raw)
        except ValueError:
            print("Please enter a number.")
            continue

        if minimum is not None and value < minimum:
            print(f"Please enter a value of at least {minimum}.")
            continue

        if maximum is not None and value > maximum:
            print(f"Please enter a value no greater than {maximum}.")
            continue

        return value


def prompt_choice(prompt: str, choices: list[str]) -> str:
    normalized = {choice.lower(): choice for choice in choices}

    while True:
        raw = input(prompt).strip().lower()

        if raw in normalized:
            return normalized[raw]

        if raw.isdigit():
            index = int(raw) - 1
            if 0 <= index < len(choices):
                return choices[index]

        matches = [choice for choice in choices if choice.lower().startswith(raw)] if raw else []
        if len(matches) == 1:
            return matches[0]

        print("Please choose one of:")
        for i, choice in enumerate(choices, start=1):
            print(f"  {i}. {choice}")


def print_stats_at_level(level: int) -> None:
    print()
    print(f"Stats at Level {level}")
    print("-" * 95)
    print(f"{'Job':<25}{'MHP':>8}{'MMP':>8}{'ATK':>8}{'DEF':>8}{'MAT':>8}{'MDF':>8}{'AGI':>8}")
    print("-" * 95)

    for job in JOBS:
        values = [get_stat(job, level, stat) for stat in STATS]
        print(
            f"{job:<25}"
            f"{values[0]:>8}"
            f"{values[1]:>8}"
            f"{values[2]:>8}"
            f"{values[3]:>8}"
            f"{values[4]:>8}"
            f"{values[5]:>8}"
            f"{values[6]:>8}"
        )

    print("-" * 95)
    print()


def check_stats_at_level() -> None:
    level = prompt_int(f"Enter level ({MIN_LEVEL}-{MAX_LEVEL}): ", MIN_LEVEL, MAX_LEVEL)
    print_stats_at_level(level)


def sanitize_filename(name: str) -> str:
    return "".join(ch if ch.isalnum() else "_" for ch in name).strip("_")


def export_stat_csv() -> None:
    print("\nChoose a class to export:")
    for i, job in enumerate(JOBS, start=1):
        print(f"  {i}. {job}")

    job = prompt_choice("Class: ", JOBS)

    default_filename = f"{sanitize_filename(job)}_stats_1_to_999.csv"
    raw_filename = input(f"Output filename [{default_filename}]: ").strip()
    filename = raw_filename or default_filename

    if not filename.lower().endswith(".csv"):
        filename += ".csv"

    path = Path(filename)

    with path.open("w", newline="", encoding="utf-8") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(["Level", *STATS])

        for level in range(MIN_LEVEL, MAX_LEVEL + 1):
            writer.writerow([level, *[get_stat(job, level, stat) for stat in STATS]])

    print(f"\nExported {job} stats to: {path.resolve()}\n")


def simulate_damage() -> None:
    print("\nDamage Simulator")
    print("This matches the default coefficients from SL_DamageFormulas.js.")
    print("Min/expected/max totals are based on hit-count range.")
    print()

    attacker_type = prompt_choice("Attacker type: 1. Player  2. Enemy: ", ["Player", "Enemy"])
    damage_type = prompt_choice("Damage type: 1. Physical  2. Magical: ", ["Physical", "Magical"])

    level = prompt_int("Attacker level: ", MIN_LEVEL, MAX_LEVEL)
    power = prompt_float("Skill power / potency, e.g. 1.00, 1.50, 2.25: ", 0.0)
    hit_mode, min_hits, max_hits, job, job_level = prompt_hit_range(attacker_type, damage_type)

    if damage_type == "Physical":
        offense = prompt_int("Attacker ATK: ", 0)
        defense = prompt_int("Target DEF: ", 0)

        if attacker_type == "Player":
            damage_per_hit = player_damage_physical(level, offense, defense, power)
            divisor = PLAYER_DEFENSE_DIVISOR
        else:
            damage_per_hit = enemy_damage_physical(level, offense, defense, power)
            divisor = ENEMY_DEFENSE_DIVISOR

    else:
        offense = prompt_int("Attacker MAT: ", 0)
        defense = prompt_int("Target MDF: ", 0)

        if attacker_type == "Player":
            damage_per_hit = player_damage_magical(level, offense, defense, power)
            divisor = PLAYER_DEFENSE_DIVISOR
        else:
            damage_per_hit = enemy_damage_magical(level, offense, defense, power)
            divisor = ENEMY_DEFENSE_DIVISOR

    rate = mitigation(defense, divisor)
    expected_hit_value = expected_hits(min_hits, max_hits)
    min_damage = damage_per_hit * min_hits
    max_damage = damage_per_hit * max_hits
    expected_damage = expected_total_damage(damage_per_hit, min_hits, max_hits)

    print()
    print("Damage Result")
    print("-" * 48)
    print(f"Attacker Type:     {attacker_type}")
    print(f"Damage Type:       {damage_type}")
    print(f"Level:             {level}")
    if job is not None and job_level is not None:
        print(f"Class:             {job}")
        print(f"Job Level:         {job_level}")
    print(f"Offense Stat:      {offense}")
    print(f"Target Defense:    {defense}")
    print(f"Skill Power:       {power:.2f}")
    print(f"Mitigation Rate:   {rate:.4f} ({rate * 100:.2f}%)")
    print(f"Hit Count Mode:    {hit_mode}")
    print(f"Hit Range:         {min_hits}-{max_hits}")
    print(f"Expected Hits:     {expected_hit_value:.2f}")
    print(f"Damage Per Hit:    {damage_per_hit}")
    print("-" * 48)
    print(f"Minimum Damage:    {min_damage}")
    print(f"Expected Damage:   {expected_damage:.2f}")
    print(f"Maximum Damage:    {max_damage}")
    print("-" * 48)
    print()


def main() -> None:
    while True:
        print("JRPG Stat and Damage Tool")
        print("1. Check Stats at Level")
        print("2. Export Stat CSV")
        print("3. Simulate Damage")
        print("4. Quit")

        choice = prompt_choice(
            "Choose an option: ",
            [
                "Check Stats at Level",
                "Export Stat CSV",
                "Simulate Damage",
                "Quit",
            ],
        )

        if choice == "Check Stats at Level":
            check_stats_at_level()
        elif choice == "Export Stat CSV":
            export_stat_csv()
        elif choice == "Simulate Damage":
            simulate_damage()
        elif choice == "Quit":
            print("Goodbye.")
            break


if __name__ == "__main__":
    main()