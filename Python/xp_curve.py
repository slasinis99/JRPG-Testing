import math
import matplotlib.pyplot as plt

XP_MILESTONE_LEVELS: list[int] = [1, 10, 25, 50, 75, 99, 125, 150, 199, 300, 500, 750, 999]

XP_TO_NEXT_LEVEL: dict[int, int] = {
    1:25, 10:105, 25:520, 50:2200, 75:6200, 99:14000,
    125:32000, 150:70000, 199:220000, 300:650000,
    500:900000, 750:1200000, 999:1500000
}

def get_xp_start_level(level: int) -> int:
    for i, v in enumerate(XP_MILESTONE_LEVELS):
        if v > level:
            return XP_MILESTONE_LEVELS[i-1]
    return XP_MILESTONE_LEVELS[-2]

def get_xp_end_level(level: int) -> int:
    for i, v in enumerate(XP_MILESTONE_LEVELS):
        if v > level:
            return v
    return XP_MILESTONE_LEVELS[-1]

def xp_to_next_level(level: int) -> int:
    """
    Returns the XP needed to go from level to level + 1.
    """
    if level >= 999:
        return 0
    
    start_level = get_xp_start_level(level)
    end_level =get_xp_end_level(level)

    start_xp = XP_TO_NEXT_LEVEL[start_level]
    end_xp = XP_TO_NEXT_LEVEL[end_level]

    t = (level - start_level) / (end_level - start_level)

    log_xp = math.log(start_xp) + (math.log(end_xp) - math.log(start_xp)) * t

    return round(math.exp(log_xp))

def total_xp_for_level(level: int) -> int:
    """
    Returns the cumulative XP required to reach this level.
    """
    if level <= 1:
        return 0
    
    return sum(xp_to_next_level(l) for l in range(1, level))

def print_xp_table() -> None:
    print(f"{'Level':<8}{'XP to Next':<15}{'Total XP':<15}")
    for level in XP_MILESTONE_LEVELS:
        xp_next = xp_to_next_level(level)
        total = total_xp_for_level(level)
        print(f"{level:<8}{xp_next:<15}{total:<15}")

def plot_xp_per_level():
    levels = list(range(1, 1000))
    xp_values = [xp_to_next_level(l) for l in levels]

    plt.plot(levels, xp_values)
    plt.xlabel("Level")
    plt.ylabel("XP to Next Level")
    plt.title("XP Curve")
    plt.yscale("log")
    plt.show()

def plot_xp_to_reach_level():
    levels = list(range(1, 1000))
    xp_values = [total_xp_for_level(l) for l in levels]

    plt.plot(levels, xp_values)
    plt.xlabel("Level")
    plt.ylabel("XP to Reach Level")
    plt.title("XP Curve")
    plt.yscale("log")
    plt.show()

if __name__ == "__main__":
    for l in range(1, 999):
        print(f"{l: <7}{str(xp_to_next_level(l)): <10}{str(total_xp_for_level(l)): <10}")