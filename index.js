/**
 * Persona Extensions Plugin
 * Main extension initialization file
 */

import { eventSource, event_types } from "/script.js";
import { user_avatar } from "/scripts/personas.js";
import {
  injectPersonaExtensions,
  initPersonaExtensionsHook,
  resetPersonaExtensionsState,
} from "./prompt-injection.js";
import { createExtensionsContainer, renderExtensionsUI } from "./ui.js";
import {
  loadSettings,
  isExtensionEnabled,
  initSettingsUI,
} from "./settings.js";

let lastAvatarId = user_avatar;

/**
 * Plugin initialization
 */
function init() {
  console.log("[User Persona Extended]: Extension initialized");

  // Load settings first
  loadSettings();

  // Initialize handlers for persona restoration after generation
  initPersonaExtensionsHook();

  // Function to create UI container
  const tryCreateContainer = () => {
    if (!$("#PersonaManagement").length || !$("#persona_description").length) {
      return false;
    }

    if ($("#persona_extensions_container").length) {
      renderExtensionsUI();
      return false;
    }

    createExtensionsContainer();
    return true;
  };

  // Wait for full application load
  eventSource.on(event_types.APP_READY, () => {
    setTimeout(tryCreateContainer, 200);
  });

  // Try to create container immediately after initialization (if DOM is ready)
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    setTimeout(tryCreateContainer, 200);
  } else {
    $(document).ready(() => setTimeout(tryCreateContainer, 200));
  }

  // Track Persona Management panel opening
  $(document).on("click", "#persona-management-button", () => {
    setTimeout(tryCreateContainer, 100);
  });

  // Track persona avatar clicks
  $(document).on("click", "#user_avatar_block .avatar-container", () => {
    setTimeout(tryCreateContainer, 100);
  });

  // Listen for changes via events on description element
  eventSource.on(event_types.CHAT_CHANGED, () => {
    if (user_avatar !== lastAvatarId) {
      lastAvatarId = user_avatar;
      resetPersonaExtensionsState(user_avatar);
      setTimeout(() => {
        renderExtensionsUI();
      }, 100);
    }
  });

  // Inject extensions before generation
  eventSource.on(event_types.GENERATION_STARTED, async () => {
    if (isExtensionEnabled()) {
      injectPersonaExtensions(user_avatar);
    }
  });
}

// Start initialization on load
try {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    setTimeout(init, 100);
  }

  // Initialize settings UI when extensions are ready
  eventSource.on(event_types.EXTENSION_SETTINGS_LOADED, () => {
    setTimeout(initSettingsUI, 200);
  });
} catch (error) {
  console.error("[User Persona Extended]: Initialization error:", error);
}
