// Test scrapers with direct scraping only (no WebScrapingAPI)
const axios = require('axios');

// Test direct scraping for different sites
async function testDirectScraping() {
  console.log('🧪 Testing Direct Scraping (No API)...\n');
  
  const sites = [
    { name: 'RedTube', url: 'https://www.redtube.com/?search=test' },
    { name: 'XVideos', url: 'https://www.xvideos.com/?k=test' },
    { name: 'PornHub', url: 'https://www.pornhub.com/video/search?search=test' },
    { name: 'SpankBang', url: 'https://spankbang.com/s/test/' }
  ];
  
  for (const site of sites) {
    console.log(`🔍 Testing ${site.name}...`);
    try {
      const response = await axios.get(site.url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      });
      
      console.log(`✅ ${site.name}: Status ${response.status}, Data length: ${response.data.length}`);
      
      // Check for basic content indicators
      const html = response.data.toLowerCase();
      if (html.includes('video') || html.includes('thumb') || html.includes('title')) {
        console.log(`   📺 Contains video-related content`);
      } else {
        console.log(`   ⚠️  No obvious video content detected`);
      }
      
    } catch (error) {
      console.log(`❌ ${site.name}: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
      }
    }
    console.log('');
  }
}

testDirectScraping();
