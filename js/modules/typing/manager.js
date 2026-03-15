/**
 * TypingManager — Tab controller for the Typing SVG configurator
 * Builds the full UI, handles live preview, embed code generation, copy-to-clipboard
 */
import { TypingSVGEngine } from './engine.js';

import { FontManager } from '../utils/fonts.js';

const EXTRA_FONTS = [
    'Permanent Marker', 'Sedgwick Ave', 'Rock Salt', 'Just Another Hand', 'Covered By Your Grace',
    'Cinzel Decorative', 'Cormorant', 'Playfair Display SC', 'Syncopate', 'Space Grotesk',
    'Bebas Neue', 'Oswald', 'Anton', 'Righteous', 'Teko', 'Monoton', 'Audiowide', 'Michroma', 'Silkscreen'
];
const _baseFonts = new FontManager().getFontList();
const GOOGLE_FONTS = [...new Set([..._baseFonts, ...EXTRA_FONTS])].sort();

export class TypingManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.config = { ...TypingSVGEngine.DEFAULTS };
        this.config.repeat = true;
        this.config.lines = ['Hello World!', 'Welcome to Typing SVG', 'Customize everything!'];
        this.config.center = true;
        this.config.vCenter = true;
        this.config.pause = 1000;
        this.config.width = 500;
        this.config.height = 60;
        this.updateTimer = null;
        this.buildUI();
        this.loadSettings();
        this.scheduleUpdate();
    }

    // ═══════════════════════════════════════════════════════
    // BUILD UI
    // ═══════════════════════════════════════════════════════
    buildUI() {
        this.container.innerHTML = `
<div class="typing-configurator">
    <!-- LEFT: Controls -->
    <div class="typing-panel typing-controls">
        <div class="typing-panel-header">
            <h2>⌨️ Typing SVG Generator</h2>
            <p class="typing-subtitle">Create animated typing text for READMEs &amp; webpages</p>
        </div>

        <!-- Lines Section -->
        <div class="typing-section">
            <div class="typing-section-header">
                <h3>Text Lines</h3>
                <button class="typing-btn-small typing-add-line" id="typing-add-line">+ Add Line</button>
            </div>
            <div class="typing-lines-list" id="typing-lines-list"></div>
        </div>

        <!-- Font Section -->
        <div class="typing-section">
            <h3>Typography</h3>
            <div class="typing-grid">
                <div class="typing-field">
                    <label>Font Family</label>
                    <div class="typing-font-picker-wrap">
                        <input type="text" id="typing-font" class="typing-input typing-font-search" placeholder="Search fonts..." autocomplete="off" value="${this.config.font}">
                        <div class="typing-font-dropdown hidden" id="typing-font-dropdown"></div>
                    </div>
                </div>
                <div class="typing-field">
                    <label>Weight</label>
                    <select id="typing-weight" class="typing-select">
                        <option value="100">100 Thin</option>
                        <option value="200">200 Extra Light</option>
                        <option value="300">300 Light</option>
                        <option value="400" selected>400 Regular</option>
                        <option value="500">500 Medium</option>
                        <option value="600">600 Semi Bold</option>
                        <option value="700">700 Bold</option>
                        <option value="800">800 Extra Bold</option>
                        <option value="900">900 Black</option>
                    </select>
                </div>
                <div class="typing-field">
                    <label>Font Size (px)</label>
                    <input type="number" id="typing-size" class="typing-input" value="${this.config.size}" min="8" max="120">
                </div>
                <div class="typing-field">
                    <label>Font Style</label>
                    <select id="typing-fontStyle" class="typing-select">
                        <option value="normal">Normal</option>
                        <option value="italic">Italic</option>
                    </select>
                </div>
                <div class="typing-field">
                    <label>Letter Spacing (px)</label>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <input type="range" id="typing-letterSpacing" min="0" max="20" step="0.5" value="0" class="typing-range" style="flex:1;">
                        <span class="typing-range-value" id="typing-letterSpacing-val">normal</span>
                    </div>
                </div>
                <div class="typing-field">
                    <label>Text Transform</label>
                    <select id="typing-textTransform" class="typing-select">
                        <option value="none">None</option>
                        <option value="uppercase">Uppercase</option>
                        <option value="lowercase">Lowercase</option>
                        <option value="capitalize">Capitalize Words</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Colors Section -->
        <div class="typing-section">
            <h3>Colors &amp; Effects</h3>
            <div class="typing-grid">
                <div class="typing-field">
                    <label>Text Color</label>
                    <div class="typing-color-wrap">
                        <input type="color" id="typing-color" value="${this.config.color}">
                        <input type="text" id="typing-color-hex" class="typing-input typing-color-hex" value="${this.config.color}" placeholder="#36BCF7">
                    </div>
                </div>
                <div class="typing-field">
                    <label>Background</label>
                    <div class="typing-color-wrap">
                        <input type="color" id="typing-background" value="#000000">
                        <input type="text" id="typing-background-hex" class="typing-input typing-color-hex" value="transparent" placeholder="transparent">
                    </div>
                </div>
                <div class="typing-field typing-field-wide">
                    <label>Gradient (comma-separated hex)</label>
                    <input type="text" id="typing-gradient" class="typing-input" value="${this.config.gradient}" placeholder="#FF6B6B,#4ECDC4,#45B7D1">
                    <div class="typing-gradient-presets" id="typing-gradient-presets"></div>
                </div>
                <div class="typing-field">
                    <label>Glow Color</label>
                    <div class="typing-color-wrap">
                        <input type="color" id="typing-glowColor" value="#36BCF7">
                        <input type="text" id="typing-glowColor-hex" class="typing-input typing-color-hex" value="" placeholder="none">
                    </div>
                </div>
                <div class="typing-field">
                    <label>Glow Intensity</label>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <input type="range" id="typing-glowIntensity" min="1" max="30" value="${this.config.glowIntensity}" class="typing-range">
                        <span class="typing-range-value" id="typing-glowIntensity-val">${this.config.glowIntensity}</span>
                    </div>
                </div>
                <div class="typing-field">
                    <label>Opacity</label>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <input type="range" id="typing-opacity" min="0.1" max="1" step="0.1" value="${this.config.opacity}" class="typing-range">
                        <span class="typing-range-value" id="typing-opacity-val">${this.config.opacity}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Animation Section -->
        <div class="typing-section">
            <h3>Animation</h3>
            <div class="typing-grid">
                <div class="typing-field">
                    <label>Style</label>
                    <select id="typing-animationStyle" class="typing-select">
                        <option value="typing-classic">Typewriter (Classic)</option>
                        <option value="typing-smooth">Typewriter (Smooth)</option>
                        <option value="typing-v2">Typewriter (V2 / Focus)</option>
                        <option value="typing-glow">Typewriter + Glow</option>
                        <option value="fade">Fade (Line)</option>
                        <option value="slide">Slide</option>
                        <option value="glitch">Glitch V1 (RGB Split)</option>
                        <option value="glitch-v2">Glitch V2 (Aggressive)</option>
                        <option value="glitch-v3">Glitch V3 (Distort)</option>
                        <option value="glitch-v4">Glitch V4 (Matrix)</option>
                        <option value="glitch-v5">Glitch V5 (Cyberpunk)</option>
                        <option value="wave">Wave</option>
                        <option value="bounce">Bounce</option>
                        <option value="pulse">Pulse</option>
                        <option value="reveal">Reveal</option>
                        <option value="drop">Drop</option>
                    </select>
                </div>
                <div class="typing-field">
                    <label>Duration (ms/line)</label>
                    <input type="number" id="typing-duration" class="typing-input" value="${this.config.duration}" min="500" max="30000" step="100">
                </div>
                <div class="typing-field">
                    <label>Pause (ms)</label>
                    <input type="number" id="typing-pause" class="typing-input" value="${this.config.pause}" min="0" max="10000" step="100">
                </div>
                <div class="typing-field typing-field-wide">
                    <label class="typing-toggle-label">
                        <input type="checkbox" id="typing-showCursor" checked>
                        <span>Show Cursor</span>
                    </label>
                </div>
                <div id="typing-cursor-options">
                    <div class="typing-grid">
                        <div class="typing-field">
                            <label>Cursor Style</label>
                            <select id="typing-cursorStyle" class="typing-select">
                                <option value="solid">Solid</option>
                                <option value="blink">Blink</option>
                                <option value="smooth">Smooth</option>
                            </select>
                        </div>
                        <div class="typing-field">
                            <label>Cursor Color</label>
                            <div class="typing-color-wrap">
                                <input type="color" id="typing-cursorColor" value="#36BCF7">
                                <input type="text" id="typing-cursorColor-hex" class="typing-input typing-color-hex" value="" placeholder="auto (text color)">
                            </div>
                        </div>
                        <div class="typing-field">
                            <label>Cursor Width</label>
                            <div style="display:flex; align-items:center; gap:8px;">
                                <input type="range" id="typing-cursorWidth" min="1" max="10" value="${this.config.cursorWidth}" class="typing-range" style="flex:1;">
                                <span class="typing-range-value" id="typing-cursorWidth-val">${this.config.cursorWidth}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Layout Section -->
        <div class="typing-section">
            <h3>Layout</h3>
            <div class="typing-grid">
                <div class="typing-field">
                    <label>Width (px)</label>
                    <input type="number" id="typing-width" class="typing-input" value="${this.config.width}" min="50" max="2000">
                </div>
                <div class="typing-field">
                    <label>Height (px)</label>
                    <input type="number" id="typing-height" class="typing-input" value="${this.config.height}" min="20" max="1000">
                </div>
                <div class="typing-field">
                    <label>X-Offset / Pad Left</label>
                    <input type="number" id="typing-offsetX" class="typing-input" value="${this.config.offsetX || 0}" min="-500" max="500">
                </div>
                <div class="typing-field">
                    <label>Y-Offset / Pad Top</label>
                    <input type="number" id="typing-offsetY" class="typing-input" value="${this.config.offsetY || 0}" min="-500" max="500">
                </div>
                <div class="typing-field">
                    <label>Center Horizontally</label>
                    <select id="typing-center" class="typing-select">
                        <option value="true" selected>Yes</option>
                        <option value="false">No</option>
                    </select>
                </div>
                <div class="typing-field">
                    <label>Center Vertically</label>
                    <select id="typing-vCenter" class="typing-select">
                        <option value="true" selected>Yes</option>
                        <option value="false">No</option>
                    </select>
                </div>
                <div class="typing-field">
                    <label>Multiline</label>
                    <select id="typing-multiline" class="typing-select">
                        <option value="false" selected>Single line (retype)</option>
                        <option value="true">Each on new line</option>
                    </select>
                </div>
                <div class="typing-field">
                    <label>Repeat</label>
                    <select id="typing-repeat" class="typing-select">
                        <option value="true" selected>Yes</option>
                        <option value="false">No</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Border Section -->
        <div class="typing-section">
            <h3>Border</h3>
            <div class="typing-grid">
                <div class="typing-field">
                    <label>Border Width (px)</label>
                    <input type="number" id="typing-borderWidth" class="typing-input" value="${this.config.borderWidth}" min="0" max="10">
                </div>
                <div class="typing-field">
                    <label>Border Radius (px)</label>
                    <input type="number" id="typing-borderRadius" class="typing-input" value="${this.config.borderRadius}" min="0" max="50">
                </div>
                <div class="typing-field">
                    <label>Border Color</label>
                    <div class="typing-color-wrap">
                        <input type="color" id="typing-borderColor" value="#36BCF7">
                        <input type="text" id="typing-borderColor-hex" class="typing-input typing-color-hex" value="" placeholder="none">
                    </div>
                </div>
            </div>
        </div>

        <!-- Actions -->
        <div class="typing-section typing-actions">
            <button class="typing-btn" id="typing-reset">↺ Reset All</button>
        </div>
    </div>

    <!-- RIGHT: Preview + Output -->
    <div class="typing-panel typing-output">
        <div class="typing-panel-header" style="display:flex; justify-content:space-between; align-items:center;">
            <h2>Preview</h2>
            <div style="display:flex; gap:12px; align-items:center;">
                <label class="typing-border-toggle">
                    <input type="checkbox" id="typing-show-border">
                    <span>Show border</span>
                </label>
                <button class="typing-btn-small" style="background:var(--accent-color); color:#fff; border-color:var(--accent-color);" id="typing-download-svg">⬇ Download SVG</button>
            </div>
        </div>

        <div class="typing-preview-area" id="typing-preview-area">
            <div class="typing-preview-inner" id="typing-preview-inner"></div>
        </div>

        <div class="typing-output-section">
            <div class="typing-output-header">
                <h3>Markdown</h3>
                <button class="typing-btn-small typing-copy-btn" id="typing-copy-md">Copy</button>
            </div>
            <pre class="typing-code" id="typing-code-md"></pre>
        </div>

        <div class="typing-output-section">
            <div class="typing-output-header">
                <h3>HTML</h3>
                <button class="typing-btn-small typing-copy-btn" id="typing-copy-html">Copy</button>
            </div>
            <pre class="typing-code" id="typing-code-html"></pre>
        </div>

        <div class="typing-output-section">
            <div class="typing-output-header">
                <h3>Raw SVG File</h3>
                <div style="display:flex; gap:8px;">
                    <button class="typing-btn-small typing-copy-btn" id="typing-copy-svg">Copy</button>
                </div>
            </div>
            <pre class="typing-code typing-code-svg" id="typing-code-svg"></pre>
        </div>
    </div>
</div>`;

        this._setupLines();
        this._setupFontPicker();
        this._setupEventListeners();
    }

    // ═══════════════════════════════════════════════════════
    // LINES MANAGEMENT
    // ═══════════════════════════════════════════════════════
    _setupLines() {
        const list = this.container.querySelector('#typing-lines-list');
        list.innerHTML = '';
        this.config.lines.forEach((line, i) => this._addLineElement(list, i, line));
    }

    _addLineElement(list, index, value = '') {
        const row = document.createElement('div');
        row.className = 'typing-line-row';
        row.dataset.index = index;

        const num = document.createElement('span');
        num.className = 'typing-line-num';
        num.textContent = index + 1;

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'typing-input typing-line-input';
        input.value = value;
        input.placeholder = 'Enter text...';
        input.addEventListener('input', () => {
            this.config.lines[index] = input.value;
            this.scheduleUpdate();
        });

        const del = document.createElement('button');
        del.className = 'typing-btn-icon typing-del-line';
        del.innerHTML = '×';
        del.title = 'Remove line';
        del.addEventListener('click', () => {
            this.config.lines.splice(index, 1);
            if (this.config.lines.length === 0) this.config.lines = [''];
            this._setupLines();
            this.scheduleUpdate();
        });

        row.appendChild(num);
        row.appendChild(input);
        row.appendChild(del);
        list.appendChild(row);
    }

    // ═══════════════════════════════════════════════════════
    // GOOGLE FONTS PICKER (Lazy Loaded)
    // ═══════════════════════════════════════════════════════
    _setupFontPicker() {
        const input = this.container.querySelector('#typing-font');
        const dropdown = this.container.querySelector('#typing-font-dropdown');

        // Setup observer for lazy-loading font previews
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const item = entry.target;
                    const font = item.dataset.font;
                    if (font && font !== 'monospace' && !item.dataset.loaded) {
                        const encoded = encodeURIComponent(font).replace(/%20/g, '+');
                        item.style.fontFamily = `"${font}", monospace`;
                        const link = document.createElement('link');
                        link.rel = 'stylesheet';
                        link.href = `https://fonts.googleapis.com/css2?family=${encoded}:wght@400&display=swap&text=${encodeURIComponent(font)}`;
                        document.head.appendChild(link);
                        item.dataset.loaded = 'true';
                    }
                    observer.unobserve(item);
                }
            });
        }, { root: dropdown, rootMargin: '150px' });

        // Populate dropdown
        const renderList = (filter = '') => {
            const lf = filter.toLowerCase();
            const filtered = GOOGLE_FONTS.filter(f => f.toLowerCase().includes(lf));
            dropdown.innerHTML = '';
            filtered.forEach(font => {
                const item = document.createElement('div');
                item.className = 'typing-font-item';
                item.textContent = font;
                item.dataset.font = font;

                item.addEventListener('click', () => {
                    input.value = font;
                    this.config.font = font;
                    dropdown.classList.add('hidden');
                    this.scheduleUpdate();
                });
                
                dropdown.appendChild(item);
                if (font !== 'monospace') {
                    observer.observe(item);
                }
            });
        };

        input.addEventListener('focus', () => {
            renderList(input.value);
            dropdown.classList.remove('hidden');
        });

        input.addEventListener('input', () => {
            renderList(input.value);
            dropdown.classList.remove('hidden');
            this.config.font = input.value || 'monospace';
            this.scheduleUpdate();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.typing-font-picker-wrap')) {
                dropdown.classList.add('hidden');
            }
        });
    }

    // ═══════════════════════════════════════════════════════
    // EVENT LISTENERS
    // ═══════════════════════════════════════════════════════
    _setupEventListeners() {
        const $ = id => this.container.querySelector(`#${id}`);

        const bindInput = (id, key, type = 'string') => {
            const el = this.container.querySelector('#' + id);
            if (!el) return;
            const evt = el.tagName === 'SELECT' || el.type === 'range' ? 'change' : 'input';
            el.addEventListener(evt, () => {
                let val = el.value;
                if (type === 'number') val = Number(val);
                if (type === 'boolean') val = val === 'true';
                this.config[key] = val;
                
                // Keep connected label updated for ranges
                const valLabel = this.container.querySelector(`#${id}-val`);
                if (valLabel) valLabel.textContent = val;

                this.scheduleUpdate();
            });
        };

        // Initialize Gradient Presets
        const presetsContainer = this.container.querySelector('#typing-gradient-presets');
        if (presetsContainer) {
            const presets = [
                '#FF6B6B,#4ECDC4',     // Neon Watermelon
                '#a18cd1,#fbc2eb',     // Amour
                '#fa709a,#fee140',     // Sunny Morning
                '#fccb90,#d57eeb',     // Plum Plate
                '#e0c3fc,#8ec5fc',     // True Sunset
                '#43e97b,#38f9d7',     // Sea Weed
                '#f83600,#f9d423',     // Mars Party
                '#b224ef,#7579ff',     // Purple Division
                '#16a085,#f4d03f',     // Solid Stone
                '#ff7eb3,#ff758c',     // Pink Sugar
                '#00c6ff,#0072ff',     // Deep Blue
                '#000000,#434343'      // Subtly Gothic
            ];
            presets.forEach(grad => {
                const swatch = document.createElement('div');
                swatch.className = 'typing-gradient-swatch';
                swatch.style.background = `linear-gradient(135deg, ${grad})`;
                swatch.title = grad;
                swatch.addEventListener('click', () => {
                    const gradInput = this.container.querySelector('#typing-gradient');
                    gradInput.value = grad;
                    this.config.gradient = grad;
                    this.scheduleUpdate();
                });
                presetsContainer.appendChild(swatch);
            });
        }

        // Add line button
        $('typing-add-line').addEventListener('click', () => {
            this.config.lines.push('');
            this._addLineElement(
                this.container.querySelector('#typing-lines-list'),
                this.config.lines.length - 1,
                ''
            );
            // Re-number
            this.container.querySelectorAll('.typing-line-num').forEach((el, i) => el.textContent = i + 1);
        });

        // Simple input/select bindings
        const bind = (id, key, transform = v => v) => {
            const el = $(id);
            if (!el) return;
            const evt = el.tagName === 'SELECT' || el.type === 'range' ? 'change' : 'input';
            el.addEventListener(evt, () => {
                this.config[key] = transform(el.value);
                if (el.type === 'range') {
                    const valSpan = this.container.querySelector(`#${id}-val`);
                    if (valSpan) valSpan.textContent = el.value;
                }
                this.scheduleUpdate();
            });
        };

        const toBool = v => v === 'true';
        const toInt = v => parseInt(v, 10) || 0;
        const toFloat = v => parseFloat(v) || 0;

        bind('typing-weight', 'weight');
        bind('typing-size', 'size', toInt);
        bind('typing-fontStyle', 'fontStyle');
        bind('typing-letterSpacing', 'letterSpacing', v => {
            const num = parseFloat(v);
            const valSpan = this.container.querySelector('#typing-letterSpacing-val');
            if (num === 0) {
                if (valSpan) valSpan.textContent = 'normal';
                return 'normal';
            }
            if (valSpan) valSpan.textContent = v + 'px';
            return v;
        });
        bind('typing-cursorWidth', 'cursorWidth', v => {
            const valSpan = this.container.querySelector('#typing-cursorWidth-val');
            if (valSpan) valSpan.textContent = v;
            return parseInt(v, 10) || 3;
        });
        bind('typing-textTransform', 'textTransform');
        bind('typing-gradient', 'gradient');
        bind('typing-glowIntensity', 'glowIntensity', toInt);
        bind('typing-opacity', 'opacity', toFloat);
        bind('typing-animationStyle', 'animationStyle');
        bind('typing-duration', 'duration', toInt);
        bind('typing-pause', 'pause', toInt);
        bind('typing-cursorStyle', 'cursorStyle');
        bind('typing-width', 'width', toInt);
        bind('typing-height', 'height', toInt);
        bind('typing-center', 'center', toBool);
        bind('typing-vCenter', 'vCenter', toBool);
        bind('typing-multiline', 'multiline', toBool);
        bind('typing-repeat', 'repeat', toBool);
        bind('typing-borderWidth', 'borderWidth', toInt);
        bind('typing-borderRadius', 'borderRadius', toInt);

        // Show Cursor toggle
        const showCursorEl = $('typing-showCursor');
        const cursorOptionsEl = $('typing-cursor-options');
        if (showCursorEl && cursorOptionsEl) {
            // Initialize: if cursorStyle was 'none', uncheck
            if (this.config.cursorStyle === 'none') {
                showCursorEl.checked = false;
                cursorOptionsEl.style.display = 'none';
            }
            this._savedCursorStyle = this.config.cursorStyle !== 'none' ? this.config.cursorStyle : 'blink';

            showCursorEl.addEventListener('change', () => {
                if (showCursorEl.checked) {
                    this.config.cursorStyle = this._savedCursorStyle || 'blink';
                    cursorOptionsEl.style.display = '';
                    const csEl = $('typing-cursorStyle');
                    if (csEl) csEl.value = this.config.cursorStyle;
                } else {
                    this._savedCursorStyle = this.config.cursorStyle;
                    this.config.cursorStyle = 'none';
                    cursorOptionsEl.style.display = 'none';
                }
                this.scheduleUpdate();
            });
        }

        // Color pickers — sync color input and hex text
        this._bindColor('typing-color', 'color');
        this._bindColor('typing-background', 'background', 'transparent');
        this._bindColor('typing-glowColor', 'glowColor', '');
        this._bindColor('typing-cursorColor', 'cursorColor', '');
        this._bindColor('typing-borderColor', 'borderColor', '');

        // Reset button
        $('typing-reset').addEventListener('click', () => {
            this.config = { ...TypingSVGEngine.DEFAULTS };
            this.config.lines = ['Hello World!', 'Welcome to Typing SVG', 'Customize everything!'];
            this.config.center = true;
            this.config.vCenter = true;
            this.config.pause = 1000;
            this.config.width = 500;
            this.config.height = 60;
            this.buildUI();
            this.scheduleUpdate();
        });

        // Copy buttons
        $('typing-copy-md').addEventListener('click', () => this._copyText($('typing-code-md').textContent, $('typing-copy-md')));
        $('typing-copy-html').addEventListener('click', () => this._copyText($('typing-code-html').textContent, $('typing-copy-html')));
        $('typing-copy-svg').addEventListener('click', () => this._copyText($('typing-code-svg').textContent, $('typing-copy-svg')));

        // Download SVG button (Chrome-safe)
        $('typing-download-svg').addEventListener('click', () => {
            const xmlProlog = '<?xml version="1.0" encoding="utf-8"?>\n';
            const svgCode = xmlProlog + $('typing-code-svg').textContent;
            
            // Octet-stream forces Chrome and others to download the file directly
            const blob = new Blob([svgCode], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'animated-typing.svg';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            // Delay revocation so Chrome finishes writing the file
            setTimeout(() => URL.revokeObjectURL(url), 1500);
        });

        // Show border toggle
        $('typing-show-border').addEventListener('change', (e) => {
            const preview = this.container.querySelector('#typing-preview-inner');
            preview.classList.toggle('typing-outlined', e.target.checked);
        });
    }

    _bindColor(baseId, configKey, emptyValue) {
        const colorInput = this.container.querySelector(`#${baseId}`);
        const hexInput = this.container.querySelector(`#${baseId}-hex`);
        if (!colorInput || !hexInput) return;

        colorInput.addEventListener('input', () => {
            hexInput.value = colorInput.value;
            this.config[configKey] = colorInput.value;
            this.scheduleUpdate();
        });

        hexInput.addEventListener('input', () => {
            const v = hexInput.value.trim();
            if (emptyValue !== undefined && (v === '' || v === 'none' || v === 'transparent' || v === 'auto')) {
                this.config[configKey] = emptyValue;
            } else {
                this.config[configKey] = v;
                if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
                    colorInput.value = v;
                }
            }
            this.scheduleUpdate();
        });
    }

    // ═══════════════════════════════════════════════════════
    // UPDATE — Generate SVG + embed codes
    // ═══════════════════════════════════════════════════════
    scheduleUpdate() {
        clearTimeout(this.updateTimer);
        this.updateTimer = setTimeout(() => this.update(), 150);
    }

    update() {
        const c = { ...this.config };

        // Inject Google Font CSS into SVG
        if (c.font && c.font !== 'monospace') {
            c._fontCSS = TypingSVGEngine.getFontImportCSS(c.font, c.weight);
        }

        // --- MEASURE TEXT WIDTHS ---
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const weight = c.weight || '400';
        const size = c.size || 22;
        const font = c.font || 'monospace';
        const style = c.fontStyle === 'italic' ? 'italic ' : '';
        ctx.font = `${style}${weight} ${size}px "${font}", monospace`;
        
        let ls = 0;
        if (c.letterSpacing !== 'normal') {
            ls = parseFloat(c.letterSpacing) || 0;
        }

        c._lineWidths = c.lines.map(line => {
            let textToMeasure = line;
            if (c.textTransform === 'uppercase') textToMeasure = line.toUpperCase();
            else if (c.textTransform === 'lowercase') textToMeasure = line.toLowerCase();
            else if (c.textTransform === 'capitalize') textToMeasure = line.replace(/\b\w/g, l => l.toUpperCase());

            const width = ctx.measureText(textToMeasure).width;
            return width + (textToMeasure.length * ls);
        });

        const svg = TypingSVGEngine.generate(c);

        // Live preview
        const previewEl = this.container.querySelector('#typing-preview-inner');
        previewEl.innerHTML = svg;

        // Markdown embed (uses data URI)
        const svgB64 = btoa(unescape(encodeURIComponent(svg)));
        const dataUri = `data:image/svg+xml;base64,${svgB64}`;

        const mdCode = `![Typing SVG](${dataUri})`;
        const htmlCode = `<img src="${dataUri}" alt="Typing SVG" />`;

        this.container.querySelector('#typing-code-md').textContent = mdCode;
        this.container.querySelector('#typing-code-html').textContent = htmlCode;
        this.container.querySelector('#typing-code-svg').textContent = svg;

        this.saveSettings();
    }

    _copyText(text, btn) {
        navigator.clipboard.writeText(text).then(() => {
            const orig = btn.textContent;
            btn.textContent = '✓ Copied!';
            btn.classList.add('typing-copied');
            setTimeout(() => {
                btn.textContent = orig;
                btn.classList.remove('typing-copied');
            }, 2000);
        }).catch(() => {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            const orig = btn.textContent;
            btn.textContent = '✓ Copied!';
            setTimeout(() => { btn.textContent = orig; }, 2000);
        });
    }

    // ═══════════════════════════════════════════════════════
    // PERSISTENCE
    // ═══════════════════════════════════════════════════════
    saveSettings() {
        try {
            localStorage.setItem('typing-svg-config', JSON.stringify(this.config));
        } catch (e) { /* ignore */ }
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('typing-svg-config');
            if (saved) {
                const parsed = JSON.parse(saved);
                Object.assign(this.config, parsed);
                // Rebuild lines UI with loaded data
                this._setupLines();
                // Sync UI inputs
                this._syncUIFromConfig();
            }
        } catch (e) { /* ignore */ }
    }

    _syncUIFromConfig() {
        const $ = id => this.container.querySelector(`#${id}`);
        const c = this.config;

        const setVal = (id, val) => { const el = $(id); if (el) el.value = val; };
        const setHex = (id, val) => { const el = $(`${id}-hex`); if (el) el.value = val; };

        setVal('typing-font', c.font);
        setVal('typing-weight', c.weight);
        setVal('typing-size', c.size);
        setVal('typing-fontStyle', c.fontStyle);
        setVal('typing-letterSpacing', c.letterSpacing === 'normal' ? 0 : c.letterSpacing);
        setVal('typing-textTransform', c.textTransform);
        setVal('typing-gradient', c.gradient);
        setVal('typing-glowIntensity', c.glowIntensity);
        setVal('typing-opacity', c.opacity);
        setVal('typing-animationStyle', c.animationStyle);
        setVal('typing-duration', c.duration);
        setVal('typing-pause', c.pause);
        setVal('typing-cursorStyle', c.cursorStyle === 'none' ? 'blink' : c.cursorStyle);
        setVal('typing-cursorWidth', c.cursorWidth);
        setVal('typing-width', c.width);
        setVal('typing-height', c.height);
        setVal('typing-offsetX', c.offsetX);
        setVal('typing-offsetY', c.offsetY);
        setVal('typing-center', String(c.center));
        setVal('typing-vCenter', String(c.vCenter));
        setVal('typing-multiline', String(c.multiline));
        setVal('typing-repeat', String(c.repeat));
        setVal('typing-borderWidth', c.borderWidth);
        setVal('typing-borderRadius', c.borderRadius);

        setHex('typing-color', c.color);
        setHex('typing-background', c.background);
        setHex('typing-glowColor', c.glowColor);
        setHex('typing-cursorColor', c.cursorColor);
        setHex('typing-borderColor', c.borderColor);

        // Range display values
        const gi = $('typing-glowIntensity-val');
        if (gi) gi.textContent = c.glowIntensity;
        const ov = $('typing-opacity-val');
        if (ov) ov.textContent = c.opacity;
        const ls = $('typing-letterSpacing-val');
        if (ls) ls.textContent = c.letterSpacing === 'normal' ? 'normal' : c.letterSpacing + 'px';
        const cw = $('typing-cursorWidth-val');
        if (cw) cw.textContent = c.cursorWidth;

        // Show Cursor toggle sync
        const showCursor = $('typing-showCursor');
        const cursorOpts = $('typing-cursor-options');
        if (showCursor && cursorOpts) {
            const isVisible = c.cursorStyle !== 'none';
            showCursor.checked = isVisible;
            cursorOpts.style.display = isVisible ? '' : 'none';
        }
    }
}
