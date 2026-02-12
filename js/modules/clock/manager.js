import { ClockEngine } from './engine.js';
import { ClockRenderer } from './renderer.js';
import { FaceGenerator } from './faces.js';

export class ClockManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.engine = new ClockEngine();
        this.renderer = new ClockRenderer(this.container);
        this.generator = new FaceGenerator();
        this.currentFace = null;
        this.use24h = true;
        this.colorPickerVisible = false;

        this.init();
    }

    init() {
        this.currentFace = this.generator.getCurrentFace();
        this.renderer.setupFace(this.currentFace);

        this.engine.start((time) => {
            this.renderer.render(time, this.currentFace);
        });

        this.setupControls();
    }

    setupControls() {
        const controls = document.getElementById('clock-controls');
        if (!controls) return;

        const total = this.generator.getTotalFaces();

        controls.innerHTML = `
            <button id="clock-prev-btn">◀ Prev</button>
            <div class="face-info">
                <span id="face-name">${this.currentFace.name}</span>
                <span class="face-counter">${this.currentFace.id + 1} / ${total}</span>
            </div>
            <button id="clock-next-btn">Next ▶</button>
            <button id="clock-customize-btn" title="Change Color">🎨</button>
        `;

        // Color picker popup — append to the TAB, NOT the container (doesn't get wiped)
        this.colorPickerEl = document.createElement('div');
        this.colorPickerEl.className = 'color-picker-popup hidden';
        this.colorPickerEl.id = 'color-picker-popup';
        this.renderColorPicker();

        const clockTab = document.getElementById('clock-tab');
        if (clockTab) {
            clockTab.appendChild(this.colorPickerEl);
        }

        document.getElementById('clock-next-btn').addEventListener('click', () => {
            this.currentFace = this.generator.getNextFace();
            this.renderer.setupFace(this.currentFace);
            this.updateFaceUI();
        });

        document.getElementById('clock-prev-btn').addEventListener('click', () => {
            this.currentFace = this.generator.getPrevFace();
            this.renderer.setupFace(this.currentFace);
            this.updateFaceUI();
        });

        document.getElementById('clock-customize-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleColorPicker();
        });

        // Close color picker when clicking outside
        document.addEventListener('click', (e) => {
            if (this.colorPickerVisible &&
                !this.colorPickerEl.contains(e.target) &&
                e.target.id !== 'clock-customize-btn') {
                this.hideColorPicker();
            }
        });
    }

    updateFaceUI() {
        const nameEl = document.getElementById('face-name');
        const counterEl = document.querySelector('.face-counter');
        const total = this.generator.getTotalFaces();

        if (nameEl) nameEl.textContent = this.currentFace.name;
        if (counterEl) counterEl.textContent = `${this.currentFace.id + 1} / ${total}`;
    }

    renderColorPicker() {
        const colors = [
            '#ff0000', '#ff4444', '#ff6b6b', '#e74c3c',
            '#ff9900', '#ffbb33', '#f39c12', '#e67e22',
            '#ffdd00', '#ffee44', '#f1c40f', '#ffd700',
            '#00ff00', '#33ff33', '#2ecc71', '#27ae60',
            '#00ffff', '#00d4ff', '#3498db', '#2980b9',
            '#0066ff', '#0088ff', '#4488ff', '#6366f1',
            '#9933ff', '#aa55ff', '#8e44ad', '#9b59b6',
            '#ff00ff', '#ff69b4', '#e91e63', '#ff2e63',
            '#ffffff', '#cccccc', '#888888', '#333333',
        ];

        let html = '';
        colors.forEach(c => {
            html += `<div class="color-swatch" data-color="${c}" style="background:${c};" title="${c}"></div>`;
        });
        html += `
            <div class="custom-color-wrap">
                <input type="color" id="custom-clock-color" value="${this.currentFace?.palette?.primary || '#ffffff'}">
                <span>Custom color</span>
            </div>
        `;
        this.colorPickerEl.innerHTML = html;

        // Swatch listeners
        this.colorPickerEl.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', (e) => {
                e.stopPropagation();
                this.applyColor(e.target.dataset.color);
            });
        });

        // Custom color
        const customInput = this.colorPickerEl.querySelector('#custom-clock-color');
        if (customInput) {
            customInput.addEventListener('input', (e) => {
                e.stopPropagation();
                this.applyColor(e.target.value);
            });
            customInput.addEventListener('click', (e) => e.stopPropagation());
        }
    }

    applyColor(color) {
        if (!this.currentFace) return;
        this.currentFace.palette.primary = color;
        this.renderer.setupFace(this.currentFace);

        // Re-append color picker since setupFace clears container but picker is on tab
        this.colorPickerEl.querySelectorAll('.color-swatch').forEach(s => {
            s.classList.toggle('active', s.dataset.color === color);
        });
    }

    toggleColorPicker() {
        this.colorPickerVisible ? this.hideColorPicker() : this.showColorPicker();
    }

    showColorPicker() {
        this.colorPickerEl.classList.remove('hidden');
        this.colorPickerVisible = true;
    }

    hideColorPicker() {
        this.colorPickerEl.classList.add('hidden');
        this.colorPickerVisible = false;
    }

    setTimezone(tz) {
        this.engine.setTimezone(tz);
    }

    set24h(val) {
        this.use24h = val;
        this.engine.set24h(val);
    }
}
