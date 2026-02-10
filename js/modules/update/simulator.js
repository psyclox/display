export class UpdateSimulator {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.menu = document.getElementById('update-menu');
        this.simulationArea = document.getElementById('update-simulation');
        this.isActive = false;

        this.osPresets = [
            { id: 'win10', name: 'Windows 10', bg: '#0078d7', text: 'Working on updates', sub: 'Don\'t turn off your PC. This will take a while.', loader: 'spinner' },
            { id: 'win11', name: 'Windows 11', bg: '#000000', text: 'Updates are underway.', sub: 'Please keep your computer on.', loader: 'dots' },
            { id: 'mac', name: 'macOS', bg: '#000000', text: '', sub: '', loader: 'apple-bar' },
            { id: 'bsod', name: 'BSOD', bg: '#0078d7', text: ':(', sub: 'Your PC ran into a problem and needs to restart.', loader: 'none' }
        ];

        this.init();
    }

    init() {
        this.renderMenu();
        this.setupKeyboardListeners();
    }

    renderMenu() {
        const grid = this.menu.querySelector('.os-grid');
        grid.innerHTML = '';

        this.osPresets.forEach(os => {
            const btn = document.createElement('button');
            btn.className = 'os-btn';
            btn.textContent = os.name;
            btn.style.background = os.bg; // Preview color
            btn.onclick = () => this.startSimulation(os);
            grid.appendChild(btn);
        });
    }

    startSimulation(os) {
        this.isActive = true;
        this.menu.classList.add('hidden');
        this.simulationArea.innerHTML = ''; // Request fullscreen
        this.container.requestFullscreen().catch(err => console.log(err));
        document.body.style.cursor = 'none';

        // Build UI
        if (os.id === 'win10' || os.id === 'win11') {
            this.buildWindowsUI(os);
        } else if (os.id === 'mac') {
            this.buildMacUI(os);
        } else if (os.id === 'bsod') {
            this.buildBSOD(os);
        }

        // Start Loop
        this.runProgressLoop(os);
    }

    buildWindowsUI(os) {
        this.simulationArea.style.backgroundColor = os.bg;
        this.simulationArea.className = `simulation-running os-${os.id}`;

        const content = document.createElement('div');
        content.className = 'update-content';

        // Loader
        const loader = document.createElement('div');
        loader.className = os.loader === 'spinner' ? 'win-spinner' : 'win-dots';
        if (os.loader === 'dots') {
            // Create dots
            for (let i = 0; i < 5; i++) loader.appendChild(document.createElement('div'));
        }

        // Text
        const textContainer = document.createElement('div');
        textContainer.className = 'text-container';

        const mainText = document.createElement('h1');
        mainText.textContent = `${os.text} 0%`;
        mainText.id = 'update-percentage';

        const subText = document.createElement('p');
        subText.textContent = os.sub;

        content.appendChild(loader);
        content.appendChild(textContainer);
        textContainer.appendChild(mainText);
        textContainer.appendChild(subText);

        this.simulationArea.appendChild(content);
    }

    buildMacUI(os) {
        this.simulationArea.style.backgroundColor = '#000';
        this.simulationArea.className = 'simulation-running os-mac';

        const apple = document.createElement('div');
        apple.className = 'apple-logo';
        apple.innerHTML = '';

        const bar = document.createElement('div');
        bar.className = 'mac-progress-bar';
        const fill = document.createElement('div');
        fill.className = 'mac-progress-fill';
        fill.id = 'update-progress-fill';
        bar.appendChild(fill);

        this.simulationArea.appendChild(apple);
        this.simulationArea.appendChild(bar);
    }

    buildBSOD(os) {
        this.simulationArea.style.backgroundColor = os.bg;
        this.simulationArea.className = 'simulation-running os-bsod';

        this.simulationArea.innerHTML = `
            <div class="bsod-content">
                <h1>:(</h1>
                <p>${os.sub}</p>
                <p>0% complete</p>
            </div>
        `;
    }

    runProgressLoop(os) {
        let progress = 0;
        const totalTime = 5 * 60 * 1000; // 5 mins
        const intervalTime = 1000;
        const increment = 100 / (totalTime / intervalTime);

        this.interval = setInterval(() => {
            if (!this.isActive) return clearInterval(this.interval);

            progress += increment + (Math.random() * 0.5 - 0.2); // Random fluctuation
            if (progress > 99) progress = 99; // Stuck at 99% logic usually

            this.updateUI(os, Math.floor(progress));

            // Randomly restart or finish logic could go here
        }, intervalTime);
    }

    updateUI(os, progress) {
        if (os.id === 'win10' || os.id === 'win11') {
            const el = document.getElementById('update-percentage');
            if (el) el.textContent = `${os.text} ${progress}%`;
        } else if (os.id === 'mac') {
            const el = document.getElementById('update-progress-fill');
            if (el) el.style.width = `${progress}%`;
        } else if (os.id === 'bsod') {
            const el = this.simulationArea.querySelector('.bsod-content p:last-child');
            if (el) el.textContent = `${progress}% complete`;
        }
    }

    stopSimulation() {
        this.isActive = false;
        clearInterval(this.interval);
        this.menu.classList.remove('hidden');
        this.simulationArea.innerHTML = '';
        document.body.style.cursor = 'auto';
        if (document.exitFullscreen) document.exitFullscreen();
    }

    setupKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            if (!this.isActive) return;

            if (e.key === 'Enter') {
                // Force restart / crash / stop
                this.stopSimulation();
            }
            // Block other keys if possible (browsers limit this security-wise)
            e.preventDefault();
        });
    }
}
