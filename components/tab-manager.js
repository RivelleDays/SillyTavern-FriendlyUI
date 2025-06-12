/**
 * Generic Tab Manager for dynamic tab creation and management
 */

export class TabManager {
    constructor(config) {
        this.config = {
            containerSelector: config.containerSelector,
            insertAfterSelector: config.insertAfterSelector,
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
        setInterval(() => this.checkConditionAndInitialize(), 2000);
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled && this.isTabsCreated) {
            this.removeTabs();
        } else if (enabled) {
            this.checkConditionAndInitialize();
        }
    }

    checkConditionAndInitialize() {
        if (!this.enabled) return;

        const shouldShowTabs = this.config.checkCondition();

        if (shouldShowTabs && !this.isTabsCreated) {
            this.createTabs();
        } else if (!shouldShowTabs && this.isTabsCreated) {
            this.removeTabs();
        }
    }

    createTabs() {
        const insertAfterElement = document.querySelector(this.config.insertAfterSelector);
        if (!insertAfterElement) return;

        // Generate tab buttons HTML
        const tabButtonsHTML = Object.entries(this.config.tabs)
            .map(([id, tab], index) => `
                <button id="${this.config.tabPrefix}-btn-${id}" class="${this.config.className}-button ${index === 0 ? 'active' : ''}">
                    <i class="${tab.icon}"></i>
                    <span data-i18n="${tab.label}">${tab.label}</span>
                </button>
            `).join('');

        insertAfterElement.insertAdjacentHTML('afterend', `
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

        // Create tab containers
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

    removeTabs() {
        if (this.tabButtonsContainer) {
            this.tabButtonsContainer.remove();
            this.tabButtonsContainer = null;
        }

        const originalContainer = document.querySelector(this.config.containerSelector);
        if (!originalContainer) return;

        // Move all content back to original container
        Object.keys(this.config.tabs).forEach(id => {
            const tabContent = document.querySelector(`#${this.config.tabPrefix}-content-${id}`);
            if (tabContent) {
                while (tabContent.firstChild) {
                    originalContainer.appendChild(tabContent.firstChild);
                }
                tabContent.remove();
            }
        });

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
        this.checkConditionAndInitialize();
    }
}
