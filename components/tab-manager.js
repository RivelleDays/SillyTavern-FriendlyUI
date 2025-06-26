/**
 * Generic Tab Manager for dynamic tab creation and management
 */

export class TabManager {
    constructor(config) {
        this.config = {
            containerSelector: config.containerSelector,
            insertAfterSelector: config.insertAfterSelector,
            insertBeforeSelector: config.insertBeforeSelector, // New option
            useContainerForContent: config.useContainerForContent || false, // New option
            tabPrefix: config.tabPrefix || 'tab',
            activeTabStorageKey: config.activeTabStorageKey,
            defaultTab: config.defaultTab || Object.keys(config.tabs)[0],
            tabs: config.tabs, // { id: { label, icon, contentSelector } }
            checkCondition: config.checkCondition || (() => true),
            onTabSwitch: config.onTabSwitch,
            className: config.className || 'generic-tab'
        };

        this.activeTab = this.config.defaultTab;
        this.tabButtonsContainer = null;
        this.isTabsCreated = false;
        this.enabled = true;

        this.init();
    }

    init() {
        setTimeout(() => this.checkConditionAndInitialize(), 300);
        this.intervalId = setInterval(() => this.checkConditionAndInitialize(), 2000);
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            // Clear interval to prevent re-creation
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }

            // Force remove tabs immediately when disabled
            if (this.isTabsCreated) {
                this.removeTabs();
            }

