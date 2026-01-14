/**
 * Persona Extensions - UI Module
 * Creation and management of extension UI elements
 */

import { getPersonaExtensions, savePersonaExtensions } from "./data.js";
import { user_avatar } from "/scripts/personas.js";

/**
 * Generates unique ID for extension
 * @returns {string} Unique ID
 */
function generateExtensionId() {
  return `ext_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Creates HTML template for extension field
 * @param {Object} extensionData Extension data {id, title, description, enabled}
 * @param {number} index Field index (for display purposes)
 * @param {number} total Total number of extensions
 * @returns {string} HTML string
 */
function createExtensionFieldTemplate(
  extensionData = { id: "", title: "", description: "", enabled: true },
  index = 0,
  total = 0
) {
  const id = extensionData.id || generateExtensionId();
  const title = extensionData.title || `Extension #${index + 1}`;
  const description = extensionData.description || "";
  const enabled = extensionData.enabled !== false;

  const upDisabled = index === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : '';
  const downDisabled = index === total - 1 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : '';

  return `
        <div class="inline-drawer" data-extension-id="${id}">
            <div class="inline-drawer-header" style="cursor: default;">
                <div class="flex-container alignitemscenter margin0" style="width: 100%; padding-right: 25px;">
                    <b class="persona_extension_title_text" style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-right: 10px;">${title}</b>
                    
                    <div class="flex-container alignitemscenter margin0" style="flex-shrink: 0; gap: 10px;">
                        <label class="checkbox_label margin0" style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                            <input type="checkbox" class="persona_extension_field_enabled" data-extension-id="${id}" ${enabled ? "checked" : ""}>
                            <span>Enabled</span>
                        </label>
                        
                        <div class="flex-container margin0" style="gap: 5px;">
                            <button type="button" class="menu_button margin0 persona_extension_move_up" data-extension-id="${id}" title="Move Up" ${upDisabled}>
                                <i class="fa-solid fa-arrow-up"></i>
                            </button>
                            <button type="button" class="menu_button margin0 persona_extension_move_down" data-extension-id="${id}" title="Move Down" ${downDisabled}>
                                <i class="fa-solid fa-arrow-down"></i>
                            </button>
                            <button type="button" class="menu_button margin0 persona_extension_delete" data-extension-id="${id}" title="Delete">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down persona_extension_toggle" style="cursor: pointer;" data-extension-id="${id}"></div>
            </div>
            <div class="inline-drawer-content" style="display: none;">
                <label style="display: block; margin-bottom: 5px;">Title:</label>
                <input type="text" class="text_pole persona_extension_title" data-extension-id="${id}" placeholder="Title" value="${title}" style="margin-bottom: 10px;">
                <label style="display: block; margin-bottom: 5px;">Description:</label>
                <textarea class="text_pole textarea_compact persona_extension_description" data-extension-id="${id}" placeholder="Description" rows="4">${description}</textarea>
            </div>
        </div>
    `;
}

/**
 * Renders UI for persona extensions
 * @param {boolean} force Force re-render even if length is the same
 */
export function renderExtensionsUI(force = false) {
  const $container = $("#persona_extensions_container");
  if (!$container.length) return;

  const $fieldsContainer = $container.find(".persona_extensions_fields");
  if (!$fieldsContainer.length) return;

  const extensions = getPersonaExtensions(user_avatar);
  const $currentFields = $fieldsContainer.find(".inline-drawer");

  // Re-render if length changed OR if forced (e.g., after reordering)
  // Field values are updated directly via input/change events
  if (force || $currentFields.length !== extensions.length) {
    // Save state of open blocks by ID
    const openStates = {};
    $currentFields.each((idx, field) => {
      const $field = $(field);
      const extensionId = $field.data("extension-id");
      const $content = $field.find(".inline-drawer-content");
      if ($content.is(":visible") && extensionId) {
        openStates[extensionId] = true;
      }
    });

    // Clear and recreate all fields
    $fieldsContainer.empty();

    if (extensions.length === 0) {
      $fieldsContainer.append(`
                <div class="text_muted" style="padding: 10px;">
                    No additional descriptions. Click "+" to add.
                </div>
            `);
    } else {
      extensions.forEach((ext, index) => {
        // Ensure extension has an ID
        if (!ext.id) ext.id = generateExtensionId();

        const html = createExtensionFieldTemplate(ext, index, extensions.length);
        const $field = $(html);
        $fieldsContainer.append($field);

        // Restore open state by ID
        if (openStates[ext.id]) {
          $field.find(".inline-drawer-content").show();
          const $icon = $field.find(".inline-drawer-icon");
          $icon
            .removeClass("down fa-circle-chevron-down")
            .addClass("up fa-circle-chevron-up");
        }
      });

      // Save extensions if IDs were added
      const needsSave = extensions.some((ext) => !ext.id);
      if (needsSave) {
        savePersonaExtensions(user_avatar, extensions);
      }
    }
  }
}

