/*:
 * @target MZ
 * @plugindesc v1.0 Shows only the current job's Job Level skills in menus and battle.
 * @author JRPG Project
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
 * SL_CurrentJobSkillsOnly
 * ============================================================================
 *
 * This plugin hides Job Level skills from inactive jobs.
 *
 * Problem:
 *   If Warrior, Ranger, and Knight all use the same Skill Type, such as
 *   Techniques, RPG Maker normally shows every learned Technique no matter
 *   which class/job the actor currently has equipped.
 *
 * Solution:
 *   Skills learned through <Job Level Skills> remain permanently learned, but
 *   they only appear and can only be used while the actor's current job has
 *   access to that skill at the actor's current Job Level.
 *
 * This plugin reads class notetags:
 *
 *   <Job Level Skills>
 *   1: 112
 *   6: 113
 *   12: 114
 *   </Job Level Skills>
 *
 * It also supports comma-separated entries:
 *
 *   <Job Level Skills>
 *   10: 15, 16, 17
 *   </Job Level Skills>
 *
 * Single-line tags are also supported:
 *
 *   <Job Level Skill: 10, 15>
 *   <Job Level Skill: 20, 16, 17>
 *
 * Optional Skill notetag:
 *
 *   <SL Always Skill>
 *
 * Put this on a skill if it should always appear even if it is listed in a
 * job's Job Level Skills somewhere.
 *
 * Recommended placement:
 *   Put this below SL_JobLevelSystem and below any skill menu override plugins.
 *
 * ============================================================================
 */

