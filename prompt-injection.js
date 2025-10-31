/**
 * Persona Extensions - Prompt Injection Module
 * Injection of persona extensions into prompt
 */

import { eventSource, event_types } from "/script.js";
import { power_user } from "/scripts/power-user.js";
import { getPersonaExtensions } from "./data.js";

let currentUserAvatar = null;
let originalPersonaDescription = null;
let isRestoringPersona = false;

/**
 * Gets extension text for specified persona
 * @param {string} userAvatar Current persona ID
 * @returns {string} Extension text or empty string
 */
function getExtensionText(userAvatar) {
    if (!userAvatar) {
        return "";
    }

    const extensions = getPersonaExtensions(userAvatar);
    if (!extensions || extensions.length === 0) {
        return "";
    }

    const enabledExtensions = extensions.filter(
        (ext) =>
            ext &&
            ext.enabled !== false &&
            ext.description &&
            ext.description.trim().length > 0
    );

    if (enabledExtensions.length === 0) {
        return "";
    }

    // Form prompt text - insert only description
    const extensionText = enabledExtensions
        .map((ext) => {
            const description = (ext.description || "").trim();
            return description;
        })
        .filter((text) => text.length > 0)
        .join("\n");

    return extensionText || "";
}

/**
 * Gets original persona description for specified avatar
 * @param {string} userAvatar Current persona ID
 * @returns {string} Original persona description
 */
function getOriginalPersonaDescription(userAvatar) {
    if (!userAvatar || !power_user.persona_descriptions) {
        return power_user.persona_description || "";
    }

    const descriptor = power_user.persona_descriptions[userAvatar];
    if (descriptor && descriptor.description) {
        return descriptor.description;
    }

    return power_user.persona_description || "";
}

/**
 * Resets saved state when persona changes
 * @param {string} userAvatar New persona ID
 */
export function resetPersonaExtensionsState(userAvatar) {
    // If persona changed, reset saved state
    if (currentUserAvatar !== userAvatar) {
        originalPersonaDescription = null;
        currentUserAvatar = userAvatar;
    }
}

/**
 * Injects persona extensions into prompt
 * Temporarily modifies power_user.persona_description before generation
 * @param {string} userAvatar Current persona ID
 */
export function injectPersonaExtensions(userAvatar) {
    // Reset state when persona changes
    resetPersonaExtensionsState(userAvatar);

    // Save original persona description for current avatar
    if (!isRestoringPersona && originalPersonaDescription === null) {
        originalPersonaDescription = getOriginalPersonaDescription(userAvatar);
    }

    // Get extension text
    const extensionText = getExtensionText(userAvatar);

    if (extensionText && !isRestoringPersona) {
        // Temporarily modify persona_description, adding extensions
        const basePersona = originalPersonaDescription || "";
        const separator =
            basePersona.trim() && !basePersona.trim().endsWith("\n")
                ? "\n"
                : "";
        power_user.persona_description =
            basePersona + separator + extensionText;
    }
}

/**
 * Restores original persona description after generation
 */
function restoreOriginalPersona() {
    if (originalPersonaDescription !== null && !isRestoringPersona) {
        isRestoringPersona = true;
        power_user.persona_description = originalPersonaDescription;
        originalPersonaDescription = null;
        isRestoringPersona = false;
    }
}

/**
 * Initializes event handlers for persona modification in prompt
 * Should be called once when extension loads
 */
export function initPersonaExtensionsHook() {
    // Restore original description after generation
    eventSource.on(event_types.GENERATION_ENDED, restoreOriginalPersona);
    eventSource.on(event_types.GENERATION_STOPPED, restoreOriginalPersona);
}
