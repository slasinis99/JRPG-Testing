/*:
 * @target MZ
 * @plugindesc v1.0 Fully recovers the party after battle while a chosen escort switch is ON.
 * @author JRPG Project
 *
 * @param Escort Switch ID
 * @text Escort Switch ID
 * @type switch
 * @default 1
 *
 * @param Recovery Message
 * @text Recovery Message
 * @type string
 * @default Maren restores the party's wounds.
 *
 * @param Show Message
 * @text Show Message
 * @type boolean
 * @on Show
 * @off Hide
 * @default true
 *
 * @help
 * ============================================================================
 * SL_EscortBattleRecovery
 * ============================================================================
 *
 * While the chosen switch is ON, the party is fully recovered after each battle
 * victory.
 *
 * Intended use:
 *
 *   Maren Escort Active = ON
 *      Party recovers after every won battle.
 *
 *   Maren Escort Active = OFF
 *      Normal battle behavior.
 *
 * This only triggers after victory, not after escape or defeat.
 * ============================================================================
 */

(() => {
  "use strict";

  const pluginName = "SL_EscortBattleRecovery";
  const params = PluginManager.parameters(pluginName);

  const ESCORT_SWITCH_ID = Number(params["Escort Switch ID"] || 1);
  const RECOVERY_MESSAGE = String(params["Recovery Message"] || "Maren restores the party's wounds.");
  const SHOW_MESSAGE = String(params["Show Message"] || "true") === "true";

  const _BattleManager_processVictory = BattleManager.processVictory;

  BattleManager.processVictory = function() {
    if ($gameSwitches.value(ESCORT_SWITCH_ID)) {
      for (const actor of $gameParty.members()) {
        actor.recoverAll();
      }

      if (SHOW_MESSAGE && RECOVERY_MESSAGE) {
        $gameMessage.add(RECOVERY_MESSAGE);
      }
    }

    _BattleManager_processVictory.call(this);
  };
})();