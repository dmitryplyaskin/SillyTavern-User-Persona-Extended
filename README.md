# User Persona Extended

An extension for SillyTavern that allows you to add multiple contextual descriptions for your user persona and toggle them on/off as needed. These descriptions are seamlessly injected into the prompt right after your main persona description, providing a natural way to enhance character context without cluttering the interface.

## Motivation

If you have a collection of personas that you frequently roleplay with, you've likely encountered situations where you need to add contextual details for different scenarios. Whether it's describing clothing and appearance for a specific scene, or adding extensive lore elements for particular settings, managing these variations can be cumbersome.

Traditional solutions like author's notes or system instructions can feel intrusive and break immersion. This extension solves that problem by allowing you to prepare multiple contextual descriptions in advance and enable only the ones relevant to your current scenario. The descriptions appear naturally in the prompt right after your main persona description, making them feel like a seamless part of your character definition rather than external instructions.

**Note:** This extension has been tested with standard persona settings only.

## Features

- **Multiple Extension Blocks**: Create unlimited additional description blocks for each persona
- **Per-Persona Storage**: Each persona has its own independent set of extensions
- **Toggle On/Off**: Enable or disable individual extensions without deleting them
- **Seamless Integration**: Extensions are injected directly into the prompt after the main persona description
- **Natural Appearance**: Descriptions flow naturally in the prompt, maintaining immersion
- **Easy Management**: Simple UI integrated into the Persona Management panel

## Installation

Install via SillyTavern's extension installer using the repository URL:
```
https://github.com/dmitryplyaskin/SillyTavern-User-Persona-Extended
```

## Usage

### Accessing the Extension

1. Open the **Persona Management** panel (click the persona management button in the interface)
2. Find the **"Additional Descriptions"** section
3. The extension UI will appear below your persona description

### Adding a New Extension

1. Click the **"+"** button in the Additional Descriptions section
2. A new extension block will be created and automatically expanded
3. Enter a **Title** (optional, for organizational purposes)
4. Enter the **Description** text that will be added to the prompt
5. The extension is enabled by default (checkbox is checked)

### Managing Extensions

- **Edit**: Click on the extension header or the chevron icon to expand/collapse the block
- **Enable/Disable**: Use the "Enabled" checkbox in the extension header
- **Delete**: Click the trash icon button in the extension header
- **Title Update**: The title displayed in the header updates automatically as you type

### How It Works

When a message is generated:
1. The extension checks which extensions are enabled for the current persona
2. Enabled extensions with non-empty descriptions are collected
3. They are appended to your main persona description in the prompt
4. The original persona description is restored after generation

Only enabled extensions with content are included in the prompt. Disabled or empty extensions are automatically skipped.

## Settings

Access extension settings via **Extensions > User Persona Extended**:

- **Enable extension**: Master toggle to enable/disable the extension globally
- **Clear All Extension Data**: Permanently delete all saved extensions for all personas (with confirmation)

## Use Cases

### Scenario-Specific Descriptions
Create separate extensions for different scenarios or settings:
- Modern day clothing and appearance
- Fantasy world attire and equipment
- Sci-fi setting descriptions

### Lore Additions
Add extensive lore information that's only relevant in specific contexts:
- World-specific background information
- Setting-dependent character history
- Contextual character relationships

### Dynamic Details
Easily toggle details that change over time:
- Current outfit or appearance
- Temporary character states
- Scene-specific modifications

## Technical Details

### Data Storage

Extensions are stored per persona in `accountStorage`:
- Storage key format: `user_persona_extended_{avatarId}`
- Data format: JSON array of extension objects
- Each extension: `{id: string, title: string, description: string, enabled: boolean}`

### Prompt Injection

Extensions are injected by temporarily modifying `power_user.persona_description`:
- Injection happens before generation starts (`GENERATION_STARTED` event)
- Original description is restored after generation completes
- Extensions are appended with a newline separator if needed

### Architecture

The extension consists of modular components:
- **`index.js`**: Main initialization and event coordination
- **`data.js`**: Data persistence using accountStorage
- **`ui.js`**: UI creation and management
- **`prompt-injection.js`**: Prompt modification logic
- **`settings.js`**: Settings management
- **`settings.html`**: Settings UI template

## Compatibility

- **SillyTavern Version**: Tested with standard persona settings
- **Browser**: Should work in all modern browsers supported by SillyTavern

## License

See LICENSE file for details.

## Author

Dmitry Plyaskin

## Support

For issues, feature requests, or contributions, please visit the [GitHub repository](https://github.com/dmitryplyaskin/SillyTavern-User-Persona-Extended).
