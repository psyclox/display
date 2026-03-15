/**
 * TypingSVGEngine — Pure JavaScript Animated SVG Text Generator
 * Generates self-contained SVGs with CSS @keyframes animations.
 * Works in GitHub README, HTML pages, and any SVG-capable renderer.
 */
export class TypingSVGEngine {

    static DEFAULTS = {
        lines: ['Hello World!'],
        font: 'monospace',
        weight: '400',
        fontStyle: 'normal',
        size: 22,
        color: '#36BCF7',
        gradient: '', // e.g. '#FF6B6B,#4ECDC4'
        background: 'transparent',
        width: 435,
        height: 55,
        center: true,
        vCenter: true,
        multiline: false,
        duration: 5000,
        pause: 1000,
        letterSpacing: 'normal',
        textTransform: 'none', // none, uppercase, lowercase, capitalize
        lineHeight: 1.6,
        opacity: 1,
        separator: ';',
        random: false,

        // Cursor
        cursorStyle: 'blink',   // solid | blink | smooth | none
        cursorColor: '',        // defaults to text color
        cursorWidth: 3,

        // Glow
        glowColor: '',
        glowIntensity: 8,

        // Inner Spacing Offset
        offsetX: 0,
        offsetY: 0,

        // Animation
        animationStyle: 'typing', // typing | typewriter | fade | slide | glitch | wave | bounce | pulse | reveal | drop

        // Border
        borderRadius: 0,
        borderColor: '',
        borderWidth: 0,
    };

