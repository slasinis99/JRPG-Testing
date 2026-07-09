//=============================================================================
// VisuStella MZ - Bright Effects
// VisuMZ_2_BrightEffects.js
//=============================================================================

var Imported = Imported || {};
Imported.VisuMZ_2_BrightEffects = true;

var VisuMZ = VisuMZ || {};
VisuMZ.BrightEffects = VisuMZ.BrightEffects || {};
VisuMZ.BrightEffects.version = 1.11;

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Tier 2] [Version 1.11] [BrightEffects]
 * @author VisuStella
 * @url http://www.yanfly.moe/wiki/Bright_Effects_VisuStella_MZ
 * @orderAfter VisuMZ_0_CoreEngine
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 * 
 * This RPG Maker MZ plugin allows you to add various bright effects to your
 * game's maps and battle system. These effects can make the game appear more
 * vivid, light, and gives you control over the color settings of a particular
 * map to make a more distinct feeling, too. The bright effects can be changed
 * midway through events in both maps and battles, too.
 *
 * Features include all (but not limited to) the following:
 * 
 * * A Bloom filter effect that can help soften the feel of a map by giving
 *   objects on the screen a slight hazy glow.
 * * Godrays can be used to show animated sunlight coming down from the sky
 *   above.
 * * The Color Adjustment filter allows you to alter the brightness, contrast,
 *   and saturation levels of your maps and battles.
 * * The Tilt Shift filter creates a blur at the top and bottom sections of the
 *   screen to give a sense of proximity blurring.
 * * Plugin Commands that allow you to adjust these settings on the go.
 * * Notetags for maps to alter the Bloom, Godray, and Color Adjustments
 *
 * ============================================================================
 * Requirements
 * ============================================================================
 *
 * This plugin is made for RPG Maker MZ. This will not work in other iterations
 * of RPG Maker.
 *
 * ------ Required Plugin List ------
 *
 * * Pixi JS Filters*
 *
 * This plugin requires the above listed plugins to be installed inside your
 * game's Plugin Manager list in order to work. You cannot start your game with
 * this plugin enabled without the listed plugins.
 * 
 * *Note* You can download the Pixi JS Filters plugin library from the below
 * URL or from the Action Sequence Impact product page. Install it as a
 * Tier 0 plugin.
 * 
 * *Note2* Pixi JS Filters perform differently on different machines/devices.
 * Please understand that this is outside of VisuStella's control.
 * 
 * URL: https://filters.pixijs.download/v3.1.0/pixi-filters.js
 *
 * ------ Tier 2 ------
 *
 * This plugin is a Tier 2 plugin. Place it under other plugins of lower tier
 * value on your Plugin Manager list (ie: 0, 1, 2, 3, 4, 5). This is to ensure
 * that your plugins will have the best compatibility with the rest of the
 * VisuStella MZ library.
 *
 * ============================================================================
 * New Effects
 * ============================================================================
 *
 * This plugin adds some new hard-coded features to RPG Maker MZ's functions.
 * The following is a list of them.
 *
 * ---
 *
 * Bloom
 * 
 * This filter puts a faint (or large) glow around lighter-colored objects on
 * the map to give them a softer, hazy, brighter feeling.
 * 
 * Properties:
 *
 * Scale: To adjust the strength of the bloom. Higher values is more
 * intense brightness.
 *
 * Brightness: The brightness, lower value is more subtle brightness, higher
 * value is blown-out.
 *
 * Threshold: Defines how bright a color needs to be to affect bloom.
 *
 * ---
 * 
 * Blur
 * 
 * The blur filter makes the screen appear less focused and more fuzzy. Details
 * become harder to distinguish and the like.
 * 
 * Properties:
 * 
 * Blur: Adjusts the blur strength. For best results, use numbers between 0 and
 * 5 where 0 is no blur and higher numbers mean higher blur strength. There are
 * no default Plugin Parameter settings for the Blur strength as it will
 * automatically default to 0 for best results.
 * 
 * ---
 *
 * Godray
 * 
 * The Godray filter puts down rays of light coming from the sky at an angle.
 * This is often used to represent sunlight peaking from above the clouds.
 * 
 * Properties:
 *
 * Visible: If on, the godrays will be visible by default. If off, they won't.
 *
 * Speed: The speed at which the light flickers. Lower for slower rate.
 * Higher for faster speeds.
 *
 * Gain: General intensity of the effect.
 *
 * Lacunarity: The density of the fractal noise.
 *
 * Angle: The angle/light-source direction of the rays.
 *
 * ---
 *
 * Color Adjustment
 * 
 * The Color Adjustment filter allows you to control the colors on the screen
 * to be more/less bright, contrast more/less, and more/less saturated.
 * 
 * Properties:
 *
 * Brightness: Adjusts the overall brightness of the screen. Use lower numbers
 * to make it darker and higher numbers to increase the brightness.
 *
 * Contrast: Increases the separation between dark and bright. Darker colors
 * become darker. Lighter colors become lighter. Increase this number to make
 * the effect more intense or decrease it to lessen it.
 *
 * Saturate: Adjusts the intensity of color on the screen. User higher numbers
 * to make colors more intense and lower numbers to make it less.
 *
 * ---
 * 
 * Tilt Shift
 * 
 * The Tilt Shift filter creates a blur at the upper and lower edges of the
 * screen with varying degrees of pixelation blur and gradient blur.
 * 
 * Properties:
 * 
 * Pixel Blur: What is the default pixel blur amount for tilt shift? Smaller
 * values mean less blur. Higher values mean more blur.
 * 
 * Gradient Blur: What is the default gradient blur amount for tilt shift?
 * Smaller values mean less gradient. Higher values mean more gradient.
 * 
 * ---
 *
 * ============================================================================
 * Extra Features
 * ============================================================================
 *
 * There are some extra features found if other VisuStella MZ plugins are found
 * present in the Plugin Manager list.
 *
 * ---
 * 
 * VisuMZ_1_OptionsCore
 * 
 * As of the VisuStella MZ Options Core v1.10 update, both the Bright Effects
 * and Horror Effects plugins will be affected by the "Special Effects" option
 * found under the Options Core's General Settings. If the "Special Effects"
 * option is set to OFF, then the filter effects applied by those plugins will
 * also be disabled. They will be reenabled when the option is set back to ON.
 * 
 * ---
 *
 * ============================================================================
 * Notetags
 * ============================================================================
 *
 * The following are notetags that have been added through this plugin. These
 * notetags will not work with your game if this plugin is OFF or not present.
 *
 * ---
 * 
 * === Bloom-Related Notetags ===
 * 
 * ---
 *
 * <Bloom Scale: x>
 *
 * - Used for: Map Notetags and Troop Names
 * - Changes the bloom scale to x for map/battle.
 * - Replace 'x' with a number to represent the value. Use decimals.
 *   - Lower - Less bloom
 *   - Higher - More bloom
 *
 * ---
 *
 * <Bloom Brightness: x>
 *
 * - Used for: Map Notetags and Troop Names
 * - Changes the bloom brightness to x for map/battle
 * - Replace 'x' with a number to represent the value. Use decimals.
 *   - Lower - Darker
 *   - Higher - Brighter
 *
 * ---
 *
 * <Bloom Threshold: x>
 *
 * - Used for: Map Notetags and Troop Names
 * - Changes the bloom threshold to x for map/battle.
 * - Replace 'x' with a number to represent the value. Use decimals.
 *   - Lower - Less picky
 *   - Higher - More picky
 *
 * ---
 *
 * <Bloom Horz Scale: x to y>
 * <Bloom Vert Scale: x to y>
 *
 * - Used for: Map Notetags
 * - Map only. Sets an adjusting scale when traveling left to right on the map
 *   (Horz) or up to down on the map (Vert).
 * - Replace 'x' and 'y' with numbers to represent the value. Use decimals.
 *   - Lower - Less bloom
 *   - Higher - More bloom
 *
 * ---
 *
 * <Bloom Horz Brightness: x to y>
 * <Bloom Vert Brightness: x to y>
 *
 * - Used for: Map Notetags
 * - Map only. Sets an adjusting brightness when traveling left to right on the
 *   map (Horz) or up to down on the map (Vert).
 * - Replace 'x' and 'y' with numbers to represent the value. Use decimals.
 *   - Lower - Darker
 *   - Higher - Brighter
 *
 * ---
 *
 * <Bloom Horz Threshold: x to y>
 * <Bloom Vert Threshold: x to y>
 *
 * - Used for: Map Notetags
 * - Map only. Sets an adjusting threshold when traveling left to right on the
 *   map (Horz) or up to down on the map (Vert).
 * - Replace 'x' and 'y' with numbers to represent the value. Use decimals.
 *   - Lower - Less picky
 *   - Higher - More picky
 *
 * ---
 * 
 * === Blur-Related Notetags ===
 * 
 * ---
 * 
 * <Blur: x>
 * 
 * - Used for: Map Notetags and Troop Names
 * - Changes the blur strength used for the screen to 'x'.
 * - Replace 'x' with a number representing the blur strength. For best
 *   results, use numbers between 0 and 5 where 0 is no blur and higher numbers
 *   mean higher blur strength.
 * 
 * ---
 * 
 * === Godray-Related Notetags ===
 * 
 * ---
 *
 * <Godray>
 * <No Godray>
 *
 * - Used for: Map Notetags and Troop Names
 * - Changes if there will be a godray on the map/battle regardless of the
 *   default settings in the plugin parameters.
 *
 * ---
 *
 * <Godray Speed: x>
 *
 * - Used for: Map Notetags and Troop Names
 * - Sets the flickering speed of the rays.
 * - Replace 'x' with a number to represent the value. Use decimals.
 *   - Lower - Slower
 *   - Higher - Faster
 *
 * ---
 *
 * <Godray Gain: x>
 *
 * - Used for: Map Notetags and Troop Names
 * - Sets the gain/intensity of the rays.
 * - Replace 'x' with a number to represent the value. Use decimals.
 *   - Lower - Lighter
 *   - Higher - Intense
 *
 * ---
 *
 * <Godray Lacunarity: x>
 *
 * - Used for: Map Notetags and Troop Names
 * - Sets the lacunarity/density of the rays.
 * - Replace 'x' with a number to represent the value. Use decimals.
 *   - Lower - Less dense
 *   - Higher - More dense
 *
 * ---
 *
 * <Godray Angle: x>
 *
 * - Used for: Map Notetags and Troop Names
 * - Sets the angle of the rays.
 * - Replace 'x' with a number to represent the value. Use a negative or
 *   positive integer value.
 *   - Negative - Coming from the left
 *   - Positive - Coming from the right
 *
 * ---
 *
 * <Godray Horz Speed: x to y>
 * <Godray Vert Speed: x to y>
 *
 * - Used for: Map Notetags
 * - Map only. Adjusts godray speed going left to right on a map (Horz) or up
 *   to down on a map (Vert). 
 * - Replace 'x' and 'y' with numbers to represent the value. Use decimals.
 *   - Lower - Slower
 *   - Higher - Faster
 *
 * ---
 *
 * <Godray Horz Gain: x to y>
 * <Godray Vert Gain: x to y>
 *
 * - Used for: Map Notetags
 * - Map only. Adjusts godray gain going left to right on a map (Horz) or up to
 *   down on a map (Vert).
 * - Replace 'x' and 'y' with numbers to represent the value. Use decimals.
 *   - Lower - Lighter
 *   - Higher - Intense
 *
 * ---
 *
 * <Godray Horz Lacunarity: x to y>
 * <Godray Vert Lacunarity: x to y>
 *
 * - Used for: Map Notetags
 * - Map only. Adjusts godray lacunarity going left to right on a map (Horz) or
 *   up to down on a map (Vert).
 * - Replace 'x' and 'y' with numbers to represent the value. Use decimals.
 *   - Lower - Less dense
 *   - Higher - More dense
 *
 * ---
 *
 * <Godray Horz Angle: x to y>
 * <Godray Vert Angle: x to y>
 *
 * - Used for: Map Notetags
 * - Map only. Adjusts godray angle going left to right on a map (Horz) or up
 *   to down on a map (Vert).
 * - Replace 'x' and 'y' with numbers to represent the value. Use a negative or
 *   positive integer values.
 *   - Negative - Coming from the left
 *   - Positive - Coming from the right
 *
 * ---
 * 
 * === Color Adjust-Related Notetags ===
 * 
 * ---
 *
 * <Color Adjust Brightness: x>
 *
 * - Used for: Map Notetags and Troop Names
 * - Alters the screen brightness for the map/battle.
 * - Replace 'x' with a number to represent the value. Use decimals.
 *   - Lower - Darker
 *   - Higher - Brighter
 *
 * ---
 *
 * <Color Adjust Contrast: x>
 *
 * - Used for: Map Notetags and Troop Names
 * - Adjusts the screen contrast for the map/battle.
 * - Replace 'x' with a number to represent the value. Use decimals.
 *   - Lower - Less contrast
 *   - Higher - More contrast
 *
 * ---
 *
 * <Color Adjust Saturate: x>
 *
 * - Used for: Map Notetags and Troop Names
 * - Adjusts the screen saturation for the map/battle.
 * - Replace 'x' with a number to represent the value. Use decimals.
 *   - Lower - Darker
 *   - Higher - Brighter
 *
 * ---
 *
 * <Color Adjust Horz Brightness: x to y>
 * <Color Adjust Vert Brightness: x to y>
 *
 * - Used for: Map Notetags
 * - Map only. Alters the screen brightness when moving left to right on a map
 *   (Horz) or up to down on a map (Vert).
 * - Replace 'x' and 'y' with numbers to represent the value. Use decimals.
 *   - Lower - Darker
 *   - Higher - Brighter
 *
 * ---
 *
 * <Color Adjust Horz Contrast: x to y>
 * <Color Adjust Vert Contrast: x to y>
 *
 * - Used for: Map Notetags
 * - Map only. Adjusts the screen contrast when moving left to right on a map
 *   (Horz) or up to down on a map (Vert).
 * - Replace 'x' and 'y' with numbers to represent the value. Use decimals.
 *   - Lower - Less contrast
 *   - Higher - More contrast
 *
 * ---
 *
 * <Color Adjust Horz Saturate: x to y>
 * <Color Adjust Vert Saturate: x to y>
 *
 * - Used for: Map Notetags
 * - Map only. Adjusts the screen saturation when moving left to right on a map
 *   (Horz) or up to down on a map (Vert).
 * - Replace 'x' and 'y' with numbers to represent the value. Use decimals.
 *   - Lower - Less intensity
 *   - Higher - More intensity
 *
 * ---
 * 
 * === Tilt Shift Notetags ===
 * 
 * ---
 * 
 * <Tilt Shift Pixel Blur: x>
 * 
 * - Used for: Map Notetags and Troop Names
 * - Adjusts the tilt shift filter's pixel blur amount for the map/battle.
 * - Replace 'x' with a number to represent the blur intensity.
 *   - Lower = less blur
 *   - Higher = more blur
 * 
 * ---
 * 
 * <Tilt Shift Gradient Blur: x>
 * 
 * - Used for: Map Notetags and Troop Names
 * - Adjusts the tilt shift filter's gradient blur amount for the map/battle.
 * - Replace 'x' with a number to represent the gradient blur distance.
 *   - Lower = less gradient
 *   - Higher = more gradient
 * 
 * ---
 *
 * ============================================================================
 * Plugin Commands
 * ============================================================================
 *
 * The following are Plugin Commands that come with this plugin. They can be
 * accessed through the Plugin Command event command.
 *
 * ---
 * 
 * === Bloom Plugin Commands ===
 * 
 * ---
 *
 * Bloom: Change Settings
 * - Change the Bloom filter settings for the screen.
 *
 *   Bloom Scale:
 *   - Change bloom scale for the screen.
 *
 *   Bloom Brightness:
 *   - Change bloom brightness for the screen.
 *
 *   Bloom Threshold:
 *   - Change bloom threshold for the screen.
 *
 *   Shift Duration:
 *   - The amount of time it takes for the change to occur.
 *
 * ---
 *
 * Bloom: Reset
 * - Reset the Bloom filter settings for the settings found in the Plugin
 *   Parameters or map notetags.
 *
 *   Shift Duration:
 *   - The amount of time it takes for the reset to occur.
 *
 * ---
 * 
 * === Blur Plugin Commands ===
 * 
 * ---
 * 
 * Blur: Change Settings
 * - Change the Blur filter settings for the screen.
 * 
 *   Blur Strength:
 *   - Change blur strength for the screen.
 *   - For best results, use numbers between 0 and 5  where 0 is no blur and
 *     higher numbers mean higher blur strength.
 * 
 *   Blur Duration:
 *   - The amount of time it takes for the change to occur.
 * 
 * ---
 * 
 * Blur: Reset
 * - Clears the Blur filter.
 * 
 *   Blur Duration:
 *   - The amount of time it takes for the reset to occur.
 * 
 * ---
 * 
 * === Godray Plugin Commands ===
 * 
 * ---
 *
 * Godray: Change Settings
 * - Change the Godray filter settings for the screen.
 *
 *   Visible?:
 *   - Show godrays on the screen?
 *   - Visibility changes are immediate.
 *
 *   Godray Speed:
 *   - Change godray speed for the screen.
 *
 *   Godray Gain:
 *   - Change godray gain for the screen.
 *
 *   Godray Lacunarity:
 *   - Change godray lacunarity for the screen.
 *
 *   Godray Angle:
 *   - Change godray angle for the screen.
 *
 *   Shift Duration:
 *   - The amount of time it takes for the change to occur.
 *   - Visibility changes are immediate.
 *
 * ---
 *
 * Godray: Reset
 * - Reset the Godray filter settings for the settings found in the Plugin
 *   Parameters or map notetags.
 *
 *   Shift Duration:
 *   - The amount of time it takes for the reset to occur.
 *   - Visibility changes are immediate.
 *
 * ---
 * 
 * === Color Adjust Plugin Commands ===
 * 
 * ---
 *
 * Color Adjust: Change Settings
 * - Change the Color Adjustment filter settings for the screen.
 *
 *   Adjust Brightness:
 *   - Change color adjust brightness for the screen.
 *
 *   Adjust Contrast:
 *   - Change color adjust contrast for the screen.
 *
 *   Adjust Saturation:
 *   - Change color adjust saturation for the screen.
 *
 *   Shift Duration:
 *   - The amount of time it takes for the change to occur.
 *
 * ---
 *
 * Color Adjust: Reset
 * - Reset the Color Adjustment filter settings for the settings found in the
 *   Plugin Parameters or map notetags.
 *
 *   Shift Duration:
 *   - The amount of time it takes for the reset to occur.
 *
 * ---
 * 
 * === Tilt Shift Plugin Commands ===
 * 
 * ---
 * 
 * Tilt Shift: Change Settings
 * - Change the Tilt Shift filter settings for the screen.
 * 
 *   Pixel Blur:
 *   - What is the default pixel blur amount for tilt shift?
 *   - Smaller = less blur. Higher = more blur.
 * 
 *   Gradient Blur:
 *   - What is the default gradient blur amount for tilt shift?
 *   - Smaller = less gradient. Higher = more gradient.
 * 
 *   Shift Duration:
 *   - The amount of time it takes for the change to occur.
 * 
 * ---
 * 
 * Tilt Shift: Reset
 * - Reset the Tilt Shift filter settings for the settings found in the
 *   Plugin Parameters or map notetags.
 * 
 *   Shift Duration:
 *   - The amount of time it takes for the change to occur.
 * 
 * ---
 * 
 * ============================================================================
 * Plugin Parameters: General Settings
 * ============================================================================
 * 
 * This section is for the general plugin parameter settings.
 * 
 * ---
 * 
 * General
 * 
 *   Apply Base-Only?
 *   - Base-Only excludes pictures, timers, and weather.
 *   - Whole includes the above.
 * 
 * ---
 *
 * ============================================================================
 * Plugin Parameters: Bloom Settings
 * ============================================================================
 *
 * There are two versions of these plugin parameters. One of them are for the
 * Map Defaults and the other is for the Battle Defaults. These settings are
 * applied to the map and battle scenes respectively and will serve as the
 * stock setting when no map notetags, troop name tags, or Plugin Commands have
 * been used to alter them.
 *
 * ---
 *
 * Bloom Settings
 * 
 *   Bloom Scale:
 *   - Default bloom scale for the screen unless changed through tags.
 * 
 *   Bloom Brightness:
 *   - Default bloom brightness for the screen unless changed through tags.
 * 
 *   Bloom Threshold:
 *   - Default bloom threshold for the screen unless changed through tags.
 *
 * ---
 *
 * ============================================================================
 * Plugin Parameters: Godray Settings
 * ============================================================================
 *
 * There are two versions of these plugin parameters. One of them are for the
 * Map Defaults and the other is for the Battle Defaults. These settings are
 * applied to the map and battle scenes respectively and will serve as the
 * stock setting when no map notetags, troop name tags, or Plugin Commands have
 * been used to alter them.
 *
 * ---
 *
 * Godray Settings
 * 
 *   Default Visible?:
 *   - Show godrays on all screens by default unless changed through tags?
 * 
 *   Godray Speed:
 *   - Default godray speed for all screens unless changed through tags.
 * 
 *   Godray Gain:
 *   - Default godray gain for all screens unless changed through tags.
 * 
 *   Godray Lacunarity:
 *   - Default godray lacunarity for all screens unless changed through tags.
 * 
 *   Godray Angle:
 *   - Default godray angle for all screens unless changed through tags.
 *
 * ---
 *
 * ============================================================================
 * Plugin Parameters: Color Adjust Settings
 * ============================================================================
 *
 * There are two versions of these plugin parameters. One of them are for the
 * Map Defaults and the other is for the Battle Defaults. These settings are
 * applied to the map and battle scenes respectively and will serve as the
 * stock setting when no map notetags, troop name tags, or Plugin Commands have
 * been used to alter them.
 *
 * ---
 *
 * Color Adjust Settings
 * 
 *   Adjust Brightness:
 *   - Default color adjust brightness for all screens unless changed
 *     through tags.
 * 
 *   Adjust Contrast:
 *   - Default color adjust contrast for all screens unless changed
 *     through tags.
 * 
 *   Adjust Saturation:
 *   - Default color adjust saturation for all screens unless changed
 *     through tags.
 *
 * ---
 *
 * ============================================================================
 * Plugin Parameters: Tilt Shift Settings
 * ============================================================================
 *
 * There are two versions of these plugin parameters. One of them are for the
 * Map Defaults and the other is for the Battle Defaults. These settings are
 * applied to the map and battle scenes respectively and will serve as the
 * stock setting when no map notetags, troop name tags, or Plugin Commands have
 * been used to alter them.
 *
 * ---
 *
 * Tilt Shift Settings
 * 
 *   Pixel Blur:
 *   - What is the default pixel blur amount for tilt shift?
 *   - Smaller = less blur. Higher = more blur.
 * 
 *   Gradient Blur:
 *   - What is the default gradient blur amount for tilt shift?
 *   - Smaller = less gradient. Higher = more gradient.
 *
 * ---
 *
 * ============================================================================
 * Terms of Use
 * ============================================================================
 *
 * 1. These plugins may be used in free or commercial games provided that they
 * have been acquired through legitimate means at VisuStella.com and/or any
 * other official approved VisuStella sources. Exceptions and special
 * circumstances that may prohibit usage will be listed on VisuStella.com.
 * 
 * 2. All of the listed coders found in the Credits section of this plugin must
 * be given credit in your games or credited as a collective under the name:
 * "VisuStella".
 * 
 * 3. You may edit the source code to suit your needs, so long as you do not
 * claim the source code belongs to you. VisuStella also does not take
 * responsibility for the plugin if any changes have been made to the plugin's
 * code, nor does VisuStella take responsibility for user-provided custom code
 * used for custom control effects including advanced JavaScript notetags
 * and/or plugin parameters that allow custom JavaScript code.
 * 
 * 4. You may NOT redistribute these plugins nor take code from this plugin to
 * use as your own. These plugins and their code are only to be downloaded from
 * VisuStella.com and other official/approved VisuStella sources. A list of
 * official/approved sources can also be found on VisuStella.com.
 *
 * 5. VisuStella is not responsible for problems found in your game due to
 * unintended usage, incompatibility problems with plugins outside of the
 * VisuStella MZ library, plugin versions that aren't up to date, nor
 * responsible for the proper working of compatibility patches made by any
 * third parties. VisuStella is not responsible for errors caused by any
 * user-provided custom code used for custom control effects including advanced
 * JavaScript notetags and/or plugin parameters that allow JavaScript code.
 *
 * 6. If a compatibility patch needs to be made through a third party that is
 * unaffiliated with VisuStella that involves using code from the VisuStella MZ
 * library, contact must be made with a member from VisuStella and have it
 * approved. The patch would be placed on VisuStella.com as a free download
 * to the public. Such patches cannot be sold for monetary gain, including
 * commissions, crowdfunding, and/or donations.
 * 
 * 7. If this VisuStella MZ plugin is a paid product, all project team members
 * must purchase their own individual copies of the paid product if they are to
 * use it. Usage includes working on related game mechanics, managing related
 * code, and/or using related Plugin Commands and features. Redistribution of
 * the plugin and/or its code to other members of the team is NOT allowed
 * unless they own the plugin itself as that conflicts with Article 4.
 * 
 * 8. Any extensions and/or addendums made to this plugin's Terms of Use can be
 * found on VisuStella.com and must be followed.
 *
 * ============================================================================
 * Credits
 * ============================================================================
 * 
 * If you are using this plugin, credit the following people in your game:
 * 
 * Team VisuStella
 * * Yanfly
 * * Arisu
 * * Olivia
 * * Irina
 *
 * ============================================================================
 * Changelog
 * ============================================================================
 * 
 * Version 1.11: January 19, 2026
 * * Bug Fixes!
 * ** Fixed a bug where entering the Options menu mid-battle will cause the
 *    Bright Effects plugin to be cleared. Fix made by Olivia.
 * 
 * Version 1.10: January 16, 2025
 * * Bug Fixes!
 * ** Fixed bug with Tilt Shift effect not applying correctly when exiting a
 *    menu upon reentering the map scene. Fix made by Olivia.
 * 
 * Version 1.09: October 17, 2024
 * * Optimization Update!
 * ** Plugin should run more optimized.
 * 
 * Version 1.08: June 13, 2024
 * * Bug Fixes!
 * ** Added a failsafe to prevent crashes when no focus target is found due to
 *    either changing map or a sprite is deleted. Fix made by Olivia.
 * 
 * Version 1.07: March 16, 2023
 * * Documentation Update!
 * ** Help file updated for new features.
 * * New Features!
 * ** New features added by Olivia and sponsored by Archeia:
 * *** Blur
 * **** The blur filter makes the screen appear less focused and more fuzzy.
 *      Details become harder to distinguish and the like.
 * **** Notetags and Plugin Commands added.
 * * Optimization Update!
 * ** Plugin should run more optimized.
 * 
 * Version 1.06: October 13, 2022
 * * Documentation Update!
 * ** Help file updated for new features.
 * * New Features!
 * ** New features added by Olivia and sponsored by Archeia:
 * *** Tilt Shift
 * **** The Tilt Shift filter creates a blur at the upper and lower edges of
 *      the screen with varying degrees of pixelation blur and gradient blur.
 * **** Plugin Parameters, Notetags, and Plugin Commands added.
 * * Optimization Update!
 * ** Plugin should run more optimized.
 * 
 * Version 1.05: April 28, 2022
 * * Bug Fixes!
 * ** No longer crashes with event test play. Fix made by Olivia.
 * 
 * Version 1.04: March 24, 2022
 * * Documentation Update!
 * ** Help file updated for new features.
 * * New Features:
 * ** New Plugin Parameters added: "Apply Base-Only?"
 * *** Base-Only excludes pictures, timers, and weather.
 * *** Whole includes the above.
 * 
 * Version 1.03: April 2, 2021
 * * Bug Fixes!
 * ** Changing scenes while a filter change is in transition will automatically
 *    load up the changes made to the filter to prevent desynchronization.
 *    Fix made by Olivia.
 * 
 * Version 1.02: March 12, 2021
 * * Compatibility Update!
 * ** Added compatibility with the VisuStella MZ Options Core v1.10 update.
 * *** When the "Special Effects" option is set to OFF, the filters for this
 *     plugin will be shut off. They will be returned to normal when set to ON.
 * * Documentation Update!
 * ** Added the Options Core section to the "Extra Features" list.
 * 
 * Version 1.01: December 25, 2020
 * * Bug Fixes!
 * ** Bright effects from battle should no longer carry back over into the
 *    map scene. Fix made by Yanfly.
 *
 * Version 1.00: January 18, 2021
 * * Finished Plugin!
 *
 * ============================================================================
 * End of Helpfile
 * ============================================================================
 *
 * @ --------------------------------------------------------------------------
 *
 * @command Separator_Begin
 * @text -
 * @desc -
 *
 * @ --------------------------------------------------------------------------
 *
 * @command BloomChange
 * @text Bloom: Change Settings
 * @desc Change the Bloom filter settings for the screen.
 *
 * @arg Scale:num
 * @text Bloom Scale
 * @desc Change bloom scale for the screen.
 * @default 0.5
 *
 * @arg Brightness:num
 * @text Bloom Brightness
 * @desc Change bloom brightness for the screen.
 * @default 1.0
 *
 * @arg Threshold:num
 * @text Bloom Threshold
 * @desc Change bloom threshold for the screen.
 * @default 0.5
 *
 * @arg Duration:num
 * @text Shift Duration
 * @type number
 * @desc The amount of time it takes for the change to occur.
 * @default 60
 *
 * @ --------------------------------------------------------------------------
 *
 * @command BloomReset
 * @text Bloom: Reset
 * @desc Reset the Bloom filter settings for the settings found in
 * the Plugin Parameters or map notetags.
 *
 * @arg Duration:num
 * @text Shift Duration
 * @type number
 * @desc The amount of time it takes for the reset to occur.
 * @default 60
 *
 * @ --------------------------------------------------------------------------
 *
 * @command Separator_Blur
 * @text -
 * @desc -
 *
 * @ --------------------------------------------------------------------------
 *
 * @command BlurChange
 * @text Blur: Change Settings
 * @desc Change the Blur filter settings for the screen.
 *
 * @arg Blur:num
 * @text Blur Strength
 * @desc Change blur strength for the screen.
 * For best results, use numbers between 0 and 5.
 * @default 2.0
 *
 * @arg Duration:num
 * @text Blur Duration
 * @type number
 * @desc The amount of time it takes for the change to occur.
 * @default 60
 *
 * @ --------------------------------------------------------------------------
 *
 * @command BlurReset
 * @text Blur: Reset
 * @desc Clears the Blur filter.
 *
 * @arg Duration:num
 * @text Blur Duration
 * @type number
 * @desc The amount of time it takes for the reset to occur.
 * @default 60
 *
 * @ --------------------------------------------------------------------------
 *
 * @command Separator_Godray
 * @text -
 * @desc -
 *
 * @ --------------------------------------------------------------------------
 *
 * @command GodrayChange
 * @text Godray: Change Settings
 * @desc Change the Godray filter settings for the screen.
 *
 * @arg Visible:eval
 * @text Visible?
 * @type boolean
 * @on Show
 * @off Hide
 * @desc Show godrays on the screen?
 * Visibility changes are immediate.
 * @default true
 *
 * @arg Speed:num
 * @text Godray Speed
 * @desc Change godray speed for the screen.
 * @default 0.01
 *
 * @arg Gain:num
 * @text Godray Gain
 * @desc Change godray gain for the screen.
 * @default 0.6
 *
 * @arg Lacunarity:num
 * @text Godray Lacunarity
 * @desc Change godray lacunarity for the screen.
 * @default 2.0
 *
 * @arg Angle:num
 * @text Godray Angle
 * @desc Change godray angle for the screen.
 * @default -30
 *
 * @arg Duration:num
 * @text Shift Duration
 * @type number
 * @desc The amount of time it takes for the change to occur.
 * Visibility changes are immediate.
 * @default 60
 *
 * @ --------------------------------------------------------------------------
 *
 * @command GodrayReset
 * @text Godray: Reset
 * @desc Reset the Godray filter settings for the settings
 * found in the Plugin Parameters or map notetags.
 *
 * @arg Duration:num
 * @text Shift Duration
 * @type number
 * @desc The amount of time it takes for the reset to occur.
 * Visibility changes are immediate.
 * @default 60
 *
 * @ --------------------------------------------------------------------------
 *
 * @command Separator_ColorAdjust
 * @text -
 * @desc -
 *
 * @ --------------------------------------------------------------------------
 *
 * @command ColorAdjustChange
 * @text Color Adjust: Change Settings
 * @desc Change the Color Adjustment filter settings for the screen.
 *
 * @arg Brightness:num
 * @text Adjust Brightness
 * @desc Change color adjust brightness for the screen.
 * @default 1.0
 *
 * @arg Contrast:num
 * @text Adjust Contrast
 * @desc Change color adjust contrast for the screen.
 * @default 0.0
 *
 * @arg Saturate:num
 * @text Adjust Saturation
 * @desc Change color adjust saturation for the screen.
 * @default 0.0
 *
 * @arg Duration:num
 * @text Shift Duration
 * @type number
 * @desc The amount of time it takes for the change to occur.
 * @default 60
 *
 * @ --------------------------------------------------------------------------
 *
 * @command ColorAdjustReset
 * @text Color Adjust: Reset
 * @desc Reset the Color Adjustment filter settings for the settings
 * found in the Plugin Parameters or map notetags.
 *
 * @arg Duration:num
 * @text Shift Duration
 * @type number
 * @desc The amount of time it takes for the reset to occur.
 * @default 60
 *
 * @ --------------------------------------------------------------------------
 *
 * @command Separator_TiltShift
 * @text -
 * @desc -
 *
 * @ --------------------------------------------------------------------------
 *
 * @command TiltShiftChange
 * @text Tilt Shift: Change Settings
 * @desc Change the Tilt Shift filter settings for the screen.
 *
 * @arg Blur:num
 * @text Pixel Blur
 * @desc What is the default pixel blur amount for tilt shift?
 * Smaller = less blur. Higher = more blur.
 * @default 24
 *
 * @arg GradientBlur:num
 * @text Gradient Blur
 * @desc What is the default gradient blur amount for tilt shift?
 * Smaller = less gradient. Higher = more gradient.
 * @default 1000
 *
 * @arg Duration:num
 * @text Shift Duration
 * @type number
 * @desc The amount of time it takes for the change to occur.
 * @default 60
 *
 * @ --------------------------------------------------------------------------
 *
 * @command TiltShiftReset
 * @text Tilt Shift: Reset
 * @desc Reset the Tilt Shift filter settings for the settings
 * found in the Plugin Parameters or map notetags.
 *
 * @arg Duration:num
 * @text Shift Duration
 * @type number
 * @desc The amount of time it takes for the reset to occur.
 * @default 60
 *
 * @ --------------------------------------------------------------------------
 *
 * @command Separator_End
 * @text -
 * @desc -
 *
 * @ --------------------------------------------------------------------------
 *
 * @ ==========================================================================
 * @ Plugin Parameters
 * @ ==========================================================================
 *
 * @param BreakHead
 * @text --------------------------
 * @default ----------------------------------
 *
 * @param BrightEffects
 * @default Plugin Parameters
 *
 * @param ATTENTION
 * @default READ THE HELP FILE
 *
 * @param BreakSettings
 * @text --------------------------
 * @default ----------------------------------
 * 
 * @param Map
 * @text Map Defaults
 *
 * @param MapBaseFilter:eval
 * @text Apply Base-Only?
 * @parent Map
 * @type boolean
 * @on Base-Only
 * @off Apply Whole
 * @desc Base-Only excludes pictures, timers, and weather.
 * Whole includes the above.
 * @default true
 *
 * @param MapBloom:struct
 * @text Bloom Settings
 * @parent Map
 * @type struct<Bloom>
 * @desc Default bloom settings for all maps.
 * @default {"Scale:num":"0.5","Brightness:num":"1.0","Threshold:num":"0.5"}
 *
 * @param MapGodray:struct
 * @text Godray Settings
 * @parent Map
 * @type struct<Godray>
 * @desc Default Godray settings for all maps.
 * @default {"Visible:eval":"false","Speed:num":"0.01","Gain:num":"0.6","Lacunarity:num":"2.0","Angle:num":"-30"}
 *
 * @param MapColorAdjust:struct
 * @text Color Adjust Settings
 * @parent Map
 * @type struct<ColorAdjust>
 * @desc Default color adjustment settings for all maps.
 * @default {"Brightness:num":"1.0","Contrast:num":"0.0","Saturate:num":"0.0"}
 *
 * @param MapTiltShift:struct
 * @text Tilt Shift Settings
 * @parent Map
 * @type struct<TiltShift>
 * @desc Default tilt shift adjustment settings for all maps.
 * @default {"Blur:num":"24","GradientBlur:num":"1000"}
 * 
 * @param Battle
 * @text Battle Defaults
 *
 * @param BattleBaseFilter:eval
 * @text Apply Base-Only?
 * @parent Battle
 * @type boolean
 * @on Base-Only
 * @off Apply Whole
 * @desc Base-Only excludes pictures, timers, and weather.
 * Whole includes the above.
 * @default true
 *
 * @param BattleBloom:struct
 * @text Bloom Settings
 * @parent Battle
 * @type struct<Bloom>
 * @desc Default bloom settings for all battles.
 * @default {"Scale:num":"0.5","Brightness:num":"1.0","Threshold:num":"0.5"}
 *
 * @param BattleGodray:struct
 * @text Godray Settings
 * @parent Battle
 * @type struct<Godray>
 * @desc Default Godray settings for all battles.
 * @default {"Visible:eval":"false","Speed:num":"0.01","Gain:num":"0.6","Lacunarity:num":"2.0","Angle:num":"-30"}
 *
 * @param BattleColorAdjust:struct
 * @text Color Adjust Settings
 * @parent Battle
 * @type struct<ColorAdjust>
 * @desc Default color adjustment settings for all battles.
 * @default {"Brightness:num":"1.0","Contrast:num":"0.0","Saturate:num":"0.0"}
 *
 * @param BattleTiltShift:struct
 * @text Tilt Shift Settings
 * @parent Battle
 * @type struct<TiltShift>
 * @desc Default tilt shift adjustment settings for all battles.
 * @default {"Blur:num":"0","GradientBlur:num":"1600"}
 *
 * @param BreakEnd1
 * @text --------------------------
 * @default ----------------------------------
 *
 * @param End Of
 * @default Plugin Parameters
 *
 * @param BreakEnd2
 * @text --------------------------
 * @default ----------------------------------
 *
 */
