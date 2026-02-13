
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json'
};

const apis = [
    { name: 'TimeAPI.io (IP)', url: 'https://timeapi.io/api/Time/current/ip' },
    { name: 'TimeAPI.io (Zone)', url: 'https://timeapi.io/api/Time/current/zone?timeZone=UTC' },
    { name: 'WorldTimeAPI (IP)', url: 'https://worldtimeapi.org/api/ip' },
];

async function testApi(api) {
    console.log(`\nTesting ${api.name}...`);
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const resp = await fetch(api.url, {
            headers,
            signal: controller.signal
        });
        clearTimeout(timeout);

        console.log(`Status: ${resp.status}`);
        if (resp.ok) {
            const data = await resp.json();
            console.log('Success:', JSON.stringify(data).substring(0, 100) + '...');
        } else {
            console.log('Failed:', resp.statusText);
            const text = await resp.text();
            console.log('Body:', text.substring(0, 200));
        }
    } catch (e) {
        console.log('Error:', e.message);
    }
}

async function run() {
    console.log('Starting v2 Test...');
    for (const api of apis) {
        await testApi(api);
    }
}

run();
