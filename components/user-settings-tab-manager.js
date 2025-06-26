/**
 * User Settings Tab Manager
 * Organizes user settings into categorized tabs for better UX
 */

import { TabManager } from './tab-manager.js';

export class UserSettingsTabManager {
    constructor() {
        this.tabManager = new TabManager({
            containerSelector: '#user-settings-block-content',
            insertBeforeSelector: '#user-settings-block-content', // Changed to insertBefore
            tabPrefix: 'user-settings-tab',
            activeTabStorageKey: 'user-settings-active-tab',
            defaultTab: 'theme',
            className: 'user-settings-tab',
            useContainerForContent: true, // New flag to use container for content
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
        this.resizeObserver = null;
        this.setupCustomizations();
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        this.tabManager.setEnabled(enabled);

        // Clean up resize observer when disabled
        if (!enabled && this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
    }

    refreshTabs() {
        if (this.enabled) {
            this.tabManager.refreshTabs();
        }
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
        // Add styles if needed for tab layout
        const styleId = 'user-settings-tab-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .user-settings-tab-content {
                    width: 100% !important;
                }
                .user-settings-tab-content.narrow-layout {
                    /* Narrow layout specific styles */
                }
            `;
            document.head.appendChild(style);
        }
    }

    setupResponsiveLayout() {
        // Only set up if enabled
        if (!this.enabled) return;

        // Ensure the tab content is responsive
        this.resizeObserver = new ResizeObserver(entries => {
            entries.forEach(entry => {
                if (entry.target.classList.contains('user-settings-tab-content')) {
                    // Handle responsive layout adjustments
                    this.adjustLayoutForSize(entry.contentRect.width);
                }
            });
        });

        // Observe all tab content containers
        const checkAndObserve = () => {
            if (!this.enabled || !this.resizeObserver) return;

            const tabContents = document.querySelectorAll('.user-settings-tab-content');
            tabContents.forEach(content => {
                if (!content.hasAttribute('data-observed')) {
                    this.resizeObserver.observe(content);
                    content.setAttribute('data-observed', 'true');
                }
            });
        };

        // Initial check and periodic recheck
        checkAndObserve();
        this.observeInterval = setInterval(() => {
            if (this.enabled) {
                checkAndObserve();
            }
        }, 1000);
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
            // Ensure width is always 100%
            content.style.width = '100%';
        });
    }

    // Clean up method
    destroy() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        if (this.observeInterval) {
            clearInterval(this.observeInterval);
            this.observeInterval = null;
        }
        if (this.tabManager) {
            this.tabManager.destroy();
        }
    }

    // Backward compatibility methods
    get activeTab() {
        return this.tabManager.activeTab;
    }

    get isTabsCreated() {
        return this.tabManager.isTabsCreated;
    }
}
