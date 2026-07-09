/*:
 * @target MZ
 * @plugindesc Helper formulas for asymmetric player/enemy battle damage. v1.0.0
 * @author JRPG Project
 *
 * @param Default Skill Power
 * @text Default Skill Power
 * @type number
 * @decimals 2
 * @min 0
 * @default 1.00
 * @desc Used when a helper is called without a potency/power value.
 *
 * @param Minimum Damage
 * @text Minimum Damage
 * @type number
 * @min 0
 * @default 1
 * @desc Minimum positive damage returned by these helpers.
 *
 * @param Minimum Mitigation Rate
 * @text Minimum Mitigation Rate
 * @type number
 * @decimals 2
 * @min 0
 * @default 0.05
 * @desc Lowest defense multiplier allowed. 0.05 means defense cannot reduce formula damage below 5%.
 *
 * @param Maximum Mitigation Rate
 * @text Maximum Mitigation Rate
 * @type number
 * @decimals 2
 * @min 0
 * @default 1.00
 * @desc Highest defense multiplier allowed. 1.00 means normal defense never increases damage.
 *
 * @param Default Enemy Level
 * @text Default Enemy Level
 * @type number
 * @min 1
 * @default 1
 * @desc Used for enemies without an enemy level notetag or level property.
 *
 * @param Player Physical Offense Coef
 * @text Player Physical Offense Coef
 * @type number
 * @decimals 2
 * @min 0
 * @default 8.00
 * @desc ATK coefficient for actors using physical player damage helpers.
 *
 * @param Player Magical Offense Coef
 * @text Player Magical Offense Coef
 * @type number
 * @decimals 2
 * @min 0
 * @default 8.00
 * @desc MAT coefficient for actors using magical player damage helpers.
 *
 * @param Player Level Coef
 * @text Player Level Coef
 * @type number
 * @decimals 2
 * @min 0
 * @default 25.00
 * @desc Level coefficient for actors using player damage helpers.
 *
 * @param Player Physical Defense Divisor
 * @text Player Physical Defense Divisor
 * @type number
 * @decimals 2
 * @min 0.01
 * @default 20.00
 * @desc Higher values make enemy DEF matter less against actor physical damage.
 *
 * @param Player Magical Defense Divisor
 * @text Player Magical Defense Divisor
 * @type number
 * @decimals 2
 * @min 0.01
 * @default 20.00
 * @desc Higher values make enemy MDF matter less against actor magical damage.
 *
 * @param Enemy Physical Offense Coef
 * @text Enemy Physical Offense Coef
 * @type number
 * @decimals 2
 * @min 0
 * @default 2.50
 * @desc ATK coefficient for enemies using physical enemy damage helpers.
 *
 * @param Enemy Magical Offense Coef
 * @text Enemy Magical Offense Coef
 * @type number
 * @decimals 2
 * @min 0
 * @default 2.50
 * @desc MAT coefficient for enemies using magical enemy damage helpers.
 *
 * @param Enemy Level Coef
 * @text Enemy Level Coef
 * @type number
 * @decimals 2
 * @min 0
 * @default 12.00
 * @desc Level coefficient for enemies using enemy damage helpers.
 *
 * @param Enemy Physical Defense Divisor
 * @text Enemy Physical Defense Divisor
 * @type number
 * @decimals 2
 * @min 0.01
 * @default 8.00
 * @desc Lower values make actor DEF matter more against enemy physical damage.
 *
 * @param Enemy Magical Defense Divisor
 * @text Enemy Magical Defense Divisor
 * @type number
 * @decimals 2
 * @min 0.01
 * @default 8.00
 * @desc Lower values make actor MDF matter more against enemy magical damage.
 *
 * @help
 * ============================================================================
 * SL_DamageFormulas
 * ============================================================================
 *
 * This plugin adds global damage helper functions for RPG Maker MZ formulas.
 * It is designed for this JRPG project's large 1-999 stat curve and large enemy
 * HP pools.
 *
 * The main idea is asymmetric damage:
 *
 *   - Actors use high-output formulas so they can chew through very large
 *     enemy HP values.
 *   - Enemies use lower-output formulas so they can pressure the party without
 *     instantly deleting actors.
 *
 * Put this plugin below VisuStella Core Engine and below your stat plugins.
 * It does not override parameters, rewards, or RPG Maker's damage pipeline.
 * RPG Maker still handles elements, physical/magical rate, variance, guarding,
 * and critical hits after the formula result is returned.
 *
 * ============================================================================
 * Basic Skill Formula Usage
 * ============================================================================
 *
 * Use these in the skill's Damage Formula box:
 *
 *   SL_DMG.phys(a, b, 1.00)
 *   SL_DMG.mag(a, b, 1.75)
 *   SL_DMG.hybrid(a, b, 2.00)
 *
 * These automatically detect whether the attacker is an actor or enemy.
 *
 * If you want to force the player/enemy version explicitly:
 *
 *   SL_DMG.pAtk(a, b, 1.50)     Actor physical formula
 *   SL_DMG.pMag(a, b, 1.50)     Actor magical formula
 *   SL_DMG.eAtk(a, b, 1.50)     Enemy physical formula
 *   SL_DMG.eMag(a, b, 1.50)     Enemy magical formula
 *
 * Recommended skill power ranges:
 *
 *   Basic Attack:         1.00
 *   Light Skill:          1.25 - 1.50
 *   Normal Skill:         1.75 - 2.25
 *   Heavy Skill:          2.75 - 3.50
 *   Limit / Ultimate:     5.00 - 8.00+
 *
 * ============================================================================
 * Skill Notetag Power Option
 * ============================================================================
 *
 * Instead of writing the power directly in the formula, you can put one of
 * these notetags in the skill's note box:
 *
 *   <SL Damage Power: 1.75>
 *   <Damage Power: 1.75>
 *   <SL Power: 1.75>
 *
 * Then use this formula:
 *
 *   SL_DMG.phys(a, b, item)
 *   SL_DMG.mag(a, b, item)
 *
 * RPG Maker MZ exposes the local variable item inside damage formulas, so the
 * helper can read the skill's notetag.
 *
 * ============================================================================
 * Enemy Level Notetags
 * ============================================================================
 *
 * Enemy damage helpers use an enemy level value. Actors already have levels.
 * Enemies do not by default, so this plugin supports enemy notetags:
 *
 *   <Enemy Level: 25>
 *   <SL Enemy Level: 25>
 *   <SL Level: 25>
 *   <Level: 25>
 *
 * If none are present, the plugin parameter Default Enemy Level is used.
 *
 * ============================================================================
 * Formula Details
 * ============================================================================
 *
 * Player physical damage is approximately:
 *
 *   ((a.atk * 8.00 + a.level * 25.00) * power)
 *     * (100 / (100 + b.def / 20.00))
 *
 * Player magical damage is approximately:
 *
 *   ((a.mat * 8.00 + a.level * 25.00) * power)
 *     * (100 / (100 + b.mdf / 20.00))
 *
 * Enemy physical damage is approximately:
 *
 *   ((a.atk * 2.50 + enemyLevel * 12.00) * power)
 *     * (100 / (100 + b.def / 8.00))
 *
 * Enemy magical damage is approximately:
 *
 *   ((a.mat * 2.50 + enemyLevel * 12.00) * power)
 *     * (100 / (100 + b.mdf / 8.00))
 *
 * ============================================================================
 * Extra Helpers
 * ============================================================================
 *
 *   SL_DMG.level(a)
 *     Returns actor level, enemy notetag level, or Default Enemy Level.
 *
 *   SL_DMG.mitigation(defense, divisor)
 *     Returns the defense multiplier used by the formulas.
 *
 *   SL_DMG.trueDamage(a, b, amount)
 *     Returns fixed damage, still subject to RPG Maker's final element/rate/etc.
 *
 *   SL_DMG.percentTargetHp(b, percent, minDamage, maxDamage)
 *     Damage based on target max HP. percent should be 0.10 for 10%.
 *
 * ============================================================================
 */