    /**
     * @param {Object} config
     * @returns {string} Complete SVG markup string
     */
    static generate(config = {}) {
        const c = { ...TypingSVGEngine.DEFAULTS, ...config };

        // Normalise lines
        let linesRaw = c.lines;
        if (typeof linesRaw === 'string') {
            linesRaw = linesRaw.split(c.separator).filter(l => l.length > 0);
        }
        
        let lineData = linesRaw.map((l, i) => ({ 
            text: l, 
            width: (c._lineWidths && c._lineWidths[i]) ? c._lineWidths[i] : null 
        }));
        
        if (c.random) {
            lineData = lineData.sort(() => Math.random() - 0.5);
        }
        if (!lineData.length) lineData = [{ text: '', width: 0 }];

        const lines = lineData.map(ld => ld.text);
        c._lineWidths = lineData.map(ld => ld.width || (c.size * ld.text.length * 0.6));

        const lineCount = lines.length;
        const totalCycle = (c.duration + c.pause) * lineCount;

        // Auto-scale SVG dimensions to prevent text cutoff
        const maxLineWidth = Math.max(0, ...c._lineWidths);
        const _ox = Math.abs(Number(c.offsetX) || 0);
        const _oy = Math.abs(Number(c.offsetY) || 0);
        
        const autoWidth = maxLineWidth + _ox * 2 + 40; // 40px safety padding
        if (autoWidth > c.width) {
            c.width = Math.ceil(autoWidth);
        }

        let autoHeight = c.height;
        if (c.multiline) {
            autoHeight = (lineCount * (c.size + 5)) + _oy * 2 + 30;
        } else {
            autoHeight = c.size + _oy * 2 + 20;
        }
        if (autoHeight > c.height) {
            c.height = Math.ceil(autoHeight);
        }
        const singlePhase = c.duration + c.pause;

        // Escape HTML
        const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

        // ── Build CSS ────────────────────────────────────────
        let css = '';

        // Google Font import — just the @import rule, no wrapping <style> tags
        if (c._fontCSS) {
            css += c._fontCSS + '\n';
        }

        // Gradient definition
        let gradientDef = '';
        let fillAttr = esc(c.color);
        let textGradientCss = '';
        if (c.gradient) {
            // CSS Background text clip gradient for mesmerizing animated flow
            const colors = c.gradient.split(',').map(s => s.trim()).join(', ');
            textGradientCss = `
              fill: transparent;
              background-image: linear-gradient(90deg, ${colors}, ${colors});
              background-size: 200% auto;
              background-clip: text;
              -webkit-background-clip: text;
              animation: textGradientPan 4s linear infinite;
            `;
            css += `@keyframes textGradientPan { to { background-position: 200% center; } }\n`;
        }

        // Text shadow / glow filter
        let filterDef = '';
        let filterAttr = '';
        let textShadowCss = '';
        if (c.glowColor) {
            const gc = esc(c.glowColor);
            const gi = c.glowIntensity;
            textShadowCss = `text-shadow: 0 0 ${gi}px ${gc}, 0 0 ${gi * 2}px ${gc};`;
        }

        // Font styling CSS block
        css += `
        .typing-text {
            font-family: "${esc(c.font)}", monospace;
            font-size: ${c.size}px;
            font-weight: ${c.weight};
            font-style: ${c.fontStyle};
            fill: ${esc(c.color)};
            letter-spacing: ${c.letterSpacing === 'normal' ? 'normal' : c.letterSpacing + 'px'};
            text-transform: ${c.textTransform};
            opacity: ${c.opacity};
            ${textGradientCss}
            ${textShadowCss}
        }
        `;

        // ── Determine animation approach ────────────────────
        const style = c.animationStyle;
        const hasCursor = c.cursorStyle !== 'none';
        const curColor = c.cursorColor || c.color;

        // Text anchor & Offsets
        const anchor = c.center ? 'middle' : 'start';
        // Apply inner offset space
        const ox = Number(c.offsetX) || 0;
        const oy = Number(c.offsetY) || 0;

        // Border
        let borderRect = '';
        if (c.borderWidth > 0 && c.borderColor) {
            borderRect = `<rect x="${c.borderWidth / 2}" y="${c.borderWidth / 2}" width="${c.width - c.borderWidth}" height="${c.height - c.borderWidth}" rx="${c.borderRadius}" ry="${c.borderRadius}" fill="none" stroke="${esc(c.borderColor)}" stroke-width="${c.borderWidth}"/>`;
        }

        // Background
        const bgColor = c.background === 'transparent' ? 'transparent' : c.background;
        const bgRect = bgColor !== 'transparent'
            ? `<rect width="${c.width}" height="${c.height}" rx="${c.borderRadius}" ry="${c.borderRadius}" fill="${esc(bgColor)}"/>`
            : '';

        // ── Build animation keyframes + SVG body ────────────
        let keyframes = '';
        let svgBody = '';

        if (style.startsWith('typing-') || style === 'typewriter') {
            // ── TYPING / TYPEWRITER / FADE / GLOW ──
            const isTypewriter = true; // For cursor synchronization

            if (style === 'typing-glow') {
                svgBody = TypingSVGEngine._buildTypingGlow(lines, c, esc);
            } else if (c.multiline) {
                // Fade-style typewriter logic works beautifully for multiline
                svgBody = TypingSVGEngine._buildMultilineTyping(lines, c, esc, isTypewriter);
            } else {
                // "classic", "smooth", "v2" variants use the superior typing fade logic
                svgBody = TypingSVGEngine._buildTypingFade(lines, c, esc, style);
            }

            if (hasCursor) {
                svgBody += TypingSVGEngine._buildTypingCursor(lines, c, curColor, ox, oy, isTypewriter);
            }
        } else if (style === 'fade') {
            svgBody = TypingSVGEngine._buildFadeAnimation(lines, c, esc);
        } else if (style === 'slide') {
            svgBody = TypingSVGEngine._buildSlideAnimation(lines, c, esc);
        } else if (style === 'glitch') {
            svgBody = TypingSVGEngine._buildGlitchAnimation(lines, c, esc);
        } else if (style === 'glitch-v2') {
            svgBody = TypingSVGEngine._buildGlitchV2(lines, c, esc);
        } else if (style === 'glitch-v3') {
            svgBody = TypingSVGEngine._buildGlitchV3(lines, c, esc);
        } else if (style === 'glitch-v4') {
            svgBody = TypingSVGEngine._buildGlitchV4(lines, c, esc);
        } else if (style === 'wave') {
            svgBody = TypingSVGEngine._buildWaveAnimation(lines, c, esc);
        } else if (style === 'bounce') {
            svgBody = TypingSVGEngine._buildBounceAnimation(lines, c, esc);
        } else if (style === 'pulse') {
            svgBody = TypingSVGEngine._buildPulseAnimation(lines, c, esc);
        } else if (style === 'reveal') {
            svgBody = TypingSVGEngine._buildRevealAnimation(lines, c, esc, fillAttr);
        } else if (style === 'drop') {
            svgBody = TypingSVGEngine._buildDropAnimation(lines, c, esc);
        } else {
            // Fallback to typing
            svgBody = TypingSVGEngine._buildSingleLineTyping(lines, c, esc, false);
            if (hasCursor) {
                svgBody += TypingSVGEngine._buildTypingCursor(lines, c, curColor, ox, oy, false);
            }
        }

        // ── Assemble SVG ────────────────────────────────────
        const borderRadiusStyle = c.borderRadius > 0 ? ` rx="${c.borderRadius}" ry="${c.borderRadius}"` : '';
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${c.width} ${c.height}" width="${c.width}px" height="${c.height}px" role="img" aria-label="${esc(lines.join(', '))}">
<style>
${css}
</style>
${gradientDef}${filterDef}
${bgRect}${borderRect}
${svgBody}
</svg>`;

        return svg;
    }

    // ═══════════════════════════════════════════════════════
    // TYPING / TYPEWRITER ANIMATION (Single-line looping)
    // Uses per-character stepping for typewriter (steps = char count)
    // ═══════════════════════════════════════════════════════
    static _buildSingleLineTyping(lines, c, esc, isTypewriter) {
        const lineCount = lines.length;
        const totalCycle = (c.duration + c.pause) * lineCount;
        const ox = Number(c.offsetX) || 0;
        const oy = Number(c.offsetY) || 0;
        const textX = c.center ? (c.width / 2) + ox : 5 + ox;
        const textY = c.vCenter ? (c.height / 2) + oy : c.size + 5 + oy;
        const anchor = c.center ? 'middle' : 'start';
        const db = c.vCenter ? 'central' : 'auto';

        let parts = `<style>`;
        
        for (let i = 0; i < lineCount; i++) {
            const freeze = !c.repeat && i === lineCount - 1;
            const charCount = lines[i].length || 1;
            // Typing phase = 60% of duration for typewriter, 80% for smooth
            const typePct = isTypewriter ? 0.6 : 0.8;
            // Erase takes 20% for both
            const erasePct = 0.2;
            // For typewriter, use steps(charCount) for per-character reveal
            const stepsFn = isTypewriter ? `steps(${charCount}, end)` : 'linear';
            
            const delay = i * (c.duration + c.pause);
            const startPct = (delay / totalCycle * 100);
            const typeEndPct = ((delay + typePct * c.duration) / totalCycle * 100);
            const eraseStartPct = ((delay + typePct * c.duration + c.pause) / totalCycle * 100);
            const eraseEndPct = ((delay + typePct * c.duration + c.pause + erasePct * c.duration) / totalCycle * 100);
            const endPct = ((delay + c.duration + c.pause) / totalCycle * 100);

            // clip-path: inset(top right bottom left)
            const eraseState = `inset(-50px 100% -50px -50px)`;
            const fullState = `inset(-50px -50px -50px -50px)`;

            if (freeze) {
                parts += `
@keyframes type${i} {
    0%{clip-path:${eraseState}; opacity:0}
    ${Math.max(0, startPct-0.01).toFixed(2)}%{clip-path:${eraseState}; opacity:0}
    ${startPct.toFixed(2)}%{clip-path:${eraseState}; opacity:1}
    ${typeEndPct.toFixed(2)}%{clip-path:${fullState}; opacity:1}
    100%{clip-path:${fullState}; opacity:1}
}
.type${i} { animation: type${i} ${totalCycle}ms forwards ${stepsFn}; opacity:0; }`;
            } else {
                parts += `
@keyframes type${i} {
    0%{clip-path:${eraseState}; opacity:0}
    ${Math.max(0, startPct-0.01).toFixed(2)}%{clip-path:${eraseState}; opacity:0}
    ${startPct.toFixed(2)}%{clip-path:${eraseState}; opacity:1}
    ${typeEndPct.toFixed(2)}%{clip-path:${fullState}; opacity:1}
    ${eraseStartPct.toFixed(2)}%{clip-path:${fullState}; opacity:1}
    ${eraseEndPct.toFixed(2)}%{clip-path:${eraseState}; opacity:0}
    ${endPct.toFixed(2)}%{clip-path:${eraseState}; opacity:0}
    100%{clip-path:${eraseState}; opacity:0}
}
.type${i} { animation: type${i} ${totalCycle}ms ${c.repeat ? 'infinite' : 'forwards'} ${stepsFn}; opacity:0; }`;
            }
        }
        parts += `</style>\n`;

        for (let i = 0; i < lineCount; i++) {
            parts += `<text class="typing-text type${i}" dominant-baseline="${db}" x="${textX}" y="${textY}" text-anchor="${anchor}" fill="${esc(c.color)}">${esc(lines[i])}</text>\n`;
        }
        return parts;
    }

    // ═══════════════════════════════════════════════════════
    // MULTILINE TYPING
    // ═══════════════════════════════════════════════════════
    static _buildMultilineTyping(lines, c, esc, isTypewriter) {
        const lineCount = lines.length;
        const totalCycle = (c.duration + c.pause) * lineCount;
        const ox = Number(c.offsetX) || 0;
        const oy = Number(c.offsetY) || 0;
        const textX = c.center ? (c.width / 2) + ox : 5 + ox;
        const anchor = c.center ? 'middle' : 'start';

        // Same trick: over-bleed clip box to omit glow truncation
        const eraseState = `inset(-50px 100% -50px -50px)`;
        const fullState = `inset(-50px -50px -50px -50px)`;

        let parts = `<style>`;
        
        for (let i = 0; i < lineCount; i++) {
            const delay = i * (c.duration + c.pause);
            const startPct = (delay / totalCycle * 100);
            const typeEndPct = ((delay + c.duration) / totalCycle * 100);
            
            parts += `
@keyframes multiline${i} {
    0%{clip-path:${eraseState}; opacity:0}
    ${Math.max(0, startPct-0.01).toFixed(2)}%{clip-path:${eraseState}; opacity:1}
    ${startPct.toFixed(2)}%{clip-path:${eraseState}; opacity:1}
    ${typeEndPct.toFixed(2)}%{clip-path:${fullState}; opacity:1}
    100%{clip-path:${fullState}; opacity:1}
}
.multiline${i} { animation: multiline${i} ${totalCycle}ms ${c.repeat ? 'infinite' : 'forwards'} ${isTypewriter ? 'steps(40, end)' : 'linear'}; opacity:0; }`;
        }
        parts += `</style>\n`;

        for (let i = 0; i < lineCount; i++) {
            const nextIdx = i + 1;
            // Proper vertical centering for an entire block of text
            const blockHeight = lineCount * (c.size + 5);
            let textY;
            if (c.vCenter) {
                // Determine vertical center point and subtract half the block, then position per line
                textY = (c.height / 2) - (blockHeight / 2) + ((i + 0.5) * (c.size + 5)) + oy;
            } else {
                textY = (nextIdx * (c.size + 5)) + oy;
            }
            const db = c.vCenter ? 'central' : 'auto';
            parts += `<text class="typing-text multiline${i}" dominant-baseline="${db}" x="${textX}" y="${textY}" text-anchor="${anchor}" fill="${esc(c.color)}">${esc(lines[i])}</text>\n`;
        }
        return parts;
    }

    // ═══════════════════════════════════════════════════════
    // CURSOR for typing/typewriter modes
    // Perfectly synced with text clip-path reveal
    // Uses same timing function (steps for typewriter, linear for smooth)
    // ═══════════════════════════════════════════════════════
    static _buildTypingCursor(lines, c, curColor, ox, oy, isTypewriter) {
        if (c.cursorStyle === 'none') return '';
        const lineCount = lines.length;
        const totalCycle = (c.duration + c.pause) * lineCount;
        const typePct = isTypewriter ? 0.6 : 0.8;
        const erasePct = 0.2;
       
        const halfSize = c.size / 2;
        let parts = '<style>';
        let cursors = '';

        for (let i = 0; i < lineCount; i++) {
            const charCount = lines[i].length || 1;
            const lineWidth = (c._lineWidths && c._lineWidths[i]) ? c._lineWidths[i] : c.size * lines[i].length * 0.6;
            
            // Cursor must follow the RIGHT EDGE of the revealed text
            const textX = c.center ? (c.width / 2) + ox : 5 + ox;
            let startX, endX;
            if (c.center) {
                // Center: cursor starts before first char, ends on last char
                startX = textX - (lineWidth / 2) - charWidth;
                endX = textX + (lineWidth / 2) - charWidth;
            } else {
                startX = textX - charWidth;
                endX = textX + lineWidth - charWidth;
            }

            let textY;
            if (c.multiline) {
                const blockHeight = lineCount * (c.size + 5);
                if (c.vCenter) {
                    textY = (c.height / 2) - (blockHeight / 2) + ((i + 0.5) * (c.size + 5)) + oy;
                } else {
                    textY = ((i + 1) * (c.size + 5)) + oy;
                }
            } else {
                if (c.vCenter) {
                    textY = (c.height / 2) + oy;
                } else {
                    textY = c.size + 5 + oy;
                }
            }
            const cy1 = textY - halfSize;
            const cy2 = textY + halfSize;

            const freeze = !c.repeat && i === lineCount - 1 && !c.multiline;
            const delay = i * (c.duration + c.pause);
            const startPct = (delay / totalCycle * 100);
            const typeEndPct = ((delay + typePct * c.duration) / totalCycle * 100);
            const eraseStartPct = ((delay + typePct * c.duration + c.pause) / totalCycle * 100);
            const eraseEndPct = ((delay + typePct * c.duration + c.pause + erasePct * c.duration) / totalCycle * 100);
            const endPct = ((delay + c.duration + c.pause) / totalCycle * 100);

            // Use same steps function as text for perfect sync
            const stepsFn = isTypewriter ? `steps(${charCount}, end)` : 'linear';

            if (c.multiline) {
                const typeEndPctMulti = ((delay + c.duration) / totalCycle * 100);
                parts += `
@keyframes cursorAnim${i} {
    0% { transform: translateX(${startX}px); opacity: 0; }
    ${Math.max(0, startPct - 0.01).toFixed(2)}% { transform: translateX(${startX}px); opacity: 0; }
    ${startPct.toFixed(2)}% { transform: translateX(${startX}px); opacity: 1; }
    ${typeEndPctMulti.toFixed(2)}% { transform: translateX(${endX}px); opacity: 1; }
    100% { transform: translateX(${endX}px); opacity: ${c.repeat ? '0' : '1'}; }
}`;
            } else if (freeze) {
                parts += `
@keyframes cursorAnim${i} {
    0% { transform: translateX(${startX}px); opacity: 0; }
    ${Math.max(0, startPct - 0.01).toFixed(2)}% { transform: translateX(${startX}px); opacity: 0; }
    ${startPct.toFixed(2)}% { transform: translateX(${startX}px); opacity: 1; }
    ${typeEndPct.toFixed(2)}% { transform: translateX(${endX}px); opacity: 1; }
    100% { transform: translateX(${endX}px); opacity: 1; }
}`;
            } else {
                parts += `
@keyframes cursorAnim${i} {
    0% { transform: translateX(${startX}px); opacity: 0; }
    ${Math.max(0, startPct - 0.01).toFixed(2)}% { transform: translateX(${startX}px); opacity: 0; }
    ${startPct.toFixed(2)}% { transform: translateX(${startX}px); opacity: 1; }
    ${typeEndPct.toFixed(2)}% { transform: translateX(${endX}px); opacity: 1; }
    ${eraseStartPct.toFixed(2)}% { transform: translateX(${endX}px); opacity: 1; }
    ${eraseEndPct.toFixed(2)}% { transform: translateX(${startX}px); opacity: 0; }
    ${endPct.toFixed(2)}% { transform: translateX(${startX}px); opacity: 0; }
    100% { transform: translateX(${startX}px); opacity: 0; }
}`;
            }

            let blinkStyle = '';
            if (c.cursorStyle === 'blink') {
                blinkStyle = `animation: blinkAnim 0.7s infinite;`;
            } else if (c.cursorStyle === 'smooth') {
                blinkStyle = `animation: smoothBlinkAnim 1.2s infinite ease-in-out;`;
            }

            // Cursor uses SAME timing function as text reveal for perfect sync
            cursors += `
<g style="opacity: 0; animation: cursorAnim${i} ${totalCycle}ms ${c.repeat ? 'infinite' : 'forwards'} ${stepsFn};">
    <line x1="0" y1="${cy1}" x2="0" y2="${cy2}" stroke="${curColor}" stroke-width="${c.cursorWidth}" stroke-linecap="round" class="typing-cursor" style="${blinkStyle}"></line>
</g>\n`;
        }

        parts += `
@keyframes blinkAnim { 0%, 49% { stroke-opacity: 1; } 50%, 100% { stroke-opacity: 0; } }
@keyframes smoothBlinkAnim { 0% { stroke-opacity: 1; } 50% { stroke-opacity: 0; } 100% { stroke-opacity: 1; } }
</style>`;

        return parts + '\n' + cursors;
    }

    // ═══════════════════════════════════════════════════════
    // TYPING FADE (Used for Classic, Smooth, V2 variants)
    // ═══════════════════════════════════════════════════════
    static _buildTypingFade(lines, c, esc, variantStr = 'typing-fade') {
        const lineCount = lines.length;
        const totalCycle = (c.duration + c.pause) * lineCount;
        const ox = Number(c.offsetX) || 0;
        const oy = Number(c.offsetY) || 0;
        const textX = c.center ? (c.width / 2) + ox : 5 + ox;
        const textY = c.vCenter ? (c.height / 2) + oy : c.size + 5 + oy;
        const db = c.vCenter ? 'central' : 'auto';

        let parts = `<style>`;
        let texts = '';
        for (let i = 0; i < lineCount; i++) {
            const charCount = lines[i].length || 1;
            const delay = i * (c.duration + c.pause);
            const startPct = (delay / totalCycle * 100);
            const eraseStartPct = ((delay + c.duration * 0.8 + c.pause) / totalCycle * 100);
            const eraseEndPct = ((delay + c.duration * 0.8 + c.pause + c.duration * 0.2) / totalCycle * 100);
            const endPct = ((delay + c.duration + c.pause) / totalCycle * 100);
            
            parts += `
@keyframes tfVis${i} { 
    0%{opacity:0} 
    ${Math.max(0, startPct-0.01).toFixed(2)}%{opacity:0} 
    ${startPct.toFixed(2)}%{opacity:1} 
    ${eraseStartPct.toFixed(2)}%{opacity:1} 
    ${eraseEndPct.toFixed(2)}%{opacity:0} 
    ${endPct.toFixed(2)}%{opacity:0} 
    100%{opacity:0} 
}
.tfVis${i} { animation: tfVis${i} ${totalCycle}ms ${c.repeat ? 'infinite' : 'forwards'}; opacity:0; }`;

            const phaseMs = c.duration * 0.8;
            for (let j = 0; j < charCount; j++) {
                const charDelayMs = delay + (j / charCount) * phaseMs;
                const charStart = (charDelayMs / totalCycle * 100).toFixed(2);
                
                // Define logic based on variant string
                if (variantStr === 'typing-classic' || variantStr === 'typing-fade') {
                    // Classic: Instant pop-in (0ms fade duration)
                    const charEnd = ((charDelayMs + 1) / totalCycle * 100).toFixed(2); 
                    parts += `
@keyframes tfc_${i}_${j} { 
    0%{opacity:0} 
    ${Math.max(0, charStart-0.01).toFixed(2)}%{opacity:0} 
    ${charStart}%{opacity:0} 
    ${charEnd}%{opacity:1} 
    100%{opacity:1} 
}`;
                } else if (variantStr === 'typing-smooth') {
                    // Smooth: Soft fade in (150ms fade duration)
                    const charEnd = ((charDelayMs + 150) / totalCycle * 100).toFixed(2); 
                    parts += `
@keyframes tfc_${i}_${j} { 
    0%{opacity:0} 
    ${Math.max(0, charStart-0.01).toFixed(2)}%{opacity:0} 
    ${charStart}%{opacity:0} 
    ${charEnd}%{opacity:1} 
    100%{opacity:1} 
}`;
                } else if (variantStr === 'typing-v2') {
                    // V2 Focus: Soft fade in AND blur removal (200ms)
                    const charEnd = ((charDelayMs + 200) / totalCycle * 100).toFixed(2); 
                    parts += `
@keyframes tfc_${i}_${j} { 
    0%{opacity:0; filter:blur(4px);} 
    ${Math.max(0, charStart-0.01).toFixed(2)}%{opacity:0; filter:blur(4px);} 
    ${charStart}%{opacity:0; filter:blur(4px);} 
    ${charEnd}%{opacity:1; filter:blur(0px);} 
    100%{opacity:1; filter:blur(0px);} 
}`;
                }
            }

            const anchor = c.center ? 'middle' : 'start';
            const chars = lines[i].split('');
            let charSpans = '';
            for (let j = 0; j < chars.length; j++) {
                let charText = chars[j] === ' ' ? '&#160;' : esc(chars[j]);
                charSpans += `<tspan style="animation:tfc_${i}_${j} ${totalCycle}ms ${c.repeat ? 'infinite' : 'forwards'}; opacity:0;">${charText}</tspan>`;
            }
            texts += `<text class="typing-text tfVis${i}" dominant-baseline="${db}" x="${textX}" y="${textY}" text-anchor="${anchor}" fill="${esc(c.color)}">${charSpans}</text>\n`;
        }
        parts += `</style>\n`;
        return parts + texts;
    }

    // ═══════════════════════════════════════════════════════
    // TYPEWRITER GLOW
    // ═══════════════════════════════════════════════════════
    static _buildTypingGlow(lines, c, esc) {
        // Use the superior Typing fade logic
        let parts = TypingSVGEngine._buildTypingFade(lines, c, esc);
        const lineCount = lines.length;
        const totalCycle = (c.duration + c.pause) * lineCount;
        
        let glows = '<style>.glow-blob { filter: blur(8px); mix-blend-mode: screen; }</style>\n';
        for (let i = 0; i < lineCount; i++) {
            const lineWidth = (c._lineWidths && c._lineWidths[i]) ? c._lineWidths[i] : c.size * lines[i].length * 0.6;
            const textX = c.center ? (c.width / 2) + Number(c.offsetX) : 5 + Number(c.offsetX);
            const textY = c.vCenter ? (c.height / 2) + Number(c.offsetY) : c.size + 5 + Number(c.offsetY);
            
            const glowColor = c.glowColor || c.color;
            // The cursor animation translates from startX to endX. Glow blob inherits this.
            glows += `<circle cx="0" cy="${textY - c.size/4}" r="${c.size/1.5}" fill="${glowColor}" class="glow-blob" style="opacity:0; animation: cursorAnim${i} ${totalCycle}ms ${c.repeat ? 'infinite' : 'forwards'} linear;" />\n`;
        }
        return parts + glows;
    }

    // ═══════════════════════════════════════════════════════
    // FADE ANIMATION
    // ═══════════════════════════════════════════════════════
    static _buildFadeAnimation(lines, c, esc) {
        const lineCount = lines.length;
        const totalCycle = (c.duration + c.pause) * lineCount;
        const ox = Number(c.offsetX) || 0;
        const oy = Number(c.offsetY) || 0;
        const textX = c.center ? (c.width / 2) + ox : 5 + ox;
        const textY = c.vCenter ? (c.height / 2) + oy : c.size + 5 + oy;
        const anchor = c.center ? 'middle' : 'start';
        const db = c.vCenter ? 'central' : 'auto';

        let parts = `<style>`;
        for (let i = 0; i < lineCount; i++) {
            const delay = i * (c.duration + c.pause);
            const startPct = (delay / totalCycle * 100);
            const p1 = startPct + ((c.duration * 0.15) / totalCycle * 100);
            const p2 = startPct + ((c.duration * 0.85) / totalCycle * 100);
            const p3 = startPct + (c.duration / totalCycle * 100);

            parts += `
@keyframes fade${i} { 0%{opacity:0; filter:blur(10px)} ${startPct.toFixed(1)}%{opacity:0; filter:blur(10px)} ${p1.toFixed(1)}%{opacity:1; filter:blur(0)} ${p2.toFixed(1)}%{opacity:1; filter:blur(0)} ${p3.toFixed(1)}%{opacity:0; filter:blur(10px)} 100%{opacity:0; filter:blur(10px)} }
.fade${i} { animation: fade${i} ${totalCycle}ms ${c.repeat ? 'infinite' : 'forwards'} cubic-bezier(0.4, 0, 0.2, 1); opacity:0; }`;
        }
        parts += `</style>\n`;

        for (let i = 0; i < lineCount; i++) {
            parts += `<text class="typing-text fade${i}" dominant-baseline="${db}" x="${textX}" y="${textY}" text-anchor="${anchor}" fill="${esc(c.color)}">${esc(lines[i])}</text>\n`;
        }
        return parts;
    }

    // ═══════════════════════════════════════════════════════
    // SLIDE ANIMATION
    // ═══════════════════════════════════════════════════════
    static _buildSlideAnimation(lines, c, esc) {
        const lineCount = lines.length;
        const totalCycle = (c.duration + c.pause) * lineCount;
        const ox = Number(c.offsetX) || 0;
        const oy = Number(c.offsetY) || 0;
        const textX = c.center ? (c.width / 2) + ox : 5 + ox;
        const textY = c.vCenter ? (c.height / 2) + oy : c.size + 5 + oy;
        const anchor = c.center ? 'middle' : 'start';
        const db = c.vCenter ? 'central' : 'auto';

        let parts = `<style>`;
        for (let i = 0; i < lineCount; i++) {
            const delay = i * (c.duration + c.pause);
            const startPct = (delay / totalCycle * 100);
            const inPct = startPct + ((c.duration * 0.2) / totalCycle * 100);
            const outStartPct = startPct + ((c.duration * 0.8) / totalCycle * 100);
            const endPct = startPct + (c.duration / totalCycle * 100);

            parts += `
@keyframes slide${i} { 0%{opacity:0;transform:translateY(30px) scale(0.9)} ${startPct.toFixed(1)}%{opacity:0;transform:translateY(30px) scale(0.9)} ${inPct.toFixed(1)}%{opacity:1;transform:translateY(0) scale(1)} ${outStartPct.toFixed(1)}%{opacity:1;transform:translateY(0) scale(1)} ${endPct.toFixed(1)}%{opacity:0;transform:translateY(-30px) scale(0.9)} 100%{opacity:0;transform:translateY(-30px) scale(0.9)} }
.slide${i} { animation: slide${i} ${totalCycle}ms ${c.repeat ? 'infinite' : 'forwards'} cubic-bezier(0.34, 1.56, 0.64, 1); opacity:0; transform-origin:center; }`;
        }
        parts += `</style>\n`;

        for (let i = 0; i < lineCount; i++) {
            parts += `<text class="typing-text slide${i}" dominant-baseline="${db}" x="${textX}" y="${textY}" text-anchor="${anchor}" fill="${esc(c.color)}">${esc(lines[i])}</text>\n`;
        }
        return parts;
    }

    // ═══════════════════════════════════════════════════════
    // GLITCH V1 (RGB Split Focus)
    // ═══════════════════════════════════════════════════════
    static _buildGlitchAnimation(lines, c, esc) {
        return TypingSVGEngine._glitchBase(lines, c, esc, 1);
    }

    // ═══════════════════════════════════════════════════════
    // GLITCH V2 (Scan Lines)
    // ═══════════════════════════════════════════════════════
    static _buildGlitchV2(lines, c, esc) {
        return TypingSVGEngine._glitchBase(lines, c, esc, 2);
    }

    // ═══════════════════════════════════════════════════════
    // GLITCH V3 (Distortion / Flicker)
    // ═══════════════════════════════════════════════════════
    static _buildGlitchV3(lines, c, esc) {
        return TypingSVGEngine._glitchBase(lines, c, esc, 3);
    }

    // ═══════════════════════════════════════════════════════
    // GLITCH V4 (Severe / Shake)
    // ═══════════════════════════════════════════════════════
    static _buildGlitchV4(lines, c, esc) {
        return TypingSVGEngine._glitchBase(lines, c, esc, 4);
    }

    // ═══════════════════════════════════════════════════════
    // GLITCH V5 (Cyberpunk)
    // ═══════════════════════════════════════════════════════
    static _buildGlitchV5(lines, c, esc) {
        return TypingSVGEngine._glitchBase(lines, c, esc, 5);
    }

    static _glitchBase(lines, c, esc, version) {
        const lineCount = lines.length;
        const totalCycle = (c.duration + c.pause) * lineCount;
        const ox = Number(c.offsetX) || 0;
        const oy = Number(c.offsetY) || 0;
        const textX = c.center ? (c.width / 2) + ox : 5 + ox;
        const textY = c.vCenter ? (c.height / 2) + oy : c.size + 5 + oy;
        const anchor = c.center ? 'middle' : 'start';
        const db = c.vCenter ? 'central' : 'auto';

        let parts = `<style>`;
        
        // Define keyframes based on version
        if (version === 1) {
            // V1: Classic RGB split
            parts += `
@keyframes gl1 { 0%{clip-path:inset(20% 0 80% 0); transform:translate(-2px,1px)} 20%{clip-path:inset(60% 0 10% 0); transform:translate(2px,-1px)} 40%{clip-path:inset(40% 0 50% 0); transform:translate(-2px,2px)} 60%{clip-path:inset(80% 0 5% 0); transform:translate(2px,-2px)} 80%{clip-path:inset(10% 0 70% 0); transform:translate(-1px,1px)} 100%{clip-path:inset(30% 0 50% 0); transform:translate(1px,-1px)} }
@keyframes gl2 { 0%{clip-path:inset(10% 0 60% 0); transform:translate(2px,-1px)} 20%{clip-path:inset(30% 0 20% 0); transform:translate(-2px,1px)} 40%{clip-path:inset(70% 0 10% 0); transform:translate(2px,-2px)} 60%{clip-path:inset(20% 0 50% 0); transform:translate(-2px,2px)} 80%{clip-path:inset(50% 0 30% 0); transform:translate(1px,-1px)} 100%{clip-path:inset(5% 0 80% 0); transform:translate(-1px,1px)} }
.gl-a { animation: gl1 0.25s infinite linear alternate-reverse; }
.gl-b { animation: gl2 0.3s infinite linear alternate-reverse; }`;
        } else if (version === 2) {
            // V2: Aggressive / Jitter
            parts += `
@keyframes gl1 {
  0%{clip-path:inset(20% 0 80% 0); transform:translate(3px,-4px)}
  10%{clip-path:inset(80% 0 5% 0); transform:translate(-4px,3px) scale(1.02)}
  20%{clip-path:inset(10% 0 60% 0); transform:translate(2px,5px)}
  30%{clip-path:inset(50% 0 30% 0); transform:translate(-5px,-2px) skewX(20deg)}
  40%{clip-path:inset(30% 0 10% 0); transform:translate(5px,-5px)}
  50%{clip-path:inset(90% 0 2% 0); transform:translate(-2px,4px)}
  60%{clip-path:inset(5% 0 80% 0); transform:translate(4px,-2px)}
  70%{clip-path:inset(60% 0 20% 0); transform:translate(-3px,2px)}
  80%{clip-path:inset(15% 0 70% 0); transform:translate(3px,-4px)}
  90%{clip-path:inset(70% 0 10% 0); transform:translate(-2px,5px)}
  100%{clip-path:inset(25% 0 35% 0); transform:translate(5px,-3px)}
}
@keyframes gl2 {
  0%{clip-path:inset(15% 0 82% 0); transform:translate(-3px,4px)}
  10%{clip-path:inset(40% 0 15% 0); transform:translate(4px,-3px) scale(0.98)}
  20%{clip-path:inset(85% 0 10% 0); transform:translate(-2px,-5px)}
  30%{clip-path:inset(20% 0 60% 0); transform:translate(5px,2px) skewX(-20deg)}
  40%{clip-path:inset(65% 0 5% 0); transform:translate(-5px,5px)}
  50%{clip-path:inset(10% 0 75% 0); transform:translate(2px,-4px)}
  60%{clip-path:inset(75% 0 20% 0); transform:translate(-4px,2px)}
  70%{clip-path:inset(35% 0 40% 0); transform:translate(3px,-2px)}
  80%{clip-path:inset(5% 0 85% 0); transform:translate(-3px,4px)}
  90%{clip-path:inset(50% 0 45% 0); transform:translate(2px,-5px)}
  100%{clip-path:inset(80% 0 5% 0); transform:translate(-5px,3px)}
}
.gl-a { animation: gl1 0.4s infinite steps(2, end) alternate-reverse; }
.gl-b { animation: gl2 0.35s infinite steps(2, end) alternate; }`;
        } else if (version === 3) {
            // V3: Opacity flicker + sudden jumps
            parts += `
@keyframes gl1 { 0%, 100%{transform:translate(0,0); opacity:1} 15%{transform:translate(-5px,2px); opacity:0.8} 16%{transform:translate(0,0); opacity:1} 45%{transform:translate(4px,-2px); opacity:0.6} 46%{transform:translate(0,0); opacity:1} 70%{transform:scale(1.02); opacity:0.9} 71%{transform:scale(1); opacity:1} }
@keyframes gl2 { 0%, 100%{transform:translate(0,0); opacity:0} 15%{transform:translate(5px,-2px); opacity:0.5} 16%{transform:translate(0,0); opacity:0} 45%{transform:translate(-4px,2px); opacity:0.5} 46%{transform:translate(0,0); opacity:0} 70%{clip-path:inset(40% 0 40% 0); transform:translateX(-5px); opacity:0.8} 75%{clip-path:inset(0); transform:translateX(0); opacity:0} }
.gl-a { animation: gl1 2.5s infinite steps(2, end); }
.gl-b { animation: gl2 2.5s infinite steps(2, end); }`;
        } else if (version === 4) {
            // V4: Severe / Matrix style
            parts += `
@keyframes gl1 { 0%, 100%{transform:none; clip-path:none;} 5%{transform:skewX(-15deg) translate(-10px, 0); clip-path:inset(10% 0 60% 0);} 10%{transform:none; clip-path:none;} 40%{transform:skewX(20deg) translate(10px, 0); clip-path:inset(50% 0 30% 0);} 45%{transform:none; clip-path:none;} }
@keyframes gl2 { 0%, 100%{transform:none; clip-path:none;} 5%{transform:skewX(15deg) translate(10px, 0); clip-path:inset(60% 0 10% 0);} 10%{transform:none; clip-path:none;} 40%{transform:skewX(-20deg) translate(-10px, 0); clip-path:inset(30% 0 50% 0);} 45%{transform:none; clip-path:none;} }
.gl-a { animation: gl1 3s infinite steps(1, end); }
.gl-b { animation: gl2 3s infinite steps(1, end); }`;
        } else {
            // V5: Cyberpunk Hard-Slice Glitch
            // Utilizes high-frequency vertical slices, vibrant cyan/magenta shifting, and main text jittering.
            parts += `
@keyframes glM {
    0%, 100%{ transform: translate(0,0) skewX(0deg); }
    5% { transform: translate(-3px,-1px) skewX(5deg); }
    6% { transform: translate(0,0) skewX(0deg); }
    22% { transform: translate(4px,1px) skewX(-10deg); }
    23% { transform: translate(0,0) skewX(0deg); }
    65% { transform: translate(-2px,2px) scaleX(1.05); }
    66% { transform: translate(0,0) scaleX(1); }
    88% { transform: translate(5px,-2px) skewX(8deg); }
    89% { transform: translate(0,0) skewX(0deg); }
}
@keyframes gl1 {
    0%{clip-path:inset(20% 0 80% 0); transform:translate(-4px,1px)}
    10%{clip-path:inset(60% 0 10% 0); transform:translate(3px,-2px)}
    20%{clip-path:inset(40% 0 50% 0); transform:translate(-2px,3px)}
    30%{clip-path:inset(80% 0 5% 0); transform:translate(5px,-1px)}
    40%{clip-path:inset(10% 0 70% 0); transform:translate(-6px,2px)}
    50%{clip-path:inset(30% 0 50% 0); transform:translate(4px,-3px)}
    60%{clip-path:inset(70% 0 15% 0); transform:translate(-3px,1px)}
    70%{clip-path:inset(5% 0 80% 0); transform:translate(2px,-4px)}
    80%{clip-path:inset(50% 0 30% 0); transform:translate(-5px,2px)}
    90%{clip-path:inset(15% 0 60% 0); transform:translate(3px,-1px)}
    100%{clip-path:inset(20% 0 80% 0); transform:translate(-4px,1px)}
}
@keyframes gl2 {
    0%{clip-path:inset(60% 0 10% 0); transform:translate(4px,-1px)}
    10%{clip-path:inset(20% 0 80% 0); transform:translate(-3px,2px)}
    20%{clip-path:inset(80% 0 5% 0); transform:translate(2px,-3px)}
    30%{clip-path:inset(40% 0 50% 0); transform:translate(-5px,1px)}
    40%{clip-path:inset(70% 0 15% 0); transform:translate(6px,-2px)}
    50%{clip-path:inset(10% 0 70% 0); transform:translate(-4px,3px)}
    60%{clip-path:inset(30% 0 50% 0); transform:translate(3px,-1px)}
    70%{clip-path:inset(50% 0 30% 0); transform:translate(-2px,4px)}
    80%{clip-path:inset(5% 0 80% 0); transform:translate(5px,-2px)}
    90%{clip-path:inset(15% 0 60% 0); transform:translate(-3px,1px)}
    100%{clip-path:inset(60% 0 10% 0); transform:translate(4px,-1px)}
}
.gl-m { animation: glM 3.2s infinite ease-out; }
.gl-a { animation: gl1 0.6s infinite steps(2, end) alternate-reverse; opacity: 0.8 !important; }
.gl-b { animation: gl2 0.7s infinite steps(2, end) alternate; opacity: 0.8 !important; }`;
        }

        for (let i = 0; i < lineCount; i++) {
            const delay = i * (c.duration + c.pause);
            const startPct = (delay / totalCycle * 100);
            const endPct = ((delay + c.duration) / totalCycle * 100);

            parts += `
@keyframes gVis${i} { 0%{opacity:0} ${startPct.toFixed(1)}%{opacity:0} ${(startPct+0.5).toFixed(1)}%{opacity:1} ${endPct.toFixed(1)}%{opacity:1} ${(endPct+0.5).toFixed(1)}%{opacity:0} 100%{opacity:0} }
.gVis${i} { animation: gVis${i} ${totalCycle}ms ${c.repeat ? 'infinite' : 'forwards'}; opacity:0; }`;
        }
        parts += `</style>\n`;

        for (let i = 0; i < lineCount; i++) {
            let colors = { a: 'rgba(255,0,0,0.5)', b: 'rgba(0,255,255,0.5)' };
            let blend = 'mix-blend-mode:screen;';
            let mainStyle = '';
            let mainClass = 'typing-text';
            if (version === 2) {
                blend = 'mix-blend-mode:difference;';
            } else if (version === 3) {
                colors = { a: c.color, b: 'rgba(255,255,255,0.8)' };
                blend = '';
                mainStyle = 'animation: gl1 2.5s infinite steps(2, end);';
            } else if (version === 5) {
                colors = { a: '#00ffff', b: '#ff003c' };
                blend = 'mix-blend-mode: screen;'; 
                mainClass = 'typing-text gl-m';
            }

            parts += `<g class="gVis${i}">
    <text class="${mainClass}" dominant-baseline="${db}" x="${textX}" y="${textY}" text-anchor="${anchor}" fill="${esc(c.color)}" style="${mainStyle}">${esc(lines[i])}</text>
    <text class="typing-text gl-a" dominant-baseline="${db}" x="${textX}" y="${textY}" text-anchor="${anchor}" fill="${colors.a}" style="text-shadow:none; ${blend}">${esc(lines[i])}</text>
    <text class="typing-text gl-b" dominant-baseline="${db}" x="${textX}" y="${textY}" text-anchor="${anchor}" fill="${colors.b}" style="text-shadow:none; ${blend}">${esc(lines[i])}</text>
</g>\n`;
        }
        return parts;
    }
    // ═══════════════════════════════════════════════════════
    // WAVE ANIMATION
    // ═══════════════════════════════════════════════════════
    static _buildWaveAnimation(lines, c, esc) {
        const lineCount = lines.length;
        const totalCycle = (c.duration + c.pause) * lineCount;
        const ox = Number(c.offsetX) || 0;
        const oy = Number(c.offsetY) || 0;
        const baseX = c.center ? (c.width / 2) + ox : 5 + ox;
        const textY = c.vCenter ? (c.height / 2) + oy : c.size + 5 + oy;
        const db = c.vCenter ? 'central' : 'auto';

        let parts = `<style>`;
        for (let i = 0; i < lineCount; i++) {
            const delay = i * (c.duration + c.pause);
            const startPct = (delay / totalCycle * 100);
            const endPct = ((delay + c.duration) / totalCycle * 100);

            parts += `
@keyframes waveVis${i} { 0%{opacity:0} ${startPct.toFixed(1)}%{opacity:0} ${(startPct + 1).toFixed(1)}%{opacity:1} ${endPct.toFixed(1)}%{opacity:1} ${(endPct + 1).toFixed(1)}%{opacity:0} 100%{opacity:0} }
.waveVis${i} { animation: waveVis${i} ${totalCycle}ms ${c.repeat ? 'infinite' : 'forwards'}; opacity:0; }`;
        }

        parts += `
@keyframes waveCharY { 0%{transform:translateY(0)} 15%{transform:translateY(-15px)} 30%{transform:translateY(0)} 100%{transform:translateY(0)} }
</style>\n`;

        for (let i = 0; i < lineCount; i++) {
            const chars = lines[i].split('');
            let charSpans = '';
            // Approximate monospace width, but this relies on it being monospace/known width
            const charWidth = c.size * 0.6;
            const totalW = chars.length * charWidth;
            const startX = c.center ? baseX - (totalW / 2) : baseX;

            for (let j = 0; j < chars.length; j++) {
                const x = startX + j * charWidth;
                const charDelay = (j * 0.08).toFixed(2);
                charSpans += `<tspan x="${x.toFixed(1)}" style="animation:waveCharY 1.5s ${charDelay}s infinite cubic-bezier(0.45, 0, 0.55, 1); display:inline-block;">${esc(chars[j])}</tspan>`;
            }

            parts += `<text class="typing-text waveVis${i}" dominant-baseline="${db}" y="${textY}" text-anchor="start" fill="${esc(c.color)}">${charSpans}</text>\n`;
        }
        return parts;
    }

    // ═══════════════════════════════════════════════════════
    // BOUNCE ANIMATION
    // ═══════════════════════════════════════════════════════
    static _buildBounceAnimation(lines, c, esc) {
        const lineCount = lines.length;
        const totalCycle = (c.duration + c.pause) * lineCount;
        const ox = Number(c.offsetX) || 0;
        const oy = Number(c.offsetY) || 0;
        const baseX = c.center ? (c.width / 2) + ox : 5 + ox;
        const textY = c.vCenter ? (c.height / 2) + oy : c.size + 5 + oy;
        const db = c.vCenter ? 'central' : 'auto';

        let parts = `<style>`;
        for (let i = 0; i < lineCount; i++) {
            const delay = i * (c.duration + c.pause);
            const startPct = (delay / totalCycle * 100);
            const endPct = ((delay + c.duration) / totalCycle * 100);

            parts += `
@keyframes bVis${i} { 0%{opacity:0} ${startPct.toFixed(1)}%{opacity:0} ${(startPct + 1).toFixed(1)}%{opacity:1} ${endPct.toFixed(1)}%{opacity:1} ${(endPct + 1).toFixed(1)}%{opacity:0} 100%{opacity:0} }
.bVis${i} { animation: bVis${i} ${totalCycle}ms ${c.repeat ? 'infinite' : 'forwards'}; opacity:0; }`;
        }

        parts += `
@keyframes bounceChar { 0%{transform:translateY(0) scale(1,1)} 10%{transform:translateY(0) scale(1.2,0.8)} 25%{transform:translateY(-20px) scale(0.9,1.1)} 40%{transform:translateY(0) scale(1.1,0.9)} 50%{transform:translateY(-10px) scale(0.95,1.05)} 60%{transform:translateY(0) scale(1,1)} 100%{transform:translateY(0) scale(1,1)} }
</style>\n`;

        for (let i = 0; i < lineCount; i++) {
            const chars = lines[i].split('');
            let charSpans = '';
            const charWidth = c.size * 0.6;
            const totalW = chars.length * charWidth;
            const startX = c.center ? baseX - (totalW / 2) : baseX;

            for (let j = 0; j < chars.length; j++) {
                const x = startX + j * charWidth;
                const charDelay = (j * 0.05).toFixed(2);
                charSpans += `<tspan x="${x.toFixed(1)}" style="animation:bounceChar 2s ${charDelay}s infinite cubic-bezier(0.28, 0.84, 0.42, 1); display:inline-block; transform-origin:bottom;">${esc(chars[j])}</tspan>`;
            }

            parts += `<text class="typing-text bVis${i}" dominant-baseline="${db}" y="${textY}" text-anchor="start" fill="${esc(c.color)}">${charSpans}</text>\n`;
        }
        return parts;
    }

    // ═══════════════════════════════════════════════════════
    // PULSE ANIMATION
    // ═══════════════════════════════════════════════════════
    static _buildPulseAnimation(lines, c, esc) {
        const lineCount = lines.length;
        const totalCycle = (c.duration + c.pause) * lineCount;
        const ox = Number(c.offsetX) || 0;
        const oy = Number(c.offsetY) || 0;
        const textX = c.center ? (c.width / 2) + ox : 5 + ox;
        const textY = c.vCenter ? (c.height / 2) + oy : c.size + 5 + oy;
        const anchor = c.center ? 'middle' : 'start';
        const db = c.vCenter ? 'central' : 'auto';

        let parts = `<style>`;
        for (let i = 0; i < lineCount; i++) {
            const delay = i * (c.duration + c.pause);
            const startPct = (delay / totalCycle * 100);
            const endPct = ((delay + c.duration) / totalCycle * 100);

            parts += `
@keyframes pulseVis${i} { 0%{opacity:0} ${startPct.toFixed(1)}%{opacity:0} ${(startPct+1).toFixed(1)}%{opacity:1} ${endPct.toFixed(1)}%{opacity:1} ${(endPct+1).toFixed(1)}%{opacity:0} 100%{opacity:0} }
.pulseVis${i} { animation: pulseVis${i} ${totalCycle}ms ${c.repeat ? 'infinite' : 'forwards'}; opacity:0; }`;
        }

        parts += `
@keyframes pulseBeat { 0%{transform:scale(1); filter:brightness(1)} 10%{transform:scale(1.08); filter:brightness(1.5)} 20%{transform:scale(1); filter:brightness(1)} 30%{transform:scale(1.08); filter:brightness(1.5)} 40%{transform:scale(1); filter:brightness(1)} 100%{transform:scale(1); filter:brightness(1)} }
</style>\n`;

        for (let i = 0; i < lineCount; i++) {
            parts += `<g class="pulseVis${i}" style="transform-origin:center; animation:pulseBeat 1.5s infinite ease-in-out;">
    <text class="typing-text" dominant-baseline="${db}" x="${textX}" y="${textY}" text-anchor="${anchor}" fill="${esc(c.color)}">${esc(lines[i])}</text>
</g>\n`;
        }
        return parts;
    }

    // ═══════════════════════════════════════════════════════
    // REVEAL ANIMATION (Block slide reveal)
    // ═══════════════════════════════════════════════════════
    static _buildRevealAnimation(lines, c, esc, fillAttr) {
        const lineCount = lines.length;
        const totalCycle = (c.duration + c.pause) * lineCount;
        const ox = Number(c.offsetX) || 0;
        const oy = Number(c.offsetY) || 0;
        const textX = c.center ? `50%` : `${5}px`; // use standard % for text
        const textY = c.vCenter ? `50%` : `${c.size + 5}px`;
        const anchor = c.center ? 'middle' : 'start';
        const db = c.vCenter ? 'central' : 'auto';

        let parts = `<style>
@keyframes revealText { 0%{clip-path:inset(0 100% 0 0)} 40%{clip-path:inset(0 0 0 0)} 80%{clip-path:inset(0 0 0 0)} 100%{clip-path:inset(0 0 0 100%)} }
@keyframes revealBlock { 0%{transform:scaleX(0); transform-origin:left} 20%{transform:scaleX(1); transform-origin:left} 20.1%{transform-origin:right} 40%{transform:scaleX(0); transform-origin:right} 100%{transform:scaleX(0)} }
        `;

        for (let i = 0; i < lineCount; i++) {
            const delay = i * (c.duration + c.pause);
            const startPct = (delay / totalCycle * 100);
            const endPct = ((delay + c.duration) / totalCycle * 100);

            parts += `
@keyframes rVis${i} { 0%{opacity:0} ${startPct.toFixed(1)}%{opacity:1} ${endPct.toFixed(1)}%{opacity:1} ${(endPct+0.1).toFixed(1)}%{opacity:0} 100%{opacity:0} }
.rVis${i} { animation: rVis${i} ${totalCycle}ms ${c.repeat ? 'infinite' : 'forwards'}; opacity:0; }`;
        }
        parts += `</style>\n`;

        // We use a group offset to handle offsetX/Y
        const blockColor = c.glowColor || c.color;

        for (let i = 0; i < lineCount; i++) {
            // Block width approximation based on character count
            const approxW = lines[i].length * (c.size * 0.6) + 40;
            const blockX = c.center ? (c.width / 2) - (approxW / 2) : 5;
            const blockY = c.vCenter ? (c.height / 2) - ((c.size / 2) + 5) : 5;

            parts += `<g class="rVis${i}" style="transform:translate(${ox}px, ${oy}px);">
    <text class="typing-text" dominant-baseline="${db}" x="${textX}" y="${textY}" text-anchor="${anchor}" fill="${esc(c.color)}" style="animation:revealText ${c.duration}ms cubic-bezier(0.77, 0, 0.175, 1) infinite;">${esc(lines[i])}</text>
    <rect x="${blockX}" y="${blockY}" width="${approxW}" height="${c.size + 10}" fill="${esc(blockColor)}" style="animation:revealBlock ${c.duration}ms cubic-bezier(0.77, 0, 0.175, 1) infinite;" />
</g>\n`;
        }
        return parts;
    }

    // ═══════════════════════════════════════════════════════
    // DROP ANIMATION
    // ═══════════════════════════════════════════════════════
    static _buildDropAnimation(lines, c, esc) {
        const lineCount = lines.length;
        const totalCycle = (c.duration + c.pause) * lineCount;
        const ox = Number(c.offsetX) || 0;
        const oy = Number(c.offsetY) || 0;
        const baseX = c.center ? (c.width / 2) + ox : 5 + ox;
        const textY = c.vCenter ? (c.height / 2) + oy : c.size + 5 + oy;
        const db = c.vCenter ? 'central' : 'auto';

        let parts = `<style>`;
        for (let i = 0; i < lineCount; i++) {
            const delay = i * (c.duration + c.pause);
            const startPct = (delay / totalCycle * 100);
            const endPct = ((delay + c.duration) / totalCycle * 100);

            parts += `
@keyframes dropVis${i} { 0%{opacity:0} ${startPct.toFixed(1)}%{opacity:0} ${(startPct+0.5).toFixed(1)}%{opacity:1} ${endPct.toFixed(1)}%{opacity:1} ${(endPct+0.5).toFixed(1)}%{opacity:0} 100%{opacity:0} }
.dropVis${i} { animation: dropVis${i} ${totalCycle}ms ${c.repeat ? 'infinite' : 'forwards'}; opacity:0; }`;
        }

        parts += `
@keyframes dropChar { 0%{transform:translateY(-50px); opacity:0} 10%{transform:translateY(0); opacity:1} 15%{transform:translateY(-10px)} 20%{transform:translateY(0)} 80%{transform:translateY(0); opacity:1} 90%{transform:translateY(20px); opacity:0} 100%{transform:translateY(20px); opacity:0} }
</style>\n`;

        for (let i = 0; i < lineCount; i++) {
            const chars = lines[i].split('');
            let charSpans = '';
            const charWidth = c.size * 0.6;
            const totalW = chars.length * charWidth;
            const startX = c.center ? baseX - (totalW / 2) : baseX;

            for (let j = 0; j < chars.length; j++) {
                const x = startX + j * charWidth;
                const charDelay = (j * 0.04).toFixed(2);
                charSpans += `<tspan x="${x.toFixed(1)}" style="animation:dropChar ${c.duration}ms ${charDelay}s infinite cubic-bezier(0.175, 0.885, 0.32, 1.275); display:inline-block; opacity:0;">${esc(chars[j])}</tspan>`;
            }

            parts += `<text class="typing-text dropVis${i}" dominant-baseline="${db}" y="${textY}" text-anchor="start" fill="${esc(c.color)}">${charSpans}</text>\n`;
        }
        return parts;
    }

    // ═══════════════════════════════════════════════════════
    // UTILITY: Generate Google Font CSS for embedding in SVG
    // ═══════════════════════════════════════════════════════
    static getFontImportCSS(fontName, weight = '400') {
        if (!fontName || fontName === 'monospace') return '';
        const encoded = encodeURIComponent(fontName).replace(/%20/g, '+');
        return `@import url('https://fonts.googleapis.com/css2?family=${encoded}:wght@${weight}&display=swap');`;
    }
}
