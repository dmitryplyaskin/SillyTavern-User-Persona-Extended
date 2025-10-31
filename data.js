/**
 * Persona Extensions - Data Management Module
 * Management of extension data for personas
 */

import { accountStorage } from "/scripts/util/AccountStorage.js";

const STORAGE_KEY_PREFIX = "user_persona_extended_";

/**
 * Gets storage key for extension data for specified persona
 * @param {string} avatarId Persona avatar ID
 * @returns {string} Storage key
 */
function getStorageKey(avatarId) {
    return `${STORAGE_KEY_PREFIX}${avatarId}`;
}

/**
 * Gets extension data for specified persona
 * @param {string} avatarId Persona avatar ID
 * @returns {Array} Array of objects with fields {title, description, enabled} (copy)
 */
export function getPersonaExtensions(avatarId) {
    if (!avatarId) return [];

    const storageKey = getStorageKey(avatarId);
    const storedData = accountStorage.getItem(storageKey);

    if (!storedData) {
        return [];
    }

    try {
        const extensions = JSON.parse(storedData);
        if (Array.isArray(extensions)) {
            // Return deep copy to avoid mutating original array
            return JSON.parse(JSON.stringify(extensions));
        }
    } catch (error) {
        console.warn("[User Persona Extended]: Failed to parse stored data", error);
    }

    return [];
}

/**
 * Saves extension data for specified persona
 * @param {string} avatarId Persona avatar ID
 * @param {Array} extensions Array of extension objects
 */
export function savePersonaExtensions(avatarId, extensions) {
    if (!avatarId) return;

    const storageKey = getStorageKey(avatarId);

    try {
        const dataToStore = JSON.stringify(extensions || []);
        accountStorage.setItem(storageKey, dataToStore);
    } catch (error) {
        console.error("[User Persona Extended]: Failed to save data", error);
    }
}
