/**
 * Generates random clock face configurations.
 * Combining: 
 * - Palettes (Colors)
 * - Dial Styles
 * - Hand Styles
 * - Marker Styles
 */
export class FaceGenerator {
    constructor() {
        this.palettes = [
            { name: "Neon", bg: "#000", primary: "#0ff", secondary: "#f0f", accent: "#ff0" },
            { name: "Classic", bg: "#fff", primary: "#000", secondary: "#333", accent: "#d00" },
            { name: "Midnight", bg: "#1a1a2e", primary: "#e94560", secondary: "#16213e", accent: "#fff" },
            { name: "Forest", bg: "#051405", primary: "#4caf50", secondary: "#2e7d32", accent: "#81c784" },
            { name: "Ocean", bg: "#001e3c", primary: "#0288d1", secondary: "#01579b", accent: "#b3e5fc" },
            { name: "Sunset", bg: "#2d1b2e", primary: "#ff9a8b", secondary: "#ff6a88", accent: "#ff99ac" },
            { name: "Cyberpunk", bg: "#0b0c15", primary: "#fcee0a", secondary: "#00f0ff", accent: "#ff003c" },
            { name: "Mono Dark", bg: "#111", primary: "#888", secondary: "#444", accent: "#fff" },
            { name: "Mono Light", bg: "#eee", primary: "#333", secondary: "#999", accent: "#000" },
            { name: "Royal", bg: "#2c003e", primary: "#ffd700", secondary: "#c0c0c0", accent: "#fff" },
            { name: "AMOLED", bg: "#000000", primary: "#ffffff", secondary: "#333333", accent: "#00ff00" }
        ];

        this.markerTypes = ['lines', 'dots', 'numbers', 'roman', 'minimal'];
        this.handTypes = ['needle', 'baton', 'arrow', 'rounded'];
        this.types = ['analog', 'digital'];
    }

    generateRandomFace() {
        const palette = this.palettes[Math.floor(Math.random() * this.palettes.length)];
        const type = this.types[Math.floor(Math.random() * this.types.length)]; // Analog or Digital

        let layout = {};
        let name = "";

        if (type === 'analog') {
            const marker = this.markerTypes[Math.floor(Math.random() * this.markerTypes.length)];
            const hands = this.handTypes[Math.floor(Math.random() * this.handTypes.length)];
            name = `${palette.name} ${marker.charAt(0).toUpperCase() + marker.slice(1)}`;
            layout = {
                type: 'analog',
                markerType: marker,
                handType: hands,
                showDate: Math.random() > 0.5,
                showSeconds: true
            };
        } else {
            name = `${palette.name} Digital`;
            layout = {
                type: 'digital',
                font: Math.random() > 0.5 ? 'monospace' : 'sans-serif',
                showSeconds: true,
                showDate: true
            };
        }

        return {
            id: Date.now(),
            name: name,
            palette: palette,
            layout: layout
        };
    }
}
