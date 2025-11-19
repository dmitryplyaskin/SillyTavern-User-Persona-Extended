/**
 * Persona Extensions - Prompt Injection Module
 * Injection of persona extensions into prompt
 */

import { eventSource, event_types } from "/script.js";
import { power_user } from "/scripts/power-user.js";
import { getPersonaExtensions } from "./data.js";

let isInjectionActive = false;
let injectionTimeout = null;
let isHijacked = false;

// Internal storage for the actual description
let _internalDescription = "";

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
 * Hijacks the persona_description property on power_user object
 * This allows us to dynamically inject extensions when read,
 * while keeping the underlying value clean for saving.
 */
function hijackPersonaDescription() {
    if (isHijacked) return;

    // Initialize internal storage with current value
    _internalDescription = power_user.persona_description || "";

    try {
        Object.defineProperty(power_user, 'persona_description', {
            get: function() {
                // If injection is active, return description + extensions
                if (isInjectionActive) {
                    // We need the current avatar ID to get relevant extensions
                    // We can import it dynamically or rely on the one passed to injectPersonaExtensions
                    // But injectPersonaExtensions sets the flag, so we should have the text ready?
                    // Better: injectPersonaExtensions prepares the text.
                    
                    // Actually, simpler: injectPersonaExtensions sets a temporary "override" string
                    // But we want to be robust.
                    
                    // Let's stick to the plan: 
                    // The getter calculates the text if active.
                    // But we need the avatar ID. 
                    // Let's store the current extension text in a module-level variable when injection starts.
                    return _internalDescription + (currentExtensionText ? ("\n" + currentExtensionText) : "");
                }
                return _internalDescription;
            },
            set: function(value) {
                _internalDescription = value;
            },
            configurable: true,
            enumerable: true
        });
        
        isHijacked = true;
        console.log("[User Persona Extended]: Persona description hijacked successfully");
    } catch (e) {
        console.error("[User Persona Extended]: Failed to hijack persona description", e);
    }
}

let currentExtensionText = "";

/**
 * Resets saved state when persona changes
 * @param {string} userAvatar New persona ID
 */
export function resetPersonaExtensionsState(userAvatar) {
    // Not strictly needed for this approach, but good for cleanup
    isInjectionActive = false;
    currentExtensionText = "";
}

/**
 * Injects persona extensions into prompt
 * Activates the smart getter for a short duration
 * @param {string} userAvatar Current persona ID
 */
export function injectPersonaExtensions(userAvatar) {
    // Prepare extension text
    const text = getExtensionText(userAvatar);
    
    if (text) {
        currentExtensionText = text;
        isInjectionActive = true;
        
        // Auto-disable injection after a short timeout to be safe
        // The prompt construction usually happens immediately after this event
        if (injectionTimeout) clearTimeout(injectionTimeout);
        injectionTimeout = setTimeout(() => {
            isInjectionActive = false;
            currentExtensionText = "";
        }, 1000); // 1 second should be plenty for prompt construction
    }
}

/**
 * Restores original persona description state after generation
 */
function disableInjection() {
    isInjectionActive = false;
    currentExtensionText = "";
    if (injectionTimeout) clearTimeout(injectionTimeout);
}

/**
 * Initializes event handlers for persona modification in prompt
 * Should be called once when extension loads
 */
export function initPersonaExtensionsHook() {
    // Hijack the property
    hijackPersonaDescription();

    // Disable injection after generation
    eventSource.on(event_types.GENERATION_ENDED, disableInjection);
    eventSource.on(event_types.GENERATION_STOPPED, disableInjection);
}

// Export for compatibility/cleanup if needed, though not used internally anymore
export function cleanupPersonaDescription() {
    // No-op in this version as we don't dirty the value
}
