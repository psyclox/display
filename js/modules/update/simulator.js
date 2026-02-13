/**
 * Update Simulator — pixel-accurate OS update screens.
 * Simulates Windows 10, Windows 11, macOS Sonoma, ChromeOS, and BSOD.
 * Progress uses realistic multi-stage timing (fast start, slow middle, fast finish).
 */
export class UpdateSimulator {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.menu = document.getElementById('update-menu');
        this.simulationArea = document.getElementById('update-simulation');
        this.isActive = false;

        // Apple SVG (accurate proportions — viewBox corrected to encompass full path)
        this.appleSVG = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="white"><path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.2-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.28 2.13-9.54 3.24-12.8 3.35-4.92.21-9.84-1.96-14.75-6.52-3.13-2.73-7.05-7.41-11.76-14.04-5.05-7.12-9.2-15.38-12.45-24.8-3.47-10.17-5.21-20.01-5.21-29.53 0-10.91 2.36-20.33 7.07-28.23A41.52 41.52 0 0 1 88.83 47.6c5.56-2.78 11.56-4.19 18.04-4.32 3.94 0 9.1 1.21 15.51 3.6 6.39 2.4 10.49 3.62 12.28 3.62 1.34 0 5.87-1.43 13.55-4.28 7.25-2.64 13.37-3.74 18.39-3.31 13.59 1.1 23.8 6.45 30.58 16.1-12.15 7.37-18.16 17.68-18.04 30.9.11 10.3 3.85 18.88 11.19 25.71 3.33 3.16 7.05 5.6 11.18 7.34-.9 2.6-1.84 5.1-2.84 7.49zM119.04 7.01c0 8.07-2.95 15.6-8.83 22.56C103.25 37.5 94.72 42 85.43 41.26a17.56 17.56 0 0 1-.13-2.14c0-7.74 3.37-16.03 9.35-22.79 2.99-3.41 6.79-6.25 11.4-8.51 4.59-2.24 8.93-3.47 13.02-3.71.11.97.17 1.93.17 2.9h-.2z"/></svg>`;

        // Windows 10 tilted four-pane logo
        this.windowsSVG = `<svg viewBox="0 0 88 88" xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="white"><path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L.028 71.48l-.001-25.55zm4.326-39.025L87.314 0v41.527l-47.318.376zm47.329 39.349l-.011 41.34-47.318-6.678-.066-34.739z"/></svg>`;

