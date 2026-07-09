/*:
 * @target MZ
 * @plugindesc Compact class list layout for VisuStella Class Change System, showing custom Job Lv progress.
 * @author You
 *
 * @help
 * Place below:
 *   VisuMZ_2_ClassChangeSystem
 *   SL_JobLevelSystem
 *
 * This menu displays:
 *
 *   Job Lv x        Next: y / z
 *
 * where y is the Job Points earned inside the current Job Level,
 * and z is the Job Points needed to reach the next Job Level.
 */

(() => {
  "use strict";

  // ---------------------------------------------------------------------------
  // Settings
  // ---------------------------------------------------------------------------

  const CLASS_LIST_ITEM_HEIGHT = 72;
  const CLASS_NAME_FONT_SIZE = 26;
  const CLASS_LEVEL_FONT_SIZE = 22;
  const EQUIPPED_LABEL_FONT_SIZE = 22;

  // Optional fallback icons if a class does not have <Icon: x>.
  // These IDs must match your Database > Classes IDs.
  const CLASS_ICON_FALLBACKS = {
    1: 96,    // Knight
    2: 97,    // Warrior
    3: 106,   // Monk
    4: 107,   // Lancer
    5: 102,   // Ranger
    6: 115,   // Thief
    7: 101,   // White Mage
    8: 109,   // Black Mage
    9: 120,   // Red Mage
    10: 108,  // Time Mage
    11: 121,  // Apothecary
    12: 112,  // Geomancer
    13: 116,  // Artificer
    14: 98,   // Bard
    15: 113,  // Ronin
    16: 0,    // Not a Class

    17: 96,   // Knight
    18: 97,   // Warrior
    19: 106,  // Monk
    20: 107,  // Lancer
    21: 102,  // Ranger
    22: 115,  // Thief
    23: 101,  // White Mage
    24: 109,  // Black Mage
    25: 120,  // Red Mage
    26: 108,  // Time Mage
    27: 121,  // Apothecary
    28: 112,  // Geomancer
    29: 116,  // Artificer
    30: 98,   // Bard
    31: 113,  // Ronin
    32: 0,    // Not a Class
    33: 96    // Wanderer
  };

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  function cleanName(name) {
    return String(name || "")
      .replace(/\x1bI\[(\d+)\]/gi, "")
      .replace(/\\I\[(\d+)\]/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function classIcon(classObj) {
    if (!classObj) return 0;

    if (classObj.meta && classObj.meta.Icon) {
      return Number(classObj.meta.Icon) || 0;
    }

    if (classObj.iconIndex) {
      return Number(classObj.iconIndex) || 0;
    }

    return CLASS_ICON_FALLBACKS[classObj.id] || 0;
  }

  function jobLevelProgress(actor, classId) {
    if (!actor || !classId) {
      return {
        level: 1,
        current: 0,
        needed: 1,
        mastered: false
      };
    }

    // Preferred: our separate SL_JobLevelSystem.js.
    if (actor.slJobLevel) {
      const level = actor.slJobLevel(classId);

      const current = actor.slJobPointsIntoLevel
        ? actor.slJobPointsIntoLevel(classId)
        : 0;

      const remaining = actor.slJobPointsToNextLevel
        ? actor.slJobPointsToNextLevel(classId)
        : 0;

      const mastered = level >= 99 || remaining <= 0;
      const needed = mastered ? 0 : current + remaining;

      return {
        level,
        current,
        needed,
        mastered
      };
    }

    // Fallback: VisuStella class level, if SL_JobLevelSystem is not installed.
    if (actor.classLevel) {
      return {
        level: actor.classLevel(classId),
        current: 0,
        needed: 1,
        mastered: false
      };
    }

    if (actor.classLevelById) {
      return {
        level: actor.classLevelById(classId),
        current: 0,
        needed: 1,
        mastered: false
      };
    }

    return {
      level: 1,
      current: 0,
      needed: 1,
      mastered: false
    };
  }

  function equippedTierName(actor, classId) {
    if (!actor || !classId || !actor.findMulticlassTier) return "";

    const tier = actor.findMulticlassTier(classId);

    if (tier === 1) return "Primary";
    if (tier > 1) return "Subclass";

    return "";
  }

  // ---------------------------------------------------------------------------
  // Make class list entries smaller
  // ---------------------------------------------------------------------------

  Window_ClassList.prototype.itemHeight = function() {
    return CLASS_LIST_ITEM_HEIGHT;
  };

  // ---------------------------------------------------------------------------
  // Draw compact class list entries
  // ---------------------------------------------------------------------------

  Window_ClassList.prototype.drawItem = function(index) {
    const command = this._list[index];
    if (!command) return;

    const rect = this.itemRectWithPadding(index);
    const classObj = command.ext;

    this.resetFontSettings();
    this.changePaintOpacity(command.enabled);

    // Draw normal item background / selection background.
    if (this.drawItemBackground) {
      this.drawItemBackground(index);
    }

    // Handle "Unassign Class" row.
    if (!classObj) {
      this.contents.fontSize = CLASS_NAME_FONT_SIZE;
      this.drawText(command.name, rect.x, rect.y + 12, rect.width, "center");
      this.changePaintOpacity(true);
      this.resetFontSettings();
      return;
    }

    const iconIndex = classIcon(classObj);
    const iconX = rect.x + 16;
    const iconY = rect.y + Math.floor((rect.height - ImageManager.iconHeight) / 2);

    if (iconIndex > 0) {
      this.drawIcon(iconIndex, iconX, iconY);
    }

    const textX = iconX + ImageManager.iconWidth + 18;
    const textWidth = rect.width - textX + rect.x - 12;

    // Optional Primary/Subclass label.
    const tierName = equippedTierName(this._actor, classObj.id);

    if (tierName) {
      this.contents.fontSize = EQUIPPED_LABEL_FONT_SIZE;
      this.changeTextColor(ColorManager.systemColor());
      this.drawText(tierName, rect.x, rect.y, rect.width - 12, "right");
      this.resetTextColor();
    }

    // Class name.
    this.contents.fontSize = CLASS_NAME_FONT_SIZE;
    const name = cleanName(classObj.name);
    this.drawText(name, textX, rect.y + 4, textWidth, "left");

    // Job level + progress to next Job Level.
    const progress = jobLevelProgress(this._actor, classObj.id);

    const levelText = `Job Lv ${progress.level}`;
    const nextText = progress.mastered
      ? "Next: MAX"
      : `Next: ${progress.current} / ${progress.needed}`;

    this.contents.fontSize = CLASS_LEVEL_FONT_SIZE;

    this.changeTextColor(ColorManager.systemColor());
    this.drawText(levelText, textX, rect.y + 34, 140, "left");

    this.resetTextColor();
    this.drawText(nextText, textX + 144, rect.y + 34, textWidth - 144, "right");

    this.changePaintOpacity(true);
    this.resetFontSettings();
  };
})();