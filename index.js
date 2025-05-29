/**
 * FriendlyUI Extension for SillyTavern
 */

// Global settings and constants
const EXTENSION_NAME = 'FriendlyUI';
const settingsKey = 'SillyTavernFriendlyUI';
const VERSION = "0.0.1";

// Import required functions
import { t } from '../../../i18n.js';

// Import components
import { OpenAITabManager } from './components/openai-tab-manager.js';

/**
 * Default settings configuration
 */
const defaultSettings = {
    enabled: true,
    openaiTabsEnabled: true
};

// Global tab manager instance
let openAITabManager = null;

/**
 * Main extension initialization function
 */
(function initExtension() {
    // Get SillyTavern context
    const context = SillyTavern.getContext();

    // Initialize settings
    if (!context.extensionSettings[settingsKey]) {
        context.extensionSettings[settingsKey] = { ...defaultSettings };
    }

    // Ensure all default setting keys exist
    for (const key of Object.keys(defaultSettings)) {
        if (context.extensionSettings[settingsKey][key] === undefined) {
            context.extensionSettings[settingsKey][key] = defaultSettings[key];
        }
    }

    // Save settings
    context.saveSettingsDebounced();

    // Initialize extension UI when DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initExtensionUI);
    } else {
        initExtensionUI();
    }
})();

/**
 * Initialize UI elements and events for the extension
 */
function initExtensionUI() {
    // Render extension settings
    renderExtensionSettings();

    // Initialize OpenAI tab manager
    initializeOpenAITabs();
}

/**
 * Initialize OpenAI tab management
 */
function initializeOpenAITabs() {
    const context = SillyTavern.getContext();
    const settings = context.extensionSettings[settingsKey];

    if (!openAITabManager) {
        openAITabManager = new OpenAITabManager();
    }

    // Set enabled state based on settings
    openAITabManager.setEnabled(settings.enabled && settings.openaiTabsEnabled);
}

/**
 * Render extension settings panel
 */
function renderExtensionSettings() {
    const context = SillyTavern.getContext();
    const settingsContainer = document.getElementById(`${settingsKey}-container`) ?? document.getElementById('extensions_settings2');
    if (!settingsContainer) {
        return;
    }

    // Find existing settings drawer to avoid duplication
    let existingDrawer = settingsContainer.querySelector(`#${settingsKey}-drawer`);
    if (existingDrawer) {
        return; // Don't recreate if exists
    }

    // Create settings drawer
    const inlineDrawer = document.createElement('div');
    inlineDrawer.id = `${settingsKey}-drawer`;
    inlineDrawer.classList.add('inline-drawer');
    settingsContainer.append(inlineDrawer);

    // Create drawer title
    const inlineDrawerToggle = document.createElement('div');
    inlineDrawerToggle.classList.add('inline-drawer-toggle', 'inline-drawer-header');

    const extensionNameElement = document.createElement('b');
    extensionNameElement.textContent = EXTENSION_NAME;

    const inlineDrawerIcon = document.createElement('div');
    inlineDrawerIcon.classList.add('inline-drawer-icon', 'fa-solid', 'fa-circle-chevron-down', 'down');

    inlineDrawerToggle.append(extensionNameElement, inlineDrawerIcon);

    // Create settings content area
    const inlineDrawerContent = document.createElement('div');
    inlineDrawerContent.classList.add('inline-drawer-content');

    // Add to drawer
    inlineDrawer.append(inlineDrawerToggle, inlineDrawerContent);

    // Get settings
    const settings = context.extensionSettings[settingsKey];

    // Create enable switch
    const enabledCheckboxLabel = document.createElement('label');
    enabledCheckboxLabel.classList.add('checkbox_label');
    enabledCheckboxLabel.htmlFor = `${settingsKey}-enabled`;

    const enabledCheckbox = document.createElement('input');
    enabledCheckbox.id = `${settingsKey}-enabled`;
    enabledCheckbox.type = 'checkbox';
    enabledCheckbox.checked = settings.enabled;

    enabledCheckbox.addEventListener('change', () => {
        settings.enabled = enabledCheckbox.checked;

        // Update OpenAI tabs based on main enabled state
        if (openAITabManager) {
            openAITabManager.setEnabled(settings.enabled && settings.openaiTabsEnabled);
        }

        context.saveSettingsDebounced();
    });

    const enabledCheckboxText = document.createElement('span');
    enabledCheckboxText.textContent = t`Enable FriendlyUI`;

    enabledCheckboxLabel.append(enabledCheckbox, enabledCheckboxText);
    inlineDrawerContent.append(enabledCheckboxLabel);

    // Create OpenAI tabs toggle
    const openaiTabsLabel = document.createElement('label');
    openaiTabsLabel.classList.add('checkbox_label');
    openaiTabsLabel.htmlFor = `${settingsKey}-openai-tabs`;

    const openaiTabsCheckbox = document.createElement('input');
    openaiTabsCheckbox.id = `${settingsKey}-openai-tabs`;
    openaiTabsCheckbox.type = 'checkbox';
    openaiTabsCheckbox.checked = settings.openaiTabsEnabled;

    openaiTabsCheckbox.addEventListener('change', () => {
        settings.openaiTabsEnabled = openaiTabsCheckbox.checked;

        // Update OpenAI tabs
        if (openAITabManager) {
            openAITabManager.setEnabled(settings.enabled && settings.openaiTabsEnabled);
        }

        context.saveSettingsDebounced();
    });

    const openaiTabsText = document.createElement('span');
    openaiTabsText.textContent = t`Enable Chat Completion Presets Settings Tabs`;

    openaiTabsLabel.append(openaiTabsCheckbox, openaiTabsText);
    inlineDrawerContent.append(openaiTabsLabel);

    // Add version info
    addVersionInfo(inlineDrawerContent);

    // Initialize drawer toggle functionality
    inlineDrawerToggle.addEventListener('click', function() {
        this.classList.toggle('open');
        inlineDrawerIcon.classList.toggle('down');
        inlineDrawerIcon.classList.toggle('up');
        inlineDrawerContent.classList.toggle('open');
    });
}

/**
 * Add version information
 */
function addVersionInfo(container) {
    const versionContainer = document.createElement('div');
    versionContainer.className = 'flex-container flexFlowColumn';
    versionContainer.style.marginTop = '0.5em';
    versionContainer.style.marginBottom = '0.5em';
    versionContainer.style.textAlign = 'center';

    const smallElement = document.createElement('small');
    smallElement.className = 'flex-container justifyCenter alignitemscenter';

    const spanElement = document.createElement('span');
    spanElement.setAttribute('data-i18n', 'FriendlyUI Version');
    spanElement.textContent = 'FriendlyUI Version';

    const linkElement = document.createElement('a');
    linkElement.id = 'friendlyui-version';
    linkElement.href = 'https://github.com/RivelleDays/SillyTavern-FriendlyUI';
    linkElement.target = '_blank';
    linkElement.rel = 'noopener noreferrer';
    linkElement.style.marginLeft = '5px';
    linkElement.textContent = VERSION;

    smallElement.appendChild(spanElement);
    smallElement.appendChild(linkElement);
    versionContainer.appendChild(smallElement);
    container.appendChild(versionContainer);
}

// Additional initialization calls with delays to ensure proper loading
setTimeout(() => {
    if (openAITabManager) {
        openAITabManager.refreshTabs();
    }
}, 1000);

setTimeout(() => {
    if (openAITabManager) {
        openAITabManager.refreshTabs();
    }
}, 3000);