/* ----------------------------------------------------------------------------
 * Bloom Settings
 * ----------------------------------------------------------------------------
 */
/*~struct~Bloom:
 *
 * @param Scale:num
 * @text Bloom Scale
 * @desc Default bloom scale for the screen unless changed through tags.
 * @default 0.5
 *
 * @param Brightness:num
 * @text Bloom Brightness
 * @desc Default bloom brightness for the screen unless changed through tags.
 * @default 1.0
 *
 * @param Threshold:num
 * @text Bloom Threshold
 * @desc Default bloom threshold for the screen unless changed through tags.
 * @default 0.5
 *
 */
/* ----------------------------------------------------------------------------
 * Godray Settings
 * ----------------------------------------------------------------------------
 */
/*~struct~Godray:
 *
 * @param Visible:eval
 * @text Default Visible?
 * @type boolean
 * @on Show
 * @off Hide
 * @desc Show godrays on all screens by default unless changed through tags?
 * @default false
 *
 * @param Speed:num
 * @text Godray Speed
 * @desc Default godray speed for all screens unless changed through tags.
 * @default 0.01
 *
 * @param Gain:num
 * @text Godray Gain
 * @desc Default godray gain for all screens unless changed through tags.
 * @default 0.6
 *
 * @param Lacunarity:num
 * @text Godray Lacunarity
 * @desc Default godray lacunarity for all screens unless changed through tags.
 * @default 2.0
 *
 * @param Angle:num
 * @text Godray Angle
 * @desc Default godray angle for all screens unless changed through tags.
 * @default -30
 *
 */
