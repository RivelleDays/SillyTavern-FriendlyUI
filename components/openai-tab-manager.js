/**
 * OpenAI Settings Tab Manager (Refactored)
 * When using the Chat Completion API, add separate tabs for Parameters and Prompt.
 */

// Import required functions
import { main_api } from '../../../../../script.js';
import { oai_settings } from './../../../../openai.js';
import { TabManager } from './tab-manager.js';

export class OpenAITabManager {
    constructor() {
        this.tabManager = new TabManager({
            containerSelector: '#left-nav-panel #openai_api-presets',
            insertAfterSelector: '#left-nav-panel #openai_api-presets > div',
            tabPrefix: 'openai-tab',
            activeTabStorageKey: 'openai-active-tab',
            defaultTab: 'parameters',
            className: 'openai-tab',
            tabs: {
                parameters: {
                    label: 'Parameters',
                    icon: 'fa-solid fa-vial',
                    contentSelectors: [
                        '#left-nav-panel #range_block_openai',
                        '#left-nav-panel #openai_settings',
                        '#left-nav-panel #logit_bias_openai',
                        '#left-nav-panel [data-source*="openai"]:not(.openai-tab-content):not(.openai-tab-buttons)'
                    ]
                },
                prompts: {
                    label: 'Prompts',
                    icon: 'fa-solid fa-file-edit',
                    contentSelectors: [
                        '#left-nav-panel #completion_prompt_manager'
                    ]
                }
            },
            checkCondition: () => {
                return typeof main_api !== 'undefined' &&
                       main_api === 'openai' &&
                       typeof oai_settings !== 'undefined' &&
                       document.querySelector('#left-nav-panel') !== null;
            }
        });

        this.enabled = true;
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        this.tabManager.setEnabled(enabled);
    }

    refreshTabs() {
        this.tabManager.refreshTabs();
    }

    // Backward compatibility methods
    get activeTab() {
        return this.tabManager.activeTab;
    }

    get isTabsCreated() {
        return this.tabManager.isTabsCreated;
    }
}
