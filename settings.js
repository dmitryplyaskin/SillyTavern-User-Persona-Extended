/**
 * User Persona Extended - Settings Module
 * Handles extension settings loading, saving and UI
 */

import { saveSettingsDebounced } from "/script.js";
import {
  extension_settings,
  renderExtensionTemplateAsync,
} from "../../../extensions.js";
import { accountStorage } from "/scripts/util/AccountStorage.js";
import { callGenericPopup, POPUP_TYPE } from "../../../popup.js";

/**
 * Extension settings key
 */
const SETTINGS_KEY = "userPersonaExtended";

/**
 * Storage key prefix for persona extensions
 */
const STORAGE_KEY_PREFIX = "user_persona_extended_";

/**
 * Default settings
 */
const defaultSettings = {
  enabled: true,
};

/**
 * Flag to track if settings UI has been initialized
 */
let settingsUIInitialized = false;

/**
 * Load settings from extension_settings
 */
export function loadSettings() {
  // Initialize settings if they don't exist
  if (!extension_settings[SETTINGS_KEY]) {
    extension_settings[SETTINGS_KEY] = { ...defaultSettings };
    saveSettingsDebounced();
  }

  // Ensure all default settings exist
  let shouldSave = false;
  for (const key in defaultSettings) {
    if (!(key in extension_settings[SETTINGS_KEY])) {
      extension_settings[SETTINGS_KEY][key] = defaultSettings[key];
      shouldSave = true;
    }
  }

  if (shouldSave) {
    saveSettingsDebounced();
  }

  // Update UI checkbox if it exists
  const $checkbox = $("#user-persona-extended-enabled");
  if ($checkbox.length) {
    $checkbox.prop("checked", extension_settings[SETTINGS_KEY].enabled);
  }
}

/**
 * Check if extension is enabled
 */
export function isExtensionEnabled() {
  // Ensure settings are loaded
  if (!extension_settings[SETTINGS_KEY]) {
    loadSettings();
  }
  // Return true if enabled is explicitly true, or if it's undefined (default enabled)
  return extension_settings[SETTINGS_KEY]?.enabled !== false;
}

/**
 * Clear all extension data
 * Deletes all persona extensions from accountStorage and resets extension settings
 */
export async function clearAllExtensionData() {
  // Show confirmation dialog
  const confirmed = await callGenericPopup(
    `<div class="text_pole">
      <p><strong>Are you sure you want to delete all extension data?</strong></p>
      <p>This will permanently delete:</p>
      <p>All saved persona extensions for all personas</p>
      <p>Extension settings (will be reset to defaults)</p>
      <p>This action cannot be undone.</p>
    </div>`,
    POPUP_TYPE.CONFIRM,
    "",
    { wide: true }
  );

  if (!confirmed) {
    return;
  }

  try {
    // Get all keys from accountStorage
    const state = accountStorage.getState();
    let deletedCount = 0;

    // Delete all keys that start with the storage prefix
    for (const key in state) {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        accountStorage.removeItem(key);
        deletedCount++;
      }
    }

    // Reset extension settings to defaults
    extension_settings[SETTINGS_KEY] = { ...defaultSettings };
    saveSettingsDebounced();

    // Show success message
    toastr.success(
      `Successfully deleted ${deletedCount} persona extension(s) and reset extension settings`,
      "Data Cleared"
    );

    // Reload settings to update UI
    loadSettings();

    // Emit event to refresh UI if needed
    if (typeof eventSource !== "undefined" && eventSource.emit) {
      await eventSource.emit("user-persona-extended-data-cleared");
    }
  } catch (error) {
    console.error("[User Persona Extended]: Error clearing data:", error);
    toastr.error("Failed to clear extension data", "Error");
  }
}

/**
 * Initialize settings UI
 */
export async function initSettingsUI() {
  // Prevent duplicate initialization
  if (settingsUIInitialized) {
    return;
  }

  // Check if settings container already exists
  if ($("#user_persona_extended_settings").length) {
    settingsUIInitialized = true;
    loadSettings();
    return;
  }

  try {
    const settingsHtml = await renderExtensionTemplateAsync(
      "third-party/SillyTavern-User-Persona-Extended",
      "settings"
    );

    const getContainer = () =>
      $(
        document.getElementById("user_persona_extended_settings_container") ??
          document.getElementById("extensions_settings")
      );

    const $container = getContainer();
    if (!$container.length) {
      console.warn(
        "[User Persona Extended]: Settings container not found, retrying later..."
      );
      return;
    }

    // Check again if settings were added by another call
    if ($("#user_persona_extended_settings").length) {
      settingsUIInitialized = true;
      loadSettings();
      return;
    }

    $container.append(settingsHtml);
    settingsUIInitialized = true;

    // Load settings
    loadSettings();

    // Handle checkbox change - use event delegation to prevent duplicates
    $(document)
      .off("change", "#user-persona-extended-enabled")
      .on("change", "#user-persona-extended-enabled", function () {
        extension_settings[SETTINGS_KEY].enabled = $(this).prop("checked");
        saveSettingsDebounced();
      });

    // Handle clear all data button
    $(document)
      .off("click", "#user-persona-extended-clear-all-data")
      .on("click", "#user-persona-extended-clear-all-data", async function () {
        await clearAllExtensionData();
      });
  } catch (error) {
    console.error(
      "[User Persona Extended]: Settings UI initialization error:",
      error
    );
  }
}
