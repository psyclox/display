/**
 * Ultimate Display — Main Application Logic
 * Handles tab switching, global settings, fullscreen, adaptive theme, timezone, and modules.
 */

import { ClockManager } from './modules/clock/manager.js';
import { ClockEngine } from './modules/clock/engine.js';
import { TextManager } from './modules/text/manager.js';
import { UpdateSimulator } from './modules/update/simulator.js';
import { MediaManager } from './modules/media/manager.js';

class App {
    constructor() {
        this.currentTab = 'clock';
        this.nav = document.getElementById('main-nav');
        this.tabs = document.querySelectorAll('.tab-content');
        this.navBtns = document.querySelectorAll('.nav-btn');
        this.fullscreenBtn = document.getElementById('fullscreen-btn');
        this.settingsBtn = document.getElementById('settings-btn');
        this.wakeLock = null;
        this.currentTheme = 'theme-dark';

        this.clockManager = new ClockManager('clock-container');
        this.textManager = new TextManager('text-canvas');
        this.updateSimulator = new UpdateSimulator('update-tab');
        this.mediaManager = new MediaManager('media-tab');

        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupGlobalSettings();
        this.setupFullscreen();
        this.setupAdaptiveTheme();
        this.populateTimezones();
        this.loadTheme();
        this.loadSettings();
    }