/**
 * Moves an extension up or down in the list
 * @param {string} extensionId 
 * @param {boolean} moveUp 
 */
function moveExtension(extensionId, moveUp) {
  const extensions = getPersonaExtensions(user_avatar);
  const index = extensions.findIndex(ext => ext.id === extensionId);

  if (index === -1) return;

  const targetIndex = moveUp ? index - 1 : index + 1;

  // Boundary check
  if (targetIndex < 0 || targetIndex >= extensions.length) return;

  // Swap elements
  [extensions[index], extensions[targetIndex]] = [extensions[targetIndex], extensions[index]];

  savePersonaExtensions(user_avatar, extensions);
  renderExtensionsUI(true); // Force re-render to reflect new order
}

// Flag to track handler initialization
let eventHandlersInitialized = false;

/**
 * Initializes event handlers via delegation on document
 * Called once when module loads
 */
function initEventHandlers() {
  if (eventHandlersInitialized) return;
  eventHandlersInitialized = true;

  // Handle text input
  $(document).on(
    "input",
    ".persona_extension_title, .persona_extension_description",
    function () {
      const $input = $(this);
      const extensionId = $input.data("extension-id");
      if (!extensionId) return;

      // Always get fresh data from storage
      const extensions = getPersonaExtensions(user_avatar);
      const extensionIndex = extensions.findIndex(
        (ext) => ext.id === extensionId
      );
      if (extensionIndex === -1) return;

      const extension = extensions[extensionIndex];

      if ($input.hasClass("persona_extension_title")) {
        extension.title = $input.val();
        // Update header title
        const displayIndex = extensionIndex + 1;
        $input
          .closest(".inline-drawer")
          .find(".persona_extension_title_text")
          .text($input.val() || `Extension #${displayIndex}`);
      } else if ($input.hasClass("persona_extension_description")) {
        extension.description = $input.val();
      }

      // Save changes
      savePersonaExtensions(user_avatar, extensions);
    }
  );

  // Handle checkbox change
  $(document).on("change", ".persona_extension_field_enabled", function () {
    const $checkbox = $(this);
    const extensionId = $checkbox.data("extension-id");
    if (!extensionId) return;

    // Always get fresh data from storage
    const extensions = getPersonaExtensions(user_avatar);
    const extensionIndex = extensions.findIndex(
      (ext) => ext.id === extensionId
    );
    if (extensionIndex !== -1) {
      extensions[extensionIndex].enabled = $checkbox.prop("checked");
      // Save changes
      savePersonaExtensions(user_avatar, extensions);
    }
  });

  // Handle delete button click
  $(document).on("click", ".persona_extension_delete", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const $button = $(this);
    const extensionId = $button.data("extension-id");
    if (!extensionId) return;

    // Always get fresh data from storage
    const extensions = getPersonaExtensions(user_avatar);
    const extensionIndex = extensions.findIndex(
      (ext) => ext.id === extensionId
    );
    if (extensionIndex !== -1) {
      // Remove element by ID
      extensions.splice(extensionIndex, 1);
      // Save changes
      savePersonaExtensions(user_avatar, extensions);
      // Re-render UI
      setTimeout(() => {
        renderExtensionsUI();
      }, 0);
    }
  });

  // Handle toggle icon click
  $(document).on("click", ".persona_extension_toggle", function (e) {
    e.stopPropagation();
    const $icon = $(this);
    const $drawer = $icon.closest(".inline-drawer");
    const $content = $drawer.find(".inline-drawer-content");

    if ($content.is(":visible")) {
      $content.hide();
      $icon
        .removeClass("up fa-circle-chevron-up")
        .addClass("down fa-circle-chevron-down");
    } else {
      $content.show();
      $icon
        .removeClass("down fa-circle-chevron-down")
        .addClass("up fa-circle-chevron-up");
    }

    $drawer.trigger("inline-drawer-toggle");
  });

  // Handle add button click
  $(document).on("click", ".persona_extension_add", addExtensionField);

  $(document).on("click", ".persona_extension_move_up, .persona_extension_move_down", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const $button = $(this);
    const extensionId = $button.data("extension-id");
    const isUp = $button.hasClass("persona_extension_move_up");

    if (extensionId) {
      moveExtension(extensionId, isUp);
    }
  });
}

