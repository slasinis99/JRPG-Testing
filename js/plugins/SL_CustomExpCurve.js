/*:
 * @target MZ
 * @plugindesc Overrides RPG Maker MZ's default actor EXP curve with a custom milestone-based Level 1-999 EXP curve.
 * @author JRPG Project
 *
 * @param Override Max Level
 * @text Override Max Level
 * @type boolean
 * @on Yes
 * @off No
 * @default false
 * @desc If true, this plugin forces actor max level to the Max Level parameter. If using VisuStella Core Engine for max level, leave this false.
 *
 * @param Max Level
 * @text Max Level
 * @type number
 * @min 1
 * @default 999
 * @desc The intended maximum level for the EXP curve.
 *
 * @param Debug Logging
 * @text Debug Logging
 * @type boolean
 * @on Yes
 * @off No
 * @default false
 * @desc If true, prints sample EXP values to the console on game boot.
 *
 * @help
 * ============================================================================
 * JRPG_CustomExpCurve
 * ============================================================================
 *
 * This plugin overrides RPG Maker MZ's default actor EXP curve.
 *
 * RPG Maker MZ normally calculates cumulative EXP using the actor's database
 * EXP curve settings. This plugin replaces that behavior with a custom
 * milestone-based curve.
 *
 * This affects:
 *   - EXP required to reach each level
 *   - EXP shown in menus
 *   - Level-up behavior
 *   - EXP needed until next level
 *
 * This does NOT affect:
 *   - Enemy EXP rewards
 *   - Job EXP / JP systems
 *   - Actor stats
 *   - Class stats
 *
 * Recommended placement:
 *   Put this BELOW VisuStella Core Engine and other plugins that modify levels
 *   or EXP display.
 *
 * Console helpers:
 *   JRPG.ExpCurve.xpToNextLevel(level)
 *   JRPG.ExpCurve.totalExpForLevel(level)
 *   JRPG.ExpCurve.printMilestones()
 *
 * Examples:
 *   JRPG.ExpCurve.xpToNextLevel(50)
 *   JRPG.ExpCurve.totalExpForLevel(199)
 *
 * ============================================================================
 */

