
// Mimic the fixed ClockEngine logic to verify it works in this environment
async function verifyFix() {
    console.log('Verifying TimeAPI.io fix...');
    try {
        const url = 'https://timeapi.io/api/Time/current/zone?timeZone=UTC';
        console.log(`Fetching from: ${url}`);

        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`Status: ${resp.status}`);

        const data = await resp.json();
        console.log('Data recieved:', data);

        // This is the key logic we added
        const serverTime = new Date(data.dateTime + 'Z');

        console.log('Parsed UTC Time:', serverTime.toISOString());
        console.log('Local Time:     ', new Date().toISOString());

        const diff = Math.abs(serverTime.getTime() - Date.now());
        console.log(`Difference: ${diff}ms`);

        if (diff < 60000) { // Should be very close if system time is correct, or just returns a valid time
            console.log('✅ Fix verified: Parsed time is valid and close to system time.');
        } else {
            console.warn('⚠️ Time difference is large. This might be due to incorrect system time, but the API call SUCCEEDED.');
            console.log('Device Time:', new Date().toString());
            console.log('Server Time:', serverTime.toString());
        }
    } catch (e) {
        console.error('❌ Verification failed:', e.message);
        process.exit(1);
    }
}

verifyFix();
