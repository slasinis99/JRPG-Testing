/*:
 * @target MZ
 * @plugindesc v1.0 Lets items, weapons, and armors use material-based shop costs instead of gold.
 * @author JRPG Project
 *
 * @param Cost Label
 * @text Cost Label
 * @type string
 * @default Trade
 * @desc Text shown in the shop buy list when an item uses material costs.
 *
 * @param Debug Logging
 * @text Debug Logging
 * @type boolean
 * @on Yes
 * @off No
 * @default false
 *
 * @help
 * ============================================================================
 * SL_MaterialShopCosts
 * ============================================================================
 *
 * This plugin lets an item, weapon, or armor require materials instead of gold
 * when purchased from a normal RPG Maker MZ shop.
 *
 * Add the item to the shop as usual through Shop Processing.
 * The database price can be anything. If the item has an SL Shop Cost notetag,
 * this plugin will use the material cost instead of gold.
 *
 * ----------------------------------------------------------------------------
 * Basic Notetag
 * ----------------------------------------------------------------------------
 *
 * Put this on the item, weapon, or armor being purchased:
 *
 *   <SL Shop Cost>
 *   Sharp Beak: 3
 *   Razorwing Feather: 1
 *   </SL Shop Cost>
 *
 * This means the item costs:
 *   3 Sharp Beaks
 *   1 Razorwing Feather
 *
 * ----------------------------------------------------------------------------
 * Supported Requirement Types
 * ----------------------------------------------------------------------------
 *
 * By default, the plugin looks for the required material in this order:
 *
 *   Items -> Weapons -> Armors
 *
 * You can force a type like this:
 *
 *   <SL Shop Cost>
 *   Item: Sharp Beak: 3
 *   Weapon: Iron Longsword: 1
 *   Armor: Traveler's Bandana: 1
 *   </SL Shop Cost>
 *
 * You can also use IDs:
 *
 *   <SL Shop Cost>
 *   Item 12: 3
 *   Weapon 4: 1
 *   Armor 8: 1
 *   </SL Shop Cost>
 *
 * Optional gold can also be included:
 *
 *   <SL Shop Cost>
 *   Gold: 100
 *   Sharp Beak: 3
 *   </SL Shop Cost>
 *
 * If there is no Gold line, no gold is charged.
 *
 * ----------------------------------------------------------------------------
 * Notes
 * ----------------------------------------------------------------------------
 *
 * - Material costs are multiplied by purchase quantity.
 * - Materials are consumed from inventory.
 * - Equipped weapons/armors are NOT consumed.
 * - If the player lacks materials, the shop item is disabled.
 * - If an item has no <SL Shop Cost> tag, it uses normal gold pricing.
 *
 * ============================================================================
 */