(() => {
    "use strict";

    const pluginName = (() => {
        const src = document.currentScript && document.currentScript.src;
        const match = src ? src.match(/([^/]+)\.js$/i) : null;
        return match ? decodeURIComponent(match[1]) : "JRPG_CustomExpCurve";
    })();

    const params = PluginManager.parameters(pluginName);

    const OVERRIDE_MAX_LEVEL = String(params["Override Max Level"] || "false") === "true";
    const MAX_LEVEL = Math.max(1, Number(params["Max Level"] || 999));
    const DEBUG_LOGGING = String(params["Debug Logging"] || "false") === "true";

    // -------------------------------------------------------------------------
    // EXP Curve Configuration
    // -------------------------------------------------------------------------
    // These values are XP-to-next-level values, not cumulative EXP.
    //
    // Example:
    //   Level 50: 2200 means it takes 2,200 EXP to go from level 50 to 51.
    //
    // The plugin converts these into cumulative EXP internally because
    // RPG Maker's Game_Actor.prototype.expForLevel(level) expects cumulative EXP.

    const XP_MILESTONE_LEVELS = [
        1, 10, 25, 50, 75, 99, 125, 150, 199, 300, 500, 750, 999
    ];

    const XP_TO_NEXT_MILESTONE = {
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
        999: 1500000
    };

    // -------------------------------------------------------------------------
    // Utility Functions
    // -------------------------------------------------------------------------

    function clampLevel(level) {
        level = Number(level || 1);
        if (!Number.isFinite(level)) level = 1;
        return Math.max(1, Math.min(Math.floor(level), MAX_LEVEL));
    }

    function getStartLevel(level) {
        for (let i = 0; i < XP_MILESTONE_LEVELS.length; i++) {
            if (XP_MILESTONE_LEVELS[i] > level) {
                return XP_MILESTONE_LEVELS[i - 1];
            }
        }

        return XP_MILESTONE_LEVELS[XP_MILESTONE_LEVELS.length - 2];
    }

    function getEndLevel(level) {
        for (const milestone of XP_MILESTONE_LEVELS) {
            if (milestone > level) {
                return milestone;
            }
        }

        return XP_MILESTONE_LEVELS[XP_MILESTONE_LEVELS.length - 1];
    }

    function logInterpolate(startValue, endValue, t) {
        const startLog = Math.log(startValue);
        const endLog = Math.log(endValue);
        return Math.exp(startLog + (endLog - startLog) * t);
    }

    function xpToNextLevelRaw(level) {
        level = clampLevel(level);

        if (level >= MAX_LEVEL) {
            return 0;
        }

        const startLevel = getStartLevel(level);
        const endLevel = getEndLevel(level);

        const startXp = XP_TO_NEXT_MILESTONE[startLevel];
        const endXp = XP_TO_NEXT_MILESTONE[endLevel];

        const t = (level - startLevel) / (endLevel - startLevel);

        return Math.round(logInterpolate(startXp, endXp, t));
    }

    // -------------------------------------------------------------------------
    // Cumulative EXP Cache
    // -------------------------------------------------------------------------
    // totalExpCache[level] = total EXP required to reach that level.
    //
    // Level 1 always requires 0 total EXP.

    const totalExpCache = [];

    function buildTotalExpCache() {
        totalExpCache.length = 0;
        totalExpCache[1] = 0;

        for (let level = 1; level < MAX_LEVEL; level++) {
            totalExpCache[level + 1] = totalExpCache[level] + xpToNextLevelRaw(level);
        }
    }

    buildTotalExpCache();

    function xpToNextLevel(level) {
        return xpToNextLevelRaw(level);
    }

    function totalExpForLevel(level) {
        level = clampLevel(level);
        return totalExpCache[level] || 0;
    }

    function printMilestones() {
        console.log("JRPG Custom EXP Curve");
        console.log("----------------------------------------");
        console.log("Level | XP to Next | Total EXP");
        console.log("----------------------------------------");

        for (const level of XP_MILESTONE_LEVELS) {
            if (level > MAX_LEVEL) continue;

            const xpNext = xpToNextLevel(level);
            const total = totalExpForLevel(level);

            console.log(
                String(level).padEnd(5, " ") + " | " +
                String(xpNext).padEnd(10, " ") + " | " +
                String(total)
            );
        }

        console.log("----------------------------------------");
    }

    // -------------------------------------------------------------------------
    // Public Debug Object
    // -------------------------------------------------------------------------

    window.JRPG = window.JRPG || {};
    window.JRPG.ExpCurve = {
        maxLevel: () => MAX_LEVEL,
        xpToNextLevel,
        totalExpForLevel,
        printMilestones
    };

    // -------------------------------------------------------------------------
    // RPG Maker Overrides
    // -------------------------------------------------------------------------

    const _Game_Actor_maxLevel = Game_Actor.prototype.maxLevel;

    Game_Actor.prototype.maxLevel = function() {
        if (OVERRIDE_MAX_LEVEL) {
            return MAX_LEVEL;
        }

        return _Game_Actor_maxLevel.call(this);
    };

    Game_Actor.prototype.expForLevel = function(level) {
        level = Number(level || 1);

        if (!Number.isFinite(level)) {
            level = 1;
        }

        level = Math.floor(level);

        if (level <= 1) {
            return 0;
        }

        if (level > MAX_LEVEL) {
            level = MAX_LEVEL;
        }

        return totalExpForLevel(level);
    };

    // -------------------------------------------------------------------------
    // Debug Logging
    // -------------------------------------------------------------------------

    const _Scene_Boot_start = Scene_Boot.prototype.start;

    Scene_Boot.prototype.start = function() {
        _Scene_Boot_start.call(this);

        if (DEBUG_LOGGING) {
            printMilestones();
        }
    };

})();