        // Windows 11 flat four-square logo (equal squares with gaps)
        this.windows11SVG = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="white"><rect x="2" y="2" width="44" height="44" rx="4"/><rect x="54" y="2" width="44" height="44" rx="4"/><rect x="2" y="54" width="44" height="44" rx="4"/><rect x="54" y="54" width="44" height="44" rx="4"/></svg>`;

        // ChromeOS colored sphere
        this.chromeSVG = `<svg viewBox="0 0 48 48" width="60" height="60" xmlns="http://www.w3.org/2000/svg"><circle fill="#fff" cx="24" cy="24" r="11"/><path fill="#DB4437" d="M21.2 5A19 19 0 0 0 5.1 29l9.8-17a11 11 0 0 1 6.3-7z"/><path fill="#0F9D58" d="M5.1 29a19 19 0 0 0 32.2 5H17.7a11 11 0 0 1-8.3-3.3z"/><path fill="#4285F4" d="M37.3 34A19 19 0 0 0 24 5a11 11 0 0 1 10.5 7.5v.1L24 31h13.3z"/><circle fill="#F4B400" cx="24" cy="24" r="7"/></svg>`;

        this.osPresets = [
            { id: 'win10', name: 'Windows 10', bg: '#0078d7', text: 'Working on updates', sub: "Don't turn off your PC. This will take a while.", loader: 'spinner', duration: 600000 },
            { id: 'win11', name: 'Windows 11', bg: '#000000', text: 'Updates are underway.', sub: 'Please keep your computer on.', loader: 'dots', duration: 480000 },
            { id: 'mac', name: 'macOS Sonoma', bg: '#000000', text: '', sub: 'About 20 minutes remaining...', loader: 'apple-bar', duration: 420000 },
            { id: 'bsod', name: 'BSOD', bg: '#0078d7', text: ':(', sub: 'Your PC ran into a problem and needs to restart.', loader: 'none', duration: 300000 },
            { id: 'chromeos', name: 'ChromeOS', bg: '#202124', text: 'Updating ChromeOS...', sub: 'Please do not turn off your device.', loader: 'spinner', duration: 360000 }
        ];

        this.init();
    }

    init() {
        this.renderMenu();
        this.setupKeyboardListeners();
    }

    renderMenu() {
        const grid = this.menu.querySelector('.os-grid');
        if (!grid) return;
        grid.innerHTML = '';

        this.osPresets.forEach(os => {
            const btn = document.createElement('button');
            btn.className = 'os-btn';
            btn.innerHTML = `<span class="os-btn-icon">${this.getOsIcon(os.id)}</span><span class="os-btn-name">${os.name}</span>`;
            btn.onclick = () => this.startSimulation(os);
            grid.appendChild(btn);
        });
    }

    getOsIcon(id) {
        if (id === 'mac') return this.appleSVG;
        if (id === 'win10') return this.windowsSVG;
        if (id === 'win11') return this.windows11SVG;
        if (id === 'bsod') return `<span style="font-size:2rem">💀</span>`;
        if (id === 'chromeos') return this.chromeSVG;
        return '💻';
    }

    startSimulation(os) {
        this.isActive = true;
        this.menu.classList.add('hidden');
        this.simulationArea.innerHTML = '';
        this.container.requestFullscreen().catch(err => console.log(err));
        document.body.style.cursor = 'none';

        if (os.id === 'win10') this.buildWindows10UI(os);
        else if (os.id === 'win11') this.buildWindows11UI(os);
        else if (os.id === 'mac') this.buildMacUI(os);
        else if (os.id === 'bsod') this.buildBSOD(os);
        else if (os.id === 'chromeos') this.buildChromeOSUI(os);

        this.runRealisticProgress(os);
    }

    /* ═══ Windows 10 — circular spinner + percentage ═══ */
    buildWindows10UI(os) {
        this.simulationArea.style.backgroundColor = os.bg;
        this.simulationArea.className = 'simulation-running os-win10';

        this.simulationArea.innerHTML = `
            <div class="update-content win10-layout">
                <div class="win10-spinner"><div class="win10-spinner-ring"></div></div>
                <h1 id="update-percentage" class="win10-text">${os.text}</h1>
                <p id="update-pct" class="win10-pct">0% complete</p>
                <p class="win10-sub">${os.sub}</p>
            </div>
        `;
    }

    /* ═══ Windows 11 — logo + loading dots + percentage ═══ */
    buildWindows11UI(os) {
        this.simulationArea.style.backgroundColor = '#000';
        this.simulationArea.className = 'simulation-running os-win11';

        this.simulationArea.innerHTML = `
            <div class="update-content win11-layout">
                <div class="win11-logo">${this.windows11SVG}</div>
                <div class="win11-dots"><div></div><div></div><div></div><div></div><div></div></div>
                <p id="update-pct" class="win11-pct">0%</p>
                <p class="win11-text">${os.text}</p>
                <p class="win11-sub">${os.sub}</p>
            </div>
        `;
    }

    /* ═══ macOS Sonoma — Apple logo + progress bar + remaining ═══ */
    buildMacUI(os) {
        this.simulationArea.style.backgroundColor = '#000';
        this.simulationArea.className = 'simulation-running os-mac';

        this.simulationArea.innerHTML = `
            <div class="update-content mac-layout">
                <div class="apple-logo">${this.appleSVG}</div>
                <div class="mac-progress-bar">
                    <div class="mac-progress-fill" id="update-progress-fill"></div>
                </div>
                <p class="mac-remaining" id="mac-remaining">About 20 minutes remaining...</p>
            </div>
        `;
    }

    /* ═══ BSOD — Windows 10/11 Blue Screen ═══ */
    buildBSOD(os) {
        this.simulationArea.style.backgroundColor = os.bg;
        this.simulationArea.className = 'simulation-running os-bsod';

        this.simulationArea.innerHTML = `
            <div class="bsod-content">
                <h1 class="bsod-frown">:(</h1>
                <p class="bsod-main">${os.sub}</p>
                <p class="bsod-info">We're just collecting some error info, and then we'll restart for you.</p>
                <p class="bsod-progress" id="update-pct">0% complete</p>
                <div class="bsod-details">
                    <div class="bsod-qr">
                        <svg viewBox="0 0 100 100" width="80" height="80" fill="white">
                            <rect x="5" y="5" width="25" height="25"/><rect x="35" y="5" width="5" height="5"/><rect x="45" y="5" width="5" height="5"/><rect x="55" y="5" width="5" height="5"/><rect x="70" y="5" width="25" height="25"/>
                            <rect x="10" y="10" width="15" height="15" fill="#0078d7"/><rect x="75" y="10" width="15" height="15" fill="#0078d7"/>
                            <rect x="5" y="35" width="5" height="5"/><rect x="15" y="35" width="5" height="5"/><rect x="35" y="35" width="15" height="5"/><rect x="60" y="35" width="5" height="5"/><rect x="80" y="35" width="5" height="5"/>
                            <rect x="5" y="45" width="5" height="5"/><rect x="25" y="45" width="10" height="5"/><rect x="45" y="45" width="10" height="5"/><rect x="65" y="45" width="5" height="5"/><rect x="85" y="45" width="10" height="5"/>
                            <rect x="5" y="70" width="25" height="25"/><rect x="45" y="55" width="5" height="5"/><rect x="55" y="65" width="10" height="5"/><rect x="75" y="55" width="10" height="5"/><rect x="75" y="75" width="10" height="10"/>
                            <rect x="10" y="75" width="15" height="15" fill="#0078d7"/><rect x="35" y="80" width="5" height="5"/><rect x="50" y="75" width="5" height="5"/><rect x="60" y="85" width="5" height="5"/>
                        </svg>
                    </div>
                    <div class="bsod-text-info">
                        <p>For more information about this issue and possible fixes, visit<br>https://www.windows.com/stopcode</p>
                        <p class="bsod-stop">If you call a support person, give them this info:<br>Stop code: CRITICAL_PROCESS_DIED</p>
                    </div>
                </div>
            </div>
        `;
    }

    /* ═══ ChromeOS — Chrome sphere + spinner + text ═══ */
    buildChromeOSUI(os) {
        this.simulationArea.style.backgroundColor = os.bg;
        this.simulationArea.className = 'simulation-running os-chromeos';

        this.simulationArea.innerHTML = `
            <div class="update-content chromeos-layout">
                <div class="chrome-logo">${this.chromeSVG}</div>
                <div class="chrome-spinner-wrap">
                    <div class="chrome-spinner"><div></div><div></div><div></div></div>
                </div>
                <p id="update-pct" class="chromeos-pct">${os.text}</p>
                <p class="chromeos-sub">${os.sub}</p>
            </div>
        `;
    }

    /**
     * Realistic progress: fast 0→30, slow 30→85, fast 85→99, then hold.
     * Uses requestAnimationFrame for smooth rendering.
     */
    runRealisticProgress(os) {
        const startTime = Date.now();
        const duration = os.duration || 300000;
        let displayProgress = 0;

        const stages = [
            { end: 30, speed: 2.5 },   // Fast initial
            { end: 70, speed: 0.4 },   // Slow middle — stalls here
            { end: 85, speed: 0.8 },   // Moderate pick-up
            { end: 95, speed: 1.5 },   // Faster
            { end: 99, speed: 0.3 },   // Slow final crawl
        ];

        const tick = () => {
            if (!this.isActive) return;

            const elapsed = Date.now() - startTime;
            const totalProgress = Math.min(99, (elapsed / duration) * 100);

            // Add realistic jitter: sometimes progress appears to stall
            const jitter = Math.sin(elapsed / 8000) * 0.3 + Math.random() * 0.15;
            displayProgress = Math.min(99, Math.max(displayProgress, totalProgress + jitter));

            this.updateUI(os, Math.floor(displayProgress));

            if (displayProgress < 99) {
                requestAnimationFrame(tick);
            }
        };

        requestAnimationFrame(tick);
    }

    updateUI(os, progress) {
        const pctEl = document.getElementById('update-pct');

        if (os.id === 'win10') {
            if (pctEl) pctEl.textContent = `${progress}% complete`;
            // Stage text changes
            const h1 = document.getElementById('update-percentage');
            if (h1) {
                if (progress < 30) h1.textContent = 'Working on updates';
                else if (progress < 75) h1.textContent = 'Installing features';
                else h1.textContent = 'Almost done';
            }
        } else if (os.id === 'win11') {
            if (pctEl) pctEl.textContent = `${progress}%`;
        } else if (os.id === 'mac') {
            const fill = document.getElementById('update-progress-fill');
            if (fill) fill.style.width = `${progress}%`;
            const rem = document.getElementById('mac-remaining');
            if (rem) {
                const mins = Math.max(1, Math.round((99 - progress) * 0.22));
                rem.textContent = mins > 1 ? `About ${mins} minutes remaining...` : 'Less than a minute remaining...';
            }
        } else if (os.id === 'bsod') {
            if (pctEl) pctEl.textContent = `${progress}% complete`;
        } else if (os.id === 'chromeos') {
            if (pctEl) {
                if (progress < 40) pctEl.textContent = 'Updating ChromeOS...';
                else if (progress < 80) pctEl.textContent = 'Installing update...';
                else pctEl.textContent = 'Almost ready...';
            }
        }
    }

    stopSimulation() {
        this.isActive = false;
        this.menu.classList.remove('hidden');
        this.simulationArea.innerHTML = '';
        this.simulationArea.className = '';
        this.simulationArea.style.backgroundColor = '';
        document.body.style.cursor = 'auto';
        if (document.exitFullscreen && document.fullscreenElement) document.exitFullscreen();
    }

    setupKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            if (!this.isActive) return;
            if (e.key === 'Enter' || e.key === 'Escape') {
                this.stopSimulation();
            }
            e.preventDefault();
        });
    }
}
