/*:
 * @target MZ
 * @plugindesc Adds simple weapon notetag effects for outgoing healing and magical state application.
 * @author JRPG Project
 *
 * @help
 * ============================================================================
 * SL_WeaponSpecialEffects
 * ============================================================================
 *
 * Weapon / armor notetags:
 *
 *   <SL Healing Done: 1.10>
 *      Multiplies outgoing HP/MP recovery skills by 1.10.
 *
 *   <SL Magic Add State: 17, 10%>
 *      Magical HP damage skills have a 10% chance to apply state ID 17.
 *
 *   <SL Magic Add State: Exposed, 10%>
 *      You may use a state name instead of an ID, but IDs are safer.
 *
 * Put this plugin below your battle/stat/damage plugins.
 */

(() => {
  "use strict";

  function noteObjects(battler) {
    if (!battler || !battler.equips) return [];
    return battler.equips().filter(Boolean);
  }

  function stateIdFromToken(token) {
    const text = String(token || "").trim();
    if (/^\d+$/.test(text)) return Number(text);

    const normalized = text.toLowerCase().replace(/\s+/g, "");
    const state = $dataStates.find(s =>
      s && s.name && s.name.toLowerCase().replace(/\s+/g, "") === normalized
    );

    return state ? state.id : 0;
  }

  Game_BattlerBase.prototype.slOutgoingHealingRate = function() {
    let rate = 1.0;

    for (const obj of noteObjects(this)) {
      const note = obj.note || "";
      const match = note.match(/<\s*SL Healing Done\s*:\s*([0-9.]+)\s*>/i);
      if (match) {
        const value = Number(match[1]);
        if (Number.isFinite(value) && value > 0) {
          rate *= value;
        }
      }
    }

    return rate;
  };

  const _Game_Action_makeDamageValue = Game_Action.prototype.makeDamageValue;
  Game_Action.prototype.makeDamageValue = function(target, critical) {
    let value = _Game_Action_makeDamageValue.call(this, target, critical);

    const subject = this.subject();
    const item = this.item();
    const damageType = item && item.damage ? Number(item.damage.type || 0) : 0;

    // Damage type 3 = HP Recover, 4 = MP Recover.
    if (
      value < 0 &&
      subject &&
      subject.isActor &&
      subject.isActor() &&
      this.isSkill() &&
      (damageType === 3 || damageType === 4)
    ) {
      value = Math.round(value * subject.slOutgoingHealingRate());
    }

    return value;
  };

  const _Game_Action_executeDamage = Game_Action.prototype.executeDamage;
  Game_Action.prototype.executeDamage = function(target, value) {
    _Game_Action_executeDamage.call(this, target, value);
    this.slApplyEquipMagicAddStates(target, value);
  };

  Game_Action.prototype.slApplyEquipMagicAddStates = function(target, value) {
    const subject = this.subject();

    if (!subject || !target) return;
    if (!subject.isActor || !subject.isActor()) return;
    if (!target.isAlive || !target.isAlive()) return;
    if (!this.isSkill()) return;
    if (!this.isMagical()) return;
    if (value <= 0) return;

    for (const obj of noteObjects(subject)) {
      const note = obj.note || "";
      const regex = /<\s*SL Magic Add State\s*:\s*([^,>]+)\s*,\s*([0-9.]+)\s*%?\s*>/gi;
      let match;

      while ((match = regex.exec(note)) !== null) {
        const stateId = stateIdFromToken(match[1]);
        const chance = Number(match[2]);

        if (stateId > 0 && Number.isFinite(chance) && Math.random() * 100 < chance) {
          target.addState(stateId);
        }
      }
    }
  };

})();