(() => {
  "use strict";

  const pluginName = "SL_MaterialShopCosts";
  const params = PluginManager.parameters(pluginName);

  const COST_LABEL = String(params["Cost Label"] || "Trade");
  const DEBUG = String(params["Debug Logging"] || "false") === "true";

  window.SL_MaterialShopCosts = window.SL_MaterialShopCosts || {};
  const SLMSC = window.SL_MaterialShopCosts;

  function normalizeName(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "");
  }

  function dataTableForType(type) {
    const t = normalizeName(type);

    if (t === "item" || t === "items" || t === "i") return $dataItems;
    if (t === "weapon" || t === "weapons" || t === "w") return $dataWeapons;
    if (t === "armor" || t === "armors" || t === "armour" || t === "armours" || t === "a") return $dataArmors;

    return null;
  }

  function lookupById(table, id) {
    if (!table) return null;
    return table[Number(id)] || null;
  }

  function lookupByName(table, name) {
    if (!table) return null;

    const target = normalizeName(name);
    return table.find(obj => obj && normalizeName(obj.name) === target) || null;
  }

  function lookupMaterial(token, forcedType) {
    const raw = String(token || "").trim();

    if (!raw) return null;

    if (forcedType) {
      const table = dataTableForType(forcedType);
      if (!table) return null;

      const idMatch = raw.match(/^\d+$/);
      if (idMatch) return lookupById(table, Number(raw));

      return lookupByName(table, raw);
    }

    const typedIdMatch = raw.match(/^(item|weapon|armor|armour)\s+(\d+)$/i);
    if (typedIdMatch) {
      const table = dataTableForType(typedIdMatch[1]);
      return lookupById(table, Number(typedIdMatch[2]));
    }

    const item = lookupByName($dataItems, raw);
    if (item) return item;

    const weapon = lookupByName($dataWeapons, raw);
    if (weapon) return weapon;

    const armor = lookupByName($dataArmors, raw);
    if (armor) return armor;

    return null;
  }

  function parseAmount(value) {
    const amount = Number(String(value || "").trim());
    if (!Number.isFinite(amount)) return 0;
    return Math.max(0, Math.floor(amount));
  }

  function parseCostLine(line, ownerObj) {
    const trimmed = String(line || "").trim();

    if (!trimmed || trimmed.startsWith("//")) return null;

    const goldMatch = trimmed.match(/^gold\s*:\s*(\d+)$/i);
    if (goldMatch) {
      return {
        kind: "gold",
        amount: parseAmount(goldMatch[1])
      };
    }

    const forcedTypeMatch = trimmed.match(/^(item|weapon|armor|armour)\s*:\s*(.+?)\s*:\s*(\d+)$/i);
    if (forcedTypeMatch) {
      const obj = lookupMaterial(forcedTypeMatch[2], forcedTypeMatch[1]);
      const amount = parseAmount(forcedTypeMatch[3]);

      if (obj && amount > 0) {
        return {
          kind: "material",
          item: obj,
          amount
        };
      }

      if (DEBUG) {
        console.warn(`${pluginName}: Could not parse forced-type cost line on`, ownerObj, trimmed);
      }

      return null;
    }

    const typedIdMatch = trimmed.match(/^(item|weapon|armor|armour)\s+(\d+)\s*:\s*(\d+)$/i);
    if (typedIdMatch) {
      const obj = lookupMaterial(`${typedIdMatch[1]} ${typedIdMatch[2]}`);
      const amount = parseAmount(typedIdMatch[3]);

      if (obj && amount > 0) {
        return {
          kind: "material",
          item: obj,
          amount
        };
      }

      if (DEBUG) {
        console.warn(`${pluginName}: Could not parse typed-ID cost line on`, ownerObj, trimmed);
      }

      return null;
    }

    const normalMatch = trimmed.match(/^(.+?)\s*:\s*(\d+)$/i);
    if (normalMatch) {
      const obj = lookupMaterial(normalMatch[1]);
      const amount = parseAmount(normalMatch[2]);

      if (obj && amount > 0) {
        return {
          kind: "material",
          item: obj,
          amount
        };
      }

      if (DEBUG) {
        console.warn(`${pluginName}: Could not parse material cost line on`, ownerObj, trimmed);
      }

      return null;
    }

    if (DEBUG) {
      console.warn(`${pluginName}: Unrecognized cost line on`, ownerObj, trimmed);
    }

    return null;
  }

  SLMSC.costFor = function(item) {
    if (!item) return null;

    const note = item.note || "";
    const cacheKey = "_slMaterialShopCostCache";
    const noteKey = "_slMaterialShopCostCacheNote";

    if (item[cacheKey] && item[noteKey] === note) {
      return item[cacheKey];
    }

    const costs = [];
    const blockRegex = /<\s*SL\s+Shop\s+Cost\s*>([\s\S]*?)<\/\s*SL\s+Shop\s+Cost\s*>/gi;
    let blockMatch;

    while ((blockMatch = blockRegex.exec(note)) !== null) {
      const lines = String(blockMatch[1] || "").split(/\r?\n/);

      for (const line of lines) {
        const entry = parseCostLine(line, item);
        if (entry) costs.push(entry);
      }
    }

    item[cacheKey] = costs.length > 0 ? costs : null;
    item[noteKey] = note;

    return item[cacheKey];
  };

  SLMSC.hasMaterialCost = function(item) {
    const costs = SLMSC.costFor(item);
    return !!(costs && costs.length > 0);
  };

  SLMSC.canAfford = function(item, quantity = 1) {
    const costs = SLMSC.costFor(item);

    if (!costs) return true;

    const qty = Math.max(1, Number(quantity || 1));

    for (const cost of costs) {
      const needed = cost.amount * qty;

      if (cost.kind === "gold") {
        if ($gameParty.gold() < needed) return false;
      } else if (cost.kind === "material") {
        if ($gameParty.numItems(cost.item) < needed) return false;
      }
    }

    return true;
  };

  SLMSC.maxAffordable = function(item) {
    const costs = SLMSC.costFor(item);

    if (!costs) return Infinity;

    let max = Infinity;

    for (const cost of costs) {
      if (cost.amount <= 0) continue;

      if (cost.kind === "gold") {
        max = Math.min(max, Math.floor($gameParty.gold() / cost.amount));
      } else if (cost.kind === "material") {
        max = Math.min(max, Math.floor($gameParty.numItems(cost.item) / cost.amount));
      }
    }

    if (max === Infinity) return 0;
    return Math.max(0, max);
  };

  SLMSC.payCost = function(item, quantity = 1) {
    const costs = SLMSC.costFor(item);

    if (!costs) return false;

    const qty = Math.max(1, Number(quantity || 1));

    for (const cost of costs) {
      const amount = cost.amount * qty;

      if (cost.kind === "gold") {
        $gameParty.loseGold(amount);
      } else if (cost.kind === "material") {
        $gameParty.loseItem(cost.item, amount, false);
      }
    }

    return true;
  };

  SLMSC.costText = function(item, quantity = 1) {
    const costs = SLMSC.costFor(item);

    if (!costs) return "";

    const qty = Math.max(1, Number(quantity || 1));

    return costs.map(cost => {
      const amount = cost.amount * qty;

      if (cost.kind === "gold") {
        return `${amount} ${TextManager.currencyUnit}`;
      }

      return `${amount} ${cost.item.name}`;
    }).join(", ");
  };

  SLMSC.costLines = function(item, quantity = 1) {
    const costs = SLMSC.costFor(item);

    if (!costs) return [];

    const qty = Math.max(1, Number(quantity || 1));

    return costs.map(cost => {
      const amount = cost.amount * qty;

      if (cost.kind === "gold") {
        return {
          name: TextManager.currencyUnit,
          needed: amount,
          owned: $gameParty.gold()
        };
      }

      return {
        name: cost.item.name,
        needed: amount,
        owned: $gameParty.numItems(cost.item)
      };
    });
  };

    // --------------------------------------------------------------------------
  // UI Settings
  // --------------------------------------------------------------------------

  const REQUIREMENT_WINDOW_WIDTH = 220;
  const REQUIREMENT_FONT_SIZE = 18;
  const REQUIREMENT_MIN_BUY_WIDTH = 260;

  function slClamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

    function slRequirementWindowWidth(scene) {
    if (!scene || !scene.slHasMaterialShopCosts || !scene.slHasMaterialShopCosts()) {
      return 0;
    }

    const statusRect = Scene_Shop.prototype._slOriginalStatusWindowRect
      ? Scene_Shop.prototype._slOriginalStatusWindowRect.call(scene)
      : scene.statusWindowRect();

    const availableBeforeStatus = statusRect.x;
    const maxWidth = Math.max(0, availableBeforeStatus - REQUIREMENT_MIN_BUY_WIDTH);

    return slClamp(REQUIREMENT_WINDOW_WIDTH, 0, maxWidth);
  }

  function slShopGoodItem(good) {
    if (!good) return null;

    const kind = Number(good[0]);
    const id = Number(good[1]);

    if (kind === 0) return $dataItems[id];
    if (kind === 1) return $dataWeapons[id];
    if (kind === 2) return $dataArmors[id];

    return null;
  }

  Scene_Shop.prototype.slHasMaterialShopCosts = function() {
    if (this._slHasMaterialShopCosts !== undefined) {
      return this._slHasMaterialShopCosts;
    }

    const goods = this._goods || [];

    this._slHasMaterialShopCosts = goods.some(good => {
      const item = slShopGoodItem(good);
      return SLMSC.hasMaterialCost(item);
    });

    return this._slHasMaterialShopCosts;
  };

  // --------------------------------------------------------------------------
  // Window_ShopMaterialRequirements
  // --------------------------------------------------------------------------

  class Window_ShopMaterialRequirements extends Window_Base {
    initialize(rect) {
      super.initialize(rect);
      this._item = null;
      this.refresh();
    }

    lineHeight() {
      return Math.max(22, REQUIREMENT_FONT_SIZE + 6);
    }

    setItem(item) {
      if (this._item !== item) {
        this._item = item;
        this.refresh();
      }
    }

    refresh() {
      this.contents.clear();
      this.resetFontSettings();
      this.contents.fontSize = REQUIREMENT_FONT_SIZE;

      const item = this._item;
      const width = this.innerWidth;
      let y = 0;

      if (!item) {
        this.resetFontSettings();
        return;
      }

      this.changeTextColor(ColorManager.systemColor());
      this.drawText("Required:", 0, y, width, "left");
      y += this.lineHeight();

      this.resetTextColor();

      if (!SLMSC.hasMaterialCost(item)) {
        this.changeTextColor(ColorManager.textColor(8));
        this.drawText("Gold purchase", 0, y, width, "left");
        this.resetFontSettings();
        return;
      }

      const lines = SLMSC.costLines(item, 1);

      if (lines.length <= 0) {
        this.changeTextColor(ColorManager.textColor(8));
        this.drawText("No materials", 0, y, width, "left");
        this.resetFontSettings();
        return;
      }

      for (const line of lines) {
        const enough = line.owned >= line.needed;
        this.changeTextColor(enough ? ColorManager.normalColor() : ColorManager.crisisColor());

        const text = `${line.owned}/${line.needed} ${line.name}`;
        this.drawText(text, 0, y, width, "left");
        y += this.lineHeight();

        if (y + this.lineHeight() > this.innerHeight) break;
      }

      this.resetFontSettings();
    }
  }

  // --------------------------------------------------------------------------
  // Scene_Shop Layout
  // --------------------------------------------------------------------------

  Scene_Shop.prototype._slOriginalBuyWindowRect = Scene_Shop.prototype.buyWindowRect;
  Scene_Shop.prototype._slOriginalStatusWindowRect = Scene_Shop.prototype.statusWindowRect;

  Scene_Shop.prototype.buyWindowRect = function() {
    const rect = this._slOriginalBuyWindowRect();
    const reqWidth = slRequirementWindowWidth(this);
    const statusRect = this.statusWindowRect();

    rect.width = Math.max(REQUIREMENT_MIN_BUY_WIDTH, statusRect.x - rect.x - reqWidth);
    return rect;
  };

  Scene_Shop.prototype.statusWindowRect = function() {
    const rect = this._slOriginalStatusWindowRect();

    // Keep the status panel anchored to the right side.
    rect.x = Graphics.boxWidth - rect.width;

    return rect;
  };

  Scene_Shop.prototype.materialRequirementWindowRect = function() {
    const buyRect = this.buyWindowRect();
    const statusRect = this.statusWindowRect();

    const x = buyRect.x + buyRect.width;
    const y = buyRect.y;
    const width = Math.max(0, statusRect.x - x);
    const height = buyRect.height;

    return new Rectangle(x, y, width, height);
  };

  Scene_Shop.prototype.createMaterialRequirementWindow = function() {
    const rect = this.materialRequirementWindowRect();
    this._materialRequirementWindow = new Window_ShopMaterialRequirements(rect);
    this.addWindow(this._materialRequirementWindow);
  };

  const _Scene_Shop_createBuyWindow = Scene_Shop.prototype.createBuyWindow;
  Scene_Shop.prototype.createBuyWindow = function() {
    _Scene_Shop_createBuyWindow.call(this);
    this.createMaterialRequirementWindow();

    if (this._buyWindow && this._buyWindow.setMaterialRequirementWindow) {
      this._buyWindow.setMaterialRequirementWindow(this._materialRequirementWindow);
    }
  };

  // --------------------------------------------------------------------------
  // Window_ShopBuy
  // --------------------------------------------------------------------------

  Window_ShopBuy.prototype.setMaterialRequirementWindow = function(window) {
    this._materialRequirementWindow = window;
    this.updateHelp();
  };

  const _Window_ShopBuy_updateHelp = Window_ShopBuy.prototype.updateHelp;
  Window_ShopBuy.prototype.updateHelp = function() {
    _Window_ShopBuy_updateHelp.call(this);

    if (this._materialRequirementWindow) {
      this._materialRequirementWindow.setItem(this.item());
    }
  };

  const _Window_ShopBuy_isEnabled = Window_ShopBuy.prototype.isEnabled;
  Window_ShopBuy.prototype.isEnabled = function(item) {
    if (SLMSC.hasMaterialCost(item)) {
      return item && $gameParty.numItems(item) < $gameParty.maxItems(item) && SLMSC.canAfford(item, 1);
    }

    return _Window_ShopBuy_isEnabled.call(this, item);
  };

  const _Window_ShopBuy_drawItem = Window_ShopBuy.prototype.drawItem;
  Window_ShopBuy.prototype.drawItem = function(index) {
    const item = this.itemAt(index);

    if (!SLMSC.hasMaterialCost(item)) {
      _Window_ShopBuy_drawItem.call(this, index);
      return;
    }

    const rect = this.itemLineRect(index);
    const priceWidth = this.priceWidth ? this.priceWidth() : 96;
    const priceX = rect.x + rect.width - priceWidth;

    this.changePaintOpacity(this.isEnabled(item));
    this.drawItemName(item, rect.x, rect.y, rect.width - priceWidth);
    this.drawText(COST_LABEL, priceX, rect.y, priceWidth, "right");
    this.changePaintOpacity(true);
  };

  // --------------------------------------------------------------------------
  // Scene_Shop Buying Logic
  // --------------------------------------------------------------------------

  const _Scene_Shop_maxBuy = Scene_Shop.prototype.maxBuy;
  Scene_Shop.prototype.maxBuy = function() {
    if (SLMSC.hasMaterialCost(this._item)) {
      const maxByInventory = $gameParty.maxItems(this._item) - $gameParty.numItems(this._item);
      const maxByCost = SLMSC.maxAffordable(this._item);
      return Math.max(0, Math.min(maxByInventory, maxByCost));
    }

    return _Scene_Shop_maxBuy.call(this);
  };

  const _Scene_Shop_doBuy = Scene_Shop.prototype.doBuy;
  Scene_Shop.prototype.doBuy = function(number) {
    if (SLMSC.hasMaterialCost(this._item)) {
      SLMSC.payCost(this._item, number);
      $gameParty.gainItem(this._item, number);
      return;
    }

    _Scene_Shop_doBuy.call(this, number);
  };

  // --------------------------------------------------------------------------
  // Window_ShopNumber
  // --------------------------------------------------------------------------

  const _Window_ShopNumber_drawTotalPrice = Window_ShopNumber.prototype.drawTotalPrice;
  Window_ShopNumber.prototype.drawTotalPrice = function() {
    if (!SLMSC.hasMaterialCost(this._item)) {
      _Window_ShopNumber_drawTotalPrice.call(this);
      return;
    }

    const oldFontSize = this.contents.fontSize;
    this.contents.fontSize = REQUIREMENT_FONT_SIZE;

    const lines = SLMSC.costLines(this._item, this._number);
    const lineHeight = Math.max(22, REQUIREMENT_FONT_SIZE + 6);
    const maxLines = Math.min(lines.length, 3);
    const startY = this.innerHeight - lineHeight * maxLines;

    this.resetTextColor();

    for (let i = 0; i < maxLines; i++) {
      const line = lines[i];
      const y = startY + i * lineHeight;
      const enough = line.owned >= line.needed;

      this.changeTextColor(enough ? ColorManager.normalColor() : ColorManager.crisisColor());
      this.drawText(`${line.needed} ${line.name}`, 0, y, this.innerWidth, "right");
    }

    this.contents.fontSize = oldFontSize;
    this.resetTextColor();
  };

})();