/*:
 * @target MZ
 * @plugindesc v1.0 Adds percentage-based state rate/resistance notetags for actors, classes, enemies, equipment, and states.
 * @author JRPG Project
 *
 * @param Apply Rates To Certain Hit
 * @text Apply Rates To Certain Hit
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 * @desc If true, state rates/resistances also affect Certain Hit skills that add states.
 *
 * @param Debug Logging
 * @text Debug Logging
 * @type boolean
 * @on Yes
 * @off No
 * @default false
 *
 * @help
 * ============================================================================
 * SL_StateResistance
 * ============================================================================
 *
 * RPG Maker MZ already has two related built-in trait concepts:
 *
 *   State Rate 100%  = normal susceptibility
 *   State Rate 50%   = half chance to receive that state
 *   State Rate 0%    = no chance from normal state application
 *   State Resist     = hard immunity
 *
 * This plugin adds notetags so you can write those rates directly on database
 * objects without needing to add editor traits every time.
 *
 * Put this plugin below VisuStella battle/core plugins and below custom plugins
 * that add states through equipment effects, especially SL_WeaponSpecialEffects.
 *
 * ----------------------------------------------------------------------------
 * Notetags
 * ----------------------------------------------------------------------------
 *
 * These notetags can be placed on:
 *   Actors, Classes, Enemies, Weapons, Armors, and States.
 *
 * Single-line format:
 *
 *   <SL State Rate: Poison, 50%>
 *   <SL State Rate: 4, 50%>
 *
 * Alias format:
 *
 *   <SL State Resist: Poison, 50%>
 *   <SL State Resistance: Poison, 50%>
 *
 * Block format:
 *
 *   <SL State Rates>
 *   Poison: 50%
 *   Blind: 75%
 *   Stun: 0%
 *   </SL State Rates>
 *
 *   <SL State Resistances>
 *   Poison: 50%
 *   Blind: 75%
 *   Stun: 0%
 *   </SL State Resistances>
 *
 * The value is a state rate, not a subtraction amount:
 *
 *   100% = normal chance
 *    75% = 75% of normal chance
 *    50% = half chance
 *     0% = immune to normal chance-based application
 *   150% = vulnerable; 1.5x normal chance
 *
 * Multiple sources multiply together.
 * Example: armor 50% and accessory 50% gives 25% final state rate.
 *
 * ----------------------------------------------------------------------------
 * Skill / Item Notetag
 * ----------------------------------------------------------------------------
 *
 * Use this on a skill or item if it should ignore percentage state rates:
 *
 *   <SL Ignore State Rate>
 *
 * This does not bypass the built-in State Resist immunity trait.
 *
 * ============================================================================
 */

