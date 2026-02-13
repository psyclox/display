
async function testTimeApis() {
    console.log('Starting Time API connectivity test...');

    // Add a simple delay to verify console output works
    await new Promise(r => setTimeout(r, 100));

    const apis = [
        { name: 'TimeAPI.io (IP)', url: 'https://timeapi.io/api/Time/current/ip' },
        { name: 'WorldTimeAPI (IP)', url: 'https://worldtimeapi.org/api/ip' },
        // We'll test a specific timezone too to check that endpoint
        { name: 'WorldTimeAPI (Tokyo)', url: 'https://worldtimeapi.org/api/timezone/Asia/Tokyo' }
    ];

    for (const api of apis) {
        console.log(`\nTesting ${api.name}...`);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

            const start = Date.now();
            const resp = await fetch(api.url, { signal: controller.signal });
            clearTimeout(timeoutId);

            const duration = Date.now() - start;

            console.log(`Status: ${resp.status} ${resp.statusText}`);
            console.log(`Latency: ${duration}ms`);

            if (resp.ok) {
                const data = await resp.json();
                // console.log('Response Data:', JSON.stringify(data, null, 2));

                let serverTime;
                if (data.dateTime) serverTime = new Date(data.dateTime);
                else if (data.datetime) serverTime = new Date(data.datetime);

                if (serverTime) {
                    console.log(`Parsed Time: ${serverTime.toString()}`);
                    console.log(`Local Time:  ${new Date().toString()}`);
                    const diff = serverTime.getTime() - Date.now();
                    console.log(`Offset: ${diff}ms`);
                } else {
                    console.error('Could not parse time from response.');
                }
            } else {
                console.error('Request failed.');
            }
        } catch (err) {
            if (err.name === 'AbortError') {
                console.error('Request timed out after 5000ms');
            } else {
                console.error(`Fetch error: ${err.message}`);
                if (err.cause) console.error('Cause:', err.cause);
            }
        }
    }
    console.log('\nTest completed.');
}

testTimeApis().catch(console.error);
