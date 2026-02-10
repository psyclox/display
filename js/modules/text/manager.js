import { FontManager } from '../utils/fonts.js';

export class TextManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.text = "WELCOME TO THE ULTIMATE DISPLAY SYSTEM • SCROLLING TEXT DEMO • ";
        this.options = {
            speed: 2,
            size: 100, // px
            color: '#00d4ff',
            font: 'Inter',
            direction: 'left', // left, right
            y: 0,
            opacity: 1,
            blur: 0
        };

        this.fontManager = new FontManager();
        this.animationId = null;
        this.offset = 0;

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

        // Config styles
        this.ctx.font = `bold ${this.options.size}px "${this.options.font}"`;
        this.ctx.fillStyle = this.options.color;
        this.ctx.globalAlpha = this.options.opacity;
        if (this.options.blur > 0) {
            this.ctx.filter = `blur(${this.options.blur}px)`;
        } else {
            this.ctx.filter = 'none';
        }

        // Measure text
        const textWidth = this.ctx.measureText(this.text).width;

        // Update offset
        this.offset -= this.options.speed;
        if (this.offset < -textWidth) {
            this.offset = 0;
        }

        // Draw multiple copies to fill screen
        let x = this.offset;
        while (x < this.canvas.width) {
            this.ctx.fillText(this.text, x, this.options.y);
            x += textWidth;
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    setupControls() {
        // UI for Speed, Color, Text Input, etc.
        const controls = document.getElementById('text-controls');
        if (!controls) return;

        const fontOptions = this.fontManager.getFontList().map(f => `<option value="${f}">${f}</option>`).join('');

        // Simple input for testing
        controls.innerHTML = `
            <input type="text" id="marquee-input" value="${this.text.trim()}" placeholder="Enter text..." style="background:rgba(255,255,255,0.1); border:none; color:var(--text-color); padding:5px; border-radius:4px;">
            <input type="color" id="marquee-color" value="${this.options.color}" style="background:none; border:none; width:30px; height:30px;">
            <input type="range" id="marquee-speed" min="0" max="50" value="${this.options.speed}" title="Speed">
            <select id="marquee-font" style="background:rgba(255,255,255,0.1); color:var(--text-color); border:none; padding:5px; border-radius:4px;">
                ${fontOptions}
            </select>
        `;

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
        document.getElementById('marquee-font').addEventListener('change', (e) => {
            const font = e.target.value;
            this.fontManager.loadFont(font).then(() => {
                this.options.font = font;
            });
        });
    }
}