(() => {
  "use strict";

  const pluginName = "SL_StateResistance";
  const params = PluginManager.parameters(pluginName);

  const APPLY_RATES_TO_CERTAIN_HIT = String(params["Apply Rates To Certain Hit"] || "true") === "true";
  const DEBUG = String(params["Debug Logging"] || "false") === "true";

  function normalizeName(value) {
    return String(value || "").trim().toLowerCase().replace(/\s+/g, "");
  }

  function stateIdFromToken(token) {
    const text = String(token || "").trim();
    if (/^\d+$/.test(text)) return Number(text);

    const normalized = normalizeName(text);
    const state = ($dataStates || []).find(s => s && normalizeName(s.name) === normalized);
    return state ? state.id : 0;
  }

  function rateFromToken(token) {
    const text = String(token || "").trim();
    const hasPercent = text.includes("%");
    const value = Number(text.replace("%", "").trim());

    if (!Number.isFinite(value)) return null;
    if (value < 0) return 0;

    // Accept both 50% / 50 and 0.50 style notation.
    if (hasPercent || value > 1) return value / 100;
    return value;
  }

  function noteObjects(battler) {
    const objects = [];

    if (battler) {
      if (battler.actor && battler.actor()) objects.push(battler.actor());
      if (battler.currentClass && battler.currentClass()) objects.push(battler.currentClass());
      if (battler.enemy && battler.enemy()) objects.push(battler.enemy());
      if (battler.equips) objects.push(...battler.equips().filter(Boolean));
      if (battler.states) objects.push(...battler.states().filter(Boolean));
    }

    return objects.filter(Boolean);
  }

  function parseStateRateNotetags(obj) {
    if (!obj) return [];

    const note = obj.note || "";
    const cacheKey = "_slStateResistanceCache";
    const noteKey = "_slStateResistanceCacheNote";

    if (obj[cacheKey] && obj[noteKey] === note) {
      return obj[cacheKey];
    }

    const results = [];

    const singleRegex = /<\s*SL\s+State\s+(?:Rate|Resist|Resistance)\s*:\s*([^,>]+)\s*,\s*([+\-]?(?:\d+(?:\.\d+)?|\.\d+)\s*%?)\s*>/gi;
    let match;

    while ((match = singleRegex.exec(note)) !== null) {
      const stateId = stateIdFromToken(match[1]);
      const rate = rateFromToken(match[2]);

      if (stateId > 0 && rate !== null) {
        results.push({ stateId, rate });
      } else if (DEBUG) {
        console.warn(`${pluginName}: Could not parse state rate notetag on`, obj, match[0]);
      }
    }

    const blockRegex = /<\s*SL\s+State\s+(?:Rates|Resistances)\s*>([\s\S]*?)<\/\s*SL\s+State\s+(?:Rates|Resistances)\s*>/gi;
    let blockMatch;

    while ((blockMatch = blockRegex.exec(note)) !== null) {
      const lines = String(blockMatch[1] || "").split(/\r?\n/);

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith("//")) continue;

        const lineMatch = line.match(/^([^:]+)\s*:\s*([+\-]?(?:\d+(?:\.\d+)?|\.\d+)\s*%?)\s*$/i);
        if (!lineMatch) continue;

        const stateId = stateIdFromToken(lineMatch[1]);
        const rate = rateFromToken(lineMatch[2]);

        if (stateId > 0 && rate !== null) {
          results.push({ stateId, rate });
        } else if (DEBUG) {
          console.warn(`${pluginName}: Could not parse state rate block line on`, obj, line);
        }
      }
    }

    obj[cacheKey] = results;
    obj[noteKey] = note;
    return results;
  }

  function ignoresStateRate(action) {
    const item = action && action.item ? action.item() : null;
    const note = item ? item.note || "" : "";
    return /<\s*(?:SL\s+)?Ignore\s+State\s+(?:Rate|Resist|Resistance)\s*>/i.test(note);
  }

  Game_BattlerBase.prototype.slStateRateNotetagMultiplier = function(stateId) {
    let rate = 1.0;

    for (const obj of noteObjects(this)) {
      for (const entry of parseStateRateNotetags(obj)) {
        if (entry.stateId === stateId) {
          rate *= entry.rate;
        }
      }
    }

    return Math.max(0, rate);
  };

  const _Game_BattlerBase_stateRate = Game_BattlerBase.prototype.stateRate;
  Game_BattlerBase.prototype.stateRate = function(stateId) {
    const baseRate = _Game_BattlerBase_stateRate.call(this, stateId);
    const noteRate = this.slStateRateNotetagMultiplier(stateId);
    return Math.max(0, baseRate * noteRate);
  };

  if (APPLY_RATES_TO_CERTAIN_HIT) {
    Game_Action.prototype.itemEffectAddNormalState = function(target, effect) {
      const stateId = effect.dataId;
      let chance = effect.value1;

      if (!ignoresStateRate(this)) {
        chance *= target.stateRate(stateId);
      }

      // Preserve MZ's default behavior: LUK only affects non-certain-hit actions.
      if (!this.isCertainHit()) {
        chance *= this.lukEffectRate(target);
      }

      if (Math.random() < chance) {
        target.addState(stateId);
        this.makeSuccess(target);
      }
    };
  }

  // Compatibility patch for SL_WeaponSpecialEffects. That plugin applies
  // <SL Magic Add State> directly from equipment, so we make that roll respect
  // target.stateRate as long as this plugin is placed below it.
  if (typeof Game_Action.prototype.slApplyEquipMagicAddStates === "function") {
    Game_Action.prototype.slApplyEquipMagicAddStates = function(target, value) {
      const subject = this.subject();

      if (!subject || !target) return;
      if (!subject.isActor || !subject.isActor()) return;
      if (!target.isAlive || !target.isAlive()) return;
      if (!this.isSkill()) return;
      if (!this.isMagical()) return;
      if (value <= 0) return;

      for (const obj of subject.equips().filter(Boolean)) {
        const note = obj.note || "";
        const regex = /<\s*SL\s+Magic\s+Add\s+State\s*:\s*([^,>]+)\s*,\s*([0-9.]+)\s*%?\s*>/gi;
        let match;

        while ((match = regex.exec(note)) !== null) {
          const stateId = stateIdFromToken(match[1]);
          const basePercent = Number(match[2]);

          if (stateId > 0 && Number.isFinite(basePercent)) {
            const rate = ignoresStateRate(this) ? 1.0 : target.stateRate(stateId);
            const chance = (basePercent / 100) * rate;

            if (Math.random() < chance) {
              target.addState(stateId);
            }
          }
        }
      }
    };
  }
})();