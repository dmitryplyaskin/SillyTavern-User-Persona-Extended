# User Persona Extended

<div align="center" style="margin: 20px 0;">
  <a href="#english"><button style="padding: 8px 16px; margin: 0 5px; cursor: pointer; background: #4a90e2; color: white; border: none; border-radius: 4px; font-weight: bold; text-decoration: none;">English</button></a>
  <a href="#russian"><button style="padding: 8px 16px; margin: 0 5px; cursor: pointer; background: #4a90e2; color: white; border: none; border-radius: 4px; font-weight: bold; text-decoration: none;">Русский</button></a>
</div>

---

<a id="english"></a>

# English

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

## Changelog

### 0.0.2

- **Fix**: Changed prompt injection method to use a "Smart Getter". This prevents the extension text from being permanently saved to the persona description in settings, fixing a corruption bug.

---

<a id="russian"></a>

# Русский

Расширение для SillyTavern, которое позволяет добавлять множественные контекстные описания для вашей персоны пользователя и включать/выключать их по необходимости. Эти описания естественным образом встраиваются в промпт сразу после основного описания персоны, предоставляя естественный способ расширения контекста персонажа без загромождения интерфейса.

## Мотивация

Если у вас есть набор персонажей, с которыми вы часто играете, вы наверняка сталкивались с ситуациями, когда нужно добавлять контекстные детали для разных сценариев. Будь то описание одежды и внешности для конкретной сцены или добавление обширных лорных элементов для определенных сеттингов, управление этими вариациями может быть обременительным.

Традиционные решения, такие как заметки автора или системные инструкции, могут казаться навязчивыми и нарушать погружение. Это расширение решает эту проблему, позволяя заранее подготовить несколько контекстных описаний и активировать только те, которые релевантны вашему текущему сценарию. Описания появляются естественным образом в промпте сразу после основного описания персоны, что делает их неотъемлемой частью определения вашего персонажа, а не внешними инструкциями.

**Примечание:** Расширение протестировано только со стандартными настройками персоны.

## Возможности

- **Множественные блоки расширений**: Создавайте неограниченное количество дополнительных блоков описаний для каждой персоны
- **Хранение для каждой персоны**: Каждая персона имеет свой независимый набор расширений
- **Включение/выключение**: Включайте или отключайте отдельные расширения без их удаления
- **Бесшовная интеграция**: Расширения встраиваются непосредственно в промпт после основного описания персоны
- **Естественный вид**: Описания естественным образом вписываются в промпт, сохраняя погружение
- **Простое управление**: Простой интерфейс, интегрированный в панель управления персоной

## Установка

Установите через установщик расширений SillyTavern, используя URL репозитория:

```
https://github.com/dmitryplyaskin/SillyTavern-User-Persona-Extended
```

## Использование

### Доступ к расширению

1. Откройте панель **Управления персоной** (нажмите кнопку управления персоной в интерфейсе)
2. Найдите секцию **"Дополнительные описания"**
3. Интерфейс расширения появится ниже описания вашей персоны

### Добавление нового расширения

1. Нажмите кнопку **"+"** в секции Дополнительные описания
2. Будет создан новый блок расширения и автоматически развернут
3. Введите **Заголовок** (необязательно, для организационных целей)
4. Введите текст **Описания**, который будет добавлен в промпт
5. Расширение включено по умолчанию (чекбокс отмечен)

### Управление расширениями

- **Редактирование**: Нажмите на заголовок расширения или иконку шеврона, чтобы развернуть/свернуть блок
- **Включение/выключение**: Используйте чекбокс "Включено" в заголовке расширения
- **Удаление**: Нажмите кнопку с иконкой корзины в заголовке расширения
- **Обновление заголовка**: Заголовок, отображаемый в шапке, обновляется автоматически при вводе

### Как это работает

При генерации сообщения:

1. Расширение проверяет, какие расширения включены для текущей персоны
2. Собираются включенные расширения с непустыми описаниями
3. Они добавляются к основному описанию персоны в промпт
4. Оригинальное описание персоны восстанавливается после генерации

В промпт включаются только включенные расширения с содержимым. Отключенные или пустые расширения автоматически пропускаются.

## Настройки

Доступ к настройкам расширения через **Расширения > User Persona Extended**:

- **Включить расширение**: Главный переключатель для глобального включения/выключения расширения
- **Очистить все данные расширения**: Навсегда удалить все сохраненные расширения для всех персон (с подтверждением)

## Примеры использования

### Описания для конкретных сценариев

Создавайте отдельные расширения для разных сценариев или сеттингов:

- Одежда и внешность в современном мире
- Одежда и снаряжение в фэнтезийном мире
- Описания научно-фантастического сеттинга

### Добавление лора

Добавляйте обширную лорную информацию, которая актуальна только в определенных контекстах:

- Фоновая информация, специфичная для мира
- История персонажа, зависящая от сеттинга
- Контекстные отношения персонажа

## Технические детали

### Хранение данных

Расширения хранятся для каждой персоны в `accountStorage`:

- Формат ключа хранилища: `user_persona_extended_{avatarId}`
- Формат данных: JSON-массив объектов расширений
- Каждое расширение: `{id: string, title: string, description: string, enabled: boolean}`

### Инжекция в промпт

Расширения встраиваются путем временного изменения `power_user.persona_description`:

- Инжекция происходит до начала генерации (событие `GENERATION_STARTED`)
- Оригинальное описание восстанавливается после завершения генерации
- Расширения добавляются с разделителем новой строки при необходимости

### Архитектура

Расширение состоит из модульных компонентов:

- **`index.js`**: Основная инициализация и координация событий
- **`data.js`**: Сохранение данных с использованием accountStorage
- **`ui.js`**: Создание и управление интерфейсом
- **`prompt-injection.js`**: Логика модификации промпта
- **`settings.js`**: Управление настройками
- **`settings.html`**: Шаблон интерфейса настроек

## Совместимость

- **Версия SillyTavern**: Протестировано со стандартными настройками персоны
- **Браузер**: Должно работать во всех современных браузерах, поддерживаемых SillyTavern

## Лицензия

Подробности см. в файле LICENSE.

## Автор

Dmitry Plyaskin

## Поддержка

По вопросам, запросам функций или вкладу в проект посетите [репозиторий GitHub](https://github.com/dmitryplyaskin/SillyTavern-User-Persona-Extended).

## История изменений

### 0.0.2

- **Исправление**: Изменен метод инъекции промпта на использование "Умного геттера". Это предотвращает постоянное сохранение текста расширения в описание персоны в настройках, исправляя баг с повреждением данных.
