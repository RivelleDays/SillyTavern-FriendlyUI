/**
 * User Settings Tab Manager
 * Organizes user settings into categorized tabs for better UX
 */

import { TabManager } from './tab-manager.js';

export class UserSettingsTabManager {
    constructor() {
        this.tabManager = new TabManager({
            containerSelector: '#user-settings-block-content',
            insertAfterSelector: '#user-settings-block-content',
            tabPrefix: 'user-settings-tab',
            activeTabStorageKey: 'user-settings-active-tab',
            defaultTab: 'theme',
            className: 'user-settings-tab',
            tabs: {
                theme: {
                    label: 'UI Theme',
                    icon: 'fa-solid fa-palette',
                    contentSelectors: [
                        '#UI-Theme-Block',
                        '[name="AvatarAndChatDisplay"]',
                        '[name="themeElements"]',
                        '[name="FontBlurChatWidthBlock"]',
                        '[name="themeToggles"]',
                        '#CustomCSS-block'
                    ]
                },
                handling: {
                    label: 'Character & Chat',
                    icon: 'fa-solid fa-user-friends',
                    contentSelectors: [
                        '[name="CharacterHandlingToggles"]',
                        '[name="ChatMessageHandlingToggles"]',
                        '[name="AutoCompleteToggle"]'
                    ]
                },
                others: {
                    label: 'Others',
                    icon: 'fa-solid fa-cogs',
                    contentSelectors: [
                        '[name="MiscellaneousToggles"]',
                        '[name="STscriptToggles"]'
                    ]
                }
            },
            checkCondition: () => {
                return document.querySelector('#user-settings-block-content') !== null;
            },
            onTabSwitch: (tabId) => {
                // Custom logic when switching tabs if needed
                this.handleTabSwitch(tabId);
            }
        });

        this.enabled = true;
        this.setupCustomizations();
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        this.tabManager.setEnabled(enabled);
    }

    refreshTabs() {
        this.tabManager.refreshTabs();
    }

    handleTabSwitch(tabId) {
        // Handle any tab-specific logic here
        switch (tabId) {
            case 'theme':
                this.initializeThemeTab();
                break;
            case 'others':
                this.initializeOthersTab();
                break;
            default:
                break;
        }
    }

    initializeThemeTab() {
        // Any theme-specific initialization
        const colorPickers = document.querySelectorAll('toolcool-color-picker');
        colorPickers.forEach(picker => {
            // Ensure color pickers are properly initialized
            if (picker && typeof picker.refresh === 'function') {
                picker.refresh();
            }
        });
    }

    initializeOthersTab() {
        // Any others tab specific initialization
        const customCSSTextarea = document.querySelector('#customCSS');
        if (customCSSTextarea) {
            // Ensure textarea is properly displayed
            customCSSTextarea.style.display = 'block';
        }
    }

    setupCustomizations() {
        // Add any additional customizations for the user settings
        this.addTabSpecificStyles();
        this.setupResponsiveLayout();
    }

    addTabSpecificStyles() {
        // Add specific styles for user settings tabs if needed
        const style = document.createElement('style');
        style.textContent = `
            .user-settings-tab-content h4 {
                margin-top: 1em;
                margin-bottom: 0.5em;
                border-bottom: 1px solid color-mix(in srgb, var(--SmartThemeBodyColor) 20%, transparent);
                padding-bottom: 0.5em;
            }

            .user-settings-tab-content h4:first-child {
                margin-top: 0;
            }
        `;
        document.head.appendChild(style);
    }

    setupResponsiveLayout() {
        // Ensure the tab content is responsive
        const observer = new ResizeObserver(entries => {
            entries.forEach(entry => {
                if (entry.target.classList.contains('user-settings-tab-content')) {
                    // Handle responsive layout adjustments
                    this.adjustLayoutForSize(entry.contentRect.width);
                }
            });
        });

        // Observe all tab content containers
        const tabContents = document.querySelectorAll('.user-settings-tab-content');
        tabContents.forEach(content => observer.observe(content));
    }

    adjustLayoutForSize(width) {
        // Adjust layout based on container width
        const isNarrow = width < 800;
        const tabContents = document.querySelectorAll('.user-settings-tab-content');

        tabContents.forEach(content => {
            if (isNarrow) {
                content.classList.add('narrow-layout');
            } else {
                content.classList.remove('narrow-layout');
            }
        });
    }

    // Backward compatibility methods
    get activeTab() {
        return this.tabManager.activeTab;
    }

    get isTabsCreated() {
        return this.tabManager.isTabsCreated;
    }
}
