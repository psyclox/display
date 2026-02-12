/**
 * Renders clock faces using SVG (analog) and DOM (digital).
 * Theme-aware: in dark/AMOLED themes, forces dark bg for clock area.
 * Only adaptive theme uses the face's own bg color.
 */
export class ClockRenderer {
    constructor(container) {
        this.container = container;
        this.svgNS = "http://www.w3.org/2000/svg";
        this.elements = {};
        this.currentConfig = null;
        this.showAmpm = true;
    }

    createSVG(type, attrs) {
        const el = document.createElementNS(this.svgNS, type);
        for (const [key, value] of Object.entries(attrs)) {
            el.setAttribute(key, value);
        }
        return el;
    }

    getTheme() {
        if (document.body.classList.contains('theme-adaptive')) return 'adaptive';
        if (document.body.classList.contains('theme-oled')) return 'oled';
        if (document.body.classList.contains('theme-light')) return 'light';
        return 'dark';
    }

    getContainerBg(faceBg) {
        const theme = this.getTheme();
        if (theme === 'adaptive') return faceBg;
        if (theme === 'oled') return '#000000';
        if (theme === 'light') return '#f5f5f7';
        return '#0a0a0f'; // dark
    }

    getAnalogCircleBg(faceBg) {
        // The analog circle always uses the face bg color
        return faceBg;
    }

    setupFace(config) {
        this.container.innerHTML = '';
        this.currentConfig = config;
        this.elements = {};

        // Container bg is theme-aware
        this.container.style.backgroundColor = this.getContainerBg(config.palette.bg);

        if (config.layout.type === 'digital') {
            this.setupDigitalFace(config);
        } else {
            this.setupAnalogFace(config);
        }

        const nameEl = document.getElementById('face-name');
        if (nameEl) nameEl.textContent = config.name;

        // Dispatch event for adaptive theme
        window.dispatchEvent(new CustomEvent('faceChanged', { detail: config }));
    }

