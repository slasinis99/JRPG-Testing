/*:
 * @target MZ
 * @plugindesc Fixes Equip scene overlap by hiding inactive item previews and blocking slot input while item selection is active.
 * @author Stephen/ChatGPT
 *
 * @help
 * Place this plugin BELOW VisuMZ_1_ItemsEquipsCore.js.
 *
 * Purpose:
 * - VisuStella's Equip scene can place the equipment slot window and the
 *   equipment item-selection window in the same screen space.
 * - Hovering over a slot may display a noninteractive preview list of items,
 *   including Remove.
 * - This patch fully hides that preview window until a slot is clicked.
 * - Once the item-selection window is active, it blocks mouse/touch input from
 *   reaching the slot window underneath.
 *
 * IMPORTANT:
 * Disable/delete older custom patches:
 * - Stephen_EquipRemoveBottomFix.js
 * - Stephen_HideEquipItemWindow.js
 */

(() => {
  "use strict";

  //--------------------------------------------------------------------------
  // Helpers
  //--------------------------------------------------------------------------

  function itemWindowIsTrulyActive(scene) {
    if (!scene || !scene._itemWindow) return false;

    const itemWindow = scene._itemWindow;

    // The item/remove list should only be visible after the player has clicked
    // a slot and the item window is actually accepting input.
    return itemWindow.active && itemWindow.isOpen();
  }

  function applyItemWindowVisibility(scene) {
    if (!scene || !scene._itemWindow) return;

    const win = scene._itemWindow;
    const shouldShow = itemWindowIsTrulyActive(scene);

    if (shouldShow) {
      // Real item selection mode.
      win.show();
      win.opacity = 255;
      win.backOpacity = 192;
      win.contentsOpacity = 255;
    } else {
      // Hover-preview mode.
      // Fully hide the window so VisuStella does not draw the dark rectangle.
      win.opacity = 0;
      win.backOpacity = 0;
      win.contentsOpacity = 0;
      win.hide();
    }
  }

  function slotWindowShouldIgnoreTouch(slotWindow) {
    const scene = slotWindow && slotWindow._stephenEquipScene;
    return itemWindowIsTrulyActive(scene);
  }

  //--------------------------------------------------------------------------
  // Scene_Equip hooks
  //--------------------------------------------------------------------------

  const _Scene_Equip_createSlotWindow = Scene_Equip.prototype.createSlotWindow;
  Scene_Equip.prototype.createSlotWindow = function() {
    _Scene_Equip_createSlotWindow.call(this);

    if (this._slotWindow) {
      this._slotWindow._stephenEquipScene = this;
    }
  };

  const _Scene_Equip_createItemWindow = Scene_Equip.prototype.createItemWindow;
  Scene_Equip.prototype.createItemWindow = function() {
    _Scene_Equip_createItemWindow.call(this);

    if (this._itemWindow) {
      this._itemWindow._stephenEquipScene = this;
    }

    // Keep the item window visually above the slot window when it is active.
    if (this._windowLayer && this._itemWindow) {
      this._windowLayer.removeChild(this._itemWindow);
      this._windowLayer.addChild(this._itemWindow);
    }

    applyItemWindowVisibility(this);
  };

  const _Scene_Equip_update = Scene_Equip.prototype.update;
  Scene_Equip.prototype.update = function() {
    _Scene_Equip_update.call(this);
    applyItemWindowVisibility(this);
  };

  const _Scene_Equip_onSlotOk = Scene_Equip.prototype.onSlotOk;
  Scene_Equip.prototype.onSlotOk = function() {
    _Scene_Equip_onSlotOk.call(this);
    applyItemWindowVisibility(this);
  };

  const _Scene_Equip_onItemOk = Scene_Equip.prototype.onItemOk;
  Scene_Equip.prototype.onItemOk = function() {
    _Scene_Equip_onItemOk.call(this);
    applyItemWindowVisibility(this);
  };

  const _Scene_Equip_onItemCancel = Scene_Equip.prototype.onItemCancel;
  Scene_Equip.prototype.onItemCancel = function() {
    _Scene_Equip_onItemCancel.call(this);
    applyItemWindowVisibility(this);
  };

  const _Scene_Equip_onSlotCancel = Scene_Equip.prototype.onSlotCancel;
  Scene_Equip.prototype.onSlotCancel = function() {
    _Scene_Equip_onSlotCancel.call(this);
    applyItemWindowVisibility(this);
  };

  //--------------------------------------------------------------------------
  // Window_EquipSlot touch/mouse blocking
  //--------------------------------------------------------------------------

  const _Window_EquipSlot_processTouch = Window_EquipSlot.prototype.processTouch;
  Window_EquipSlot.prototype.processTouch = function() {
    if (slotWindowShouldIgnoreTouch(this)) {
      return;
    }

    _Window_EquipSlot_processTouch.call(this);
  };

  // VisuStella may use this for modern mouse/touch controls.
  if (Window_EquipSlot.prototype.processTouchModernControls) {
    const _Window_EquipSlot_processTouchModernControls =
      Window_EquipSlot.prototype.processTouchModernControls;

    Window_EquipSlot.prototype.processTouchModernControls = function() {
      if (slotWindowShouldIgnoreTouch(this)) {
        return;
      }

      _Window_EquipSlot_processTouchModernControls.call(this);
    };
  }

  const _Window_EquipSlot_hitTest = Window_EquipSlot.prototype.hitTest;
  Window_EquipSlot.prototype.hitTest = function(x, y) {
    if (slotWindowShouldIgnoreTouch(this)) {
      return -1;
    }

    return _Window_EquipSlot_hitTest.call(this, x, y);
  };

})();