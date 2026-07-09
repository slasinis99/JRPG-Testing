/*:
 * @target MZ
 * @plugindesc Adds a plugin command to flash the current action subject in battle.
 * @author Stephen
 *
 * @command Flash Subject
 * @text Flash Subject
 * @desc Flashes the current acting battler.
 *
 * @arg Red
 * @type number
 * @default 255
 *
 * @arg Green
 * @type number
 * @default 255
 *
 * @arg Blue
 * @type number
 * @default 255
 *
 * @arg Alpha
 * @type number
 * @default 180
 *
 * @arg Duration
 * @type number
 * @default 12
 */

(() => {
  "use strict";

  const pluginName = "SL_FlashActionSubject";

  PluginManager.registerCommand(pluginName, "Flash Subject", args => {
    const r = Number(args.Red || 255);
    const g = Number(args.Green || 255);
    const b = Number(args.Blue || 255);
    const a = Number(args.Alpha || 180);
    const duration = Number(args.Duration || 12);

    const subject = BattleManager._subject;
    const scene = SceneManager._scene;
    const spriteset = scene && scene._spriteset;

    if (!subject || !spriteset) return;

    const sprites = []
      .concat(spriteset._enemySprites || [])
      .concat(spriteset._actorSprites || []);

    const sprite = sprites.find(s => s && s._battler === subject);
    if (!sprite) return;

    sprite.setBlendColor([r, g, b, a]);

    let frames = duration;
    const oldUpdate = sprite.update.bind(sprite);

    sprite.update = function() {
      oldUpdate();

      if (frames > 0) {
        frames--;
        if (frames <= 0) {
          this.setBlendColor([0, 0, 0, 0]);
          this.update = oldUpdate;
        }
      }
    };
  });
})();