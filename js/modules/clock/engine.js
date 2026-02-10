/**
 * Handles timekeeping and animation loops.
 */
export class ClockEngine {
    constructor() {
        this.running = false;
        this.callback = null;
    }

    start(callback) {
        this.callback = callback;
        this.running = true;
        this.tick();
    }

    stop() {
        this.running = false;
    }

    tick() {
        if (!this.running) return;

        const now = new Date();
        const time = {
            hours: now.getHours(),
            minutes: now.getMinutes(),
            seconds: now.getSeconds(),
            milliseconds: now.getMilliseconds(),
            totalSeconds: now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() + now.getMilliseconds() / 1000
        };

        if (this.callback) this.callback(time);

        requestAnimationFrame(() => this.tick());
    }
}
