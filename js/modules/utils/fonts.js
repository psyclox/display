export class FontManager {
    constructor() {
        this.fonts = [
            // ═══════════════════════════════════════
            // SANS-SERIF (40)
            // ═══════════════════════════════════════
            { name: 'Inter', category: 'sans-serif' },
            { name: 'Roboto', category: 'sans-serif' },
            { name: 'Open Sans', category: 'sans-serif' },
            { name: 'Lato', category: 'sans-serif' },
            { name: 'Montserrat', category: 'sans-serif' },
            { name: 'Poppins', category: 'sans-serif' },
            { name: 'Nunito', category: 'sans-serif' },
            { name: 'Raleway', category: 'sans-serif' },
            { name: 'Rubik', category: 'sans-serif' },
            { name: 'Ubuntu', category: 'sans-serif' },
            { name: 'Outfit', category: 'sans-serif' },
            { name: 'Syne', category: 'sans-serif' },
            { name: 'DM Sans', category: 'sans-serif' },
            { name: 'Space Grotesk', category: 'sans-serif' },
            { name: 'Plus Jakarta Sans', category: 'sans-serif' },
            { name: 'Manrope', category: 'sans-serif' },
            { name: 'Work Sans', category: 'sans-serif' },
            { name: 'Quicksand', category: 'sans-serif' },
            { name: 'Nunito Sans', category: 'sans-serif' },
            { name: 'Figtree', category: 'sans-serif' },
            { name: 'Cabin', category: 'sans-serif' },
            { name: 'Karla', category: 'sans-serif' },
            { name: 'Barlow', category: 'sans-serif' },
            { name: 'Exo 2', category: 'sans-serif' },
            { name: 'Lexend', category: 'sans-serif' },
            { name: 'Archivo', category: 'sans-serif' },
            { name: 'Red Hat Display', category: 'sans-serif' },
            { name: 'Albert Sans', category: 'sans-serif' },
            { name: 'Overpass', category: 'sans-serif' },
            { name: 'Urbanist', category: 'sans-serif' },
            { name: 'Josefin Sans', category: 'sans-serif' },
            { name: 'Mukta', category: 'sans-serif' },
            { name: 'Titillium Web', category: 'sans-serif' },
            { name: 'Noto Sans', category: 'sans-serif' },
            { name: 'Source Sans 3', category: 'sans-serif' },
            { name: 'Mulish', category: 'sans-serif' },
            { name: 'Comfortaa', category: 'sans-serif' },
            { name: 'Libre Franklin', category: 'sans-serif' },
            { name: 'Hind', category: 'sans-serif' },
            { name: 'Catamaran', category: 'sans-serif' },

            // ═══════════════════════════════════════
            // SERIF (30)
            // ═══════════════════════════════════════
            { name: 'Merriweather', category: 'serif' },
            { name: 'Playfair Display', category: 'serif' },
            { name: 'Lora', category: 'serif' },
            { name: 'PT Serif', category: 'serif' },
            { name: 'Noto Serif', category: 'serif' },
            { name: 'Libre Baskerville', category: 'serif' },
            { name: 'EB Garamond', category: 'serif' },
            { name: 'Cormorant Garamond', category: 'serif' },
            { name: 'Bitter', category: 'serif' },
            { name: 'Crimson Text', category: 'serif' },
            { name: 'Spectral', category: 'serif' },
            { name: 'DM Serif Display', category: 'serif' },
            { name: 'Fraunces', category: 'serif' },
            { name: 'Vollkorn', category: 'serif' },
            { name: 'Alegreya', category: 'serif' },
            { name: 'Cardo', category: 'serif' },
            { name: 'Source Serif 4', category: 'serif' },
            { name: 'Josefin Slab', category: 'serif' },
            { name: 'Zilla Slab', category: 'serif' },
            { name: 'Lusitana', category: 'serif' },
            { name: 'Newsreader', category: 'serif' },
            { name: 'Domine', category: 'serif' },
            { name: 'Cormorant', category: 'serif' },
            { name: 'Literata', category: 'serif' },
            { name: 'Gelasio', category: 'serif' },
            { name: 'Bree Serif', category: 'serif' },
            { name: 'Arvo', category: 'serif' },
            { name: 'Roboto Slab', category: 'serif' },
            { name: 'Frank Ruhl Libre', category: 'serif' },
            { name: 'Mate', category: 'serif' },

            // ═══════════════════════════════════════
            // DISPLAY (35)
            // ═══════════════════════════════════════
            { name: 'Oswald', category: 'display' },
            { name: 'Bebas Neue', category: 'display' },
            { name: 'Anton', category: 'display' },
            { name: 'Orbitron', category: 'display' },
            { name: 'Righteous', category: 'display' },
            { name: 'Bungee', category: 'display' },
            { name: 'Bangers', category: 'display' },
            { name: 'Black Ops One', category: 'display' },
            { name: 'Passion One', category: 'display' },
            { name: 'Titan One', category: 'display' },
            { name: 'Fredoka', category: 'display' },
            { name: 'Press Start 2P', category: 'display' },
            { name: 'Silkscreen', category: 'display' },
            { name: 'Bungee Shade', category: 'display' },
            { name: 'Monoton', category: 'display' },
            { name: 'Audiowide', category: 'display' },
            { name: 'Michroma', category: 'display' },
            { name: 'Russo One', category: 'display' },
            { name: 'Teko', category: 'display' },
            { name: 'Rajdhani', category: 'display' },
            { name: 'Bai Jamjuree', category: 'display' },
            { name: 'Archivo Black', category: 'display' },
            { name: 'Staatliches', category: 'display' },
            { name: 'Changa', category: 'display' },
            { name: 'Big Shoulders Display', category: 'display' },
            { name: 'Saira', category: 'display' },
            { name: 'Advent Pro', category: 'display' },
            { name: 'Fugaz One', category: 'display' },
            { name: 'Lilita One', category: 'display' },
            { name: 'Bowlby One SC', category: 'display' },
            { name: 'Rampart One', category: 'display' },
            { name: 'Abril Fatface', category: 'display' },
            { name: 'Lobster', category: 'display' },
            { name: 'Paytone One', category: 'display' },
            { name: 'Dela Gothic One', category: 'display' },

            // ═══════════════════════════════════════
            // CURSIVE / CALLIGRAPHY (45)
            // ═══════════════════════════════════════
            { name: 'Dancing Script', category: 'cursive' },
            { name: 'Pacifico', category: 'cursive' },
            { name: 'Caveat', category: 'cursive' },
            { name: 'Satisfy', category: 'cursive' },
            { name: 'Great Vibes', category: 'cursive' },
            { name: 'Sacramento', category: 'cursive' },
            { name: 'Kalam', category: 'cursive' },
            { name: 'Indie Flower', category: 'cursive' },
            { name: 'Shadows Into Light', category: 'cursive' },
            { name: 'Permanent Marker', category: 'cursive' },
            { name: 'Architects Daughter', category: 'cursive' },
            { name: 'Amatic SC', category: 'cursive' },
            { name: 'Courgette', category: 'cursive' },
            { name: 'Patrick Hand', category: 'cursive' },
            { name: 'Handlee', category: 'cursive' },
            { name: 'Rock Salt', category: 'cursive' },
            { name: 'Reenie Beanie', category: 'cursive' },
            { name: 'Gloria Hallelujah', category: 'cursive' },
            { name: 'Covered By Your Grace', category: 'cursive' },
            { name: 'Homemade Apple', category: 'cursive' },
            { name: 'Alex Brush', category: 'cursive' },
            { name: 'Allura', category: 'cursive' },
            { name: 'Tangerine', category: 'cursive' },
            { name: 'Pinyon Script', category: 'cursive' },
            { name: 'Rouge Script', category: 'cursive' },
            { name: 'Petit Formal Script', category: 'cursive' },
            { name: 'Playball', category: 'cursive' },
            { name: 'Mrs Saint Delafield', category: 'cursive' },
            { name: 'Italianno', category: 'cursive' },
            { name: 'Clicker Script', category: 'cursive' },
            { name: 'Yellowtail', category: 'cursive' },
            { name: 'Marck Script', category: 'cursive' },
            { name: 'Berkshire Swash', category: 'cursive' },
            { name: 'Euphoria Script', category: 'cursive' },
            { name: 'Merienda', category: 'cursive' },
            { name: 'Lobster Two', category: 'cursive' },
            { name: 'Niconne', category: 'cursive' },
            { name: 'Cormorant Unicase', category: 'cursive' },
            { name: 'Nothing You Could Do', category: 'cursive' },
            { name: 'Cedarville Cursive', category: 'cursive' },
            { name: 'La Belle Aurore', category: 'cursive' },
            { name: 'Herr Von Muellerhoff', category: 'cursive' },
            { name: 'Dawning of a New Day', category: 'cursive' },
            { name: 'Bilbo Swash Caps', category: 'cursive' },
            { name: 'Lovers Quarrel', category: 'cursive' },

            // ═══════════════════════════════════════
            // MODERN WRITTEN / STYLISH (35)
            // ═══════════════════════════════════════
            { name: 'Cormorant Infant', category: 'modern-written' },
            { name: 'Philosopher', category: 'modern-written' },
            { name: 'Marcellus', category: 'modern-written' },
            { name: 'Gilda Display', category: 'modern-written' },
            { name: 'Cinzel', category: 'modern-written' },
            { name: 'Cinzel Decorative', category: 'modern-written' },
            { name: 'Poiret One', category: 'modern-written' },
            { name: 'Forum', category: 'modern-written' },
            { name: 'Tenor Sans', category: 'modern-written' },
            { name: 'Jost', category: 'modern-written' },
            { name: 'Red Rose', category: 'modern-written' },
            { name: 'Cormorant SC', category: 'modern-written' },
            { name: 'Yeseva One', category: 'modern-written' },
            { name: 'Libre Caslon Display', category: 'modern-written' },
            { name: 'Bodoni Moda', category: 'modern-written' },
            { name: 'Nixie One', category: 'modern-written' },
            { name: 'Julius Sans One', category: 'modern-written' },
            { name: 'Bellefair', category: 'modern-written' },
            { name: 'Eczar', category: 'modern-written' },
            { name: 'Unna', category: 'modern-written' },
            { name: 'Oranienbaum', category: 'modern-written' },
            { name: 'Antic Didone', category: 'modern-written' },
            { name: 'Gruppo', category: 'modern-written' },
            { name: 'Megrim', category: 'modern-written' },
            { name: 'Vast Shadow', category: 'modern-written' },
            { name: 'Cutive', category: 'modern-written' },
            { name: 'Special Elite', category: 'modern-written' },
            { name: 'Della Respira', category: 'modern-written' },
            { name: 'Stint Ultra Expanded', category: 'modern-written' },
            { name: 'Life Savers', category: 'modern-written' },
            { name: 'Londrina Solid', category: 'modern-written' },
            { name: 'Voltaire', category: 'modern-written' },
            { name: 'League Spartan', category: 'modern-written' },
            { name: 'Encode Sans', category: 'modern-written' },
            { name: 'Atkinson Hyperlegible', category: 'modern-written' },

            // ═══════════════════════════════════════
            // MONOSPACE (20)
            // ═══════════════════════════════════════
            { name: 'JetBrains Mono', category: 'monospace' },
            { name: 'Fira Code', category: 'monospace' },
            { name: 'Source Code Pro', category: 'monospace' },
            { name: 'IBM Plex Mono', category: 'monospace' },
            { name: 'Roboto Mono', category: 'monospace' },
            { name: 'Space Mono', category: 'monospace' },
            { name: 'Ubuntu Mono', category: 'monospace' },
            { name: 'Inconsolata', category: 'monospace' },
            { name: 'Red Hat Mono', category: 'monospace' },
            { name: 'DM Mono', category: 'monospace' },
            { name: 'Cousine', category: 'monospace' },
            { name: 'Anonymous Pro', category: 'monospace' },
            { name: 'Overpass Mono', category: 'monospace' },
            { name: 'Azeret Mono', category: 'monospace' },
            { name: 'Martian Mono', category: 'monospace' },
            { name: 'B612 Mono', category: 'monospace' },
            { name: 'Cutive Mono', category: 'monospace' },
            { name: 'Share Tech Mono', category: 'monospace' },
            { name: 'Major Mono Display', category: 'monospace' },
            { name: 'Victor Mono', category: 'monospace' },
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
            link.onerror = () => {
                // Silent fail for fonts that may not exist
                this.loadedFonts.add(fontName);
                resolve();
            };

            document.head.appendChild(link);
        });
    }

    getFontList() {
        return this.fonts.map(f => f.name);
    }

    getFontsWithCategories() {
        return this.fonts;
    }

    getCategories() {
        return ['all', 'sans-serif', 'serif', 'display', 'cursive', 'modern-written', 'monospace'];
    }

    getFontsByCategory(category) {
        if (category === 'all') return this.fonts;
        return this.fonts.filter(f => f.category === category);
    }
}
