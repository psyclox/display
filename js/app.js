/**
 * Main Application Logic
 * Handles tab switching, global settings, and initialization.
 */

import { ClockManager } from './modules/clock/manager.js';
import { TextManager } from './modules/text/manager.js';
import { UpdateSimulator } from './modules/update/simulator.js';

class App {
    constructor() {
        this.currentTab = 'clock';
        this.nav = document.getElementById('main-nav');
        this.tabs = document.querySelectorAll('.tab-content');
        this.navBtns = document.querySelectorAll('.nav-btn');
        this.fullscreenBtn = document.getElementById('fullscreen-btn');
        this.settingsBtn = document.getElementById('settings-btn');

        // Modules
        this.clockManager = new ClockManager('clock-container');
        this.textManager = new TextManager('text-canvas');
        this.updateSimulator = new UpdateSimulator('update-tab');

        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupGlobalSettings();
        this.setupFullscreen();
        this.loadTheme();

        // Hide nav on inactivity logic could go here
    }

    setupNavigation() {
        this.navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                this.switchTab(tabId);
            });
        });
    }

    switchTab(tabId) {
        // Update state
        this.currentTab = tabId;

        // Update UI
        this.navBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        this.tabs.forEach(tab => {
            const isActive = tab.id === `${tabId}-tab`;
            tab.classList.toggle('active', isActive);
        });

        console.log(`Switched to ${tabId}`);
    }

    setupFullscreen() {
        this.fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().then(() => {
                    this.requestWakeLock();
                }).catch(err => {
                    console.log(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                });
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        });

        // Hide nav when in fullscreen after delay?
        document.addEventListener('fullscreenchange', () => {
            if (document.fullscreenElement) {
                // Re-request wake lock if needed (some browsers release it)
                this.requestWakeLock();
                this.nav.classList.add('hidden'); // Auto hide nav

                // Show nav on mouse move
                let timeout;
                document.onmousemove = () => {
                    this.nav.classList.remove('hidden');
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        if (document.fullscreenElement) this.nav.classList.add('hidden');
                    }, 3000);
                }
            } else {
                this.nav.classList.remove('hidden');
                document.onmousemove = null;
                if (this.wakeLock !== null) {
                    this.wakeLock.release()
                        .then(() => {
                            this.wakeLock = null;
                        })
                }
            }
        });
    }

    async requestWakeLock() {
        try {
            if ('wakeLock' in navigator) {
                this.wakeLock = await navigator.wakeLock.request('screen');
                console.log('Wake Lock is active!');
            }
        } catch (err) {
            console.error(`${err.name}, ${err.message}`);
        }
    }

    setupGlobalSettings() {
        // Prevent Context Menu (Right Click)
        document.addEventListener('contextmenu', event => event.preventDefault());

        const modal = document.getElementById('global-settings');
        const closeBtn = document.getElementById('close-settings');
        const themeSelect = document.getElementById('theme-select');


        this.settingsBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
        });

        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        themeSelect.addEventListener('change', (e) => {
            this.setTheme(e.target.value);
        });
    }

    setTheme(themeName) {
        document.body.className = themeName;
        // Persist theme choice used to localStorage if needed
        localStorage.setItem('display-theme', themeName);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('display-theme');
        if (savedTheme) {
            this.setTheme(savedTheme);
            const themeSelect = document.getElementById('theme-select');
            if (themeSelect) themeSelect.value = savedTheme;
        }
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
