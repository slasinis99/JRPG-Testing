/*:
 * @target MZ
 * @plugindesc v1.0 Adds enemy-specific steal tables using notetags.
 * @author Stephen / ChatGPT
 *
 * @param Default Steal Chance
 * @type number
 * @min 0
 * @max 100
 * @default 70
 *
 * @param Success Message
 * @type string
 * @default Stole %1!
 *
 * @param Failure Message
 * @type string
 * @default Could not steal.
 *
 * @param Nothing Message
 * @type string
 * @default Nothing to steal.
 *
 * @param Already Stolen Message
 * @type string
 * @default Nothing to steal.
 *
 * @param No Target Message
 * @type string
 * @default No steal target.
 *
 * @command StealLastTarget
 * @text Steal Last Target
 * @desc Attempts to steal from the last enemy targeted by the current skill/action.
 *
 * @arg chance
 * @text Steal Chance
 * @type number
 * @min 0
 * @max 100
 * @default 70
 *
 * @help
 * ============================================================================
 * SL_StealSystem
 * ============================================================================
 *
 * Enemy Notetag:
 *
 *   <Steal List>
 *   Potion: 25
 *   Tent: 15
 *   Goblin Chopper: 5
 *   </Steal List>
 *
 * Each enemy instance rolls once to determine what it has.
 *
 * In the example above:
 *   25% chance the enemy has 1 Potion
 *   15% chance the enemy has 1 Tent
 *   5% chance the enemy has 1 Goblin Chopper
 *   55% chance the enemy has nothing
 *
 * The chances are treated as one combined table, not independent rolls.
 *
 * Item name lookup order:
 *   1. Items
 *   2. Weapons
 *   3. Armors
 *
 * If you want to force a specific database type, use:
 *
 *   Item: Potion: 25
 *   Weapon: Goblin Chopper: 5
 *   Armor: Leather Vest: 10
 *
 * ============================================================================
 * Skill Setup
 * ============================================================================
 *
 * Recommended method:
 *
 * Give your Steal skill this notetag:
 *
 *   <Steal Skill>
 *   <Steal Chance: 70>
 *
 * The skill should usually be:
 *   - Scope: 1 Enemy
 *   - Hit Type: Certain Hit
 *   - Damage Type: None
 *
 * If the enemy has nothing:
 *   Nothing to steal.
 *
 * If the enemy has an item but the steal roll fails:
 *   Could not steal.
 *
 * If the steal succeeds:
 *   Stole Potion!
 *
 * After an item is stolen, that enemy has nothing else to steal.
 *
 * ============================================================================
 * Common Event Method
 * ============================================================================
 *
 * If you prefer using a Common Event, do NOT use <Steal Skill>.
 *
 * Instead:
 *   1. Make the Steal skill target 1 enemy.
 *   2. Add a Common Event effect.
 *   3. In the Common Event, use plugin command:
 *        SL_StealSystem > Steal Last Target
 *
 * The plugin remembers the last enemy targeted by the action.
 *
 * ============================================================================
 */