/**
 * Adds new extension field
 */
export function addExtensionField() {
  // Always get fresh data from storage
  const extensions = getPersonaExtensions(user_avatar);
  const newId = generateExtensionId();

  // Add new element with unique ID
  extensions.push({
    id: newId,
    title: "",
    description: "",
    enabled: true,
  });

  // Save changes
  savePersonaExtensions(user_avatar, extensions);

  // Re-render UI
  setTimeout(() => {
    renderExtensionsUI();

    // Automatically open dropdown of new block and focus on title field
    setTimeout(() => {
      const $newField = $(`.inline-drawer[data-extension-id="${newId}"]`);
      if ($newField.length) {
        const $content = $newField.find(".inline-drawer-content");
        const $icon = $newField.find(".inline-drawer-icon");
        $content.show();
        $icon
          .removeClass("down fa-circle-chevron-down")
          .addClass("up fa-circle-chevron-up");

        const $titleInput = $newField.find(".persona_extension_title");
        if ($titleInput.length) {
          setTimeout(() => $titleInput.focus(), 50);
        }
      }
    }, 50);
  }, 0);
}

/**
 * Creates container for extension UI
 */
export function createExtensionsContainer() {
  // Check if container already exists
  if ($("#persona_extensions_container").length) {
    return;
  }

  const $personaManagementBlock = $("#PersonaManagement");
  if (!$personaManagementBlock.length) {
    return;
  }

  const $personaDescriptionSection = $personaManagementBlock.find(
    ".persona_management_current_persona"
  );
  if (!$personaDescriptionSection.length) {
    return;
  }

  // Create extensions container
  const containerHtml = `
        <div id="persona_extensions_container">
            <div class="flex-container justifySpaceBetween alignitemscenter" style="margin-bottom: 10px;">
                <h4 style="margin: 0;">Additional Descriptions</h4>
                <button type="button" class="menu_button persona_extension_add" title="Add description">
                    <i class="fa-solid fa-plus"></i>
                </button>
            </div>
            <div class="persona_extensions_fields"></div>
        </div>
    `;

  const $container = $(containerHtml);

  // Find container with description position
  const $positionContainer = $personaDescriptionSection.find(
    ".persona_management_description_position_container"
  );

  if ($positionContainer.length && $positionContainer.parent().length) {
    $positionContainer.after($container);
  } else {
    // Find Connections section
    let $connectionsSection = null;
    $personaDescriptionSection.find("h4").each(function () {
      const text = $(this).text().trim();
      if (
        text === "Connections" ||
        text === "Связи" ||
        text.includes("Connection")
      ) {
        $connectionsSection = $(this);
        return false;
      }
    });

    if ($connectionsSection && $connectionsSection.parent().length) {
      $connectionsSection.before($container);
    } else {
      $personaDescriptionSection.append($container);
    }
  }

  renderExtensionsUI();
}

/**
 * Sets up event delegation for extension fields
 * @deprecated Use initEventHandlers instead
 */
export function setupExtensionFieldsEventHandlers() {
  initEventHandlers();
}

/**
 * Checks if data update is in progress (to prevent re-rendering)
 * @deprecated No longer used
 * @returns {boolean}
 */
export function getIsUpdatingData() {
  return false;
}

// Initialize event handlers when module loads
jQuery(() => {
  initEventHandlers();
});
