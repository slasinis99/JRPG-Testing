/*:
 * @target MZ
 * @plugindesc Customizes the Skill Scene status bar layout and fixes menu cursor layering.
 * @author You
 *
 * @help
 * Place below:
 *   VisuStella Core Engine
 *   VisuStella Main Menu Core
 *   VisuStella Menu Cursor
 *
 * This plugin customizes Window_SkillStatus and raises the Skill Type window
 * above the Skill Status window so the animated menu cursor is not hidden
 * behind the status window.
 */

(() => {
  "use strict";

  // ---------------------------------------------------------------------------
  // Skill Status Window Layout
  // ---------------------------------------------------------------------------

  Window_SkillStatus.prototype.refresh = function() {
    Window_StatusBase.prototype.refresh.call(this);

    const actor = this._actor;
    if (!actor) return;

    const rect = this.innerRect;
    const lineHeight = this.lineHeight();
    const gaugeLineHeight = this.gaugeLineHeight();

    // -------------------------------------------------------------------------
    // Face
    // -------------------------------------------------------------------------

    const faceSize = 144;
    const faceX = rect.x + 8;
    const faceY = rect.y + Math.floor((rect.height - faceSize) / 2);

    const bitmap = ImageManager.loadFace(actor.faceName());
    const faceIndex = actor.faceIndex();
    const pw = ImageManager.faceWidth;
    const ph = ImageManager.faceHeight;
    const sxFace = (faceIndex % 4) * pw;
    const syFace = Math.floor(faceIndex / 4) * ph;

    bitmap.addLoadListener(() => {
      this.contents.blt(
        bitmap,
        sxFace,
        syFace,
        pw,
        ph,
        faceX,
        faceY,
        faceSize,
        faceSize
      );
    });

    // -------------------------------------------------------------------------
    // Name / Class / Level
    // -------------------------------------------------------------------------

    const textX = rect.x + 170;
    const textWidth = 160;

    let textY = rect.y + Math.floor((rect.height - lineHeight * 3) / 2);

    // Actor Name
    this.resetFontSettings();
    this.contents.fontSize = 24;
    this.drawActorName(actor, textX, textY, textWidth);

    // Class Name + Class Icon
    this.resetFontSettings();
    this.contents.fontSize = 18;
    this.changeTextColor(ColorManager.systemColor());

    const classObj = actor.currentClass();
    const rawClassName = String(classObj.name || "");

    const iconMatch = rawClassName.match(/\\I\[(\d+)\]/i);
    const classIcon = iconMatch ? Number(iconMatch[1]) : 0;

    const className = rawClassName
      .replace(/\\I\[\d+\]/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    const classY = textY + lineHeight;
    let classTextX = textX;
    let classTextWidth = textWidth;

    if (classIcon > 0) {
      const iconY = classY + Math.floor((lineHeight - ImageManager.iconHeight) / 2);
      this.drawIcon(classIcon, textX, iconY);
      classTextX += ImageManager.iconWidth + 4;
      classTextWidth -= ImageManager.iconWidth + 4;
    }

    this.drawText(className, classTextX, classY, classTextWidth, "left");

    // Level
    this.resetFontSettings();
    this.contents.fontSize = 22;
    this.drawActorLevel(actor, textX, textY + lineHeight * 2);

    // -------------------------------------------------------------------------
    // Gauges
    // -------------------------------------------------------------------------

    const gaugeX = textX + 140;
    const gaugeY = rect.y + Math.floor(
      (rect.height - gaugeLineHeight * ($dataSystem.optDisplayTp ? 3 : 2)) / 2
    );

    this.placeGauge(actor, "hp", gaugeX, gaugeY);
    this.placeGauge(actor, "mp", gaugeX, gaugeY + gaugeLineHeight);

    if ($dataSystem.optDisplayTp) {
      this.placeGauge(actor, "tp", gaugeX, gaugeY + gaugeLineHeight * 2);
    }

    // -------------------------------------------------------------------------
    // Extra Parameters
    // -------------------------------------------------------------------------

    if (Imported.VisuMZ_0_CoreEngine) {
      const params = VisuMZ.CoreEngine.Settings.Param.DisplayedParams;
      const paramsX = gaugeX + 210;
      const statAreaWidth = rect.width - paramsX - 8;

      if (statAreaWidth >= 300) {
        const paramWidth = Math.floor(statAreaWidth / 2) - 24;
        const paramRows = Math.ceil(params.length / 2);

        let px = paramsX;
        let py = rect.y + Math.floor(
          (rect.height - paramRows * gaugeLineHeight) / 2
        );

        let counter = 0;

        for (const param of params) {
          this.resetFontSettings();
          this.drawParamText(px, py, paramWidth, param, true);
          this.resetTextColor();
          this.contents.fontSize -= 8;

          const value = actor.paramValueByName(param, true);
          this.contents.drawText(value, px, py, paramWidth, gaugeLineHeight, "right");

          counter++;

          if (counter % 2 === 0) {
            px = paramsX;
            py += gaugeLineHeight;
          } else {
            px += paramWidth + 24;
          }
        }
      }
    }
  };

  // ---------------------------------------------------------------------------
  // Menu Cursor Layering Fix
  // ---------------------------------------------------------------------------
  // VisuStella Menu Cursor draws the animated cursor as a child of each selectable
  // window. In Scene_Skill, the Skill Type window is normally created before the
  // Skill Status window, so its animated cursor can appear behind the status
  // window when it bobs sideways.
  //
  // Raising the Skill Type window after Scene_Skill is created keeps the cursor
  // visible without changing the cursor plugin itself.

  function raiseWindowToTop(window) {
    if (!window || !window.parent) return;

    const parent = window.parent;

    if (parent.children && parent.children.includes(window)) {
      parent.removeChild(window);
      parent.addChild(window);
    }
  }

  const _Scene_Skill_create = Scene_Skill.prototype.create;

  Scene_Skill.prototype.create = function() {
    _Scene_Skill_create.call(this);

    // This is the main fix for the cursor being hidden behind Window_SkillStatus.
    raiseWindowToTop(this._skillTypeWindow);
  };
})();