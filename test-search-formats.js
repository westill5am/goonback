const axios = require('axios');
const cheerio = require('cheerio');

// Test correct search URL formats for each site
const siteTests = [
  {
    name: 'porntrex',
    formats: [
      'https://www.porntrex.com/search/?q=teen',
      'https://www.porntrex.com/search/teen/',
      'https://www.porntrex.com/?s=teen'
    ]
  },
  {
    name: 'anyporn', 
    formats: [
      'https://www.anyporn.com/search/?q=teen',
      'https://www.anyporn.com/search/teen/',
      'https://www.anyporn.com/search/teen/1/'
    ]
  },
  {
    name: 'pornoxo',
    formats: [
      'https://www.pornoxo.com/search/?q=teen',
      'https://www.pornoxo.com/search/teen/',
      'https://www.pornoxo.com/?s=teen'
    ]
  },
  {
    name: 'pornhits',
    formats: [
      'https://www.pornhits.com/search/?q=teen',
      'https://www.pornhits.com/search/teen/',
      'https://www.pornhits.com/?s=teen'
    ]
  }
];

async function testSearchFormat(site, url) {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // Try common video selectors
    const selectors = [
      '.video-item',
      '.thumb',
      '.video-thumb', 
      '.video',
      '.item',
      '.thumb-item',
      '.video-card',
      '.list-item'
    ];
    
    let videoCount = 0;
    for (const selector of selectors) {
      const count = $(selector).length;
      if (count > videoCount) videoCount = count;
    }
    
    console.log(`✅ ${site} - ${url} - Status: ${response.status}, Videos: ${videoCount}`);
    return videoCount;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log(`❌ ${site} - ${url} - 404 Not Found`);
    } else {
      console.log(`❌ ${site} - ${url} - Error: ${error.message}`);
    }
    return 0;
  }
}

async function testAllFormats() {
  console.log('Testing search URL formats...\n');
  
  for (const site of siteTests) {
    console.log(`\n--- Testing ${site.name.toUpperCase()} ---`);
    for (const url of site.formats) {
      await testSearchFormat(site.name, url);
    }
  }
}

testAllFormats();
