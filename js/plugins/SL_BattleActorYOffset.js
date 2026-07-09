/*:
 * @target MZ
 * @plugindesc Lowers side-view actor battlers by a fixed Y offset.
 * @author Stephen
 *
 * @param Y Offset
 * @type number
 * @min -999
 * @max 999
 * @default 40
 * @desc Positive numbers move actors down. Negative numbers move actors up.
 */

(() => {
  const pluginName = "SL_BattleActorYOffset";
  const params = PluginManager.parameters(pluginName);
  const yOffset = Number(params["Y Offset"] || 40);

  const _Sprite_Actor_setActorHome = Sprite_Actor.prototype.setActorHome;

  Sprite_Actor.prototype.setActorHome = function(index) {
    _Sprite_Actor_setActorHome.call(this, index);
    this.setHome(this._homeX, this._homeY + yOffset);
  };
})();