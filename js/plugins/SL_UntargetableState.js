/*:
 * @target MZ
 * @plugindesc Adds a state notetag that makes battlers untargetable in battle.
 * @author Stephen/ChatGPT
 *
 * @help
 * Put this notetag in a State:
 *
 * <SL Untargetable>
 *
 * Battlers with that state will be hidden from the enemy selection window
 * and filtered out of action targets.
 */

(() => {
  const TAG = /<SL\s+Untargetable>/i;

  Game_BattlerBase.prototype.slIsUntargetable = function() {
    return this.isAlive() && this.states().some(state => {
      return state && TAG.test(state.note || "");
    });
  };

  const _Game_Action_makeTargets = Game_Action.prototype.makeTargets;
  Game_Action.prototype.makeTargets = function() {
    let targets = _Game_Action_makeTargets.call(this);

    if (this.isForOpponent()) {
      targets = targets.filter(target => {
        return target && !target.slIsUntargetable();
      });
    }

    return targets;
  };

  const _Game_Action_testApply = Game_Action.prototype.testApply;
  Game_Action.prototype.testApply = function(target) {
    if (target && target.slIsUntargetable && target.slIsUntargetable() && this.isForOpponent()) {
      return false;
    }

    return _Game_Action_testApply.call(this, target);
  };

  const _Game_Unit_randomTarget = Game_Unit.prototype.randomTarget;
  Game_Unit.prototype.randomTarget = function() {
    const candidates = this.aliveMembers().filter(member => {
      return !member.slIsUntargetable || !member.slIsUntargetable();
    });

    if (candidates.length > 0) {
      let tgrSum = candidates.reduce((sum, member) => sum + member.tgr, 0);
      let tgrRand = Math.random() * tgrSum;

      for (const member of candidates) {
        tgrRand -= member.tgr;
        if (tgrRand <= 0) {
          return member;
        }
      }

      return candidates[0];
    }

    return _Game_Unit_randomTarget.call(this);
  };

  const _Game_Unit_smoothTarget = Game_Unit.prototype.smoothTarget;
  Game_Unit.prototype.smoothTarget = function(index) {
    const member = this.members()[index];

    if (member && member.isAlive() && (!member.slIsUntargetable || !member.slIsUntargetable())) {
      return member;
    }

    const candidates = this.aliveMembers().filter(m => {
      return !m.slIsUntargetable || !m.slIsUntargetable();
    });

    return candidates[0] || _Game_Unit_smoothTarget.call(this, index);
  };

  if (typeof Window_BattleEnemy !== "undefined") {
    const _Window_BattleEnemy_refresh = Window_BattleEnemy.prototype.refresh;

    Window_BattleEnemy.prototype.refresh = function() {
      _Window_BattleEnemy_refresh.call(this);

      if (this._enemies) {
        this._enemies = this._enemies.filter(enemy => {
          return !enemy.slIsUntargetable || !enemy.slIsUntargetable();
        });
      }

      Window_Selectable.prototype.refresh.call(this);
    };
  }
})();