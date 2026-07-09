/*:
 * @target MZ
 * @plugindesc Shifts the visible contents of the battle status window.
 * @author You
 *
 * @param Offset X
 * @type number
 * @min -100
 * @max 100
 * @default -18
 *
 * @param Offset Y
 * @type number
 * @min -100
 * @max 100
 * @default 0
 */

(() => {
  const pluginName = document.currentScript.src.match(/([^/]+)\.js$/)[1];
  const params = PluginManager.parameters(pluginName);

  const offsetX = Number(params["Offset X"] || -18);
  const offsetY = Number(params["Offset Y"] || 0);

  const _Window_BattleStatus_update = Window_BattleStatus.prototype.update;
  Window_BattleStatus.prototype.update = function() {
    _Window_BattleStatus_update.call(this);

    if (this._contentsSprite) {
      this._contentsSprite.x = this.padding + offsetX;
      this._contentsSprite.y = this.padding + offsetY;
    }
  };
})();