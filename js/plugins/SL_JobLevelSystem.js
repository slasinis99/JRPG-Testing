/*:
 * @target MZ
 * @plugindesc Adds a separate JRPG Job Level 1-99 system using custom Job Points and Job Lv skill unlocks. v1.1.0
 * @author JRPG Project
 *
 * @param Default Battle Job Points
 * @text Default Battle Job Points
 * @type number
 * @min 0
 * @default 1
 * @desc Job Points awarded to each battle member's currently equipped primary job after a normal victory.
 *
 * @param Show Battle JP Message
 * @text Show Battle JP Message
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 * @desc If true, victory rewards include a message showing Job Points gained.
 *
 * @param Show Job Level Up Messages
 * @text Show Job Level Up Messages
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 * @desc If true, actors announce when a job reaches a new Job Level.
 *
 * @param Show Job Skill Learn Messages
 * @text Show Job Skill Learn Messages
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 * @desc If true, actors announce when they learn skills from Job Level notetags.
 *
 * @param Debug Logging
 * @text Debug Logging
 * @type boolean
 * @on Yes
 * @off No
 * @default false
 * @desc If true, prints the Job Level curve to the console on boot.
 *
 * @command GainActorJobPoints
 * @text Gain Actor Job Points
 * @desc Gives Job Points to one actor. Class ID 0 means the actor's currently equipped primary job.
 *
 * @arg actorId
 * @text Actor ID
 * @type number
 * @min 1
 * @default 1
 *
 * @arg classId
 * @text Class ID
 * @type number
 * @min 0
 * @default 0
 * @desc 0 = currently equipped primary job.
 *
 * @arg amount
 * @text Amount
 * @type number
 * @min 0
 * @default 1
 *
 * @arg showMessages
 * @text Show Messages
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 *
 * @command GainPartyJobPoints
 * @text Gain Party Job Points
 * @desc Gives Job Points to all battle members. Class ID 0 means each actor's currently equipped primary job.
 *
 * @arg classId
 * @text Class ID
 * @type number
 * @min 0
 * @default 0
 * @desc 0 = each actor's currently equipped primary job.
 *
 * @arg amount
 * @text Amount
 * @type number
 * @min 0
 * @default 1
 *
 * @arg showMessages
 * @text Show Messages
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 *
 * @command SetNextBattleJobPoints
 * @text Set Next Battle Job Points
 * @desc Overrides the Job Points awarded by the next victory. Useful before boss encounters or inside troop events.
 *
 * @arg amount
 * @text Amount
 * @type number
 * @min 0
 * @default 1
 *
 * @command ClearNextBattleJobPoints
 * @text Clear Next Battle Job Points
 * @desc Clears the one-battle Job Point override.
 *
 * @command RefreshActorJobLevelSkills
 * @text Refresh Actor Job Level Skills
 * @desc Teaches one actor any Job Level skills they already qualify for. Class ID 0 means current primary job.
 *
 * @arg actorId
 * @text Actor ID
 * @type number
 * @min 1
 * @default 1
 *
 * @arg classId
 * @text Class ID
 * @type number
 * @min 0
 * @default 0
 * @desc 0 = currently equipped primary job.
 *
 * @arg showMessages
 * @text Show Messages
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 *
 * @command RefreshPartyJobLevelSkills
 * @text Refresh Party Job Level Skills
 * @desc Teaches each battle member any Job Level skills they already qualify for in their current primary job.
 *
 * @arg showMessages
 * @text Show Messages
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 *
 * @command PrintJobLevelCurve
 * @text Print Job Level Curve
 * @desc Prints the Job Point curve to the developer console.
 *
 * @help
 * ============================================================================
 * SL_JobLevelSystem
 * ============================================================================
 *
 * This plugin adds a separate Job Level system for this JRPG project.
 *
 * It does NOT use or modify VisuStella ClassChangeSystem's Class Points,
 * Job Points, class levels, or class EXP. This plugin stores its own cumulative
 * Job Points on each actor by database Class ID.
 *
 * Intended design:
 *   - Job Levels range from 1 to 99.
 *   - A normal battle victory gives 1 Job Point to each battle member's
 *     currently equipped primary job.
 *   - Harder encounters can give more Job Points through enemy notetags,
 *     plugin commands, or script calls.
 *
 * Curve summary, assuming 1 Job Point per battle:
 *   Job Lv 10:  12 total Job Points
 *   Job Lv 25:  59 total Job Points
 *   Job Lv 50:  255 total Job Points
 *   Job Lv 75:  718 total Job Points
 *   Job Lv 99:  1798 total Job Points
 *
 * Class skill notetags:
 *
 *   <Job Level Skill: 2, 15>
 *   <Job Level Skill: 5, 16>
 *   <Job Level Skill: 10, 17, 18>
 *
 * Or block style:
 *
 *   <Job Level Skills>
 *   2: 15
 *   5: 16
 *   10: 17, 18
 *   </Job Level Skills>
 *
 * Put these notetags in the Class note box. When an actor reaches that
 * Job Level in that class, the actor permanently learns the listed skills.
 *
 * Enemy notetags:
 *
 *   <Job Points: 3>
 *   <Job Point Reward: 3>
 *   <SL Job Points: 3>
 *
 * Since RPG Maker MZ troops do not have a normal note box, put the notetag on
 * one enemy in the troop. The battle reward becomes at least that value.
 * Untagged encounters still give the default battle reward, usually 1.
 *
 * Script calls:
 *
 *   const actor = $gameActors.actor(1);
 *
 *   actor.slCurrentJobClassId()
 *   actor.slCurrentJobLevel()
 *   actor.slJobLevel(classId)
 *   actor.slJobPoints(classId)
 *   actor.slJobPointsIntoLevel(classId)
 *   actor.slJobPointsToNextLevel(classId)
 *   actor.slGainJobPoints(amount, classId, showMessages)
 *   actor.slLearnJobLevelSkillsForClass(classId, showMessages)
 *   actor.slRefreshCurrentJobLevelSkills(showMessages)
 *   actor.slRefreshAllStoredJobLevelSkills(showMessages)
 *
 *   JRPG.JobLevels.jpToNextLevel(level)
 *   JRPG.JobLevels.totalJpForLevel(level)
 *   JRPG.JobLevels.levelFromTotalJp(totalJobPoints)
 *   JRPG.JobLevels.printCurve()
 *
 *   $gameSystem.slSetNextBattleJobPoints(5)
 *   $gameSystem.slClearNextBattleJobPoints()
 *
 * Recommended placement:
 *   Put this below VisuStella Core Engine and below VisuStella Class Change
 *   System. It can go above or below SL_JobLevelStats because it does not
 *   override actor parameters.
 *
 * ============================================================================
 */