    setupNavigation() {
        this.navBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });
    }

    switchTab(tabId) {
        this.currentTab = tabId;
        this.navBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId));
        this.tabs.forEach(tab => tab.classList.toggle('active', tab.id === `${tabId}-tab`));
    }

    /* ═══ Fullscreen ═══ */
    setupFullscreen() {
        let uiTimeout, cursorTimeout;

        this.fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().then(() => this.requestWakeLock()).catch(e => console.log(e));
            } else {
                document.exitFullscreen?.();
            }
        });

        document.addEventListener('fullscreenchange', () => {
            if (document.fullscreenElement) {
                document.body.classList.add('fullscreen-active');
                this.nav.classList.add('hidden');
                this.requestWakeLock();
                document.onmousemove = () => {
                    document.body.classList.add('show-ui');
                    this.nav.classList.remove('hidden');
                    document.body.style.cursor = 'auto';
                    clearTimeout(uiTimeout);
                    clearTimeout(cursorTimeout);
                    uiTimeout = setTimeout(() => {
                        if (document.fullscreenElement) { document.body.classList.remove('show-ui'); this.nav.classList.add('hidden'); }
                    }, 3000);
                    cursorTimeout = setTimeout(() => {
                        if (document.fullscreenElement) document.body.style.cursor = 'none';
                    }, 3500);
                };
            } else {
                document.body.classList.remove('fullscreen-active', 'show-ui');
                this.nav.classList.remove('hidden');
                document.body.style.cursor = 'auto';
                document.onmousemove = null;
                clearTimeout(uiTimeout);
                if (this.wakeLock) { this.wakeLock.release().then(() => { this.wakeLock = null; }); }
            }
        });
    }

    async requestWakeLock() {
        try {
            if ('wakeLock' in navigator) this.wakeLock = await navigator.wakeLock.request('screen');
        } catch (e) { console.error(`WakeLock: ${e.message}`); }
    }

    /* ═══ Adaptive Theme ═══ */
    setupAdaptiveTheme() {
        window.addEventListener('faceChanged', (e) => {
            if (this.currentTheme !== 'theme-adaptive') return;
            const config = e.detail;
            if (!config?.palette) return;
            const bg = config.palette.bg;
            const isDark = this.isColorDark(bg);
            document.documentElement.style.setProperty('--bg-color', bg);
            document.documentElement.style.setProperty('--text-color', isDark ? '#e8e8ec' : '#1d1d1f');
            document.documentElement.style.setProperty('--accent-color', config.palette.accent);
            document.documentElement.style.setProperty('--glass-bg', isDark ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.35)');
            document.documentElement.style.setProperty('--glass-border', isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)');
            document.documentElement.style.setProperty('--glass-hover', isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)');
            document.documentElement.style.setProperty('--dropdown-bg', isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)');
            document.documentElement.style.setProperty('--dropdown-text', isDark ? '#ffffff' : '#1d1d1f');
        });
    }

    isColorDark(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        if (hex.length !== 6) return true;
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
    }

    /* ═══ Timezone Picker ═══ */
    populateTimezones() {
        const select = document.getElementById('setting-timezone');
        if (!select) return;

        const timezones = ClockEngine.getTimezones();
        const current = Intl.DateTimeFormat().resolvedOptions().timeZone;

        timezones.forEach(tz => {
            const opt = document.createElement('option');
            opt.value = tz.value;
            opt.textContent = tz.label;
            if (tz.value === current) opt.selected = true;
            select.appendChild(opt);
        });

        select.addEventListener('change', () => {
            this.clockManager.setTimezone(select.value);
            this.saveSettings();
        });
    }

    /* ═══ Settings ═══ */
    setupGlobalSettings() {
        document.addEventListener('contextmenu', e => e.preventDefault());

        const modal = document.getElementById('global-settings');
        const closeBtn = document.getElementById('close-settings');
        const themeSelect = document.getElementById('theme-select');

        this.settingsBtn.addEventListener('click', () => modal.classList.remove('hidden'));
        closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });

        themeSelect.addEventListener('change', (e) => this.setTheme(e.target.value));

        // Clock Settings
        const showSeconds = document.getElementById('setting-show-seconds');
        const showDate = document.getElementById('setting-show-date');
        const use24h = document.getElementById('setting-24h');

        showSeconds?.addEventListener('change', () => {
            if (this.clockManager.currentFace) {
                this.clockManager.currentFace.layout.showSeconds = showSeconds.checked;
                this.clockManager.renderer.setupFace(this.clockManager.currentFace);
            }
            this.saveSettings();
        });

        showDate?.addEventListener('change', () => {
            if (this.clockManager.currentFace) {
                this.clockManager.currentFace.layout.showDate = showDate.checked;
                this.clockManager.renderer.setupFace(this.clockManager.currentFace);
            }
            this.saveSettings();
        });

        use24h?.addEventListener('change', () => {
            this.clockManager.set24h(use24h.checked);
            this.saveSettings();
        });

        const showAmpm = document.getElementById('setting-show-ampm');
        showAmpm?.addEventListener('change', () => {
            this.clockManager.setShowAmpm(showAmpm.checked);
            this.saveSettings();
        });

        // Text Settings
        document.getElementById('setting-text-direction')?.addEventListener('change', (e) => {
            this.textManager.setDirection(e.target.value);
            this.saveSettings();
        });
        document.getElementById('setting-text-opacity')?.addEventListener('input', (e) => {
            this.textManager.setOpacity(parseFloat(e.target.value));
            this.saveSettings();
        });
        document.getElementById('setting-text-blur')?.addEventListener('input', (e) => {
            this.textManager.setBlur(parseInt(e.target.value, 10));
            this.saveSettings();
        });

        // Media Settings
        document.getElementById('setting-slide-duration')?.addEventListener('change', (e) => {
            this.mediaManager.setDelay(parseInt(e.target.value, 10));
            this.saveSettings();
        });
    }

    setTheme(themeName) {
        this.currentTheme = themeName;
        document.body.classList.remove('theme-dark', 'theme-light', 'theme-oled', 'theme-adaptive');
        document.body.classList.add(themeName);

        // Clear adaptive custom properties when switching away
        if (themeName !== 'theme-adaptive') {
            ['--bg-color', '--text-color', '--accent-color', '--glass-bg', '--glass-border', '--glass-hover', '--dropdown-bg', '--dropdown-text']
                .forEach(p => document.documentElement.style.removeProperty(p));
        } else if (this.clockManager.currentFace) {
            window.dispatchEvent(new CustomEvent('faceChanged', { detail: this.clockManager.currentFace }));
        }

        // Re-render clock face so bg updates for the new theme
        if (this.clockManager.currentFace) {
            this.clockManager.renderer.setupFace(this.clockManager.currentFace);
        }

        if (document.fullscreenElement) document.body.classList.add('fullscreen-active');
        localStorage.setItem('display-theme', themeName);
    }

    loadTheme() {
        const saved = localStorage.getItem('display-theme');
        if (saved) {
            this.setTheme(saved);
            const sel = document.getElementById('theme-select');
            if (sel) sel.value = saved;
        }
    }

    saveSettings() {
        const s = {
            showSeconds: document.getElementById('setting-show-seconds')?.checked,
            showDate: document.getElementById('setting-show-date')?.checked,
            use24h: document.getElementById('setting-24h')?.checked,
            showAmpm: document.getElementById('setting-show-ampm')?.checked,
            textDirection: document.getElementById('setting-text-direction')?.value,
            textOpacity: document.getElementById('setting-text-opacity')?.value,
            textBlur: document.getElementById('setting-text-blur')?.value,
            slideDuration: document.getElementById('setting-slide-duration')?.value,
            timezone: document.getElementById('setting-timezone')?.value,
        };
        localStorage.setItem('display-settings', JSON.stringify(s));
    }

    loadSettings() {
        const saved = localStorage.getItem('display-settings');
        if (!saved) return;
        try {
            const s = JSON.parse(saved);
            if (s.showSeconds !== undefined) { const el = document.getElementById('setting-show-seconds'); if (el) el.checked = s.showSeconds; }
            if (s.showDate !== undefined) { const el = document.getElementById('setting-show-date'); if (el) el.checked = s.showDate; }
            if (s.use24h !== undefined) { const el = document.getElementById('setting-24h'); if (el) { el.checked = s.use24h; this.clockManager.set24h(s.use24h); } }
            if (s.showAmpm !== undefined) { const el = document.getElementById('setting-show-ampm'); if (el) { el.checked = s.showAmpm; this.clockManager.setShowAmpm(s.showAmpm); } }
            if (s.textDirection) { const el = document.getElementById('setting-text-direction'); if (el) el.value = s.textDirection; this.textManager.setDirection(s.textDirection); }
            if (s.textOpacity) { const el = document.getElementById('setting-text-opacity'); if (el) el.value = s.textOpacity; this.textManager.setOpacity(parseFloat(s.textOpacity)); }
            if (s.textBlur) { const el = document.getElementById('setting-text-blur'); if (el) el.value = s.textBlur; this.textManager.setBlur(parseInt(s.textBlur, 10)); }
            if (s.slideDuration) { const el = document.getElementById('setting-slide-duration'); if (el) el.value = s.slideDuration; this.mediaManager.setDelay(parseInt(s.slideDuration, 10)); }
            if (s.timezone) { const el = document.getElementById('setting-timezone'); if (el) el.value = s.timezone; this.clockManager.setTimezone(s.timezone); }
        } catch (e) { console.error('Settings load error:', e); }
    }
}

document.addEventListener('DOMContentLoaded', () => { window.app = new App(); });
