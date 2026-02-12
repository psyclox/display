import { FontManager } from '../utils/fonts.js';

export class TextManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.text = "WELCOME TO THE ULTIMATE DISPLAY • ";
        this.options = {
            speed: 2,
            size: 100,
            color: '#6366f1',
            font: 'Inter',
            direction: 'left',
            y: 0,
            opacity: 1,
            blur: 0
        };

        this.fontManager = new FontManager();
        this.animationId = null;
        this.offset = 0;
        this.fontPanelVisible = false;
        this.currentCategory = 'all';
        this.searchQuery = '';

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.setupControls();
        this.start();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.options.y = this.canvas.height / 2 + this.options.size / 3;
    }

    start() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.animate();
    }

    stop() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.font = `bold ${this.options.size}px "${this.options.font}"`;
        this.ctx.fillStyle = this.options.color;
        this.ctx.globalAlpha = this.options.opacity;
        this.ctx.filter = this.options.blur > 0 ? `blur(${this.options.blur}px)` : 'none';

        const textWidth = this.ctx.measureText(this.text).width;
        if (textWidth === 0) {
            this.animationId = requestAnimationFrame(() => this.animate());
            return;
        }

        if (this.options.direction === 'left') {
            this.offset -= this.options.speed;
            if (this.offset < -textWidth) this.offset += textWidth;
        } else {
            this.offset += this.options.speed;
            if (this.offset > textWidth) this.offset -= textWidth;
        }

        this.options.y = this.canvas.height / 2 + this.options.size / 3;

        // Draw seamless loop
        let x = this.offset;
        while (x < this.canvas.width + textWidth) {
            this.ctx.fillText(this.text, x, this.options.y);
            x += textWidth;
        }
        x = this.offset - textWidth;
        while (x > -textWidth) {
            this.ctx.fillText(this.text, x, this.options.y);
            x -= textWidth;
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    setupControls() {
        const controls = document.getElementById('text-controls');
        if (!controls) return;

        controls.innerHTML = `
            <input type="text" id="marquee-input" value="${this.text.replace(' • ', '').trim()}" placeholder="Enter text..." />
            <input type="color" id="marquee-color" value="${this.options.color}" title="Text Color" />
            <div class="ctrl-group">
                <span class="ctrl-label">Speed</span>
                <input type="range" id="marquee-speed" min="0" max="50" value="${this.options.speed}" title="Speed" />
            </div>
            <div class="ctrl-group">
                <span class="ctrl-label">Size</span>
                <input type="range" id="marquee-size" min="20" max="400" value="${this.options.size}" title="Font Size" />
            </div>
            <button class="font-picker-btn" id="font-picker-toggle">
                <span class="font-icon">Aa</span>
                <span id="current-font-name">${this.options.font}</span>
            </button>
        `;

        // Font picker panel
        this.fontPanelEl = document.createElement('div');
        this.fontPanelEl.className = 'font-picker-panel hidden';
        this.fontPanelEl.id = 'font-picker-panel';
        this.buildFontPanel();
        document.getElementById('text-tab').appendChild(this.fontPanelEl);

        // Listeners
        document.getElementById('marquee-input').addEventListener('input', (e) => {
            this.text = e.target.value + " • ";
        });
        document.getElementById('marquee-color').addEventListener('input', (e) => {
            this.options.color = e.target.value;
        });
        document.getElementById('marquee-speed').addEventListener('input', (e) => {
            this.options.speed = parseInt(e.target.value, 10);
        });
        document.getElementById('marquee-size').addEventListener('input', (e) => {
            this.options.size = parseInt(e.target.value, 10);
        });
        document.getElementById('font-picker-toggle').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFontPanel();
        });

        document.addEventListener('click', (e) => {
            if (this.fontPanelVisible &&
                !this.fontPanelEl.contains(e.target) &&
                !e.target.closest('#font-picker-toggle')) {
                this.hideFontPanel();
            }
        });
    }

    buildFontPanel() {
        const categories = this.fontManager.getCategories();
        const categoryLabels = {
            'all': 'All',
            'sans-serif': 'Sans',
            'serif': 'Serif',
            'display': 'Display',
            'cursive': 'Cursive',
            'modern-written': 'Stylish',
            'monospace': 'Mono'
        };

        const catTabsHtml = categories.map(cat => {
            return `<button class="font-cat-btn ${cat === 'all' ? 'active' : ''}" data-category="${cat}">${categoryLabels[cat] || cat}</button>`;
        }).join('');

        this.fontPanelEl.innerHTML = `
            <div class="font-panel-header">
                <h3>Choose Font</h3>
                <input type="text" class="font-search-input" id="font-search" placeholder="Search 200+ fonts..." />
                <div class="font-category-tabs" id="font-category-tabs">
                    ${catTabsHtml}
                </div>
            </div>
            <div class="font-list" id="font-list"></div>
        `;

        this.renderFontList();

        this.fontPanelEl.querySelector('#font-search').addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.renderFontList();
        });

        this.fontPanelEl.querySelectorAll('.font-cat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentCategory = e.target.dataset.category;
                this.fontPanelEl.querySelectorAll('.font-cat-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.renderFontList();
            });
        });
    }

    renderFontList() {
        const listEl = this.fontPanelEl.querySelector('#font-list');
        if (!listEl) return;

        let fonts = this.fontManager.getFontsByCategory(this.currentCategory);
        if (this.searchQuery) {
            fonts = fonts.filter(f => f.name.toLowerCase().includes(this.searchQuery));
        }

        listEl.innerHTML = fonts.map(f => {
            const isSelected = f.name === this.options.font;
            return `
                <div class="font-item ${isSelected ? 'selected' : ''}" data-font="${f.name}">
                    <span class="font-preview" style="font-family: '${f.name}', cursive, sans-serif;">The quick brown fox</span>
                    <span class="font-name">${f.name}</span>
                </div>
            `;
        }).join('');

        listEl.querySelectorAll('.font-item').forEach(item => {
            const fontName = item.dataset.font;
            this.fontManager.loadFont(fontName);

            item.addEventListener('click', () => {
                this.fontManager.loadFont(fontName).then(() => {
                    this.options.font = fontName;
                    const nameEl = document.getElementById('current-font-name');
                    if (nameEl) nameEl.textContent = fontName;
                    listEl.querySelectorAll('.font-item').forEach(i => i.classList.remove('selected'));
                    item.classList.add('selected');
                });
            });
        });
    }

    toggleFontPanel() {
        this.fontPanelVisible ? this.hideFontPanel() : this.showFontPanel();
    }

    showFontPanel() {
        this.fontPanelEl.classList.remove('hidden');
        this.fontPanelVisible = true;
    }

    hideFontPanel() {
        this.fontPanelEl.classList.add('hidden');
        this.fontPanelVisible = false;
    }

    setDirection(dir) { this.options.direction = dir; }
    setOpacity(val) { this.options.opacity = val; }
    setBlur(val) { this.options.blur = val; }
    setText(text) {
        this.text = text + " • ";
        const input = document.getElementById('marquee-input');
        if (input) input.value = text;
    }
}
