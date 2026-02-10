/**
 * Renders the clock using SVG for resolution independence.
 */
export class ClockRenderer {
    constructor(container) {
        this.container = container;
        this.svgNS = "http://www.w3.org/2000/svg";
        this.elements = {}; // Cache SVG/DOM references
        this.container.innerHTML = ''; // Clear container
    }

    createSVG(type, attrs) {
        const el = document.createElementNS(this.svgNS, type);
        for (const [key, value] of Object.entries(attrs)) {
            el.setAttribute(key, value);
        }
        return el;
    }

    setupFace(config) {
        this.container.innerHTML = ''; // clear previous
        this.currentConfig = config;
        this.elements = {}; // Reset elements cache

        if (config.layout.type === 'digital') {
            this.setupDigitalFace(config);
        } else {
            this.setupAnalogFace(config);
        }

        // Update Face Name UI
        const nameEl = document.getElementById('face-name');
        if (nameEl) nameEl.textContent = config.name;
    }

    setupDigitalFace(config) {
        const wrapper = document.createElement('div');
        wrapper.className = 'digital-clock-wrapper';
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.alignItems = 'center';
        wrapper.style.justifyContent = 'center';

        this.elements.digitalTime = document.createElement('div');
        this.elements.digitalTime.className = 'digital-time';
        this.elements.digitalTime.style.color = config.palette.primary;
        this.elements.digitalTime.style.fontFamily = config.layout.font === 'monospace' ? 'var(--font-mono)' : 'var(--font-main)';
        this.elements.digitalTime.style.textShadow = `0 0 20px ${config.palette.accent}`;

        wrapper.appendChild(this.elements.digitalTime);

        if (config.layout.showDate) {
            this.elements.digitalDate = document.createElement('div');
            this.elements.digitalDate.className = 'digital-date';
            this.elements.digitalDate.style.color = config.palette.secondary;
            this.elements.digitalDate.style.marginTop = '10px';
            wrapper.appendChild(this.elements.digitalDate);
        }

        this.container.appendChild(wrapper);
    }

    setupAnalogFace(config) {
        // Create main SVG
        const svg = this.createSVG('svg', {
            viewBox: "0 0 100 100",
            class: "clock-svg"
        });

        // Background
        const bg = this.createSVG('circle', {
            cx: 50, cy: 50, r: 48,
            fill: config.palette.bg,
            stroke: config.palette.secondary,
            "stroke-width": "1"
        });
        svg.appendChild(bg);

        // Markers
        this.renderMarkers(svg, config);

        // Hands Container (Group)
        const handsGroup = this.createSVG('g', { id: 'hands-group' });

        // Hour Hand
        this.elements.hour = this.createSVG('line', {
            x1: 50, y1: 50, x2: 50, y2: 25,
            stroke: config.palette.primary,
            "stroke-width": "3",
            "stroke-linecap": config.layout.handType === 'rounded' ? 'round' : 'butt'
        });
        handsGroup.appendChild(this.elements.hour);

        // Minute Hand
        this.elements.minute = this.createSVG('line', {
            x1: 50, y1: 50, x2: 50, y2: 15,
            stroke: config.palette.primary,
            "stroke-width": "2",
            "stroke-linecap": config.layout.handType === 'rounded' ? 'round' : 'butt'
        });
        handsGroup.appendChild(this.elements.minute);

        // Second Hand
        this.elements.second = this.createSVG('line', {
            x1: 50, y1: 50, x2: 50, y2: 10,
            stroke: config.palette.accent,
            "stroke-width": "1",
            "stroke-linecap": "round"
        });
        handsGroup.appendChild(this.elements.second);

        // Center Pin
        const pin = this.createSVG('circle', {
            cx: 50, cy: 50, r: 2,
            fill: config.palette.accent
        });
        handsGroup.appendChild(pin);

        svg.appendChild(handsGroup);
        this.container.appendChild(svg);
    }

    renderMarkers(svg, config) {
        const type = config.layout.markerType;
        const color = config.palette.secondary;

        for (let i = 0; i < 12; i++) {
            const angle = (i * 30) * (Math.PI / 180);
            const r1 = 45; // outer radius
            let r2 = 40; // inner radius

            if (type === 'lines' || type === 'minimal') {
                const x1 = 50 + r1 * Math.sin(angle);
                const y1 = 50 - r1 * Math.cos(angle);
                const x2 = 50 + r2 * Math.sin(angle);
                const y2 = 50 - r2 * Math.cos(angle);

                const line = this.createSVG('line', {
                    x1, y1, x2, y2,
                    stroke: color,
                    "stroke-width": (i % 3 === 0) ? 2 : 1
                });
                svg.appendChild(line);
            } else if (type === 'dots') {
                const x = 50 + 42 * Math.sin(angle);
                const y = 50 - 42 * Math.cos(angle);
                const dot = this.createSVG('circle', {
                    cx: x, cy: y, r: (i % 3 === 0) ? 1.5 : 0.8,
                    fill: color
                });
                svg.appendChild(dot);
            } else if (type === 'numbers') {
                // Should implement text markers, keeping it simple for now
                const x = 50 + 40 * Math.sin(angle);
                const y = 50 - 40 * Math.cos(angle);
                // Placeholder
            }
        }
    }

    render(time, config) {
        if (config.layout.type === 'digital') {
            this.renderDigital(time, config);
        } else {
            this.renderAnalog(time, config);
        }
    }

    renderAnalog(time, config) {
        if (!this.elements.hour) return;

        // Calculate angles
        const secAngle = time.seconds * 6; // 360 / 60
        const minAngle = time.minutes * 6 + time.seconds * 0.1;
        const hourAngle = (time.hours % 12) * 30 + time.minutes * 0.5;

        // Apply rotation
        this.elements.second.setAttribute('transform', `rotate(${secAngle}, 50, 50)`);
        this.elements.minute.setAttribute('transform', `rotate(${minAngle}, 50, 50)`);
        this.elements.hour.setAttribute('transform', `rotate(${hourAngle}, 50, 50)`);
    }

    renderDigital(time, config) {
        if (!this.elements.digitalTime) return;

        // Format time (HH:MM:SS)
        const h = time.hours.toString().padStart(2, '0');
        const m = time.minutes.toString().padStart(2, '0');
        const s = time.seconds.toString().padStart(2, '0');

        this.elements.digitalTime.textContent = `${h}:${m}:${s}`;

        if (this.elements.digitalDate) {
            const date = new Date();
            this.elements.digitalDate.textContent = date.toLocaleDateString(undefined, {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
        }
    }
}
