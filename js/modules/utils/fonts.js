export class FontManager {
    constructor() {
        this.fonts = [
            'Inter', 'JetBrains Mono', 'Roboto', 'Open Sans', 'Lato',
            'Montserrat', 'Oswald', 'Raleway', 'Nunito', 'Merriweather',
            'Playfair Display', 'Rubik', 'Ubuntu', 'Dancing Script', 'Pacifico',
            'Orbitron', 'Press Start 2P', 'Bangers', 'Creepster', 'Fredoka One'
        ];
        this.loadedFonts = new Set();
    }

    loadFont(fontName) {
        if (this.loadedFonts.has(fontName)) return Promise.resolve();

        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;700&display=swap`;
            link.rel = 'stylesheet';

            link.onload = () => {
                this.loadedFonts.add(fontName);
                resolve();
            };
            link.onerror = reject;

            document.head.appendChild(link);
        });
    }

    getFontList() {
        return this.fonts;
    }
}