            // Double-check removal after a short delay
            setTimeout(() => {
                if (!this.enabled) {
                    this.forceRemoveAllTabElements();
                }
            }, 100);
        } else if (enabled && !this.intervalId) {
            // Re-enable interval checking when enabled
            this.intervalId = setInterval(() => this.checkConditionAndInitialize(), 2000);
            // Check immediately
            this.checkConditionAndInitialize();
        }
    }

    // Force remove all tab-related elements by class name
    forceRemoveAllTabElements() {
        // Remove tab buttons container
        const tabButtons = document.querySelectorAll(`.${this.config.className}-buttons`);
        tabButtons.forEach(el => el.remove());

        // Remove all tab content containers
        const tabContents = document.querySelectorAll(`.${this.config.className}-content`);
        tabContents.forEach(el => el.remove());

        this.tabButtonsContainer = null;
        this.isTabsCreated = false;
    }

    checkConditionAndInitialize() {
        if (!this.enabled) {
            // If disabled, ensure tabs are removed
            if (this.isTabsCreated) {
                this.removeTabs();
            }
            return;
        }

        const shouldShowTabs = this.config.checkCondition();

        if (shouldShowTabs && !this.isTabsCreated) {
            this.createTabs();
        } else if (!shouldShowTabs && this.isTabsCreated) {
            this.removeTabs();
        }
    }

    createTabs() {
        // Prevent duplicate creation
        if (document.querySelector(`.${this.config.className}-buttons`)) {
            this.isTabsCreated = true;
            return;
        }

        // Determine where to insert tabs
        let insertElement;
        let insertMethod = 'afterend';

        if (this.config.insertBeforeSelector) {
            insertElement = document.querySelector(this.config.insertBeforeSelector);
            insertMethod = 'beforebegin';
        } else if (this.config.insertAfterSelector) {
            insertElement = document.querySelector(this.config.insertAfterSelector);
            insertMethod = 'afterend';
        }

        if (!insertElement) return;

        // Generate tab buttons HTML
        const tabButtonsHTML = Object.entries(this.config.tabs)
            .map(([id, tab], index) => `
                <button id="${this.config.tabPrefix}-btn-${id}" class="${this.config.className}-button ${index === 0 ? 'active' : ''}">
                    <i class="${tab.icon}"></i>
                    <span data-i18n="${tab.label}">${tab.label}</span>
                </button>
            `).join('');

        insertElement.insertAdjacentHTML(insertMethod, `
            <div class="${this.config.className}-buttons">
                ${tabButtonsHTML}
            </div>
        `);

        this.tabButtonsContainer = document.querySelector(`.${this.config.className}-buttons`);
        this.organizeContent();
        this.bindEvents();
        this.setInitialState();
        this.isTabsCreated = true;
    }

    organizeContent() {
        const tabButtons = this.tabButtonsContainer;
        if (!tabButtons) return;

        if (this.config.useContainerForContent) {
            // For user settings: create tab containers inside the existing container
            const existingContainer = document.querySelector(this.config.containerSelector);
            if (!existingContainer) return;

            // First, collect all elements that need to be moved BEFORE clearing the container
            const elementsToMove = {};
            Object.entries(this.config.tabs).forEach(([id, tab]) => {
                elementsToMove[id] = [];

                tab.contentSelectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(element => {
                        // Find the wrapper (range-block or direct element)
                        const wrapper = element.closest('.range-block') ||
                                       element.closest('[name]') ||
                                       element;

                        if (wrapper && wrapper.parentNode) {
                            elementsToMove[id].push(wrapper);
                        }
                    });
                });
            });

            // Now create tab containers inside the existing container
            const tabContainersHTML = Object.keys(this.config.tabs)
                .map((id, index) => `
                    <div id="${this.config.tabPrefix}-content-${id}" class="${this.config.className}-content ${index === 0 ? 'active' : ''}"></div>
                `).join('');

            existingContainer.innerHTML = tabContainersHTML;

            // Move collected content to respective tabs
            Object.entries(elementsToMove).forEach(([id, elements]) => {
                const tabContainer = document.querySelector(`#${this.config.tabPrefix}-content-${id}`);
                if (tabContainer) {
                    elements.forEach(element => {
                        if (element && element.parentNode) {
                            tabContainer.appendChild(element);
                        }
                    });
                }
            });
        } else {
            // Original behavior: create tab containers after tab buttons
            const tabContainersHTML = Object.keys(this.config.tabs)
                .map((id, index) => `
                    <div id="${this.config.tabPrefix}-content-${id}" class="${this.config.className}-content ${index === 0 ? 'active' : ''}"></div>
                `).join('');

            tabButtons.insertAdjacentHTML('afterend', tabContainersHTML);

            // Move content to respective tabs
            Object.entries(this.config.tabs).forEach(([id, tab]) => {
                const tabContainer = document.querySelector(`#${this.config.tabPrefix}-content-${id}`);

                tab.contentSelectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(element => {
                        // Find the wrapper (range-block or direct element)
                        const wrapper = element.closest('.range-block') ||
                                       element.closest('[name]') ||
                                       element;

                        if (wrapper && !tabContainer.contains(wrapper) && wrapper.parentNode) {
                            tabContainer.appendChild(wrapper);
                        }
                    });
                });
            });
        }
    }

    removeTabs() {
        // Remove tab buttons
        if (this.tabButtonsContainer) {
            this.tabButtonsContainer.remove();
            this.tabButtonsContainer = null;
        }

        const originalContainer = document.querySelector(this.config.containerSelector);

        if (this.config.useContainerForContent && originalContainer) {
            // For user settings: collect all content from tab containers and restore original structure
            const allContent = [];

            // Collect content from all tab containers
            Object.keys(this.config.tabs).forEach(id => {
                const tabContent = document.querySelector(`#${this.config.tabPrefix}-content-${id}`);
                if (tabContent) {
                    while (tabContent.firstChild) {
                        allContent.push(tabContent.firstChild);
                        tabContent.removeChild(tabContent.firstChild);
                    }
                }
            });

            // Remove all tab containers
            Object.keys(this.config.tabs).forEach(id => {
                const tabContent = document.querySelector(`#${this.config.tabPrefix}-content-${id}`);
                if (tabContent) {
                    tabContent.remove();
                }
            });

            // Clear the container and restore all content directly
            originalContainer.innerHTML = '';
            allContent.forEach(element => {
                originalContainer.appendChild(element);
            });
        } else {
            // Original behavior: move content back to original container
            if (originalContainer) {
                Object.keys(this.config.tabs).forEach(id => {
                    const tabContent = document.querySelector(`#${this.config.tabPrefix}-content-${id}`);
                    if (tabContent) {
                        while (tabContent.firstChild) {
                            originalContainer.appendChild(tabContent.firstChild);
                        }
                        tabContent.remove();
                    }
                });
            }
        }

        // Force remove any remaining tab elements
        this.forceRemoveAllTabElements();

        this.isTabsCreated = false;
    }

    bindEvents() {
        document.querySelectorAll(`.${this.config.className}-button`).forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = e.target.closest(`.${this.config.className}-button`).id
                    .replace(`${this.config.tabPrefix}-btn-`, '');
                this.switchTab(tabId);
            });
        });
    }

    switchTab(tabId) {
        if (!Object.keys(this.config.tabs).includes(tabId)) return;

        // Update buttons
        document.querySelectorAll(`.${this.config.className}-button`).forEach(button => {
            button.classList.toggle('active', button.id.includes(tabId));
        });

        // Update content
        document.querySelectorAll(`.${this.config.className}-content`).forEach(content => {
            const isActive = content.id.includes(tabId);
            content.classList.toggle('active', isActive);
        });

        // Scroll to top - check multiple possible scroll containers
        const scrollContainers = [
            '#left-nav-panel .scrollableInner',
            '#user-settings-block',
            '#user-settings-block-content',
            '.drawer-content'
        ];

        scrollContainers.forEach(selector => {
            const container = document.querySelector(selector);
            if (container) {
                container.scrollTop = 0;
            }
        });

        this.activeTab = tabId;
        this.saveTabPreference(tabId);

        // Call custom callback if provided
        if (this.config.onTabSwitch) {
            this.config.onTabSwitch(tabId);
        }
    }

    setInitialState() {
        const savedTab = this.loadTabPreference();
        const initialTab = Object.keys(this.config.tabs).includes(savedTab) ? savedTab : this.config.defaultTab;
        this.switchTab(initialTab);
    }

    saveTabPreference(tabId) {
        if (!this.config.activeTabStorageKey) return;
        try {
            localStorage.setItem(this.config.activeTabStorageKey, tabId);
        } catch (error) {
            // Silent fail
        }
    }

    loadTabPreference() {
        if (!this.config.activeTabStorageKey) return null;
        try {
            return localStorage.getItem(this.config.activeTabStorageKey);
        } catch (error) {
            return null;
        }
    }

    refreshTabs() {
        if (this.enabled) {
            this.checkConditionAndInitialize();
        }
    }

    // Clean up method to stop all timers
    destroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        if (this.isTabsCreated) {
            this.removeTabs();
        }
    }
}
