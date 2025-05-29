/**
 * OpenAI Settings Tab Manager
 * When using the Chat Completion API, add separate tabs for Parameters and Prompt.
 */

// Import required functions
import { main_api } from '../../../../../script.js';
import { oai_settings } from './../../../../openai.js';

export class OpenAITabManager {
    constructor() {
        this.activeTab = 'parameters';
        this.tabButtonsContainer = null;
        this.isTabsCreated = false;
        this.enabled = true;
        this.init();
    }

    init() {
        setTimeout(() => this.checkApiAndInitialize(), 300);
        setInterval(() => this.checkApiAndInitialize(), 2000);
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled && this.isTabsCreated) {
            this.removeTabs();
        } else if (enabled) {
            this.checkApiAndInitialize();
        }
    }

    checkApiAndInitialize() {
        if (!this.enabled) return;

        const shouldShowTabs = typeof main_api !== 'undefined' &&
                              main_api === 'openai' &&
                              typeof oai_settings !== 'undefined';

        if (shouldShowTabs && !this.isTabsCreated) {
            this.createTabs();
        } else if (!shouldShowTabs && this.isTabsCreated) {
            this.removeTabs();
        }
    }

    createTabs() {
        const presetDiv = document.querySelector('#openai_api-presets > div');
        if (!presetDiv) return;

        presetDiv.insertAdjacentHTML('afterend', `
            <div class="openai-tab-buttons">
                <button id="openai-tab-btn-parameters" class="openai-tab-button active">
                    <i class="fa-solid fa-vial"></i><span data-i18n="Parameters">Parameters</span>
                </button>
                <button id="openai-tab-btn-prompts" class="openai-tab-button">
                    <i class="fa-solid fa-file-edit"></i><span data-i18n="Prompts">Prompts</span>
                </button>
            </div>
        `);

        this.tabButtonsContainer = document.querySelector('.openai-tab-buttons');
        this.organizeContent();
        this.bindEvents();
        this.setInitialState();
        this.isTabsCreated = true;
    }

    organizeContent() {
        const tabButtons = this.tabButtonsContainer;

        // Create tab containers
        tabButtons.insertAdjacentHTML('afterend',
            `<div id="openai-tab-content-parameters" class="openai-tab-content active"></div>
             <div id="openai-tab-content-prompts" class="openai-tab-content"></div>`
        );

        const parametersTab = document.querySelector('#openai-tab-content-parameters');
        const promptsTab = document.querySelector('#openai-tab-content-prompts');

        // Move parameters content
        [
            '#range_block_openai',
            '#openai_settings',
            '#logit_bias_openai',
        ].forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                const container = element.closest('.range-block') || element;
                parametersTab.appendChild(container);
            }
        });

        // Move additional openai blocks
        document.querySelectorAll('[data-source*="openai"]:not(.openai-tab-content):not(.openai-tab-buttons)')
            .forEach(block => {
                const rangeBlock = block.closest('.range-block');
                if (rangeBlock && !parametersTab.contains(block)) {
                    parametersTab.appendChild(rangeBlock);
                }
            });

        // Move prompts content
        const completionManager = document.querySelector('#completion_prompt_manager');
        if (completionManager) {
            let wrapper = completionManager.closest('.range-block');
            if (!wrapper) {
                wrapper = document.createElement('div');
                wrapper.className = 'range-block m-b-1';
                completionManager.parentNode.insertBefore(wrapper, completionManager);
                wrapper.appendChild(completionManager);
            }
            promptsTab.appendChild(wrapper);
        }
    }

    removeTabs() {
        if (this.tabButtonsContainer) {
            this.tabButtonsContainer.remove();
            this.tabButtonsContainer = null;
        }

        const openaiContainer = document.querySelector('#openai_api-presets');
        if (!openaiContainer) return;

        ['#openai-tab-content-parameters', '#openai-tab-content-prompts'].forEach(selector => {
            const tab = document.querySelector(selector);
            if (tab) {
                while (tab.firstChild) {
                    openaiContainer.appendChild(tab.firstChild);
                }
                tab.remove();
            }
        });

        this.isTabsCreated = false;
    }

    bindEvents() {
        document.querySelectorAll('.openai-tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                // @ts-ignore
                const tabId = e.target.closest('.openai-tab-button').id.replace('openai-tab-btn-', '');
                this.switchTab(tabId);
            });
        });
    }

    switchTab(tabId) {
        if (!['parameters', 'prompts'].includes(tabId)) return;

        // Update buttons
        document.querySelectorAll('.openai-tab-button').forEach(button => {
            button.classList.toggle('active', button.id.includes(tabId));
        });

        // Update content
        document.querySelectorAll('.openai-tab-content').forEach(content => {
            const isActive = content.id.includes(tabId);
            content.classList.toggle('active', isActive);
        });

        // Scroll left panel to top
        const leftPanel = document.querySelector('#left-nav-panel .scrollableInner');
        if (leftPanel) {
            leftPanel.scrollTop = 0;
        }

        this.activeTab = tabId;
        this.saveTabPreference(tabId);
    }

    setInitialState() {
        const savedTab = this.loadTabPreference();
        const initialTab = ['parameters', 'prompts'].includes(savedTab) ? savedTab : 'parameters';
        this.switchTab(initialTab);
    }

    saveTabPreference(tabId) {
        try {
            localStorage.setItem('openai-active-tab', tabId);
        } catch (error) {
            // Silent fail
        }
    }

    loadTabPreference() {
        try {
            return localStorage.getItem('openai-active-tab');
        } catch (error) {
            return null;
        }
    }

    refreshTabs() {
        this.checkApiAndInitialize();
    }
}