    setupDigitalFace(config) {
        const wrapper = document.createElement('div');
        wrapper.className = 'digital-clock-wrapper';

        this.elements.digitalTime = document.createElement('div');
        this.elements.digitalTime.className = 'digital-time';
        this.elements.digitalTime.style.color = config.palette.primary;

        const fontFamily = config.layout.font || 'var(--font-mono)';
        if (fontFamily !== 'monospace' && fontFamily !== 'sans-serif') {
            this.elements.digitalTime.style.fontFamily = `"${fontFamily}", var(--font-mono)`;
            const link = document.createElement('link');
            link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@400;700&display=swap`;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        } else {
            this.elements.digitalTime.style.fontFamily = fontFamily === 'monospace' ? 'var(--font-mono)' : 'var(--font-main)';
        }

        wrapper.appendChild(this.elements.digitalTime);

        if (config.layout.showDate) {
            this.elements.digitalDate = document.createElement('div');
            this.elements.digitalDate.className = 'digital-date';
            this.elements.digitalDate.style.color = config.palette.secondary;
            wrapper.appendChild(this.elements.digitalDate);
        }

        // AM/PM indicator
        this.elements.ampm = document.createElement('span');
        this.elements.ampm.className = 'digital-ampm';
        this.elements.ampm.style.color = config.palette.accent;
        this.elements.ampm.style.fontSize = '3vmin';
        this.elements.ampm.style.opacity = '0.6';
        this.elements.ampm.style.marginLeft = '8px';
        this.elements.ampm.style.fontWeight = '300';
        wrapper.appendChild(this.elements.ampm);

        // Timezone label
        this.elements.tzLabel = document.createElement('div');
        this.elements.tzLabel.className = 'digital-tz';
        this.elements.tzLabel.style.fontSize = '1.5vmin';
        this.elements.tzLabel.style.opacity = '0.3';
        this.elements.tzLabel.style.marginTop = '8px';
        this.elements.tzLabel.style.color = config.palette.secondary;
        wrapper.appendChild(this.elements.tzLabel);

        this.container.appendChild(wrapper);
    }

    setupAnalogFace(config) {
        const svg = this.createSVG('svg', {
            viewBox: "0 0 100 100",
            class: "clock-svg"
        });

        // Background circle — uses face bg always for the dial
        const bg = this.createSVG('circle', {
            cx: 50, cy: 50, r: 48,
            fill: config.palette.bg,
            stroke: config.palette.secondary,
            "stroke-width": "0.4"
        });
        svg.appendChild(bg);

        // Outer ring
        const outerRing = this.createSVG('circle', {
            cx: 50, cy: 50, r: 47,
            fill: "none",
            stroke: config.palette.primary,
            "stroke-width": "0.2",
            opacity: "0.25"
        });
        svg.appendChild(outerRing);

        // Markers
        this.renderMarkers(svg, config);

        // Hands
        const handsGroup = this.createSVG('g', { id: 'hands-group' });

        const hourWidth = config.layout.handType === 'baton' ? 3 :
            config.layout.handType === 'arrow' ? 2.5 : 2;
        this.elements.hour = this.createSVG('line', {
            x1: 50, y1: 50, x2: 50, y2: 24,
            stroke: config.palette.primary,
            "stroke-width": hourWidth,
            "stroke-linecap": config.layout.handType === 'rounded' ? 'round' : 'butt'
        });
        handsGroup.appendChild(this.elements.hour);

        const minWidth = config.layout.handType === 'baton' ? 2 : 1.5;
        this.elements.minute = this.createSVG('line', {
            x1: 50, y1: 50, x2: 50, y2: 14,
            stroke: config.palette.primary,
            "stroke-width": minWidth,
            "stroke-linecap": config.layout.handType === 'rounded' ? 'round' : 'butt'
        });
        handsGroup.appendChild(this.elements.minute);

        if (config.layout.showSeconds) {
            this.elements.second = this.createSVG('line', {
                x1: 50, y1: 55, x2: 50, y2: 10,
                stroke: config.palette.accent,
                "stroke-width": "0.5",
                "stroke-linecap": "round"
            });
            handsGroup.appendChild(this.elements.second);
        }

        const pin = this.createSVG('circle', { cx: 50, cy: 50, r: 1.5, fill: config.palette.accent });
        handsGroup.appendChild(pin);
        const innerPin = this.createSVG('circle', { cx: 50, cy: 50, r: 0.5, fill: config.palette.bg });
        handsGroup.appendChild(innerPin);

        svg.appendChild(handsGroup);
        this.container.appendChild(svg);
    }

    renderMarkers(svg, config) {
        const type = config.layout.markerType;
        const primaryColor = config.palette.primary;
        const secondaryColor = config.palette.secondary;

        for (let i = 0; i < 60; i++) {
            const angle = (i * 6) * (Math.PI / 180);
            const isMajor = i % 5 === 0;

            if (type === 'minimal') {
                if (i % 15 !== 0) continue;
                const r1 = 44, r2 = 38;
                const x1 = 50 + r1 * Math.sin(angle), y1 = 50 - r1 * Math.cos(angle);
                const x2 = 50 + r2 * Math.sin(angle), y2 = 50 - r2 * Math.cos(angle);
                svg.appendChild(this.createSVG('line', { x1, y1, x2, y2, stroke: primaryColor, "stroke-width": "1.5", "stroke-linecap": "round" }));
            } else if (type === 'lines') {
                const r1 = 45, r2 = isMajor ? 39 : 43;
                const x1 = 50 + r1 * Math.sin(angle), y1 = 50 - r1 * Math.cos(angle);
                const x2 = 50 + r2 * Math.sin(angle), y2 = 50 - r2 * Math.cos(angle);
                svg.appendChild(this.createSVG('line', { x1, y1, x2, y2, stroke: isMajor ? primaryColor : secondaryColor, "stroke-width": isMajor ? "1.5" : "0.3", "stroke-linecap": "round", opacity: isMajor ? "1" : "0.5" }));
            } else if (type === 'dots') {
                if (!isMajor) continue;
                const r = 42;
                const x = 50 + r * Math.sin(angle), y = 50 - r * Math.cos(angle);
                svg.appendChild(this.createSVG('circle', { cx: x, cy: y, r: (i % 15 === 0) ? 1.5 : 1, fill: (i % 15 === 0) ? primaryColor : secondaryColor }));
            } else if (type === 'numbers') {
                if (!isMajor) continue;
                const r = 39;
                const x = 50 + r * Math.sin(angle), y = 50 - r * Math.cos(angle);
                const num = i / 5 || 12;
                const text = this.createSVG('text', { x, y: y + 2, fill: primaryColor, "font-size": "5", "font-family": "Inter, sans-serif", "font-weight": "600", "text-anchor": "middle", "dominant-baseline": "middle" });
                text.textContent = num;
                svg.appendChild(text);
            } else if (type === 'roman') {
                if (!isMajor) continue;
                const romanNumerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
                const r = 39;
                const x = 50 + r * Math.sin(angle), y = 50 - r * Math.cos(angle);
                const text = this.createSVG('text', { x, y: y + 1.5, fill: primaryColor, "font-size": "3.5", "font-family": "Georgia, serif", "font-weight": "normal", "text-anchor": "middle", "dominant-baseline": "middle", "letter-spacing": "0.5" });
                text.textContent = romanNumerals[i / 5];
                svg.appendChild(text);
            }
        }
    }

    render(time, config) {
        if (config.layout.type === 'digital') {
            this.renderDigital(time, config);
        } else {
            this.renderAnalog(time);
        }
    }

    renderAnalog(time) {
        if (!this.elements.hour) return;
        const secAngle = time.seconds * 6 + (time.milliseconds / 1000) * 6;
        const minAngle = time.minutes * 6 + time.seconds * 0.1;
        const hourAngle = (time.rawHours % 12) * 30 + time.minutes * 0.5;

        if (this.elements.second) this.elements.second.setAttribute('transform', `rotate(${secAngle}, 50, 50)`);
        this.elements.minute.setAttribute('transform', `rotate(${minAngle}, 50, 50)`);
        this.elements.hour.setAttribute('transform', `rotate(${hourAngle}, 50, 50)`);
    }

    renderDigital(time, config) {
        if (!this.elements.digitalTime) return;

        const h = time.hours.toString().padStart(2, '0');
        const m = time.minutes.toString().padStart(2, '0');
        const s = time.seconds.toString().padStart(2, '0');

        this.elements.digitalTime.textContent = config.layout.showSeconds
            ? `${h}:${m}:${s}`
            : `${h}:${m}`;

        // AM/PM
        if (this.elements.ampm) {
            this.elements.ampm.textContent = (!time.is24h && this.showAmpm) ? time.ampm : '';
        }

        // Timezone label
        if (this.elements.tzLabel) {
            const short = time.timezone.split('/').pop().replace(/_/g, ' ');
            this.elements.tzLabel.textContent = short;
        }

        if (this.elements.digitalDate) {
            const now = new Date(Date.now());
            const opts = { timeZone: time.timezone, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            this.elements.digitalDate.textContent = now.toLocaleDateString('en-US', opts);
        }
    }

    updatePrimaryColor(color) {
        if (!this.currentConfig) return;
        this.currentConfig.palette.primary = color;
        this.setupFace(this.currentConfig);
    }
}