(() => {
    "use strict";

    const PLUGIN_NAME = "SL_StealSystem";
    const params = PluginManager.parameters(PLUGIN_NAME);

    const DEFAULT_STEAL_CHANCE = Number(params["Default Steal Chance"] || 70);
    const SUCCESS_MESSAGE = String(params["Success Message"] || "Stole %1!");
    const FAILURE_MESSAGE = String(params["Failure Message"] || "Could not steal.");
    const NOTHING_MESSAGE = String(params["Nothing Message"] || "Nothing to steal.");
    const ALREADY_STOLEN_MESSAGE = String(params["Already Stolen Message"] || "Nothing to steal.");
    const NO_TARGET_MESSAGE = String(params["No Target Message"] || "No steal target.");

    const SL = window.SL || {};
    window.SL = SL;
    SL.StealSystem = SL.StealSystem || {};

    const StealSystem = SL.StealSystem;

    StealSystem._enemyTableCache = {};

    // -------------------------------------------------------------------------
    // Utility
    // -------------------------------------------------------------------------

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function formatMessage(template, value) {
        return template.replace("%1", value);
    }

    function addBattleLogText(text) {
        if (!text) return;

        const logWindow = BattleManager._logWindow;
        if (logWindow) {
            logWindow.push("addText", text);
            logWindow.push("wait");
        }
    }

    function normalizeName(name) {
        return String(name || "").trim().toLowerCase();
    }

    function findByExactName(dataArray, name) {
        const target = normalizeName(name);

        for (let i = 1; i < dataArray.length; i++) {
            const obj = dataArray[i];
            if (obj && normalizeName(obj.name) === target) {
                return obj;
            }
        }

        return null;
    }

    function findStealObject(rawName) {
        let name = String(rawName || "").trim();
        let forcedType = "";

        const typedMatch = name.match(/^(item|i|weapon|w|armor|a)\s*[:/]\s*(.+)$/i);
        if (typedMatch) {
            forcedType = typedMatch[1].toLowerCase();
            name = typedMatch[2].trim();
        }

        let obj = null;

        if (forcedType === "item" || forcedType === "i") {
            obj = findByExactName($dataItems, name);
            return obj ? { kind: "item", id: obj.id, name: obj.name } : null;
        }

        if (forcedType === "weapon" || forcedType === "w") {
            obj = findByExactName($dataWeapons, name);
            return obj ? { kind: "weapon", id: obj.id, name: obj.name } : null;
        }

        if (forcedType === "armor" || forcedType === "a") {
            obj = findByExactName($dataArmors, name);
            return obj ? { kind: "armor", id: obj.id, name: obj.name } : null;
        }

        obj = findByExactName($dataItems, name);
        if (obj) return { kind: "item", id: obj.id, name: obj.name };

        obj = findByExactName($dataWeapons, name);
        if (obj) return { kind: "weapon", id: obj.id, name: obj.name };

        obj = findByExactName($dataArmors, name);
        if (obj) return { kind: "armor", id: obj.id, name: obj.name };

        return null;
    }

    function objectFromStealEntry(entry) {
        if (!entry) return null;

        if (entry.kind === "item") {
            return $dataItems[entry.id];
        }

        if (entry.kind === "weapon") {
            return $dataWeapons[entry.id];
        }

        if (entry.kind === "armor") {
            return $dataArmors[entry.id];
        }

        return null;
    }

    // -------------------------------------------------------------------------
    // Notetag Parsing
    // -------------------------------------------------------------------------

    StealSystem.stealTableForEnemy = function(enemyData) {
        if (!enemyData) return [];

        const enemyId = enemyData.id;

        if (this._enemyTableCache[enemyId]) {
            return this._enemyTableCache[enemyId];
        }

        const note = String(enemyData.note || "");
        const match = note.match(/<\s*Steal\s+List\s*>([\s\S]*?)<\/\s*Steal\s+List\s*>/i);

        if (!match) {
            this._enemyTableCache[enemyId] = [];
            return [];
        }

        const body = match[1];
        const lines = body.split(/\r?\n/);
        const table = [];

        for (const rawLine of lines) {
            let line = String(rawLine || "").trim();

            if (!line) continue;
            if (line.startsWith("#")) continue;
            if (line.startsWith("//")) continue;

            const colonIndex = line.lastIndexOf(":");
            if (colonIndex < 0) continue;

            const itemName = line.slice(0, colonIndex).trim();
            const chanceText = line.slice(colonIndex + 1).replace("%", "").trim();
            const chance = clamp(Number(chanceText || 0), 0, 100);

            if (!itemName || chance <= 0) continue;

            const found = findStealObject(itemName);

            if (found) {
                table.push({
                    kind: found.kind,
                    id: found.id,
                    name: found.name,
                    chance: chance
                });
            } else {
                console.warn(`${PLUGIN_NAME}: Could not find steal item "${itemName}" on enemy "${enemyData.name}".`);
            }
        }

        this._enemyTableCache[enemyId] = table;
        return table;
    };

    StealSystem.isStealSkill = function(skill) {
        if (!skill) return false;
        return /<\s*Steal\s+Skill\s*>/i.test(String(skill.note || ""));
    };

    StealSystem.stealChanceForSkill = function(skill) {
        if (!skill) return DEFAULT_STEAL_CHANCE;

        const note = String(skill.note || "");
        const match = note.match(/<\s*Steal\s+Chance\s*:\s*(\d+(?:\.\d+)?)\s*>/i);

        if (match) {
            return clamp(Number(match[1]), 0, 100);
        }

        return DEFAULT_STEAL_CHANCE;
    };

    // -------------------------------------------------------------------------
    // Enemy Steal State
    // -------------------------------------------------------------------------

    const _Game_Enemy_setup = Game_Enemy.prototype.setup;
    Game_Enemy.prototype.setup = function(enemyId, x, y) {
        _Game_Enemy_setup.call(this, enemyId, x, y);
        this.slResetStealData();
    };

    Game_Enemy.prototype.slResetStealData = function() {
        this._slStealRolled = false;
        this._slStealEntry = null;
        this._slStealStolen = false;
    };

    Game_Enemy.prototype.slRollStealItem = function() {
        if (this._slStealRolled) {
            return this._slStealEntry;
        }

        this._slStealRolled = true;
        this._slStealEntry = null;

        const table = StealSystem.stealTableForEnemy(this.enemy());

        if (!table.length) {
            return null;
        }

        const roll = Math.random() * 100;
        let cumulative = 0;

        for (const entry of table) {
            cumulative += Number(entry.chance || 0);

            if (roll < cumulative) {
                this._slStealEntry = {
                    kind: entry.kind,
                    id: entry.id,
                    name: entry.name
                };
                break;
            }
        }

        return this._slStealEntry;
    };

    Game_Enemy.prototype.slHasStealItem = function() {
        return !!this.slRollStealItem() && !this._slStealStolen;
    };

    Game_Enemy.prototype.slIsStolenFrom = function() {
        return !!this._slStealStolen;
    };

    // -------------------------------------------------------------------------
    // Steal Attempt
    // -------------------------------------------------------------------------

    StealSystem.attemptSteal = function(target, stealChance, forceFailure) {
        stealChance = clamp(Number(stealChance || DEFAULT_STEAL_CHANCE), 0, 100);

        if (!target || !target.isEnemy || !target.isEnemy()) {
            addBattleLogText(NO_TARGET_MESSAGE);
            return false;
        }

        const entry = target.slRollStealItem();

        if (target.slIsStolenFrom()) {
            addBattleLogText(ALREADY_STOLEN_MESSAGE);
            return false;
        }

        if (!entry) {
            addBattleLogText(NOTHING_MESSAGE);
            return false;
        }

        if (forceFailure) {
            addBattleLogText(FAILURE_MESSAGE);
            return false;
        }

        const stealRoll = Math.random() * 100;

        if (stealRoll >= stealChance) {
            addBattleLogText(FAILURE_MESSAGE);
            return false;
        }

        const obj = objectFromStealEntry(entry);

        if (!obj) {
            addBattleLogText(NOTHING_MESSAGE);
            return false;
        }

        $gameParty.gainItem(obj, 1);
        target._slStealStolen = true;

        addBattleLogText(formatMessage(SUCCESS_MESSAGE, obj.name));
        return true;
    };

    // -------------------------------------------------------------------------
    // Remember Last Target + Skill Notetag Method
    // -------------------------------------------------------------------------

    const _Game_Action_apply = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function(target) {
        _Game_Action_apply.call(this, target);

        if ($gameParty.inBattle() && target && target.isEnemy && target.isEnemy()) {
            BattleManager._slStealLastTarget = target;
        }

        const item = this.item();

        if (!StealSystem.isStealSkill(item)) {
            return;
        }

        if (!target || !target.isEnemy || !target.isEnemy()) {
            return;
        }

        const result = target.result();
        const stealChance = StealSystem.stealChanceForSkill(item);

        if (result && !result.isHit()) {
            StealSystem.attemptSteal(target, stealChance, true);
        } else {
            StealSystem.attemptSteal(target, stealChance, false);
        }
    };

    // -------------------------------------------------------------------------
    // Plugin Command Method
    // -------------------------------------------------------------------------

    PluginManager.registerCommand(PLUGIN_NAME, "StealLastTarget", args => {
        const chance = Number(args.chance || DEFAULT_STEAL_CHANCE);
        const target = BattleManager._slStealLastTarget;

        StealSystem.attemptSteal(target, chance, false);
    });

})();