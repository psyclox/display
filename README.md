# The Ultimate Display Website 🖥️

![Project Banner](https://img.shields.io/badge/Status-Complete-success) ![Tech](https://img.shields.io/badge/Tech-Vanilla%20JS-yellow) ![License](https://img.shields.io/badge/License-MIT-blue)

A premium, high-performance display system designed to turn any screen (TV, PC, Mobile) into a stunning visual tool. Features three distinct modes: **Unified Clock**, **Running Text**, and **Fake Updates**.

---

## 🌟 Key Features

### 1. Unified Clock 🕒
> A masterpiece of procedural generation.
*   **Infinite Variety**: Procedurally generates **200+ unique clock faces** on the fly.
*   **Dual Modes**: Supports both **Analog** (SVG-based) and **Digital** layouts.
*   **AMOLED Support**: "Pitch Black" mode specifically designed for OLED screens to save pixels.
*   **Scalability**: SVG rendering ensures crisp visuals on 4K/8K TVs.

### 2. Running Text (Marquee) 🏃
> Professional-grade digital signage.
*   **High Performance**: Powered by HTML5 Canvas for smooth 60fps scrolling.
*   **Customization**:
    *   **Fonts**: Instantly load and switch between 20+ Google Fonts (Inter, Mono, Handwriting, etc.).
    *   **Visuals**: RGB Color picker, Opacity control, and Blur effects.
    *   **Physics**: Adjustable speed and smooth looping.
*   **Input**: Real-time text updates via the control panel.

### 3. Fake Update Simulator ⚠️
> The ultimate prank or screen saver.
*   **Realistic Simulations**: Windows 10, Windows 11, macOS, and BSOD.
*   **Immersive Mode**:
    *   **Auto-Hide Cursor**: The mouse disappears to sell the illusion.
    *   **Lockdown**: Interactions are blocked (except emergency exit).
    *   **Loop Logic**: Progress bars move realistically (stops at 99%, etc.).

---

## 🚀 Usage

### Installation
No build steps required! This project uses pure Vanilla HTML/CSS/JS.

1.  **Clone the Repo** (or download usage files).
2.  Open `index.html` in any modern browser (Chrome, Edge, Firefox).

### Controls
| Key / UI | Action |
| :--- | :--- |
| **F11** | **Toggle Fullscreen** (Recommended) |
| **Clock Tab** | Click `Next` to generate a new face. |
| **Text Tab** | Use the bottom panel to type text & change settings. |
| **Update Tab** | Select an OS style to start the simulation. |
| **Right Click** | **Disabled** for immersion. |

### Settings ⚙️
Click the **Gear Icon** in the top navigation to access global settings:
*   **Theme**: Light / Dark / **AMOLED (Pitch Black)**.
*   **Fullscreen**: Toggle immersive mode (activates **Wake Lock** to keep screen on).

---

## 🛠️ Technical Details

*   **Core**: Vanilla JavaScript (ES6 Modules).
*   **Styling**: Modern CSS3 (Variables, Flexbox, Grid, Backdrop Filters).
*   **Rendering**:
    *   *Clock*: SVG (Scalable Vector Graphics) for resolution independence.
    *   *Text*: HTML5 `<canvas>` for high-frame-rate bitmap manipulation.
*   **Fonts**: Dynamic loading via Google Fonts API.

---

## 📱 Responsiveness

The interface is built with fluid CSS (`min`, `max`, `dvh`) to adapt perfectly to:
*   **Ultrawide Monitors**
*   **Vertical Displays (Phones/Kiosks)**
*   **Large Format TVs**

---

### 🎨 Customization Guide
Want to add more clock faces?
Edit `js/modules/clock/faces.js`:
```javascript
// Add user palette
{ name: "MyTheme", bg: "#123", primary: "#abc", ... }
```
The **Face Generator** will automatically include it in the random rotation!

---

*Crafted with precision for the ultimate display experience.*
