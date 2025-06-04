const axios = require('axios');

// Test if sites are accessible
const sites = [
    'https://www.ixxx.com',
    'https://www.porntrex.com', 
    'https://www.anyporn.com',
    'https://www.pornoxo.com',
    'https://www.sexvid.xxx',
    'https://www.pornhits.com',
    'https://www.porn4days.com',
    'https://www.pornjam.com',
    'https://www.porngo.tv',
    'https://www.pornzog.com'
];

async function testSites() {
    console.log('Testing site accessibility...\n');
    
    for (const site of sites) {
        try {
            const response = await axios.get(site, { 
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            console.log(`✅ ${site} - Status: ${response.status}`);
        } catch (error) {
            if (error.response) {
                console.log(`❌ ${site} - Status: ${error.response.status}`);
            } else if (error.code === 'ENOTFOUND') {
                console.log(`❌ ${site} - Domain not found`);
            } else {
                console.log(`❌ ${site} - Error: ${error.message}`);
            }
        }
    }
}

testSites();
