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

        this.init();
    }

    init() {
        // Generate initial face
        this.loadRandomFace();

        // Start engine loop
        this.engine.start((time) => {
            this.renderer.render(time, this.currentFace);
        });

        // Add controls specific to clock
        this.setupControls();
    }

    loadRandomFace() {
        this.currentFace = this.generator.generateRandomFace();
        this.renderer.setupFace(this.currentFace);
    }

    setupControls() {
        // Create Clock UI overlay
        const controls = document.getElementById('clock-controls');
        if (!controls) return;

        controls.innerHTML = `
            <button id="clock-prev-btn">◀ Prev</button>
            <div class="face-info">
                <span id="face-name">Face Name</span>
            </div>
            <button id="clock-next-btn">Next ▶</button>
            <button id="clock-customize-btn">🎨</button>
        `;

        document.getElementById('clock-next-btn').addEventListener('click', () => {
            this.loadRandomFace();
        });

        document.getElementById('clock-prev-btn').addEventListener('click', () => {
            // History logic could go here
            this.loadRandomFace(); // Just random for now
        });
    }
}