(() => {
  "use strict";

  const pluginName = (() => {
    const src = document.currentScript && document.currentScript.src;
    const match = src ? src.match(/([^/]+)\.js$/i) : null;
    return match ? decodeURIComponent(match[1]) : "SL_CurrentJobSkillsOnly";
  })();

  const params = PluginManager.parameters(pluginName);
  const DEBUG = String(params["Debug Logging"] || "false") === "true";

  window.JRPG = window.JRPG || {};
  JRPG.CurrentJobSkillsOnly = JRPG.CurrentJobSkillsOnly || {};

  const CJS = JRPG.CurrentJobSkillsOnly;

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------

  function asNumber(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function parseSkillIds(text) {
    return String(text || "")
      .split(",")
      .map(value => Number(value.trim()))
      .filter(value => Number.isFinite(value) && value > 0)
      .map(value => Math.floor(value));
  }

  function currentJobClassId(actor) {
    if (!actor) return 0;

    if (actor.slCurrentJobClassId) {
      return asNumber(actor.slCurrentJobClassId(), 0);
    }

    if (actor.multiclassId) {
      const primaryId = asNumber(actor.multiclassId(1), 0);
      if (primaryId > 0) return primaryId;
    }

    if (actor.currentClass && actor.currentClass()) {
      return asNumber(actor.currentClass().id, actor._classId || 0);
    }

    return asNumber(actor._classId, 0);
  }

  function jobLevel(actor, classId) {
    if (!actor || classId <= 0) return 1;

    if (actor.slJobLevel) {
      return asNumber(actor.slJobLevel(classId), 1);
    }

    if (actor.slCurrentJobLevel && classId === currentJobClassId(actor)) {
      return asNumber(actor.slCurrentJobLevel(), 1);
    }

    return 99;
  }

  function skillAlwaysAllowed(skill) {
    if (!skill) return false;

    return /<\s*SL\s+Always\s+Skill\s*>/i.test(skill.note || "") ||
      /<\s*SL\s+Global\s+Skill\s*>/i.test(skill.note || "") ||
      /<\s*SL\s+Job\s+Skill\s+Exempt\s*>/i.test(skill.note || "");
  }

  function parseJobLevelSkillEntriesFallback(classData) {
    if (!classData) return [];

    if (classData._slCJSOFallbackEntries) {
      return classData._slCJSOFallbackEntries;
    }

    const note = classData.note || "";
    const entries = [];

    const singleRegex = /<\s*(?:SL\s*)?Job\s*Level\s*Skill\s*:\s*(\d+)\s*,\s*([\d,\s]+)\s*>/gi;
    let match;

    while ((match = singleRegex.exec(note)) !== null) {
      const level = Math.max(1, Math.floor(asNumber(match[1], 1)));
      const skillIds = parseSkillIds(match[2]);

      for (const skillId of skillIds) {
        entries.push({ level, skillId });
      }
    }

    const blockRegex = /<\s*(?:SL\s*)?Job\s*Level\s*Skills\s*>([\s\S]*?)<\s*\/\s*(?:SL\s*)?Job\s*Level\s*Skills\s*>/gi;

    while ((match = blockRegex.exec(note)) !== null) {
      const body = match[1] || "";
      const lines = body.split(/\r?\n/);

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith("//")) continue;

        const lineMatch = line.match(/^(\d+)\s*[:=]\s*([\d,\s]+)$/);
        if (!lineMatch) continue;

        const level = Math.max(1, Math.floor(asNumber(lineMatch[1], 1)));
        const skillIds = parseSkillIds(lineMatch[2]);

        for (const skillId of skillIds) {
          entries.push({ level, skillId });
        }
      }
    }

    entries.sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return a.skillId - b.skillId;
    });

    classData._slCJSOFallbackEntries = entries;
    return entries;
  }

  function jobLevelSkillEntries(classData) {
    if (!classData) return [];

    if (JRPG.JobLevels && JRPG.JobLevels.jobLevelSkillEntries) {
      return JRPG.JobLevels.jobLevelSkillEntries(classData);
    }

    return parseJobLevelSkillEntriesFallback(classData);
  }

  function allJobLevelSkillIds() {
    if (CJS._allJobLevelSkillIds) {
      return CJS._allJobLevelSkillIds;
    }

    const set = new Set();

    if ($dataClasses) {
      for (const classData of $dataClasses) {
        if (!classData) continue;

        for (const entry of jobLevelSkillEntries(classData)) {
          set.add(Number(entry.skillId));
        }
      }
    }

    CJS._allJobLevelSkillIds = set;

    if (DEBUG) {
      console.log(`${pluginName}: Indexed Job Level skill IDs:`, Array.from(set).sort((a, b) => a - b));
    }

    return set;
  }

  function currentJobAllowedSkillIds(actor) {
    if (!actor) return new Set();

    const classId = currentJobClassId(actor);
    const classData = $dataClasses && $dataClasses[classId];

    if (!classData) return new Set();

    const level = jobLevel(actor, classId);
    const set = new Set();

    for (const entry of jobLevelSkillEntries(classData)) {
      if (Number(entry.level) <= level) {
        set.add(Number(entry.skillId));
      }
    }

    return set;
  }

  CJS.isJobLevelSkill = function(skill) {
    if (!skill) return false;
    return allJobLevelSkillIds().has(Number(skill.id));
  };

  CJS.isSkillAllowedForCurrentJob = function(actor, skill) {
    if (!skill) return false;

    // Non-job skills are unaffected.
    if (!CJS.isJobLevelSkill(skill)) return true;

    // Optional escape hatch for universal skills.
    if (skillAlwaysAllowed(skill)) return true;

    const allowed = currentJobAllowedSkillIds(actor);
    return allowed.has(Number(skill.id));
  };

  // --------------------------------------------------------------------------
  // Filter learned skills
  // --------------------------------------------------------------------------

  const _Game_Actor_skills = Game_Actor.prototype.skills;

  Game_Actor.prototype.skills = function() {
    const skills = _Game_Actor_skills.call(this);

    return skills.filter(skill => {
      return CJS.isSkillAllowedForCurrentJob(this, skill);
    });
  };

  // --------------------------------------------------------------------------
  // Prevent hidden job skills from being usable through menus/battle
  // --------------------------------------------------------------------------

  const _Game_Actor_canUse = Game_Actor.prototype.canUse;

  Game_Actor.prototype.canUse = function(item) {
    if (DataManager.isSkill(item)) {
      if (!CJS.isSkillAllowedForCurrentJob(this, item)) {
        return false;
      }
    }

    return _Game_Actor_canUse.call(this, item);
  };

  // --------------------------------------------------------------------------
  // Hide empty skill type categories
  // --------------------------------------------------------------------------

  const _Game_Actor_skillTypes = Game_Actor.prototype.skillTypes;

  Game_Actor.prototype.skillTypes = function() {
    const types = _Game_Actor_skillTypes.call(this);
    const usableSkills = this.skills();

    return types.filter(stypeId => {
      return usableSkills.some(skill => skill && skill.stypeId === stypeId);
    });
  };

  // --------------------------------------------------------------------------
  // Extra safety for menu/battle skill windows
  // --------------------------------------------------------------------------

  if (typeof Window_SkillList !== "undefined") {
    const _Window_SkillList_includes = Window_SkillList.prototype.includes;

    Window_SkillList.prototype.includes = function(item) {
      if (!_Window_SkillList_includes.call(this, item)) {
        return false;
      }

      if (this._actor && DataManager.isSkill(item)) {
        return CJS.isSkillAllowedForCurrentJob(this._actor, item);
      }

      return true;
    };
  }

})();