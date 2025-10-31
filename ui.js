/**
 * Persona Extensions - UI Module
 * Creation and management of extension UI elements
 */

import { getPersonaExtensions, savePersonaExtensions } from "./data.js";
import { user_avatar } from "/scripts/personas.js";

/**
 * Creates HTML template for extension field
 * @param {Object} extensionData Extension data {title, description, enabled}
 * @param {number} index Field index
 * @returns {string} HTML string
 */
function createExtensionFieldTemplate(
  extensionData = { title: "", description: "", enabled: true },
  index = 0
) {
  const title = extensionData.title || `Extension #${index + 1}`;
  const description = extensionData.description || "";
  const enabled = extensionData.enabled !== false;

  return `
        <div class="inline-drawer" data-index="${index}">
            <div class="inline-drawer-header" style="cursor: default;">
                <div class="flex-container alignitemscenter margin0">
                    <b class="persona_extension_title_text">${title}</b>
                    <label class="checkbox_label margin0" style="margin-left: 10px; display: flex;">
                        <input type="checkbox" class="persona_extension_field_enabled" data-index="${index}" ${
    enabled ? "checked" : ""
  }>
                        <span>Enabled</span>
                    </label>
                    <button type="button" class="menu_button margin0 persona_extension_delete" data-index="${index}" style="margin-left: 10px;" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down persona_extension_toggle" style="cursor: pointer;" data-index="${index}"></div>
            </div>
            <div class="inline-drawer-content" style="display: none;">
                <label style="display: block; margin-bottom: 5px;">Title:</label>
                <input type="text" class="text_pole persona_extension_title" data-index="${index}" placeholder="Title" value="${title}" style="margin-bottom: 10px;">
                <label style="display: block; margin-bottom: 5px;">Description:</label>
                <textarea class="text_pole textarea_compact persona_extension_description" data-index="${index}" placeholder="Description" rows="4">${description}</textarea>
            </div>
        </div>
    `;
}

/**
 * Renders UI for persona extensions
 */
export function renderExtensionsUI() {
  const $container = $("#persona_extensions_container");
  if (!$container.length) return;

  const $fieldsContainer = $container.find(".persona_extensions_fields");
  if (!$fieldsContainer.length) return;

  // Always get fresh data from storage
  const extensions = getPersonaExtensions(user_avatar);
  const $currentFields = $fieldsContainer.find(".inline-drawer");

  // Re-render only if the number of elements changed
  // Field values are updated directly via input/change events
  if ($currentFields.length !== extensions.length) {
    // Save state of open blocks
    const openStates = {};
    $currentFields.each((idx, field) => {
      const $field = $(field);
      const $content = $field.find(".inline-drawer-content");
      if ($content.is(":visible")) {
        openStates[idx] = true;
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
        const html = createExtensionFieldTemplate(ext, index);
        const $field = $(html);
        $fieldsContainer.append($field);

        // Restore open state
        if (openStates[index]) {
          $field.find(".inline-drawer-content").show();
          const $icon = $field.find(".inline-drawer-icon");
          $icon
            .removeClass("down fa-circle-chevron-down")
            .addClass("up fa-circle-chevron-up");
        }
      });
    }
  }
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
      const index = parseInt($input.data("index"));
      if (isNaN(index)) return;

      // Always get fresh data from storage
      const extensions = getPersonaExtensions(user_avatar);
      if (!extensions[index]) return;

      if ($input.hasClass("persona_extension_title")) {
        extensions[index].title = $input.val();
        // Update header title
        $input
          .closest(".inline-drawer")
          .find(".persona_extension_title_text")
          .text($input.val() || `Extension #${index + 1}`);
      } else if ($input.hasClass("persona_extension_description")) {
        extensions[index].description = $input.val();
      }

      // Save changes
      savePersonaExtensions(user_avatar, extensions);
    }
  );

  // Handle checkbox change
  $(document).on("change", ".persona_extension_field_enabled", function () {
    const $checkbox = $(this);
    const index = parseInt($checkbox.data("index"));
    if (isNaN(index)) return;

    // Always get fresh data from storage
    const extensions = getPersonaExtensions(user_avatar);
    if (extensions[index]) {
      extensions[index].enabled = $checkbox.prop("checked");
      // Save changes
      savePersonaExtensions(user_avatar, extensions);
    }
  });

  // Handle delete button click
  $(document).on("click", ".persona_extension_delete", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const $button = $(this);
    const index = parseInt($button.data("index"));
    if (isNaN(index)) return;

    // Always get fresh data from storage
    const extensions = getPersonaExtensions(user_avatar);
    if (extensions[index]) {
      // Remove element
      extensions.splice(index, 1);
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
}

/**
 * Adds new extension field
 */
export function addExtensionField() {
  // Always get fresh data from storage
  const extensions = getPersonaExtensions(user_avatar);
  const newIndex = extensions.length;

  // Add new element
  extensions.push({
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
      const $newField = $(`.inline-drawer[data-index="${newIndex}"]`);
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