(() => {
  "use strict";

  const pluginName = (() => {
    const src = document.currentScript && document.currentScript.src;
    const match = src ? src.match(/([^/]+)\.js$/i) : null;
    return match ? decodeURIComponent(match[1]) : "SL_JobLevelSystem";
  })();

  const params = PluginManager.parameters(pluginName);

  const DEFAULT_BATTLE_JOB_POINTS = Math.max(0, Number(params["Default Battle Job Points"] || 1));
  const SHOW_BATTLE_JP_MESSAGE = String(params["Show Battle JP Message"] || "true") === "true";
  const SHOW_LEVEL_UP_MESSAGES = String(params["Show Job Level Up Messages"] || "true") === "true";
  const SHOW_SKILL_LEARN_MESSAGES = String(params["Show Job Skill Learn Messages"] || "true") === "true";
  const DEBUG_LOGGING = String(params["Debug Logging"] || "false") === "true";

  window.JRPG = window.JRPG || {};
  JRPG.JobLevels = JRPG.JobLevels || {};

  const JL = JRPG.JobLevels;

  JL.MAX_JOB_LEVEL = 99;

  JL.JP_MILESTONE_LEVELS = [1, 10, 25, 50, 75, 99];

  JL.JP_TO_NEXT_MILESTONE = {
    1: 1,
    10: 5,
    25: 12,
    50: 25,
    75: 37,
    99: 44
  };

  function clampInt(value, min, max) {
    value = Number(value);
    if (!Number.isFinite(value)) value = min;
    return Math.max(min, Math.min(Math.floor(value), max));
  }

  function clampJp(value) {
    value = Number(value);
    if (!Number.isFinite(value)) value = 0;
    return Math.max(0, Math.floor(value));
  }

  function getStartLevel(level) {
    for (let i = 0; i < JL.JP_MILESTONE_LEVELS.length; i++) {
      if (JL.JP_MILESTONE_LEVELS[i] > level) {
        return JL.JP_MILESTONE_LEVELS[i - 1];
      }
    }

    return JL.JP_MILESTONE_LEVELS[JL.JP_MILESTONE_LEVELS.length - 2];
  }

  function getEndLevel(level) {
    for (const milestone of JL.JP_MILESTONE_LEVELS) {
      if (milestone > level) return milestone;
    }

    return JL.JP_MILESTONE_LEVELS[JL.JP_MILESTONE_LEVELS.length - 1];
  }

  function logInterpolate(startValue, endValue, t) {
    const startLog = Math.log(startValue);
    const endLog = Math.log(endValue);
    return Math.exp(startLog + (endLog - startLog) * t);
  }

  JL.jpToNextLevel = function(level) {
    level = clampInt(level, 1, JL.MAX_JOB_LEVEL);

    if (level >= JL.MAX_JOB_LEVEL) return 0;

    const startLevel = getStartLevel(level);
    const endLevel = getEndLevel(level);
    const startJp = JL.JP_TO_NEXT_MILESTONE[startLevel];
    const endJp = JL.JP_TO_NEXT_MILESTONE[endLevel];
    const t = (level - startLevel) / (endLevel - startLevel);

    return Math.max(1, Math.round(logInterpolate(startJp, endJp, t)));
  };

  JL.totalJpCache = [];

  JL.rebuildTotalJpCache = function() {
    JL.totalJpCache.length = 0;
    JL.totalJpCache[1] = 0;

    for (let level = 1; level < JL.MAX_JOB_LEVEL; level++) {
      JL.totalJpCache[level + 1] = JL.totalJpCache[level] + JL.jpToNextLevel(level);
    }
  };

  JL.rebuildTotalJpCache();

  JL.totalJpForLevel = function(level) {
    level = clampInt(level, 1, JL.MAX_JOB_LEVEL);
    return JL.totalJpCache[level] || 0;
  };

  JL.levelFromTotalJp = function(totalJobPoints) {
    const total = clampJp(totalJobPoints);

    for (let level = JL.MAX_JOB_LEVEL; level >= 1; level--) {
      if (total >= JL.totalJpForLevel(level)) {
        return level;
      }
    }

    return 1;
  };

  JL.pointsIntoLevel = function(totalJobPoints) {
    const level = JL.levelFromTotalJp(totalJobPoints);
    return clampJp(totalJobPoints) - JL.totalJpForLevel(level);
  };

  JL.pointsToNextLevel = function(totalJobPoints) {
    const level = JL.levelFromTotalJp(totalJobPoints);
    if (level >= JL.MAX_JOB_LEVEL) return 0;
    return JL.totalJpForLevel(level + 1) - clampJp(totalJobPoints);
  };

  JL.printCurve = function() {
    console.log("SL Job Level Curve");
    console.log("--------------------------------------------------");
    console.log("Level | JP to Next | Total JP Required");
    console.log("--------------------------------------------------");

    for (const level of JL.JP_MILESTONE_LEVELS) {
      console.log(
        String(level).padEnd(5, " ") + " | " +
        String(JL.jpToNextLevel(level)).padEnd(10, " ") + " | " +
        String(JL.totalJpForLevel(level))
      );
    }

    console.log("--------------------------------------------------");
  };

  function classNameFromId(classId) {
    const data = $dataClasses && $dataClasses[classId];
    return data ? data.name : "Job";
  }

  function skillNameFromId(skillId) {
    const data = $dataSkills && $dataSkills[skillId];
    return data ? data.name : `Skill #${skillId}`;
  }

  function parseSkillIds(text) {
    return String(text || "")
      .split(",")
      .map(value => Number(value.trim()))
      .filter(value => Number.isFinite(value) && value > 0)
      .map(value => Math.floor(value));
  }

  JL.jobLevelSkillEntries = function(classData) {
    if (!classData) return [];

    if (classData._slJobLevelSkillEntries) {
      return classData._slJobLevelSkillEntries;
    }

    const note = classData.note || "";
    const entries = [];

    const singleRegex = /<\s*(?:SL\s*)?Job\s*Level\s*Skill\s*:\s*(\d+)\s*,\s*([\d,\s]+)\s*>/gi;
    let match;

    while ((match = singleRegex.exec(note)) !== null) {
      const level = clampInt(match[1], 1, JL.MAX_JOB_LEVEL);
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
        if (!line) continue;

        const lineMatch = line.match(/^(\d+)\s*[:=]\s*([\d,\s]+)$/);
        if (!lineMatch) continue;

        const level = clampInt(lineMatch[1], 1, JL.MAX_JOB_LEVEL);
        const skillIds = parseSkillIds(lineMatch[2]);

        for (const skillId of skillIds) {
          entries.push({ level, skillId });
        }
      }
    }

    const seen = new Set();
    const uniqueEntries = [];

    for (const entry of entries) {
      const key = `${entry.level}:${entry.skillId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      uniqueEntries.push(entry);
    }

    uniqueEntries.sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return a.skillId - b.skillId;
    });

    classData._slJobLevelSkillEntries = uniqueEntries;
    return uniqueEntries;
  };

  function pluralizeJobPoints(amount) {
    return amount === 1 ? "Job Point" : "Job Points";
  }

  function ensureActorJobData(actor) {
    if (!actor._slJobPointsByClass) actor._slJobPointsByClass = {};
  }

  Game_System.prototype.slSetNextBattleJobPoints = function(amount) {
    this._slNextBattleJobPoints = clampJp(amount);
  };

  Game_System.prototype.slNextBattleJobPoints = function() {
    if (this._slNextBattleJobPoints === undefined) return null;
    if (this._slNextBattleJobPoints === null) return null;
    return clampJp(this._slNextBattleJobPoints);
  };

  Game_System.prototype.slClearNextBattleJobPoints = function() {
    this._slNextBattleJobPoints = null;
  };

  const _Game_Actor_initMembers = Game_Actor.prototype.initMembers;

  Game_Actor.prototype.initMembers = function() {
    _Game_Actor_initMembers.call(this);
    this._slJobPointsByClass = {};
  };

  Game_Actor.prototype.slCurrentJobClassId = function() {
    if (this.multiclassId) {
      const primaryId = Number(this.multiclassId(1) || 0);
      if (primaryId > 0) return primaryId;
    }

    if (this.currentClass && this.currentClass()) {
      return Number(this.currentClass().id || this._classId || 0);
    }

    return Number(this._classId || 0);
  };

  Game_Actor.prototype.slJobPoints = function(classId) {
    ensureActorJobData(this);
    classId = Number(classId || this.slCurrentJobClassId() || 0);
    if (classId <= 0) return 0;
    return clampJp(this._slJobPointsByClass[classId] || 0);
  };

  Game_Actor.prototype.slSetJobPoints = function(classId, amount) {
    ensureActorJobData(this);
    classId = Number(classId || this.slCurrentJobClassId() || 0);
    if (classId <= 0) return;
    this._slJobPointsByClass[classId] = clampJp(amount);
  };

  Game_Actor.prototype.slJobLevel = function(classId) {
    return JL.levelFromTotalJp(this.slJobPoints(classId));
  };

  Game_Actor.prototype.slCurrentJobLevel = function() {
    return this.slJobLevel(this.slCurrentJobClassId());
  };

  Game_Actor.prototype.slJobPointsIntoLevel = function(classId) {
    return JL.pointsIntoLevel(this.slJobPoints(classId));
  };

  Game_Actor.prototype.slJobPointsToNextLevel = function(classId) {
    return JL.pointsToNextLevel(this.slJobPoints(classId));
  };

  Game_Actor.prototype.slLearnJobLevelSkillsForClass = function(classId, showMessages) {
    classId = Number(classId || this.slCurrentJobClassId() || 0);
    if (classId <= 0) return [];

    const classData = $dataClasses && $dataClasses[classId];
    if (!classData) return [];

    const jobLevel = this.slJobLevel(classId);
    const entries = JL.jobLevelSkillEntries(classData);
    const learned = [];

    for (const entry of entries) {
      if (entry.level > jobLevel) continue;
      if (!$dataSkills || !$dataSkills[entry.skillId]) continue;
      if (this.isLearnedSkill && this.isLearnedSkill(entry.skillId)) continue;

      this.learnSkill(entry.skillId);
      learned.push(entry.skillId);

      if (showMessages && SHOW_SKILL_LEARN_MESSAGES) {
        $gameMessage.add(`${this.name()} learned ${skillNameFromId(entry.skillId)}!`);
      }
    }

    return learned;
  };

  Game_Actor.prototype.slRefreshCurrentJobLevelSkills = function(showMessages) {
    return this.slLearnJobLevelSkillsForClass(this.slCurrentJobClassId(), showMessages);
  };

  Game_Actor.prototype.slRefreshAllStoredJobLevelSkills = function(showMessages) {
    ensureActorJobData(this);

    const learned = [];
    const classIds = Object.keys(this._slJobPointsByClass)
      .map(value => Number(value))
      .filter(value => Number.isFinite(value) && value > 0);

    const currentClassId = this.slCurrentJobClassId();
    if (currentClassId > 0 && !classIds.includes(currentClassId)) {
      classIds.push(currentClassId);
    }

    for (const classId of classIds) {
      learned.push(...this.slLearnJobLevelSkillsForClass(classId, showMessages));
    }

    return learned;
  };

  const _Game_Actor_setup = Game_Actor.prototype.setup;

  Game_Actor.prototype.setup = function(actorId) {
    _Game_Actor_setup.call(this, actorId);
    this.slRefreshCurrentJobLevelSkills(false);
  };

  const _Game_Actor_changeClass = Game_Actor.prototype.changeClass;

Game_Actor.prototype.changeClass = function(classId, keepExp) {
  _Game_Actor_changeClass.call(this, classId, keepExp);

  // VisuStella Class Change creates temporary preview actors while scrolling
  // through the class list. Those temp actors should never queue messages or
  // teach skills globally.
  if (this._tempActor) return;

  // Class changes should quietly make sure the actor has any already-earned
  // skills, but visible skill-learn messages should be reserved for actual
  // Job Level gains after battle or explicit plugin commands.
  this.slLearnJobLevelSkillsForClass(classId, false);
};

  Game_Actor.prototype.slGainJobPoints = function(amount, classId, showMessages) {
    ensureActorJobData(this);

    amount = clampJp(amount);
    classId = Number(classId || this.slCurrentJobClassId() || 0);

    if (amount <= 0 || classId <= 0) {
      return {
        actor: this,
        classId,
        amount: 0,
        oldLevel: this.slJobLevel(classId),
        newLevel: this.slJobLevel(classId),
        learnedSkills: []
      };
    }

    const oldPoints = this.slJobPoints(classId);
    const oldLevel = JL.levelFromTotalJp(oldPoints);
    const newPoints = oldPoints + amount;
    const newLevel = JL.levelFromTotalJp(newPoints);

    this.slSetJobPoints(classId, newPoints);

    if (showMessages && SHOW_LEVEL_UP_MESSAGES && newLevel > oldLevel) {
      const jobName = classNameFromId(classId);
      $gameMessage.add(`${this.name()}'s ${jobName} reached Job Lv ${newLevel}!`);
    }

    const learnedSkills = this.slLearnJobLevelSkillsForClass(classId, showMessages);

    return {
      actor: this,
      classId,
      amount,
      oldLevel,
      newLevel,
      learnedSkills
    };
  };

  JL.enemyJobPointReward = function(enemyData) {
    if (!enemyData) return null;

    const note = enemyData.note || "";
    const match = note.match(/<\s*(?:SL\s*Job\s*Points|Job\s*Points|Job\s*Point\s*Reward)\s*:\s*(\d+)\s*>/i);

    if (!match) return null;
    return clampJp(match[1]);
  };

  JL.currentBattleJobPointReward = function() {
    const override = $gameSystem ? $gameSystem.slNextBattleJobPoints() : null;

    if (override !== null) {
      return override;
    }

    let reward = DEFAULT_BATTLE_JOB_POINTS;

    if ($gameTroop && $gameTroop.members) {
      for (const enemy of $gameTroop.members()) {
        if (!enemy || !enemy.enemy) continue;
        const enemyReward = JL.enemyJobPointReward(enemy.enemy());
        if (enemyReward !== null) reward = Math.max(reward, enemyReward);
      }
    }

    return clampJp(reward);
  };

  JL.gainBattleJobPoints = function() {
    const amount = JL.currentBattleJobPointReward();

    if ($gameSystem) {
      $gameSystem.slClearNextBattleJobPoints();
    }

    if (amount <= 0) return [];

    const actors = $gameParty && $gameParty.battleMembers ? $gameParty.battleMembers() : [];
    const results = [];

    if (SHOW_BATTLE_JP_MESSAGE) {
      $gameMessage.add(`The party earned ${amount} ${pluralizeJobPoints(amount)}.`);
    }

    for (const actor of actors) {
      if (!actor) continue;
      results.push(actor.slGainJobPoints(amount, actor.slCurrentJobClassId(), true));
    }

    return results;
  };

  const _BattleManager_gainRewards = BattleManager.gainRewards;

  BattleManager.gainRewards = function() {
    _BattleManager_gainRewards.call(this);
    JL.gainBattleJobPoints();
  };

  PluginManager.registerCommand(pluginName, "GainActorJobPoints", args => {
    const actorId = Number(args.actorId || 0);
    const classId = Number(args.classId || 0);
    const amount = Number(args.amount || 0);
    const showMessages = String(args.showMessages || "true") === "true";
    const actor = $gameActors.actor(actorId);

    if (actor) {
      actor.slGainJobPoints(amount, classId || actor.slCurrentJobClassId(), showMessages);
    }
  });

  PluginManager.registerCommand(pluginName, "GainPartyJobPoints", args => {
    const classId = Number(args.classId || 0);
    const amount = Number(args.amount || 0);
    const showMessages = String(args.showMessages || "true") === "true";
    const actors = $gameParty && $gameParty.battleMembers ? $gameParty.battleMembers() : [];

    for (const actor of actors) {
      if (!actor) continue;
      actor.slGainJobPoints(amount, classId || actor.slCurrentJobClassId(), showMessages);
    }
  });

  PluginManager.registerCommand(pluginName, "SetNextBattleJobPoints", args => {
    $gameSystem.slSetNextBattleJobPoints(Number(args.amount || 0));
  });

  PluginManager.registerCommand(pluginName, "ClearNextBattleJobPoints", () => {
    $gameSystem.slClearNextBattleJobPoints();
  });

  PluginManager.registerCommand(pluginName, "RefreshActorJobLevelSkills", args => {
    const actorId = Number(args.actorId || 0);
    const classId = Number(args.classId || 0);
    const showMessages = String(args.showMessages || "true") === "true";
    const actor = $gameActors.actor(actorId);

    if (actor) {
      actor.slLearnJobLevelSkillsForClass(classId || actor.slCurrentJobClassId(), showMessages);
    }
  });

  PluginManager.registerCommand(pluginName, "RefreshPartyJobLevelSkills", args => {
    const showMessages = String(args.showMessages || "true") === "true";
    const actors = $gameParty && $gameParty.battleMembers ? $gameParty.battleMembers() : [];

    for (const actor of actors) {
      if (!actor) continue;
      actor.slRefreshCurrentJobLevelSkills(showMessages);
    }
  });

  PluginManager.registerCommand(pluginName, "PrintJobLevelCurve", () => {
    JL.printCurve();
  });

  if (DEBUG_LOGGING) {
    JL.printCurve();
  }
})();