/* ----------------------------------------------------------------------------
 * Color Adjust Settings
 * ----------------------------------------------------------------------------
 */
/*~struct~ColorAdjust:
 *
 * @param Brightness:num
 * @text Adjust Brightness
 * @desc Default color adjust brightness for all screens unless changed through tags.
 * @default 1.0
 *
 * @param Contrast:num
 * @text Adjust Contrast
 * @desc Default color adjust contrast for all screens unless changed through tags.
 * @default 0.0
 *
 * @param Saturate:num
 * @text Adjust Saturation
 * @desc Default color adjust saturation for all screens unless changed through tags.
 * @default 0.0
 *
 */
/* ----------------------------------------------------------------------------
 * Tilt Shift Settings
 * ----------------------------------------------------------------------------
 */
/*~struct~TiltShift:
 *
 * @param Blur:num
 * @text Pixel Blur
 * @desc What is the default pixel blur amount for tilt shift?
 * Smaller = less blur. Higher = more blur.
 * @default 24
 *
 * @param GradientBlur:num
 * @text Gradient Blur
 * @desc What is the default gradient blur amount for tilt shift?
 * Smaller = less gradient. Higher = more gradient.
 * @default 1000
 *
 */
//=============================================================================

var _0x5a7aa0=_0x14a1;(function(_0x2123f9,_0x3d7fb4){var _0x56eb48=_0x14a1,_0x3e1e13=_0x2123f9();while(!![]){try{var _0x3a91e6=parseInt(_0x56eb48(0x17b))/0x1*(parseInt(_0x56eb48(0x159))/0x2)+-parseInt(_0x56eb48(0x124))/0x3+-parseInt(_0x56eb48(0x152))/0x4+-parseInt(_0x56eb48(0x18d))/0x5+-parseInt(_0x56eb48(0x1c3))/0x6+-parseInt(_0x56eb48(0x195))/0x7+parseInt(_0x56eb48(0x1b4))/0x8;if(_0x3a91e6===_0x3d7fb4)break;else _0x3e1e13['push'](_0x3e1e13['shift']());}catch(_0x10f06a){_0x3e1e13['push'](_0x3e1e13['shift']());}}}(_0x2447,0x3189b));var label=_0x5a7aa0(0x119),tier=tier||0x0,dependencies=[],pluginData=$plugins[_0x5a7aa0(0x145)](function(_0x260072){var _0x5160c5=_0x5a7aa0;return _0x260072[_0x5160c5(0x1b9)]&&_0x260072[_0x5160c5(0x1d4)]['includes']('['+label+']');})[0x0];function _0x14a1(_0x2908d9,_0xea3f5a){var _0x2447aa=_0x2447();return _0x14a1=function(_0x14a18f,_0x1290a5){_0x14a18f=_0x14a18f-0x10e;var _0x43ede8=_0x2447aa[_0x14a18f];return _0x43ede8;},_0x14a1(_0x2908d9,_0xea3f5a);}VisuMZ[label]['Settings']=VisuMZ[label][_0x5a7aa0(0x1a4)]||{},VisuMZ[_0x5a7aa0(0x156)]=function(_0xcb5b15,_0x412a33){var _0x3be3a9=_0x5a7aa0;for(const _0x5ab6d1 in _0x412a33){if(_0x5ab6d1[_0x3be3a9(0x178)](/(.*):(.*)/i)){const _0x3489f5=String(RegExp['$1']),_0x4c7c3b=String(RegExp['$2'])[_0x3be3a9(0x17c)]()['trim']();let _0x47d1fb,_0x1b64c3,_0x16b6e8;switch(_0x4c7c3b){case _0x3be3a9(0x111):_0x47d1fb=_0x412a33[_0x5ab6d1]!==''?Number(_0x412a33[_0x5ab6d1]):0x0;break;case'ARRAYNUM':_0x1b64c3=_0x412a33[_0x5ab6d1]!==''?JSON[_0x3be3a9(0x16c)](_0x412a33[_0x5ab6d1]):[],_0x47d1fb=_0x1b64c3['map'](_0x357698=>Number(_0x357698));break;case _0x3be3a9(0x1b8):_0x47d1fb=_0x412a33[_0x5ab6d1]!==''?eval(_0x412a33[_0x5ab6d1]):null;break;case'ARRAYEVAL':_0x1b64c3=_0x412a33[_0x5ab6d1]!==''?JSON[_0x3be3a9(0x16c)](_0x412a33[_0x5ab6d1]):[],_0x47d1fb=_0x1b64c3['map'](_0x587cad=>eval(_0x587cad));break;case _0x3be3a9(0x16b):_0x47d1fb=_0x412a33[_0x5ab6d1]!==''?JSON[_0x3be3a9(0x16c)](_0x412a33[_0x5ab6d1]):'';break;case _0x3be3a9(0x1b7):_0x1b64c3=_0x412a33[_0x5ab6d1]!==''?JSON[_0x3be3a9(0x16c)](_0x412a33[_0x5ab6d1]):[],_0x47d1fb=_0x1b64c3[_0x3be3a9(0x1cf)](_0x338bd2=>JSON[_0x3be3a9(0x16c)](_0x338bd2));break;case _0x3be3a9(0x169):_0x47d1fb=_0x412a33[_0x5ab6d1]!==''?new Function(JSON['parse'](_0x412a33[_0x5ab6d1])):new Function(_0x3be3a9(0x146));break;case _0x3be3a9(0x18f):_0x1b64c3=_0x412a33[_0x5ab6d1]!==''?JSON['parse'](_0x412a33[_0x5ab6d1]):[],_0x47d1fb=_0x1b64c3[_0x3be3a9(0x1cf)](_0x15d58e=>new Function(JSON[_0x3be3a9(0x16c)](_0x15d58e)));break;case _0x3be3a9(0x1cb):_0x47d1fb=_0x412a33[_0x5ab6d1]!==''?String(_0x412a33[_0x5ab6d1]):'';break;case'ARRAYSTR':_0x1b64c3=_0x412a33[_0x5ab6d1]!==''?JSON[_0x3be3a9(0x16c)](_0x412a33[_0x5ab6d1]):[],_0x47d1fb=_0x1b64c3[_0x3be3a9(0x1cf)](_0x5dc8f3=>String(_0x5dc8f3));break;case _0x3be3a9(0x1a2):_0x16b6e8=_0x412a33[_0x5ab6d1]!==''?JSON['parse'](_0x412a33[_0x5ab6d1]):{},_0x47d1fb=VisuMZ[_0x3be3a9(0x156)]({},_0x16b6e8);break;case _0x3be3a9(0x143):_0x1b64c3=_0x412a33[_0x5ab6d1]!==''?JSON[_0x3be3a9(0x16c)](_0x412a33[_0x5ab6d1]):[],_0x47d1fb=_0x1b64c3['map'](_0x356c9a=>VisuMZ[_0x3be3a9(0x156)]({},JSON['parse'](_0x356c9a)));break;default:continue;}_0xcb5b15[_0x3489f5]=_0x47d1fb;}}return _0xcb5b15;},(_0x3e88b0=>{var _0x3597a3=_0x5a7aa0;const _0x3ae0cb=_0x3e88b0[_0x3597a3(0x157)];for(const _0x147c1b of dependencies){if(!Imported[_0x147c1b]){alert(_0x3597a3(0x148)[_0x3597a3(0x128)](_0x3ae0cb,_0x147c1b)),SceneManager[_0x3597a3(0x155)]();break;}}const _0x10085e=_0x3e88b0[_0x3597a3(0x1d4)];if(_0x10085e[_0x3597a3(0x178)](/\[Version[ ](.*?)\]/i)){const _0x31835e=Number(RegExp['$1']);_0x31835e!==VisuMZ[label]['version']&&(alert(_0x3597a3(0x13f)[_0x3597a3(0x128)](_0x3ae0cb,_0x31835e)),SceneManager['exit']());}if(_0x10085e['match'](/\[Tier[ ](\d+)\]/i)){const _0x331d28=Number(RegExp['$1']);_0x331d28<tier?(alert('%1\x20is\x20incorrectly\x20placed\x20on\x20the\x20plugin\x20list.\x0aIt\x20is\x20a\x20Tier\x20%2\x20plugin\x20placed\x20over\x20other\x20Tier\x20%3\x20plugins.\x0aPlease\x20reorder\x20the\x20plugin\x20list\x20from\x20smallest\x20to\x20largest\x20tier\x20numbers.'['format'](_0x3ae0cb,_0x331d28,tier)),SceneManager[_0x3597a3(0x155)]()):tier=Math['max'](_0x331d28,tier);}VisuMZ[_0x3597a3(0x156)](VisuMZ[label][_0x3597a3(0x1a4)],_0x3e88b0[_0x3597a3(0x1ca)]);})(pluginData),PluginManager[_0x5a7aa0(0x190)](pluginData[_0x5a7aa0(0x157)],_0x5a7aa0(0x189),_0x1c5d82=>{var _0x30f08f=_0x5a7aa0;VisuMZ[_0x30f08f(0x156)](_0x1c5d82,_0x1c5d82);const _0x237907=$gameScreen['getBrightEffectsAdvBloomSettings']();_0x237907[_0x30f08f(0x136)]=_0x1c5d82[_0x30f08f(0x1cc)],_0x237907[_0x30f08f(0x134)]=_0x1c5d82['Brightness'],_0x237907[_0x30f08f(0x1ad)]=_0x1c5d82[_0x30f08f(0x135)],_0x237907[_0x30f08f(0x1a1)]=_0x1c5d82[_0x30f08f(0x193)],!SceneManager[_0x30f08f(0x115)]()&&($gameMap[_0x30f08f(0x1aa)]=undefined,$gameMap['_brightEffectsBloomVertBrightness']=undefined);}),PluginManager[_0x5a7aa0(0x190)](pluginData[_0x5a7aa0(0x157)],'BloomReset',_0x5d448c=>{var _0x326d92=_0x5a7aa0;VisuMZ[_0x326d92(0x156)](_0x5d448c,_0x5d448c);SceneManager[_0x326d92(0x115)]()?$gameTroop[_0x326d92(0x184)]():$gameMap['setupBrightEffectsAdvBloomFilter']();const _0x5c3183=$gameScreen[_0x326d92(0x110)]();_0x5c3183[_0x326d92(0x1a1)]=_0x5d448c['Duration'];}),PluginManager[_0x5a7aa0(0x190)](pluginData[_0x5a7aa0(0x157)],_0x5a7aa0(0x14a),_0x305152=>{var _0x5e8ce9=_0x5a7aa0;VisuMZ[_0x5e8ce9(0x156)](_0x305152,_0x305152);const _0x18bfea=$gameScreen[_0x5e8ce9(0x19a)]();_0x18bfea[_0x5e8ce9(0x18e)]=_0x305152['Blur'],_0x18bfea[_0x5e8ce9(0x1a1)]=_0x305152[_0x5e8ce9(0x193)];}),PluginManager[_0x5a7aa0(0x190)](pluginData[_0x5a7aa0(0x157)],'BlurReset',_0x163ca9=>{var _0x3942f0=_0x5a7aa0;VisuMZ[_0x3942f0(0x156)](_0x163ca9,_0x163ca9);SceneManager[_0x3942f0(0x115)]()?$gameTroop[_0x3942f0(0x1ae)]():$gameMap['setupBrightEffectsBlurFilter']();const _0x18861f=$gameScreen[_0x3942f0(0x19a)]();_0x18861f[_0x3942f0(0x1a1)]=_0x163ca9[_0x3942f0(0x193)];}),PluginManager[_0x5a7aa0(0x190)](pluginData[_0x5a7aa0(0x157)],_0x5a7aa0(0x127),_0x4e5384=>{var _0x1f442b=_0x5a7aa0;VisuMZ[_0x1f442b(0x156)](_0x4e5384,_0x4e5384);const _0x1af43e=$gameScreen[_0x1f442b(0x125)]();_0x1af43e[_0x1f442b(0x133)]=_0x4e5384[_0x1f442b(0x18b)],_0x1af43e[_0x1f442b(0x158)]=_0x4e5384[_0x1f442b(0x122)],_0x1af43e[_0x1f442b(0x196)]=_0x4e5384[_0x1f442b(0x15a)],_0x1af43e[_0x1f442b(0x13b)]=_0x4e5384[_0x1f442b(0x176)],_0x1af43e['angle']=_0x4e5384[_0x1f442b(0x17f)],_0x1af43e[_0x1f442b(0x1a1)]=_0x4e5384[_0x1f442b(0x193)],!SceneManager[_0x1f442b(0x115)]()&&($gameMap['_brightEffectsGodrayHorzSpeed']=undefined,$gameMap[_0x1f442b(0x19b)]=undefined);}),PluginManager['registerCommand'](pluginData['name'],'GodrayReset',_0x12f703=>{var _0x417064=_0x5a7aa0;VisuMZ[_0x417064(0x156)](_0x12f703,_0x12f703);SceneManager[_0x417064(0x115)]()?$gameTroop[_0x417064(0x187)]():$gameMap[_0x417064(0x187)]();const _0x496f1a=$gameScreen['getBrightEffectsGodraySettings']();_0x496f1a[_0x417064(0x1a1)]=_0x12f703['Duration'];}),PluginManager['registerCommand'](pluginData[_0x5a7aa0(0x157)],_0x5a7aa0(0x194),_0xedab9=>{var _0x50625f=_0x5a7aa0;VisuMZ[_0x50625f(0x156)](_0xedab9,_0xedab9);const _0x3dd82d=$gameScreen['getBrightEffectsColorAdjustSettings']();_0x3dd82d[_0x50625f(0x134)]=_0xedab9['Brightness'],_0x3dd82d['contrast']=_0xedab9['Contrast'],_0x3dd82d[_0x50625f(0x174)]=_0xedab9[_0x50625f(0x11e)],_0x3dd82d[_0x50625f(0x1a1)]=_0xedab9['Duration'],!SceneManager[_0x50625f(0x115)]()&&($gameMap[_0x50625f(0x1b5)]=undefined,$gameMap[_0x50625f(0x1d2)]=undefined);}),PluginManager[_0x5a7aa0(0x190)](pluginData[_0x5a7aa0(0x157)],_0x5a7aa0(0x11b),_0x4664b8=>{var _0x54afc7=_0x5a7aa0;VisuMZ[_0x54afc7(0x156)](_0x4664b8,_0x4664b8);SceneManager[_0x54afc7(0x115)]()?$gameTroop[_0x54afc7(0x154)]():$gameMap[_0x54afc7(0x154)]();const _0x167356=$gameScreen[_0x54afc7(0x1bc)]();_0x167356[_0x54afc7(0x1a1)]=_0x4664b8[_0x54afc7(0x193)];}),PluginManager[_0x5a7aa0(0x190)](pluginData[_0x5a7aa0(0x157)],_0x5a7aa0(0x181),_0x1b676a=>{var _0x373f3a=_0x5a7aa0;VisuMZ[_0x373f3a(0x156)](_0x1b676a,_0x1b676a);const _0x5fb0c1=$gameScreen['getBrightEffectsTiltShiftSettings']();_0x5fb0c1[_0x373f3a(0x197)]=_0x1b676a['Blur'],_0x5fb0c1[_0x373f3a(0x142)]=_0x1b676a['GradientBlur'],_0x5fb0c1[_0x373f3a(0x1a1)]=_0x1b676a[_0x373f3a(0x193)];}),PluginManager[_0x5a7aa0(0x190)](pluginData[_0x5a7aa0(0x157)],'TiltShiftReset',_0x167434=>{var _0x54c59e=_0x5a7aa0;VisuMZ['ConvertParams'](_0x167434,_0x167434);SceneManager[_0x54c59e(0x115)]()?$gameTroop[_0x54c59e(0x1ba)]():$gameMap[_0x54c59e(0x1ba)]();const _0x31f749=$gameScreen[_0x54c59e(0x130)]();_0x31f749[_0x54c59e(0x1a1)]=_0x167434[_0x54c59e(0x193)];}),SceneManager[_0x5a7aa0(0x115)]=function(){var _0xb5e6cc=_0x5a7aa0;return this['_scene']&&this[_0xb5e6cc(0x180)]['constructor']===Scene_Battle;},SceneManager[_0x5a7aa0(0x183)]=function(){var _0x34b245=_0x5a7aa0;return this[_0x34b245(0x180)]&&this[_0x34b245(0x180)]['constructor']===Scene_Map;},Game_Screen[_0x5a7aa0(0x13a)][_0x5a7aa0(0x160)]=function(_0xfb0f78,_0x64011c,_0x577354,_0x6e20fa){var _0x1c152d=_0x5a7aa0;SceneManager[_0x1c152d(0x115)]()?this[_0x1c152d(0x1c2)]={'bloomScale':_0xfb0f78,'brightness':_0x64011c,'threshold':_0x577354,'duration':_0x6e20fa||0x0}:this[_0x1c152d(0x131)]={'bloomScale':_0xfb0f78,'brightness':_0x64011c,'threshold':_0x577354,'duration':_0x6e20fa||0x0};},Game_Screen['prototype'][_0x5a7aa0(0x110)]=function(){var _0x2c1fd0=_0x5a7aa0;return SceneManager[_0x2c1fd0(0x115)]()?(this[_0x2c1fd0(0x1c2)]===undefined&&$gameTroop[_0x2c1fd0(0x184)](),this[_0x2c1fd0(0x1c2)]):(this[_0x2c1fd0(0x131)]===undefined&&$gameMap[_0x2c1fd0(0x184)](),this[_0x2c1fd0(0x131)]);},Game_Screen[_0x5a7aa0(0x13a)]['setBrightEffectsGodraySettings']=function(_0x9985f9,_0xcf8634,_0x55d9d2,_0x44aa34,_0x49b752,_0x434d93){var _0x2563ad=_0x5a7aa0;SceneManager[_0x2563ad(0x115)]()?this[_0x2563ad(0x12e)]={'visible':_0x9985f9,'speed':_0xcf8634,'gain':_0x55d9d2,'lacunarity':_0x44aa34,'angle':_0x49b752,'duration':_0x434d93||0x0}:this[_0x2563ad(0x114)]={'visible':_0x9985f9,'speed':_0xcf8634,'gain':_0x55d9d2,'lacunarity':_0x44aa34,'angle':_0x49b752,'duration':_0x434d93||0x0};},Game_Screen['prototype'][_0x5a7aa0(0x125)]=function(){var _0x5efbef=_0x5a7aa0;return SceneManager[_0x5efbef(0x115)]()?(this[_0x5efbef(0x12e)]===undefined&&$gameTroop[_0x5efbef(0x187)](),this[_0x5efbef(0x12e)]):(this[_0x5efbef(0x114)]===undefined&&$gameMap[_0x5efbef(0x187)](),this[_0x5efbef(0x114)]);},Game_Screen[_0x5a7aa0(0x13a)][_0x5a7aa0(0x139)]=function(_0x3683d6,_0x3ca600,_0x57a648,_0x4286e2){var _0x44c92a=_0x5a7aa0;SceneManager[_0x44c92a(0x115)]()?this[_0x44c92a(0x116)]={'brightness':_0x3683d6,'contrast':_0x3ca600,'saturate':_0x57a648,'duration':_0x4286e2||0x0}:this['_BrightEffectsColorAdjustSettingsMap']={'brightness':_0x3683d6,'contrast':_0x3ca600,'saturate':_0x57a648,'duration':_0x4286e2||0x0};},Game_Screen[_0x5a7aa0(0x13a)]['getBrightEffectsColorAdjustSettings']=function(){var _0x242574=_0x5a7aa0;return SceneManager[_0x242574(0x115)]()?(this['_BrightEffectsColorAdjustSettingsBattle']===undefined&&$gameTroop['setupBrightEffectsColorAdjustFilter'](),this[_0x242574(0x116)]):(this[_0x242574(0x161)]===undefined&&$gameMap[_0x242574(0x154)](),this['_BrightEffectsColorAdjustSettingsMap']);},Game_Screen['prototype'][_0x5a7aa0(0x1c8)]=function(_0x607232,_0x51e122,_0x5aff53){var _0x850f5b=_0x5a7aa0;SceneManager[_0x850f5b(0x115)]()?this['_BrightEffectsTiltShiftSettingsBattle']={'pixelBlur':_0x607232,'gradientBlur':_0x51e122,'duration':_0x5aff53||0x0}:this[_0x850f5b(0x186)]={'pixelBlur':_0x607232,'gradientBlur':_0x51e122,'duration':_0x5aff53||0x0};},Game_Screen[_0x5a7aa0(0x13a)][_0x5a7aa0(0x130)]=function(){var _0xa1539e=_0x5a7aa0;return SceneManager[_0xa1539e(0x115)]()?(this[_0xa1539e(0x13e)]===undefined&&$gameTroop['setupBrightEffectsTiltShiftFilter'](),this[_0xa1539e(0x13e)]):(this[_0xa1539e(0x186)]===undefined&&$gameMap[_0xa1539e(0x1ba)](),this[_0xa1539e(0x186)]);},Game_Screen[_0x5a7aa0(0x13a)]['setBrightEffectsBlurSettings']=function(_0x416b15,_0x3dec62){var _0x1a0d6e=_0x5a7aa0;SceneManager['isSceneBattle']()?this[_0x1a0d6e(0x11f)]={'blur':_0x416b15||0x0,'duration':_0x3dec62||0x0}:this[_0x1a0d6e(0x1bf)]={'blur':_0x416b15||0x0,'duration':_0x3dec62||0x0};},Game_Screen[_0x5a7aa0(0x13a)][_0x5a7aa0(0x19a)]=function(){var _0x271349=_0x5a7aa0;return SceneManager[_0x271349(0x115)]()?(this[_0x271349(0x11f)]===undefined&&$gameTroop[_0x271349(0x1ae)](),this[_0x271349(0x11f)]):(this[_0x271349(0x1bf)]===undefined&&$gameMap[_0x271349(0x1ae)](),this[_0x271349(0x1bf)]);},VisuMZ[_0x5a7aa0(0x119)]['Scene_Battle_start']=Scene_Battle[_0x5a7aa0(0x13a)][_0x5a7aa0(0x19e)],Scene_Battle[_0x5a7aa0(0x13a)][_0x5a7aa0(0x19e)]=function(){var _0x40b681=_0x5a7aa0;VisuMZ[_0x40b681(0x119)][_0x40b681(0x117)]['call'](this),$gameTroop[_0x40b681(0x198)]();},Game_Troop[_0x5a7aa0(0x13a)][_0x5a7aa0(0x198)]=function(){var _0x48ce9c=_0x5a7aa0;this[_0x48ce9c(0x184)](),this['setupBrightEffectsGodrayFilter'](),this[_0x48ce9c(0x154)](),this[_0x48ce9c(0x1ba)](),this['setupBrightEffectsBlurFilter']();},Game_Troop[_0x5a7aa0(0x13a)]['needBypassBrightEffectsSetup']=function(){var _0x352ae7=_0x5a7aa0;if(SceneManager[_0x352ae7(0x177)](Scene_Options))return!![];if(Imported[_0x352ae7(0x1b3)]){if(SceneManager[_0x352ae7(0x1a0)]())return!![];}return![];},Game_Troop[_0x5a7aa0(0x13a)][_0x5a7aa0(0x184)]=function(){var _0x347d18=_0x5a7aa0;if(this[_0x347d18(0x141)]())return;const _0x3de824=VisuMZ[_0x347d18(0x119)][_0x347d18(0x1a4)][_0x347d18(0x147)];var _0x4b58e6=_0x3de824['Scale'],_0x6ce898=_0x3de824[_0x347d18(0x19d)],_0x4a313b=_0x3de824[_0x347d18(0x135)];if(!!this['troop']()){var _0x324930=this[_0x347d18(0x175)]()['name'];if(_0x324930[_0x347d18(0x178)](/<BLOOM SCALE: (.*)>/i))var _0x4b58e6=Number(RegExp['$1'])||0x0;if(_0x324930[_0x347d18(0x178)](/<BLOOM BRIGHTNESS: (.*)>/i))var _0x6ce898=Number(RegExp['$1'])||0x0;if(_0x324930[_0x347d18(0x178)](/<BLOOM THRESHOLD: (.*)>/i))var _0x4a313b=Number(RegExp['$1'])||0x0;}$gameScreen[_0x347d18(0x160)](_0x4b58e6,_0x6ce898,_0x4a313b,0x0);},Game_Troop[_0x5a7aa0(0x13a)][_0x5a7aa0(0x187)]=function(){var _0x41edbb=_0x5a7aa0;if(this[_0x41edbb(0x141)]())return;const _0x2b5662=VisuMZ[_0x41edbb(0x119)]['Settings']['BattleGodray'];var _0x48a326=_0x2b5662[_0x41edbb(0x18b)],_0x3f318c=_0x2b5662['Speed'],_0x5b2695=_0x2b5662[_0x41edbb(0x15a)],_0x532690=_0x2b5662['Lacunarity'],_0xcae8d7=_0x2b5662[_0x41edbb(0x17f)];if(!!this[_0x41edbb(0x175)]()){var _0x4b162e=this['troop']()['name'];if(_0x4b162e[_0x41edbb(0x178)](/<GODRAY>/i))_0x48a326=!![];else _0x4b162e[_0x41edbb(0x178)](/<NO GODRAY>/i)&&(_0x48a326=![]);_0x4b162e[_0x41edbb(0x178)](/<GODRAY SPEED: (.*)>/i)&&(_0x3f318c=Number(RegExp['$1'])||0x0),_0x4b162e[_0x41edbb(0x178)](/<GODRAY GAIN: (.*)>/i)&&(_0x5b2695=Number(RegExp['$1'])||0x0),_0x4b162e[_0x41edbb(0x178)](/<GODRAY LACUNARITY: (.*)>/i)&&(_0x532690=Number(RegExp['$1'])||0x0),_0x4b162e['match'](/<GODRAY ANGLE: (.*)>/i)&&(_0xcae8d7=Number(RegExp['$1'])||0x0);}$gameScreen[_0x41edbb(0x16a)](_0x48a326,_0x3f318c,_0x5b2695,_0x532690,_0xcae8d7,0x0);},Game_Troop[_0x5a7aa0(0x13a)][_0x5a7aa0(0x154)]=function(){var _0x49659a=_0x5a7aa0;if(this[_0x49659a(0x141)]())return;const _0x4bd48f=VisuMZ[_0x49659a(0x119)][_0x49659a(0x1a4)][_0x49659a(0x16e)];var _0x5e9fad=_0x4bd48f[_0x49659a(0x19d)],_0x194538=_0x4bd48f[_0x49659a(0x173)],_0x1a5de7=_0x4bd48f[_0x49659a(0x11e)];if(!!this[_0x49659a(0x175)]()){var _0x2fc117=this['troop']()[_0x49659a(0x157)];if(_0x2fc117[_0x49659a(0x178)](/<COLOR ADJUST BRIGHTNESS: (.*)>/i))var _0x5e9fad=Number(RegExp['$1'])||0x0;if(_0x2fc117[_0x49659a(0x178)](/<COLOR ADJUST CONTRAST: (.*)>/i))var _0x194538=Number(RegExp['$1'])||0x0;if(_0x2fc117[_0x49659a(0x178)](/<COLOR ADJUST SATURATE: (.*)>/i))var _0x1a5de7=Number(RegExp['$1'])||0x0;}$gameScreen['setBrightEffectsColorAdjustSettings'](_0x5e9fad,_0x194538,_0x1a5de7,0x0);},Game_Troop[_0x5a7aa0(0x13a)][_0x5a7aa0(0x1ba)]=function(){var _0x1daa67=_0x5a7aa0;if(this[_0x1daa67(0x141)]())return;const _0x1645ab=VisuMZ[_0x1daa67(0x119)][_0x1daa67(0x1a4)][_0x1daa67(0x166)];let _0x53674b=_0x1645ab[_0x1daa67(0x1be)],_0x2c3ff3=_0x1645ab[_0x1daa67(0x168)];if(!!this[_0x1daa67(0x175)]()){const _0x59c2dc=this[_0x1daa67(0x175)]()[_0x1daa67(0x157)];_0x59c2dc['match'](/<(?:TILTSHIFT|TILT SHIFT) PIXEL BLUR:[ ](\d+)>/i)&&(_0x53674b=Number(RegExp['$1'])),_0x59c2dc['match'](/<(?:TILTSHIFT|TILT SHIFT) (?:GRAD|GRADIENT) BLUR:[ ](\d+)>/i)&&(_0x2c3ff3=Number(RegExp['$1']));}$gameScreen['setBrightEffectsTiltShiftSettings'](_0x53674b,_0x2c3ff3,0x0);},Game_Troop[_0x5a7aa0(0x13a)][_0x5a7aa0(0x1ae)]=function(){var _0x805091=_0x5a7aa0;if(this['needBypassBrightEffectsSetup']())return;let _0x3ff1db=0x0;if(!!this[_0x805091(0x175)]()){const _0x276c05=this[_0x805091(0x175)]()[_0x805091(0x157)];_0x276c05[_0x805091(0x178)](/<BLUR:[ ](.*?)>/i)&&(_0x3ff1db=Number(RegExp['$1']));}$gameScreen[_0x805091(0x1ac)](_0x3ff1db,0x0);},VisuMZ[_0x5a7aa0(0x119)][_0x5a7aa0(0x10f)]=Game_Map[_0x5a7aa0(0x13a)][_0x5a7aa0(0x140)],Game_Map['prototype'][_0x5a7aa0(0x140)]=function(_0xc0bde1){var _0x2f7c06=_0x5a7aa0;VisuMZ['BrightEffects']['Game_Map_setup']['call'](this,_0xc0bde1),!!$dataMap&&this[_0x2f7c06(0x198)]();},Game_Map[_0x5a7aa0(0x13a)][_0x5a7aa0(0x198)]=function(){var _0x1ac782=_0x5a7aa0;this[_0x1ac782(0x184)](),this[_0x1ac782(0x187)](),this['setupBrightEffectsColorAdjustFilter'](),this['setupBrightEffectsTiltShiftFilter'](),$gamePlayer[_0x1ac782(0x167)]();},Game_Map['prototype'][_0x5a7aa0(0x184)]=function(){var _0x4e121f=_0x5a7aa0;const _0x2632af=VisuMZ[_0x4e121f(0x119)][_0x4e121f(0x1a4)][_0x4e121f(0x1b0)];var _0x5efd49=_0x2632af['Scale'],_0x56e5e9=_0x2632af[_0x4e121f(0x19d)],_0x178f1a=_0x2632af[_0x4e121f(0x135)];this[_0x4e121f(0x153)]=undefined,this[_0x4e121f(0x185)]=undefined,this[_0x4e121f(0x1aa)]=undefined,this[_0x4e121f(0x1a7)]=undefined,this['_brightEffectsBloomHorzThreshold']=undefined,this[_0x4e121f(0x14b)]=undefined;if($dataMap){var _0x541b90=$dataMap['note']||'';if(_0x541b90[_0x4e121f(0x178)](/<BLOOM SCALE: (.*)>/i))var _0x5efd49=Number(RegExp['$1'])||0x0;if(_0x541b90['match'](/<BLOOM BRIGHTNESS: (.*)>/i))var _0x56e5e9=Number(RegExp['$1'])||0x0;if(_0x541b90[_0x4e121f(0x178)](/<BLOOM THRESHOLD: (.*)>/i))var _0x178f1a=Number(RegExp['$1'])||0x0;_0x541b90[_0x4e121f(0x178)](/<BLOOM (?:HORZ|HORIZONTAL) SCALE: (.*) TO (.*)>/i)&&(this['_brightEffectsBloomHorzScale']=[Number(RegExp['$1']),Number(RegExp['$2'])],this[_0x4e121f(0x185)]=undefined),_0x541b90['match'](/<BLOOM (?:VERT|VERTICAL) SCALE: (.*) TO (.*)>/i)&&(this[_0x4e121f(0x153)]=undefined,this[_0x4e121f(0x185)]=[Number(RegExp['$1']),Number(RegExp['$2'])]),_0x541b90[_0x4e121f(0x178)](/<BLOOM (?:HORZ|HORIZONTAL) BRIGHTNESS: (.*) TO (.*)>/i)&&(this['_brightEffectsBloomHorzBrightness']=[Number(RegExp['$1']),Number(RegExp['$2'])],this['_brightEffectsBloomVertBrightness']=undefined),_0x541b90[_0x4e121f(0x178)](/<BLOOM (?:VERT|VERTICAL) BRIGHTNESS: (.*) TO (.*)>/i)&&(this['_brightEffectsBloomHorzBrightness']=undefined,this[_0x4e121f(0x1a7)]=[Number(RegExp['$1']),Number(RegExp['$2'])]),_0x541b90[_0x4e121f(0x178)](/<BLOOM (?:HORZ|HORIZONTAL) THRESHOLD: (.*) TO (.*)>/i)&&(this['_brightEffectsBloomHorzThreshold']=[Number(RegExp['$1']),Number(RegExp['$2'])],this[_0x4e121f(0x14b)]=undefined),_0x541b90[_0x4e121f(0x178)](/<BLOOM (?:VERT|VERTICAL) THRESHOLD: (.*) TO (.*)>/i)&&(this[_0x4e121f(0x14f)]=undefined,this[_0x4e121f(0x14b)]=[Number(RegExp['$1']),Number(RegExp['$2'])]);}$gameScreen[_0x4e121f(0x160)](_0x5efd49,_0x56e5e9,_0x178f1a,0x0);},Game_Map[_0x5a7aa0(0x13a)][_0x5a7aa0(0x187)]=function(){var _0x424876=_0x5a7aa0;const _0x39b7d5=VisuMZ[_0x424876(0x119)]['Settings'][_0x424876(0x126)];var _0x4a5ce7=_0x39b7d5['Visible'],_0x27d983=_0x39b7d5[_0x424876(0x122)],_0x472a67=_0x39b7d5[_0x424876(0x15a)],_0x554332=_0x39b7d5['Lacunarity'],_0x50f440=_0x39b7d5[_0x424876(0x17f)];this[_0x424876(0x15e)]=undefined,this[_0x424876(0x19b)]=undefined,this['_brightEffectsGodrayHorzGain']=undefined,this[_0x424876(0x13d)]=undefined,this[_0x424876(0x17d)]=undefined,this[_0x424876(0x123)]=undefined,this[_0x424876(0x1bd)]=undefined,this[_0x424876(0x1c0)]=undefined;if($dataMap){var _0x225134=$dataMap[_0x424876(0x16d)]||'';if(_0x225134[_0x424876(0x178)](/<GODRAY>/i))_0x4a5ce7=!![];else _0x225134[_0x424876(0x178)](/<NO GODRAY>/i)&&(_0x4a5ce7=![]);_0x225134[_0x424876(0x178)](/<GODRAY SPEED: (.*)>/i)&&(_0x27d983=Number(RegExp['$1'])||0x0),_0x225134[_0x424876(0x178)](/<GODRAY GAIN: (.*)>/i)&&(_0x472a67=Number(RegExp['$1'])||0x0),_0x225134[_0x424876(0x178)](/<GODRAY LACUNARITY: (.*)>/i)&&(_0x554332=Number(RegExp['$1'])||0x0),_0x225134[_0x424876(0x178)](/<GODRAY ANGLE: (.*)>/i)&&(_0x50f440=Number(RegExp['$1'])||0x0),_0x225134[_0x424876(0x178)](/<GODRAY (?:HORZ|HORIZONTAL) SPEED: (.*) TO (.*)>/i)&&(this[_0x424876(0x15e)]=[Number(RegExp['$1']),Number(RegExp['$2'])],this[_0x424876(0x19b)]=undefined),_0x225134[_0x424876(0x178)](/<GODRAY (?:VERT|VERTICAL) SPEED: (.*) TO (.*)>/i)&&(this[_0x424876(0x15e)]=undefined,this[_0x424876(0x19b)]=[Number(RegExp['$1']),Number(RegExp['$2'])]),_0x225134['match'](/<GODRAY (?:HORZ|HORIZONTAL) GAIN: (.*) TO (.*)>/i)&&(this[_0x424876(0x1a6)]=[Number(RegExp['$1']),Number(RegExp['$2'])],this['_brightEffectsGodrayVertGain']=undefined),_0x225134[_0x424876(0x178)](/<GODRAY (?:VERT|VERTICAL) GAIN: (.*) TO (.*)>/i)&&(this[_0x424876(0x1a6)]=undefined,this[_0x424876(0x13d)]=[Number(RegExp['$1']),Number(RegExp['$2'])]),_0x225134[_0x424876(0x178)](/<GODRAY (?:HORZ|HORIZONTAL) LACUNARITY: (.*) TO (.*)>/i)&&(this[_0x424876(0x17d)]=[Number(RegExp['$1']),Number(RegExp['$2'])],this[_0x424876(0x123)]=undefined),_0x225134[_0x424876(0x178)](/<GODRAY (?:VERT|VERTICAL) LACUNARITY: (.*) TO (.*)>/i)&&(this[_0x424876(0x17d)]=undefined,this[_0x424876(0x123)]=[Number(RegExp['$1']),Number(RegExp['$2'])]),_0x225134[_0x424876(0x178)](/<GODRAY (?:HORZ|HORIZONTAL) ANGLE: (.*) TO (.*)>/i)&&(this[_0x424876(0x1bd)]=[Number(RegExp['$1']),Number(RegExp['$2'])],this[_0x424876(0x1c0)]=undefined),_0x225134[_0x424876(0x178)](/<GODRAY (?:VERT|VERTICAL) ANGLE: (.*) TO (.*)>/i)&&(this[_0x424876(0x1bd)]=undefined,this[_0x424876(0x1c0)]=[Number(RegExp['$1']),Number(RegExp['$2'])]);}$gameScreen[_0x424876(0x16a)](_0x4a5ce7,_0x27d983,_0x472a67,_0x554332,_0x50f440,0x0);},Game_Map[_0x5a7aa0(0x13a)][_0x5a7aa0(0x154)]=function(){var _0x35dd66=_0x5a7aa0;const _0xbd2fa=VisuMZ['BrightEffects'][_0x35dd66(0x1a4)][_0x35dd66(0x1c6)];var _0x1e8434=_0xbd2fa[_0x35dd66(0x19d)],_0x6fe98c=_0xbd2fa[_0x35dd66(0x173)],_0x3c448a=_0xbd2fa[_0x35dd66(0x11e)];this[_0x35dd66(0x1d6)]=undefined,this[_0x35dd66(0x14d)]=undefined,this[_0x35dd66(0x16f)]=undefined,this[_0x35dd66(0x12a)]=undefined,this[_0x35dd66(0x1b5)]=undefined,this['_brightEffectsColorAdjustVertSaturate']=undefined;if($dataMap){var _0x39d107=$dataMap[_0x35dd66(0x16d)]||'';if(_0x39d107[_0x35dd66(0x178)](/<COLOR ADJUST BRIGHTNESS: (.*)>/i))var _0x1e8434=Number(RegExp['$1'])||0x0;if(_0x39d107[_0x35dd66(0x178)](/<COLOR ADJUST CONTRAST: (.*)>/i))var _0x6fe98c=Number(RegExp['$1'])||0x0;if(_0x39d107['match'](/<COLOR ADJUST SATURATE: (.*)>/i))var _0x3c448a=Number(RegExp['$1'])||0x0;_0x39d107['match'](/<COLOR ADJUST (?:HORZ|HORIZONTAL) BRIGHTNESS: (.*) TO (.*)>/i)&&(this[_0x35dd66(0x1d6)]=[Number(RegExp['$1']),Number(RegExp['$2'])],this[_0x35dd66(0x14d)]=undefined),_0x39d107[_0x35dd66(0x178)](/<COLOR ADJUST (?:VERT|VERTICAL) BRIGHTNESS: (.*) TO (.*)>/i)&&(this['_brightEffectsColorAdjustHorzBrightness']=undefined,this[_0x35dd66(0x14d)]=[Number(RegExp['$1']),Number(RegExp['$2'])]),_0x39d107[_0x35dd66(0x178)](/<COLOR ADJUST (?:HORZ|HORIZONTAL) CONTRAST: (.*) TO (.*)>/i)&&(this[_0x35dd66(0x16f)]=[Number(RegExp['$1']),Number(RegExp['$2'])],this[_0x35dd66(0x12a)]=undefined),_0x39d107[_0x35dd66(0x178)](/<COLOR ADJUST (?:VERT|VERTICAL) CONTRAST: (.*) TO (.*)>/i)&&(this[_0x35dd66(0x16f)]=undefined,this[_0x35dd66(0x12a)]=[Number(RegExp['$1']),Number(RegExp['$2'])]),_0x39d107['match'](/<COLOR ADJUST (?:HORZ|HORIZONTAL) SATURATE: (.*) TO (.*)>/i)&&(this[_0x35dd66(0x1b5)]=[Number(RegExp['$1']),Number(RegExp['$2'])],this['_brightEffectsColorAdjustVertSaturate']=undefined),_0x39d107[_0x35dd66(0x178)](/<COLOR ADJUST (?:VERT|VERTICAL) SATURATE: (.*) TO (.*)>/i)&&(this[_0x35dd66(0x1b5)]=undefined,this[_0x35dd66(0x1d2)]=[Number(RegExp['$1']),Number(RegExp['$2'])]);}$gameScreen[_0x35dd66(0x139)](_0x1e8434,_0x6fe98c,_0x3c448a,0x0);},Game_Map[_0x5a7aa0(0x13a)][_0x5a7aa0(0x1ba)]=function(){var _0x400a86=_0x5a7aa0;const _0x4eb984=VisuMZ[_0x400a86(0x119)][_0x400a86(0x1a4)][_0x400a86(0x1ce)];let _0x395521=_0x4eb984['Blur'],_0x450ce7=_0x4eb984['GradientBlur'];if($dataMap){const _0xedd17=$dataMap[_0x400a86(0x16d)]||'';_0xedd17['match'](/<(?:TILTSHIFT|TILT SHIFT) PIXEL BLUR:[ ](\d+)>/i)&&(_0x395521=Number(RegExp['$1'])),_0xedd17['match'](/<(?:TILTSHIFT|TILT SHIFT) (?:GRAD|GRADIENT) BLUR:[ ](\d+)>/i)&&(_0x450ce7=Number(RegExp['$1']));}$gameScreen[_0x400a86(0x1c8)](_0x395521,_0x450ce7,0x0);},Game_Map[_0x5a7aa0(0x13a)][_0x5a7aa0(0x1ae)]=function(){var _0x324b4a=_0x5a7aa0;let _0x1d5c24=0x0;if($dataMap){const _0x4e9acd=$dataMap[_0x324b4a(0x16d)]||'';_0x4e9acd['match'](/<BLUR:[ ](.*?)>/i)&&(_0x1d5c24=Number(RegExp['$1']));}$gameScreen['setBrightEffectsBlurSettings'](_0x1d5c24,0x0);},VisuMZ[_0x5a7aa0(0x119)][_0x5a7aa0(0x171)]=Game_CharacterBase[_0x5a7aa0(0x13a)][_0x5a7aa0(0x188)],Game_CharacterBase[_0x5a7aa0(0x13a)][_0x5a7aa0(0x188)]=function(_0x4a5d1f,_0x5740ec){var _0x4e2920=_0x5a7aa0;VisuMZ[_0x4e2920(0x119)][_0x4e2920(0x171)][_0x4e2920(0x1a9)](this,_0x4a5d1f,_0x5740ec),this===$gamePlayer&&this[_0x4e2920(0x167)]();},VisuMZ[_0x5a7aa0(0x119)]['Game_Player_update']=Game_Player[_0x5a7aa0(0x13a)][_0x5a7aa0(0x137)],Game_Player[_0x5a7aa0(0x13a)]['update']=function(_0x4a74a5){var _0x305e06=_0x5a7aa0;VisuMZ[_0x305e06(0x119)]['Game_Player_update'][_0x305e06(0x1a9)](this,_0x4a74a5),this['updateMapBrightEffects']();},Game_Player[_0x5a7aa0(0x13a)][_0x5a7aa0(0x167)]=function(){var _0x51b47f=_0x5a7aa0;if(ConfigManager[_0x51b47f(0x11d)]===![])return;this['updateMapBrightEffectsAdvBloom'](),this[_0x51b47f(0x113)](),this[_0x51b47f(0x1d0)]();},Game_Player[_0x5a7aa0(0x13a)][_0x5a7aa0(0x12b)]=function(){var _0x1a1128=_0x5a7aa0,_0x298a98=$gameScreen[_0x1a1128(0x110)](),_0x3e1a77=_0x298a98[_0x1a1128(0x136)],_0x4d6933=_0x298a98[_0x1a1128(0x134)],_0x1ccabf=_0x298a98[_0x1a1128(0x1ad)];if($gameMap[_0x1a1128(0x153)]!==undefined)var _0x5cbe45=$gameMap['_brightEffectsBloomHorzScale'][0x0],_0x39a70e=$gameMap['_brightEffectsBloomHorzScale'][0x1]-_0x5cbe45,_0x5e9cc4=$gamePlayer[_0x1a1128(0x19f)]/$gameMap[_0x1a1128(0x172)](),_0x3e1a77=_0x5cbe45+_0x39a70e*_0x5e9cc4;else{if($gameMap[_0x1a1128(0x185)]!==undefined)var _0x5cbe45=$gameMap[_0x1a1128(0x185)][0x0],_0x39a70e=$gameMap[_0x1a1128(0x185)][0x1]-_0x5cbe45,_0x5e9cc4=$gamePlayer[_0x1a1128(0x1b2)]/$gameMap['height'](),_0x3e1a77=_0x5cbe45+_0x39a70e*_0x5e9cc4;}if($gameMap[_0x1a1128(0x1aa)]!==undefined)var _0x5cbe45=$gameMap['_brightEffectsBloomHorzBrightness'][0x0],_0x39a70e=$gameMap[_0x1a1128(0x1aa)][0x1]-_0x5cbe45,_0x5e9cc4=$gamePlayer[_0x1a1128(0x19f)]/$gameMap['width'](),_0x4d6933=_0x5cbe45+_0x39a70e*_0x5e9cc4;else{if($gameMap[_0x1a1128(0x1a7)]!==undefined)var _0x5cbe45=$gameMap[_0x1a1128(0x1a7)][0x0],_0x39a70e=$gameMap[_0x1a1128(0x1a7)][0x1]-_0x5cbe45,_0x5e9cc4=$gamePlayer[_0x1a1128(0x1b2)]/$gameMap[_0x1a1128(0x14e)](),_0x4d6933=_0x5cbe45+_0x39a70e*_0x5e9cc4;}if($gameMap[_0x1a1128(0x14f)]!==undefined)var _0x5cbe45=$gameMap[_0x1a1128(0x14f)][0x0],_0x39a70e=$gameMap[_0x1a1128(0x14f)][0x1]-_0x5cbe45,_0x5e9cc4=$gamePlayer[_0x1a1128(0x19f)]/$gameMap[_0x1a1128(0x172)](),_0x1ccabf=_0x5cbe45+_0x39a70e*_0x5e9cc4;else{if($gameMap['_brightEffectsBloomVertThreshold']!==undefined)var _0x5cbe45=$gameMap[_0x1a1128(0x14b)][0x0],_0x39a70e=$gameMap['_brightEffectsBloomVertThreshold'][0x1]-_0x5cbe45,_0x5e9cc4=$gamePlayer['_realY']/$gameMap[_0x1a1128(0x14e)](),_0x1ccabf=_0x5cbe45+_0x39a70e*_0x5e9cc4;}$gameScreen[_0x1a1128(0x160)](_0x3e1a77,_0x4d6933,_0x1ccabf,_0x298a98[_0x1a1128(0x1a1)]);},Game_Player['prototype'][_0x5a7aa0(0x113)]=function(){var _0x762d81=_0x5a7aa0,_0x552f86=$gameScreen[_0x762d81(0x125)](),_0xebf304=_0x552f86['visible'],_0x47509e=_0x552f86[_0x762d81(0x158)],_0x1b7281=_0x552f86[_0x762d81(0x196)],_0x3f309d=_0x552f86[_0x762d81(0x13b)],_0x2e81f4=_0x552f86[_0x762d81(0x1b6)];if($gameMap[_0x762d81(0x15e)]!==undefined)var _0x4661f8=$gameMap[_0x762d81(0x15e)][0x0],_0x1e13b5=$gameMap[_0x762d81(0x15e)][0x1]-_0x4661f8,_0xf18e99=$gamePlayer['_realX']/$gameMap[_0x762d81(0x172)](),_0x47509e=_0x4661f8+_0x1e13b5*_0xf18e99;else{if($gameMap[_0x762d81(0x185)]!==undefined)var _0x4661f8=$gameMap[_0x762d81(0x19b)][0x0],_0x1e13b5=$gameMap[_0x762d81(0x19b)][0x1]-_0x4661f8,_0xf18e99=$gamePlayer['_realY']/$gameMap['height'](),_0x47509e=_0x4661f8+_0x1e13b5*_0xf18e99;}if($gameMap[_0x762d81(0x1a6)]!==undefined)var _0x4661f8=$gameMap[_0x762d81(0x1a6)][0x0],_0x1e13b5=$gameMap[_0x762d81(0x1a6)][0x1]-_0x4661f8,_0xf18e99=$gamePlayer[_0x762d81(0x19f)]/$gameMap[_0x762d81(0x172)](),_0x1b7281=_0x4661f8+_0x1e13b5*_0xf18e99;else{if($gameMap[_0x762d81(0x13d)]!==undefined)var _0x4661f8=$gameMap[_0x762d81(0x13d)][0x0],_0x1e13b5=$gameMap[_0x762d81(0x13d)][0x1]-_0x4661f8,_0xf18e99=$gamePlayer[_0x762d81(0x1b2)]/$gameMap[_0x762d81(0x14e)](),_0x1b7281=_0x4661f8+_0x1e13b5*_0xf18e99;}if($gameMap[_0x762d81(0x17d)]!==undefined)var _0x4661f8=$gameMap['_brightEffectsGodrayHorzLacunarity'][0x0],_0x1e13b5=$gameMap[_0x762d81(0x17d)][0x1]-_0x4661f8,_0xf18e99=$gamePlayer['_realX']/$gameMap[_0x762d81(0x172)](),_0x3f309d=_0x4661f8+_0x1e13b5*_0xf18e99;else{if($gameMap[_0x762d81(0x123)]!==undefined)var _0x4661f8=$gameMap[_0x762d81(0x123)][0x0],_0x1e13b5=$gameMap['_brightEffectsGodrayVertLacunarity'][0x1]-_0x4661f8,_0xf18e99=$gamePlayer[_0x762d81(0x1b2)]/$gameMap[_0x762d81(0x14e)](),_0x3f309d=_0x4661f8+_0x1e13b5*_0xf18e99;}if($gameMap['_brightEffectsGodrayHorzAngle']!==undefined)var _0x4661f8=$gameMap[_0x762d81(0x1bd)][0x0],_0x1e13b5=$gameMap['_brightEffectsGodrayHorzAngle'][0x1]-_0x4661f8,_0xf18e99=$gamePlayer[_0x762d81(0x19f)]/$gameMap[_0x762d81(0x172)](),_0x2e81f4=_0x4661f8+_0x1e13b5*_0xf18e99;else{if($gameMap[_0x762d81(0x1c0)]!==undefined)var _0x4661f8=$gameMap['_brightEffectsGodrayVertAngle'][0x0],_0x1e13b5=$gameMap[_0x762d81(0x1c0)][0x1]-_0x4661f8,_0xf18e99=$gamePlayer[_0x762d81(0x1b2)]/$gameMap[_0x762d81(0x14e)](),_0x2e81f4=_0x4661f8+_0x1e13b5*_0xf18e99;}$gameScreen[_0x762d81(0x16a)](_0xebf304,_0x47509e,_0x1b7281,_0x3f309d,_0x2e81f4,_0x552f86['duration']);},Game_Player[_0x5a7aa0(0x13a)][_0x5a7aa0(0x1d0)]=function(){var _0x1e4902=_0x5a7aa0,_0x30b4b3=$gameScreen['getBrightEffectsColorAdjustSettings'](),_0x448952=_0x30b4b3['brightness'],_0x7d00f9=_0x30b4b3['contrast'],_0x25b55b=_0x30b4b3[_0x1e4902(0x174)];if($gameMap['_brightEffectsColorAdjustHorzBrightness']!==undefined)var _0x3e0283=$gameMap[_0x1e4902(0x1d6)][0x0],_0x27a14b=$gameMap[_0x1e4902(0x1d6)][0x1]-_0x3e0283,_0xaf5436=$gamePlayer[_0x1e4902(0x19f)]/$gameMap[_0x1e4902(0x172)](),_0x448952=_0x3e0283+_0x27a14b*_0xaf5436;else{if($gameMap['_brightEffectsColorAdjustVertBrightness']!==undefined)var _0x3e0283=$gameMap[_0x1e4902(0x14d)][0x0],_0x27a14b=$gameMap['_brightEffectsColorAdjustVertBrightness'][0x1]-_0x3e0283,_0xaf5436=$gamePlayer[_0x1e4902(0x1b2)]/$gameMap['height'](),_0x448952=_0x3e0283+_0x27a14b*_0xaf5436;}if($gameMap[_0x1e4902(0x16f)]!==undefined)var _0x3e0283=$gameMap['_brightEffectsColorAdjustHorzContrast'][0x0],_0x27a14b=$gameMap[_0x1e4902(0x16f)][0x1]-_0x3e0283,_0xaf5436=$gamePlayer[_0x1e4902(0x19f)]/$gameMap[_0x1e4902(0x172)](),_0x7d00f9=_0x3e0283+_0x27a14b*_0xaf5436;else{if($gameMap[_0x1e4902(0x12a)]!==undefined)var _0x3e0283=$gameMap[_0x1e4902(0x12a)][0x0],_0x27a14b=$gameMap[_0x1e4902(0x12a)][0x1]-_0x3e0283,_0xaf5436=$gamePlayer[_0x1e4902(0x1b2)]/$gameMap[_0x1e4902(0x14e)](),_0x7d00f9=_0x3e0283+_0x27a14b*_0xaf5436;}if($gameMap[_0x1e4902(0x1b5)]!==undefined)var _0x3e0283=$gameMap[_0x1e4902(0x1b5)][0x0],_0x27a14b=$gameMap['_brightEffectsColorAdjustHorzSaturate'][0x1]-_0x3e0283,_0xaf5436=$gamePlayer[_0x1e4902(0x19f)]/$gameMap['width'](),_0x25b55b=_0x3e0283+_0x27a14b*_0xaf5436;else{if($gameMap[_0x1e4902(0x1d2)]!==undefined)var _0x3e0283=$gameMap[_0x1e4902(0x1d2)][0x0],_0x27a14b=$gameMap[_0x1e4902(0x1d2)][0x1]-_0x3e0283,_0xaf5436=$gamePlayer[_0x1e4902(0x1b2)]/$gameMap[_0x1e4902(0x14e)](),_0x25b55b=_0x3e0283+_0x27a14b*_0xaf5436;}$gameScreen[_0x1e4902(0x139)](_0x448952,_0x7d00f9,_0x25b55b,_0x30b4b3[_0x1e4902(0x1a1)]);},Spriteset_Base[_0x5a7aa0(0x1c4)]=![],Spriteset_Map[_0x5a7aa0(0x1c4)]=VisuMZ[_0x5a7aa0(0x119)][_0x5a7aa0(0x1a4)][_0x5a7aa0(0x191)],Spriteset_Battle[_0x5a7aa0(0x1c4)]=VisuMZ[_0x5a7aa0(0x119)][_0x5a7aa0(0x1a4)][_0x5a7aa0(0x150)],Spriteset_Base['prototype'][_0x5a7aa0(0x182)]=function(){return Spriteset_Base['BRIGHT_EFFECTS_BASE_ONLY'];},Spriteset_Map[_0x5a7aa0(0x13a)][_0x5a7aa0(0x182)]=function(){return Spriteset_Map['BRIGHT_EFFECTS_BASE_ONLY'];},Spriteset_Battle[_0x5a7aa0(0x13a)][_0x5a7aa0(0x182)]=function(){var _0x4fc250=_0x5a7aa0;return Spriteset_Battle[_0x4fc250(0x1c4)];},VisuMZ['BrightEffects'][_0x5a7aa0(0x12c)]=Spriteset_Base[_0x5a7aa0(0x13a)]['createOverallFilters'],Spriteset_Base[_0x5a7aa0(0x13a)]['createOverallFilters']=function(){var _0xb4ceb5=_0x5a7aa0;VisuMZ[_0xb4ceb5(0x119)][_0xb4ceb5(0x12c)][_0xb4ceb5(0x1a9)](this),this['createBrightEffectsFilters']();},VisuMZ[_0x5a7aa0(0x119)][_0x5a7aa0(0x15b)]=Spriteset_Base[_0x5a7aa0(0x13a)][_0x5a7aa0(0x137)],Spriteset_Base[_0x5a7aa0(0x13a)]['update']=function(){var _0x5c2688=_0x5a7aa0;VisuMZ[_0x5c2688(0x119)][_0x5c2688(0x15b)]['call'](this),this[_0x5c2688(0x121)]();},Spriteset_Map[_0x5a7aa0(0x13a)]['getMapEnhanceScreenY']=function(){var _0x3a3dad=_0x5a7aa0;const _0x2bddcf=$gameScreen['zoomScale']();let _0xd0396b=0x0;if(Imported[_0x3a3dad(0x1d5)]&&$gameScreen[_0x3a3dad(0x14c)]()[_0x3a3dad(0x151)])_0xd0396b=Graphics[_0x3a3dad(0x14e)]/0x2,_0xd0396b-=$gameMap['tileHeight']()*0.5*_0x2bddcf;else{const _0x4ebc5b=Imported[_0x3a3dad(0x1d5)]?$gameScreen[_0x3a3dad(0x12f)](!![]):$gamePlayer,_0x9319f9=this['findTargetSprite'](_0x4ebc5b);_0x9319f9&&(_0xd0396b=_0x4ebc5b[_0x3a3dad(0x1c9)]()*_0x2bddcf,_0xd0396b-=_0x9319f9[_0x3a3dad(0x14e)]*0.5,_0xd0396b-=_0x4ebc5b['shiftY']()*_0x2bddcf*0.5);}return _0xd0396b;},Spriteset_Base[_0x5a7aa0(0x13a)][_0x5a7aa0(0x1ab)]=function(){var _0x2d7837=_0x5a7aa0;return Graphics[_0x2d7837(0x14e)]/0x2;},Spriteset_Base[_0x5a7aa0(0x13a)][_0x5a7aa0(0x17a)]=function(){var _0x67122e=_0x5a7aa0;if(ConfigManager[_0x67122e(0x11d)]===![])return;this['filters']=this[_0x67122e(0x162)]||[],this[_0x67122e(0x15f)](),this['createBrightEffectsGodrayFilter'](),this[_0x67122e(0x12d)](),this[_0x67122e(0x11c)](),this[_0x67122e(0x120)](),this[_0x67122e(0x121)]();},Spriteset_Base[_0x5a7aa0(0x13a)][_0x5a7aa0(0x121)]=function(){var _0x5c63d3=_0x5a7aa0;this[_0x5c63d3(0x1c7)](),this['updateBrightEffectsGodrayFilter'](),this[_0x5c63d3(0x1af)](),this[_0x5c63d3(0x165)](),this[_0x5c63d3(0x1b1)]();},Spriteset_Base[_0x5a7aa0(0x13a)]['createBrightEffectsAdvBloomFilter']=function(){var _0x25ad7f=_0x5a7aa0;if(!PIXI[_0x25ad7f(0x162)]['AdvancedBloomFilter'])return;this[_0x25ad7f(0x17e)]=new PIXI[(_0x25ad7f(0x162))][(_0x25ad7f(0x19c))]();this[_0x25ad7f(0x182)]()?this[_0x25ad7f(0x199)][_0x25ad7f(0x162)][_0x25ad7f(0x1a8)](this[_0x25ad7f(0x17e)]):this[_0x25ad7f(0x162)][_0x25ad7f(0x1a8)](this[_0x25ad7f(0x17e)]);var _0xe369b0=$gameScreen['getBrightEffectsAdvBloomSettings']();_0xe369b0&&SceneManager[_0x25ad7f(0x115)]()&&(_0xe369b0['duration']=Math[_0x25ad7f(0x1cd)](0x1,_0xe369b0[_0x25ad7f(0x1a1)])),_0xe369b0&&_0xe369b0[_0x25ad7f(0x1a1)]>0x0&&(this[_0x25ad7f(0x17e)][_0x25ad7f(0x136)]=_0xe369b0[_0x25ad7f(0x136)],this[_0x25ad7f(0x17e)][_0x25ad7f(0x134)]=_0xe369b0[_0x25ad7f(0x134)],this[_0x25ad7f(0x17e)][_0x25ad7f(0x1ad)]=_0xe369b0['threshold']);},Spriteset_Base[_0x5a7aa0(0x13a)][_0x5a7aa0(0x1c7)]=function(){var _0x3e3bc9=_0x5a7aa0;if(!!this[_0x3e3bc9(0x17e)]){var _0x41e9b2=$gameScreen[_0x3e3bc9(0x110)](),_0xf8ecfb=_0x41e9b2['duration'];_0xf8ecfb<=0x0?(this[_0x3e3bc9(0x17e)]['bloomScale']=_0x41e9b2['bloomScale'],this[_0x3e3bc9(0x17e)]['brightness']=_0x41e9b2[_0x3e3bc9(0x134)],this[_0x3e3bc9(0x17e)][_0x3e3bc9(0x1ad)]=_0x41e9b2[_0x3e3bc9(0x1ad)]):(_0x41e9b2[_0x3e3bc9(0x1a1)]--,this[_0x3e3bc9(0x17e)]['bloomScale']=(this['_BrightEffectsAdvBloomFilter'][_0x3e3bc9(0x136)]*(_0xf8ecfb-0x1)+_0x41e9b2[_0x3e3bc9(0x136)])/_0xf8ecfb,this['_BrightEffectsAdvBloomFilter'][_0x3e3bc9(0x134)]=(this[_0x3e3bc9(0x17e)]['brightness']*(_0xf8ecfb-0x1)+_0x41e9b2[_0x3e3bc9(0x134)])/_0xf8ecfb,this[_0x3e3bc9(0x17e)][_0x3e3bc9(0x1ad)]=(this[_0x3e3bc9(0x17e)][_0x3e3bc9(0x1ad)]*(_0xf8ecfb-0x1)+_0x41e9b2['threshold'])/_0xf8ecfb);}},Spriteset_Base[_0x5a7aa0(0x13a)][_0x5a7aa0(0x11a)]=function(){var _0x12e603=_0x5a7aa0;if(!PIXI[_0x12e603(0x162)][_0x12e603(0x164)])return;this[_0x12e603(0x192)]=new PIXI[(_0x12e603(0x162))][(_0x12e603(0x164))](),this[_0x12e603(0x192)]['enabled']=![],this[_0x12e603(0x192)][_0x12e603(0x144)]=0x0;this[_0x12e603(0x182)]()?this[_0x12e603(0x199)][_0x12e603(0x162)]['push'](this[_0x12e603(0x192)]):this['filters'][_0x12e603(0x1a8)](this[_0x12e603(0x192)]);var _0x5837b9=$gameScreen[_0x12e603(0x125)]();_0x5837b9&&SceneManager[_0x12e603(0x115)]()&&(_0x5837b9[_0x12e603(0x1a1)]=Math[_0x12e603(0x1cd)](0x1,_0x5837b9['duration'])),_0x5837b9&&_0x5837b9['duration']>0x0&&(this['_BrightEffectsGodrayFilter'][_0x12e603(0x158)]=_0x5837b9['speed'],this[_0x12e603(0x192)][_0x12e603(0x196)]=_0x5837b9[_0x12e603(0x196)],this[_0x12e603(0x192)][_0x12e603(0x13b)]=_0x5837b9['lacunarity'],this['_BrightEffectsGodrayFilter'][_0x12e603(0x1b6)]=_0x5837b9[_0x12e603(0x1b6)]);},Spriteset_Base[_0x5a7aa0(0x13a)][_0x5a7aa0(0x129)]=function(){var _0x3fd5ae=_0x5a7aa0;if(!!this[_0x3fd5ae(0x192)]){var _0x40853c=$gameScreen[_0x3fd5ae(0x125)](),_0x3a15be=_0x40853c[_0x3fd5ae(0x1a1)];_0x3a15be<=0x0?(this['_BrightEffectsGodrayFilter'][_0x3fd5ae(0x158)]=_0x40853c[_0x3fd5ae(0x158)],this[_0x3fd5ae(0x192)][_0x3fd5ae(0x196)]=_0x40853c[_0x3fd5ae(0x196)],this[_0x3fd5ae(0x192)][_0x3fd5ae(0x13b)]=_0x40853c[_0x3fd5ae(0x13b)],this[_0x3fd5ae(0x192)][_0x3fd5ae(0x1b6)]=_0x40853c['angle']):(_0x40853c[_0x3fd5ae(0x1a1)]--,this['_BrightEffectsGodrayFilter']['speed']=(this['_BrightEffectsGodrayFilter']['speed']*(_0x3a15be-0x1)+_0x40853c[_0x3fd5ae(0x158)])/_0x3a15be,this[_0x3fd5ae(0x192)][_0x3fd5ae(0x196)]=(this[_0x3fd5ae(0x192)][_0x3fd5ae(0x196)]*(_0x3a15be-0x1)+_0x40853c[_0x3fd5ae(0x196)])/_0x3a15be,this[_0x3fd5ae(0x192)]['lacunarity']=(this['_BrightEffectsGodrayFilter']['lacunarity']*(_0x3a15be-0x1)+_0x40853c['lacunarity'])/_0x3a15be,this['_BrightEffectsGodrayFilter'][_0x3fd5ae(0x1b6)]=(this[_0x3fd5ae(0x192)][_0x3fd5ae(0x1b6)]*(_0x3a15be-0x1)+_0x40853c[_0x3fd5ae(0x1b6)])/_0x3a15be),this[_0x3fd5ae(0x192)][_0x3fd5ae(0x144)]+=this[_0x3fd5ae(0x192)]['speed'],this[_0x3fd5ae(0x192)][_0x3fd5ae(0x13c)]=_0x40853c['visible'];}},Spriteset_Base[_0x5a7aa0(0x13a)]['createBrightEffectsColorAdjustFilter']=function(){var _0x4bbe8e=_0x5a7aa0;if(!PIXI['filters'][_0x4bbe8e(0x18c)])return;this[_0x4bbe8e(0x15c)]=new PIXI[(_0x4bbe8e(0x162))][(_0x4bbe8e(0x18c))]();this['brightEffectsBaseOnly']()?this[_0x4bbe8e(0x199)][_0x4bbe8e(0x162)][_0x4bbe8e(0x1a8)](this[_0x4bbe8e(0x15c)]):this[_0x4bbe8e(0x162)]['push'](this[_0x4bbe8e(0x15c)]);var _0x547802=$gameScreen[_0x4bbe8e(0x1bc)]();_0x547802&&SceneManager[_0x4bbe8e(0x115)]()&&(_0x547802[_0x4bbe8e(0x1a1)]=Math['max'](0x1,_0x547802[_0x4bbe8e(0x1a1)])),_0x547802&&_0x547802[_0x4bbe8e(0x1a1)]>0x0&&(this[_0x4bbe8e(0x15c)][_0x4bbe8e(0x1c1)]=_0x547802['brightness'],this[_0x4bbe8e(0x15c)]['currentContrast']=_0x547802[_0x4bbe8e(0x118)],this[_0x4bbe8e(0x15c)]['currentSaturate']=_0x547802[_0x4bbe8e(0x174)]);},Spriteset_Base[_0x5a7aa0(0x13a)]['updateBrightEffectsColorAdjustFilter']=function(){var _0x166487=_0x5a7aa0;if(!!this[_0x166487(0x15c)]){var _0x4773a5=$gameScreen['getBrightEffectsColorAdjustSettings'](),_0x4ec9fb=_0x4773a5[_0x166487(0x1a1)];_0x4ec9fb<=0x0?(this[_0x166487(0x15c)][_0x166487(0x1c1)]=_0x4773a5[_0x166487(0x134)],this['_BrightEffectsColorAdjustFilter'][_0x166487(0x1d3)]=_0x4773a5[_0x166487(0x118)],this[_0x166487(0x15c)][_0x166487(0x132)]=_0x4773a5[_0x166487(0x174)]):(_0x4773a5[_0x166487(0x1a1)]--,this['_BrightEffectsColorAdjustFilter'][_0x166487(0x1c1)]=(this[_0x166487(0x15c)][_0x166487(0x1c1)]*(_0x4ec9fb-0x1)+_0x4773a5[_0x166487(0x134)])/_0x4ec9fb,this['_BrightEffectsColorAdjustFilter'][_0x166487(0x1d3)]=(this[_0x166487(0x15c)][_0x166487(0x1d3)]*(_0x4ec9fb-0x1)+_0x4773a5[_0x166487(0x118)])/_0x4ec9fb,this['_BrightEffectsColorAdjustFilter'][_0x166487(0x132)]=(this[_0x166487(0x15c)]['currentSaturate']*(_0x4ec9fb-0x1)+_0x4773a5[_0x166487(0x174)])/_0x4ec9fb),this[_0x166487(0x15c)]['brightness'](this[_0x166487(0x15c)][_0x166487(0x1c1)]),this[_0x166487(0x15c)][_0x166487(0x118)](this['_BrightEffectsColorAdjustFilter']['currentContrast'],!![]),this[_0x166487(0x15c)][_0x166487(0x174)](this[_0x166487(0x15c)]['currentSaturate'],!![]);}},Spriteset_Base[_0x5a7aa0(0x1a5)]=null,Spriteset_Base['TILT_SHIFT_BATTLE_FILTER']=null,Spriteset_Base[_0x5a7aa0(0x13a)][_0x5a7aa0(0x11c)]=function(){var _0x209228=_0x5a7aa0;if(!PIXI[_0x209228(0x162)]['TiltShiftFilter'])return;const _0x9a714f=this['getTiltShiftFilter']();this[_0x209228(0x1a3)]=_0x9a714f;this[_0x209228(0x182)]()?this[_0x209228(0x199)][_0x209228(0x162)]['push'](_0x9a714f):this[_0x209228(0x162)][_0x209228(0x1a8)](_0x9a714f);var _0x5bd497=$gameScreen[_0x209228(0x130)]();_0x5bd497&&SceneManager[_0x209228(0x115)]()&&(_0x5bd497[_0x209228(0x1a1)]=Math['max'](0x1,_0x5bd497[_0x209228(0x1a1)])),_0x5bd497&&(_0x5bd497[_0x209228(0x1a1)]>0x0&&(_0x9a714f[_0x209228(0x15d)]=_0x5bd497[_0x209228(0x197)],_0x9a714f['currentGradientBlur']=_0x5bd497['gradientBlur'])),this['updateBrightEffectsTiltShiftFilter'](!![]);},Spriteset_Base[_0x5a7aa0(0x13a)][_0x5a7aa0(0x179)]=function(){var _0x222595=_0x5a7aa0;return SceneManager[_0x222595(0x115)]()?Spriteset_Base[_0x222595(0x18a)]:Spriteset_Base[_0x222595(0x1a5)];},VisuMZ[_0x5a7aa0(0x119)][_0x5a7aa0(0x1c5)]=Scene_Boot[_0x5a7aa0(0x13a)][_0x5a7aa0(0x1d1)],Scene_Boot[_0x5a7aa0(0x13a)][_0x5a7aa0(0x1d1)]=function(){var _0x53c5e8=_0x5a7aa0;VisuMZ[_0x53c5e8(0x119)][_0x53c5e8(0x1c5)][_0x53c5e8(0x1a9)](this);if(!PIXI['filters'][_0x53c5e8(0x170)])return;Spriteset_Base[_0x53c5e8(0x1a5)]=new PIXI[(_0x53c5e8(0x162))][(_0x53c5e8(0x170))](),Spriteset_Base[_0x53c5e8(0x18a)]=new PIXI[(_0x53c5e8(0x162))][(_0x53c5e8(0x170))]();},Spriteset_Battle[_0x5a7aa0(0x13a)][_0x5a7aa0(0x179)]=function(){var _0x595ab0=_0x5a7aa0;return new PIXI[(_0x595ab0(0x162))][(_0x595ab0(0x170))]();},Spriteset_Base[_0x5a7aa0(0x13a)][_0x5a7aa0(0x165)]=function(_0x150e34){var _0x21a012=_0x5a7aa0;if(!this['_BrightEffectsTiltShiftFilter'])return;const _0x4aeefb=this['getMapEnhanceScreenY']()+0.5;this[_0x21a012(0x138)](_0x4aeefb,_0x150e34),this[_0x21a012(0x149)]();},Spriteset_Base['prototype'][_0x5a7aa0(0x138)]=function(_0x5b3b0b,_0x3ac2ef){var _0x1556e9=_0x5a7aa0;let _0x2ca434=_0x3ac2ef?0xfa0:0x8;if(this[_0x1556e9(0x1a3)][_0x1556e9(0x19e)]['y']>_0x5b3b0b)this[_0x1556e9(0x1a3)][_0x1556e9(0x19e)]={'x':0x0,'y':Math[_0x1556e9(0x1cd)](this['_BrightEffectsTiltShiftFilter'][_0x1556e9(0x19e)]['y']-_0x2ca434,_0x5b3b0b)},this[_0x1556e9(0x1a3)][_0x1556e9(0x163)]={'x':0x258,'y':Math[_0x1556e9(0x1cd)](this[_0x1556e9(0x1a3)][_0x1556e9(0x163)]['y']-_0x2ca434,_0x5b3b0b)};else this[_0x1556e9(0x1a3)][_0x1556e9(0x19e)]['y']<_0x5b3b0b&&(this[_0x1556e9(0x1a3)][_0x1556e9(0x19e)]={'x':0x0,'y':Math['min'](this[_0x1556e9(0x1a3)][_0x1556e9(0x19e)]['y']+_0x2ca434,_0x5b3b0b)},this[_0x1556e9(0x1a3)][_0x1556e9(0x163)]={'x':0x258,'y':Math['min'](this[_0x1556e9(0x1a3)]['end']['y']+_0x2ca434,_0x5b3b0b)});},Spriteset_Base[_0x5a7aa0(0x13a)][_0x5a7aa0(0x149)]=function(){var _0x3f619d=_0x5a7aa0;const _0x23be55=this[_0x3f619d(0x1a3)];var _0x6442a4=$gameScreen['getBrightEffectsTiltShiftSettings'](),_0x5a9c16=_0x6442a4[_0x3f619d(0x1a1)];_0x5a9c16<=0x0?(_0x23be55[_0x3f619d(0x15d)]=_0x6442a4[_0x3f619d(0x197)],_0x23be55['currentGradientBlur']=_0x6442a4[_0x3f619d(0x142)]):(_0x6442a4['duration']--,_0x23be55[_0x3f619d(0x15d)]=(_0x23be55[_0x3f619d(0x15d)]*(_0x5a9c16-0x1)+_0x6442a4[_0x3f619d(0x197)])/_0x5a9c16,_0x23be55['currentGradientBlur']=(_0x23be55['currentGradientBlur']*(_0x5a9c16-0x1)+_0x6442a4[_0x3f619d(0x142)])/_0x5a9c16),_0x23be55[_0x3f619d(0x18e)]=_0x23be55['currentPixelBlur'],_0x23be55[_0x3f619d(0x142)]=_0x23be55['currentGradientBlur'];},Spriteset_Base[_0x5a7aa0(0x13a)][_0x5a7aa0(0x120)]=function(){var _0x249b8e=_0x5a7aa0;const _0x1d60a9=new PIXI['filters'][(_0x249b8e(0x10e))]();this[_0x249b8e(0x1bb)]=_0x1d60a9;this[_0x249b8e(0x182)]()?this[_0x249b8e(0x199)][_0x249b8e(0x162)][_0x249b8e(0x1a8)](_0x1d60a9):this[_0x249b8e(0x162)][_0x249b8e(0x1a8)](_0x1d60a9);var _0x20f344=$gameScreen[_0x249b8e(0x19a)]();_0x20f344&&SceneManager[_0x249b8e(0x115)]()&&(_0x20f344['duration']=Math['max'](0x1,_0x20f344[_0x249b8e(0x1a1)])),_0x20f344&&_0x20f344['duration']>0x0&&(_0x1d60a9[_0x249b8e(0x112)]=_0x20f344[_0x249b8e(0x18e)]);},Spriteset_Base[_0x5a7aa0(0x13a)][_0x5a7aa0(0x1b1)]=function(){var _0x474bc6=_0x5a7aa0;if(!!this[_0x474bc6(0x1bb)]){var _0x31d4db=$gameScreen['getBrightEffectsBlurSettings'](),_0x6f749c=_0x31d4db[_0x474bc6(0x1a1)];_0x6f749c<=0x0?this['_BrightEffectsBlurFilter'][_0x474bc6(0x112)]=_0x31d4db[_0x474bc6(0x18e)]:(_0x31d4db['duration']--,this[_0x474bc6(0x1bb)][_0x474bc6(0x112)]=(this[_0x474bc6(0x1bb)][_0x474bc6(0x112)]*(_0x6f749c-0x1)+_0x31d4db[_0x474bc6(0x18e)])/_0x6f749c),this[_0x474bc6(0x1bb)][_0x474bc6(0x18e)]=this['_BrightEffectsBlurFilter']['currentBlur'];}};function _0x2447(){var _0x4a6813=['_brightEffectsColorAdjustHorzSaturate','angle','ARRAYJSON','EVAL','status','setupBrightEffectsTiltShiftFilter','_BrightEffectsBlurFilter','getBrightEffectsColorAdjustSettings','_brightEffectsGodrayHorzAngle','Blur','_BrightEffectsBlurSettingsMap','_brightEffectsGodrayVertAngle','currentBrightness','_BrightEffectsAdvBloomSettingsBattle','767712AccxwC','BRIGHT_EFFECTS_BASE_ONLY','Scene_Boot_onDatabaseLoaded','MapColorAdjust','updateBrightEffectsAdvBloomFilter','setBrightEffectsTiltShiftSettings','screenY','parameters','STR','Scale','max','MapTiltShift','map','updateMapBrightEffectsColorAdjust','onDatabaseLoaded','_brightEffectsColorAdjustVertSaturate','currentContrast','description','VisuMZ_3_MapCameraZoom','_brightEffectsColorAdjustHorzBrightness','BlurFilter','Game_Map_setup','getBrightEffectsAdvBloomSettings','NUM','currentBlur','updateMapBrightEffectsGodray','_BrightEffectsGodraySettingsMap','isSceneBattle','_BrightEffectsColorAdjustSettingsBattle','Scene_Battle_start','contrast','BrightEffects','createBrightEffectsGodrayFilter','ColorAdjustReset','createBrightEffectsTiltShiftFilter','specialEffects','Saturate','_BrightEffectsBlurSettingsBattle','createBrightEffectsBlurFilter','updateBrightEffectsFilters','Speed','_brightEffectsGodrayVertLacunarity','128625wbzQLf','getBrightEffectsGodraySettings','MapGodray','GodrayChange','format','updateBrightEffectsGodrayFilter','_brightEffectsColorAdjustVertContrast','updateMapBrightEffectsAdvBloom','Spriteset_Base_createOverallFilters','createBrightEffectsColorAdjustFilter','_BrightEffectsGodraySettingsBattle','mapCameraFocusTarget','getBrightEffectsTiltShiftSettings','_BrightEffectsAdvBloomSettingsMap','currentSaturate','visible','brightness','Threshold','bloomScale','update','setMapEnhanceTiltShiftFilterY','setBrightEffectsColorAdjustSettings','prototype','lacunarity','enabled','_brightEffectsGodrayVertGain','_BrightEffectsTiltShiftSettingsBattle','%1\x27s\x20version\x20does\x20not\x20match\x20plugin\x27s.\x20Please\x20update\x20it\x20in\x20the\x20Plugin\x20Manager.','setup','needBypassBrightEffectsSetup','gradientBlur','ARRAYSTRUCT','time','filter','return\x200','BattleBloom','%1\x20is\x20missing\x20a\x20required\x20plugin.\x0aPlease\x20install\x20%2\x20into\x20the\x20Plugin\x20Manager.','updateBrightEffectsTiltShiftFilterProperties','BlurChange','_brightEffectsBloomVertThreshold','mapCameraSettings','_brightEffectsColorAdjustVertBrightness','height','_brightEffectsBloomHorzThreshold','BattleBaseFilter','tileFocus','474824adZMqU','_brightEffectsBloomHorzScale','setupBrightEffectsColorAdjustFilter','exit','ConvertParams','name','speed','64NscHQe','Gain','Spriteset_Base_update','_BrightEffectsColorAdjustFilter','currentPixelBlur','_brightEffectsGodrayHorzSpeed','createBrightEffectsAdvBloomFilter','setBrightEffectsAdvBloomSettings','_BrightEffectsColorAdjustSettingsMap','filters','end','GodrayFilter','updateBrightEffectsTiltShiftFilter','BattleTiltShift','updateMapBrightEffects','GradientBlur','FUNC','setBrightEffectsGodraySettings','JSON','parse','note','BattleColorAdjust','_brightEffectsColorAdjustHorzContrast','TiltShiftFilter','Game_CharacterBase_locate','width','Contrast','saturate','troop','Lacunarity','isPreviousScene','match','getTiltShiftFilter','createBrightEffectsFilters','7907juDFGT','toUpperCase','_brightEffectsGodrayHorzLacunarity','_BrightEffectsAdvBloomFilter','Angle','_scene','TiltShiftChange','brightEffectsBaseOnly','isSceneMap','setupBrightEffectsAdvBloomFilter','_brightEffectsBloomVertScale','_BrightEffectsTiltShiftSettingsMap','setupBrightEffectsGodrayFilter','locate','BloomChange','TILT_SHIFT_BATTLE_FILTER','Visible','ColorMatrixFilter','1479530FfkeyI','blur','ARRAYFUNC','registerCommand','MapBaseFilter','_BrightEffectsGodrayFilter','Duration','ColorAdjustChange','2678270asmLxt','gain','pixelBlur','setupBrightEffectsFilters','_baseSprite','getBrightEffectsBlurSettings','_brightEffectsGodrayVertSpeed','AdvancedBloomFilter','Brightness','start','_realX','isPreviousSceneBattleTransitionable','duration','STRUCT','_BrightEffectsTiltShiftFilter','Settings','TILT_SHIFT_MAP_FILTER','_brightEffectsGodrayHorzGain','_brightEffectsBloomVertBrightness','push','call','_brightEffectsBloomHorzBrightness','getMapEnhanceScreenY','setBrightEffectsBlurSettings','threshold','setupBrightEffectsBlurFilter','updateBrightEffectsColorAdjustFilter','MapBloom','updateBrightEffectsBlurFilter','_realY','VisuMZ_1_BattleCore','7343456YwwPvd'];_0x2447=function(){return _0x4a6813;};return _0x2447();}