/**
 * Handles timekeeping with timezone support and optional internet time verification.
 */
export class ClockEngine {
    constructor() {
        this.running = false;
        this.callback = null;
        this.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone; // e.g. "Asia/Kolkata"
        this.use24h = true;
        this.internetOffset = 0; // ms offset from internet time
        this.verified = false;
    }

    start(callback) {
        this.callback = callback;
        this.running = true;
        this.verifyTimeOnline();
        this.tick();
    }

    stop() {
        this.running = false;
    }

    setTimezone(tz) {
        this.timezone = tz;
        // Re-verify when timezone changes
        this.verifyTimeOnline();
    }

    set24h(val) {
        this.use24h = val;
    }

    /**
     * Verify local time against WorldTimeAPI.
     * Calculates offset if there's drift.
     */
    async verifyTimeOnline() {
        try {
            const resp = await fetch(`https://worldtimeapi.org/api/timezone/${this.timezone}`);
            if (!resp.ok) return;
            const data = await resp.json();
            const serverTime = new Date(data.datetime);
            const localNow = new Date();
            this.internetOffset = serverTime.getTime() - localNow.getTime();
            this.verified = true;
            console.log(`⏱ Time verified: offset=${this.internetOffset}ms, tz=${this.timezone}`);
        } catch (err) {
            console.warn('Time verification failed, using local time:', err.message);
            this.internetOffset = 0;
        }
    }

    tick() {
        if (!this.running) return;

        // Apply internet offset for drift correction
        const correctedMs = Date.now() + this.internetOffset;
        const correctedDate = new Date(correctedMs);

        // Format using the selected timezone
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: this.timezone,
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: false,
            fractionalSecondDigits: 3
        });

        const parts = formatter.formatToParts(correctedDate);
        let hours = 0, minutes = 0, seconds = 0;

        for (const p of parts) {
            if (p.type === 'hour') hours = parseInt(p.value, 10);
            if (p.type === 'minute') minutes = parseInt(p.value, 10);
            if (p.type === 'second') seconds = parseInt(p.value, 10);
        }

        // Handle 24→12h if needed
        const displayHours = this.use24h ? hours : (hours % 12 || 12);
        const ampm = hours >= 12 ? 'PM' : 'AM';

        const time = {
            hours: displayHours,
            rawHours: hours,
            minutes,
            seconds,
            milliseconds: correctedDate.getMilliseconds(),
            totalSeconds: hours * 3600 + minutes * 60 + seconds + correctedDate.getMilliseconds() / 1000,
            ampm,
            is24h: this.use24h,
            timezone: this.timezone,
            verified: this.verified
        };

        if (this.callback) this.callback(time);
        requestAnimationFrame(() => this.tick());
    }

    static getTimezones() {
        return [
            // Africa
            { label: 'Africa/Cairo', value: 'Africa/Cairo' },
            { label: 'Africa/Casablanca', value: 'Africa/Casablanca' },
            { label: 'Africa/Johannesburg', value: 'Africa/Johannesburg' },
            { label: 'Africa/Lagos', value: 'Africa/Lagos' },
            { label: 'Africa/Nairobi', value: 'Africa/Nairobi' },
            // Americas
            { label: 'America/New York', value: 'America/New_York' },
            { label: 'America/Chicago', value: 'America/Chicago' },
            { label: 'America/Denver', value: 'America/Denver' },
            { label: 'America/Los Angeles', value: 'America/Los_Angeles' },
            { label: 'America/Toronto', value: 'America/Toronto' },
            { label: 'America/Mexico City', value: 'America/Mexico_City' },
            { label: 'America/Bogota', value: 'America/Bogota' },
            { label: 'America/São Paulo', value: 'America/Sao_Paulo' },
            { label: 'America/Buenos Aires', value: 'America/Argentina/Buenos_Aires' },
            { label: 'America/Anchorage', value: 'America/Anchorage' },
            { label: 'Pacific/Honolulu', value: 'Pacific/Honolulu' },
            // Asia
            { label: 'Asia/Kolkata', value: 'Asia/Kolkata' },
            { label: 'Asia/Tokyo', value: 'Asia/Tokyo' },
            { label: 'Asia/Shanghai', value: 'Asia/Shanghai' },
            { label: 'Asia/Dubai', value: 'Asia/Dubai' },
            { label: 'Asia/Singapore', value: 'Asia/Singapore' },
            { label: 'Asia/Hong Kong', value: 'Asia/Hong_Kong' },
            { label: 'Asia/Seoul', value: 'Asia/Seoul' },
            { label: 'Asia/Bangkok', value: 'Asia/Bangkok' },
            { label: 'Asia/Jakarta', value: 'Asia/Jakarta' },
            { label: 'Asia/Riyadh', value: 'Asia/Riyadh' },
            { label: 'Asia/Tehran', value: 'Asia/Tehran' },
            { label: 'Asia/Karachi', value: 'Asia/Karachi' },
            { label: 'Asia/Dhaka', value: 'Asia/Dhaka' },
            { label: 'Asia/Manila', value: 'Asia/Manila' },
            // Australia/Pacific
            { label: 'Australia/Sydney', value: 'Australia/Sydney' },
            { label: 'Australia/Melbourne', value: 'Australia/Melbourne' },
            { label: 'Australia/Perth', value: 'Australia/Perth' },
            { label: 'Pacific/Auckland', value: 'Pacific/Auckland' },
            { label: 'Pacific/Fiji', value: 'Pacific/Fiji' },
            // Europe
            { label: 'Europe/London', value: 'Europe/London' },
            { label: 'Europe/Paris', value: 'Europe/Paris' },
            { label: 'Europe/Berlin', value: 'Europe/Berlin' },
            { label: 'Europe/Moscow', value: 'Europe/Moscow' },
            { label: 'Europe/Istanbul', value: 'Europe/Istanbul' },
            { label: 'Europe/Rome', value: 'Europe/Rome' },
            { label: 'Europe/Madrid', value: 'Europe/Madrid' },
            { label: 'Europe/Amsterdam', value: 'Europe/Amsterdam' },
            { label: 'Europe/Zurich', value: 'Europe/Zurich' },
            { label: 'Europe/Stockholm', value: 'Europe/Stockholm' },
            // UTC
            { label: 'UTC', value: 'UTC' },
        ];
    }
}
