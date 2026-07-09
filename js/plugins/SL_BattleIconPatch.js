/*:
 * @target MZ
 * @plugindesc Fixes clipped actor state icons and shifts actor names right in battle status.
 * @author Stephen
 *
 * @help
 * Place this plugin below battle/status UI plugins.
 */

(() => {
  "use strict";

  const ICON_SIZE = ImageManager.iconWidth || 32;
  const LEFT_PADDING = 4;
  const NAME_SHIFT = 24;

  const _Window_BattleStatus_stateIconX =
    Window_BattleStatus.prototype.stateIconX;

  Window_BattleStatus.prototype.stateIconX = function(rect) {
    const x = _Window_BattleStatus_stateIconX.call(this, rect);
    const minX = rect.x + ICON_SIZE / 2 + LEFT_PADDING;
    return Math.max(x, minX);
  };

  const _Window_BattleStatus_nameX =
    Window_BattleStatus.prototype.nameX;

  Window_BattleStatus.prototype.nameX = function(rect) {
    return _Window_BattleStatus_nameX.call(this, rect) + NAME_SHIFT;
  };
})();