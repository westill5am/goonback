// Test direct scraping only (no API)
const axios = require('axios');
const cheerio = require('cheerio');

console.log('🧪 Testing direct scraping only...');

async function testDirectScraping() {
  try {
    console.log('📡 Testing RedTube direct scraping...');
    
    const response = await axios.get('https://www.redtube.com/?search=test', {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      }
    });
    
    console.log('✅ Direct scraping successful!');
    console.log('Status:', response.status);
    console.log('Data length:', response.data.length);
    
    // Try to parse
    const $ = cheerio.load(response.data);
    console.log('Page title:', $('title').text());
    
    // Look for video containers
    const videoContainers = $('.video-item, .video_link_container, .video-box').length;
    console.log('Video containers found:', videoContainers);
    
    return true;
    
  } catch (error) {
    console.error('❌ Direct scraping failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
    }
    return false;
  }
}

testDirectScraping();
