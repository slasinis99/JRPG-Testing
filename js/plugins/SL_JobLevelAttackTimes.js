/*:
 * @target MZ
 * @plugindesc Class-based Job Level scaling for normal Attack hit counts. v1.0.0
 * @author SL
 *
 * @help
 * SL_ClassAttackHits.js
 *
 * Place this plugin:
 *   - Below SL_JobLevelSystem
 *   - Below VisuStella Battle Core
 *
 * This plugin lets each class define how many times the normal Attack command
 * hits based on that actor's Job Level in the current class.
 *
 * This only affects the normal Attack command.
 * It does not affect ordinary skills.
 *
 * --------------------------------------------------------------------------
 * Class Notetag
 * --------------------------------------------------------------------------
 *
 * Put this in the Class note box:
 *
 *   <SL Attack Hits>
 *   1: 1-1
 *   25: 1-2
 *   50: 1-3
 *   75: 2-4
 *   99: 3-5
 *   </SL Attack Hits>
 *
 * The plugin uses the highest listed threshold less than or equal to the
 * actor's current Job Level.
 *
 * Example:
 *
 *   Job Lv 1-24   -> 1 hit
 *   Job Lv 25-49  -> 1 to 2 hits
 *   Job Lv 50-74  -> 1 to 3 hits
 *   Job Lv 75-98  -> 2 to 4 hits
 *   Job Lv 99     -> 3 to 5 hits
 *
 * --------------------------------------------------------------------------
 * Notes
 * --------------------------------------------------------------------------
 *
 * This REPLACES the attack hit count for the normal Attack command.
 *
 * Therefore, if the class says:
 *
 *   50: 1-3
 *
 * then the normal Attack command hits 1, 2, or 3 times total.
 *
 * I recommend NOT using the database trait "Attack Times +" with this system,
 * unless you intentionally want additional hits on top of this plugin.
 */

(() => {
  "use strict";

  const BLOCK_REGEX = /<SL ATTACK HITS>([\s\S]*?)<\/SL ATTACK HITS>/i;
  const LINE_REGEX = /^\s*(\d+)\s*:\s*(\d+)\s*-\s*(\d+)\s*$/;

  function randomIntInclusive(min, max) {
    min = Math.floor(Number(min));
    max = Math.floor(Number(max));

    if (max < min) {
      const temp = min;
      min = max;
      max = temp;
    }

    return min + Math.randomInt(max - min + 1);
  }

  function currentJobLevelOf(battler) {
    if (battler && battler.isActor && battler.isActor()) {
      if (typeof battler.slCurrentJobLevel === "function") {
        return battler.slCurrentJobLevel();
      }
    }

    return 1;
  }

  function attackHitEntriesForClass(classData) {
    if (!classData) return [];

    if (classData._slAttackHitEntries !== undefined) {
      return classData._slAttackHitEntries;
    }

    const note = classData.note || "";
    const blockMatch = BLOCK_REGEX.exec(note);

    if (!blockMatch) {
      classData._slAttackHitEntries = [];
      return classData._slAttackHitEntries;
    }

    const entries = [];

    const lines = blockMatch[1].split(/\r?\n/);
    for (const line of lines) {
      const match = LINE_REGEX.exec(line);
      if (!match) continue;

      const level = Number(match[1]);
      const minHits = Number(match[2]);
      const maxHits = Number(match[3]);

      entries.push({
        level: Math.max(1, level),
        minHits: Math.max(1, minHits),
        maxHits: Math.max(1, maxHits)
      });
    }

    entries.sort((a, b) => a.level - b.level);

    classData._slAttackHitEntries = entries;
    return classData._slAttackHitEntries;
  }

  Game_Actor.prototype.slClassAttackHitRange = function() {
    const classData = this.currentClass();
    const entries = attackHitEntriesForClass(classData);

    if (entries.length <= 0) {
      return null;
    }

    const jobLevel = currentJobLevelOf(this);
    let chosen = null;

    for (const entry of entries) {
      if (jobLevel >= entry.level) {
        chosen = entry;
      } else {
        break;
      }
    }

    if (!chosen) {
      chosen = entries[0];
    }

    return {
      minHits: chosen.minHits,
      maxHits: chosen.maxHits
    };
  };

  const _Game_Action_numRepeats = Game_Action.prototype.numRepeats;
  Game_Action.prototype.numRepeats = function() {
    let repeats = _Game_Action_numRepeats.call(this);

    if (this.isAttack()) {
      const subject = this.subject();

      if (subject && subject.isActor && subject.isActor()) {
        if (this._slClassAttackHits === undefined) {
          const range = subject.slClassAttackHitRange();

          if (range) {
            this._slClassAttackHits = randomIntInclusive(
              range.minHits,
              range.maxHits
            );
          } else {
            this._slClassAttackHits = repeats;
          }
        }

        repeats = this._slClassAttackHits;
      }
    }

    return Math.max(1, Math.floor(repeats));
  };

})();