(() => {
  "use strict";

  const pluginName = (() => {
    const src = document.currentScript && document.currentScript.src;
    const match = src ? src.match(/([^/]+)\.js$/i) : null;
    return match ? decodeURIComponent(match[1]) : "SL_DamageFormulas";
  })();

  const params = PluginManager.parameters(pluginName);

  function numberParam(name, fallback) {
    const value = Number(params[name]);
    return Number.isFinite(value) ? value : fallback;
  }

  function clamp(value, min, max) {
    value = Number(value);
    if (!Number.isFinite(value)) value = min;
    return Math.max(min, Math.min(value, max));
  }

  function positiveNumber(value, fallback) {
    value = Number(value);
    return Number.isFinite(value) && value > 0 ? value : fallback;
  }

  function nonnegativeNumber(value, fallback) {
    value = Number(value);
    return Number.isFinite(value) && value >= 0 ? value : fallback;
  }

  window.JRPG = window.JRPG || {};
  JRPG.Damage = JRPG.Damage || {};

  const DF = JRPG.Damage;

  DF.settings = {
    defaultSkillPower: positiveNumber(numberParam("Default Skill Power", 1.00), 1.00),
    minimumDamage: nonnegativeNumber(numberParam("Minimum Damage", 1), 1),
    minimumMitigationRate: nonnegativeNumber(numberParam("Minimum Mitigation Rate", 0.05), 0.05),
    maximumMitigationRate: positiveNumber(numberParam("Maximum Mitigation Rate", 1.00), 1.00),
    defaultEnemyLevel: positiveNumber(numberParam("Default Enemy Level", 1), 1),

    playerPhysicalOffenseCoef: nonnegativeNumber(numberParam("Player Physical Offense Coef", 8.00), 8.00),
    playerMagicalOffenseCoef: nonnegativeNumber(numberParam("Player Magical Offense Coef", 8.00), 8.00),
    playerLevelCoef: nonnegativeNumber(numberParam("Player Level Coef", 25.00), 25.00),
    playerPhysicalDefenseDivisor: positiveNumber(numberParam("Player Physical Defense Divisor", 20.00), 20.00),
    playerMagicalDefenseDivisor: positiveNumber(numberParam("Player Magical Defense Divisor", 20.00), 20.00),

    enemyPhysicalOffenseCoef: nonnegativeNumber(numberParam("Enemy Physical Offense Coef", 2.50), 2.50),
    enemyMagicalOffenseCoef: nonnegativeNumber(numberParam("Enemy Magical Offense Coef", 2.50), 2.50),
    enemyLevelCoef: nonnegativeNumber(numberParam("Enemy Level Coef", 12.00), 12.00),
    enemyPhysicalDefenseDivisor: positiveNumber(numberParam("Enemy Physical Defense Divisor", 8.00), 8.00),
    enemyMagicalDefenseDivisor: positiveNumber(numberParam("Enemy Magical Defense Divisor", 8.00), 8.00)
  };

  function noteNumber(data, keys) {
    if (!data) return null;

    if (data.meta) {
      for (const key of keys) {
        if (data.meta[key] !== undefined) {
          const value = Number(data.meta[key]);
          if (Number.isFinite(value)) return value;
        }
      }
    }

    const note = String(data.note || "");
    for (const key of keys) {
      const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp("<" + escaped + "\\s*:\\s*([+-]?(?:\\d+\\.?\\d*|\\.\\d+))\\s*>", "i");
      const match = note.match(regex);
      if (match) {
        const value = Number(match[1]);
        if (Number.isFinite(value)) return value;
      }
    }

    return null;
  }

  DF.readSkillPower = function(item) {
    const value = noteNumber(item, [
      "SL Damage Power",
      "Damage Power",
      "SL Power",
      "Power"
    ]);
    return positiveNumber(value, DF.settings.defaultSkillPower);
  };

  DF.resolvePower = function(powerOrItem, maybeItem) {
    if (typeof powerOrItem === "number" || typeof powerOrItem === "string") {
      return positiveNumber(powerOrItem, DF.settings.defaultSkillPower);
    }

    if (powerOrItem && typeof powerOrItem === "object") {
      return DF.readSkillPower(powerOrItem);
    }

    if (maybeItem && typeof maybeItem === "object") {
      return DF.readSkillPower(maybeItem);
    }

    return DF.settings.defaultSkillPower;
  };

  DF.level = function(battler) {
    if (!battler) return DF.settings.defaultEnemyLevel;

    if (battler.isActor && battler.isActor()) {
      return positiveNumber(battler.level, 1);
    }

    if (typeof battler.level === "number") {
      return positiveNumber(battler.level, DF.settings.defaultEnemyLevel);
    }

    if (typeof battler.level === "function") {
      return positiveNumber(battler.level(), DF.settings.defaultEnemyLevel);
    }

    if (battler.isEnemy && battler.isEnemy() && typeof battler.enemy === "function") {
      const enemyData = battler.enemy();
      const value = noteNumber(enemyData, [
        "SL Enemy Level",
        "Enemy Level",
        "SL Level",
        "Level"
      ]);
      return positiveNumber(value, DF.settings.defaultEnemyLevel);
    }

    return DF.settings.defaultEnemyLevel;
  };

  DF.mitigation = function(defense, divisor) {
    const safeDefense = Math.max(0, Number(defense) || 0);
    const safeDivisor = positiveNumber(divisor, 1);
    const rawRate = 100 / (100 + safeDefense / safeDivisor);
    const minRate = Math.max(0, DF.settings.minimumMitigationRate);
    const maxRate = Math.max(minRate, DF.settings.maximumMitigationRate);
    return clamp(rawRate, minRate, maxRate);
  };

  DF.finish = function(value) {
    value = Number(value);
    if (!Number.isFinite(value)) value = 0;
    if (value <= 0) return 0;
    return Math.max(DF.settings.minimumDamage, Math.round(value));
  };

  DF.core = function(attacker, target, options) {
    options = options || {};

    const offense = Math.max(0, Number(options.offense) || 0);
    const level = Math.max(1, Number(options.level) || DF.level(attacker));
    const offenseCoef = nonnegativeNumber(options.offenseCoef, 1);
    const levelCoef = nonnegativeNumber(options.levelCoef, 0);
    const power = positiveNumber(options.power, DF.settings.defaultSkillPower);
    const defense = Math.max(0, Number(options.defense) || 0);
    const defenseDivisor = positiveNumber(options.defenseDivisor, 1);
    const flatBonus = Number(options.flatBonus) || 0;

    const base = offense * offenseCoef + level * levelCoef + flatBonus;
    const reduced = base * power * DF.mitigation(defense, defenseDivisor);
    return DF.finish(reduced);
  };

  DF.playerPhysical = function(a, b, powerOrItem, maybeItem) {
    const power = DF.resolvePower(powerOrItem, maybeItem);
    return DF.core(a, b, {
      offense: a ? a.atk : 0,
      level: DF.level(a),
      offenseCoef: DF.settings.playerPhysicalOffenseCoef,
      levelCoef: DF.settings.playerLevelCoef,
      power: power,
      defense: b ? b.def : 0,
      defenseDivisor: DF.settings.playerPhysicalDefenseDivisor
    });
  };

  DF.playerMagical = function(a, b, powerOrItem, maybeItem) {
    const power = DF.resolvePower(powerOrItem, maybeItem);
    return DF.core(a, b, {
      offense: a ? a.mat : 0,
      level: DF.level(a),
      offenseCoef: DF.settings.playerMagicalOffenseCoef,
      levelCoef: DF.settings.playerLevelCoef,
      power: power,
      defense: b ? b.mdf : 0,
      defenseDivisor: DF.settings.playerMagicalDefenseDivisor
    });
  };

  DF.enemyPhysical = function(a, b, powerOrItem, maybeItem) {
    const power = DF.resolvePower(powerOrItem, maybeItem);
    return DF.core(a, b, {
      offense: a ? a.atk : 0,
      level: DF.level(a),
      offenseCoef: DF.settings.enemyPhysicalOffenseCoef,
      levelCoef: DF.settings.enemyLevelCoef,
      power: power,
      defense: b ? b.def : 0,
      defenseDivisor: DF.settings.enemyPhysicalDefenseDivisor
    });
  };

  DF.enemyMagical = function(a, b, powerOrItem, maybeItem) {
    const power = DF.resolvePower(powerOrItem, maybeItem);
    return DF.core(a, b, {
      offense: a ? a.mat : 0,
      level: DF.level(a),
      offenseCoef: DF.settings.enemyMagicalOffenseCoef,
      levelCoef: DF.settings.enemyLevelCoef,
      power: power,
      defense: b ? b.mdf : 0,
      defenseDivisor: DF.settings.enemyMagicalDefenseDivisor
    });
  };

  DF.physical = function(a, b, powerOrItem, maybeItem) {
    if (a && a.isActor && a.isActor()) {
      return DF.playerPhysical(a, b, powerOrItem, maybeItem);
    }
    return DF.enemyPhysical(a, b, powerOrItem, maybeItem);
  };

  DF.magical = function(a, b, powerOrItem, maybeItem) {
    if (a && a.isActor && a.isActor()) {
      return DF.playerMagical(a, b, powerOrItem, maybeItem);
    }
    return DF.enemyMagical(a, b, powerOrItem, maybeItem);
  };

  DF.playerHybrid = function(a, b, powerOrItem, maybeItem) {
    const power = DF.resolvePower(powerOrItem, maybeItem);
    const physical = DF.playerPhysical(a, b, power);
    const magical = DF.playerMagical(a, b, power);
    return DF.finish((physical + magical) / 2);
  };

  DF.enemyHybrid = function(a, b, powerOrItem, maybeItem) {
    const power = DF.resolvePower(powerOrItem, maybeItem);
    const physical = DF.enemyPhysical(a, b, power);
    const magical = DF.enemyMagical(a, b, power);
    return DF.finish((physical + magical) / 2);
  };

  DF.hybrid = function(a, b, powerOrItem, maybeItem) {
    if (a && a.isActor && a.isActor()) {
      return DF.playerHybrid(a, b, powerOrItem, maybeItem);
    }
    return DF.enemyHybrid(a, b, powerOrItem, maybeItem);
  };

  DF.trueDamage = function(a, b, amount) {
    return DF.finish(amount);
  };

  DF.percentTargetHp = function(b, percent, minDamage, maxDamage) {
    const mhp = b ? Number(b.mhp) || 0 : 0;
    const rate = Number(percent) || 0;
    let value = mhp * rate;

    if (minDamage !== undefined) value = Math.max(Number(minDamage) || 0, value);
    if (maxDamage !== undefined) value = Math.min(Number(maxDamage) || 0, value);

    return DF.finish(value);
  };

  // Short aliases for RPG Maker's small formula box.
  DF.phys = DF.physical;
  DF.mag = DF.magical;
  DF.pAtk = DF.playerPhysical;
  DF.pMag = DF.playerMagical;
  DF.eAtk = DF.enemyPhysical;
  DF.eMag = DF.enemyMagical;
  DF.pHybrid = DF.playerHybrid;
  DF.eHybrid = DF.enemyHybrid;
  DF.fixed = DF.trueDamage;
  DF.percentHp = DF.percentTargetHp;

  window.SL_DMG = DF;
})();