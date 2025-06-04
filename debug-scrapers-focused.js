// FOCUSED SCRAPER DEBUGGER
// Debug specific scraper issues and implement WebScrapingAPI fixes

const axios = require('axios');
const cheerio = require('cheerio');

// WebScrapingAPI configuration
const WEBSCRAPINGAPI_KEY = 'gk299us95BHUeOrimJEGU54QASIOXjXw';
const WEBSCRAPINGAPI_URL = 'https://api.webscraping.ai/html';

async function testWebScrapingAPI(url) {
  console.log(`🌐 Testing WebScrapingAPI for: ${url}`);
  
  try {
    const response = await axios.get(WEBSCRAPINGAPI_URL, {
      params: {
        api_key: WEBSCRAPINGAPI_KEY,
        url: url,
        timeout: 10000,
        js: false,
        proxy: 'datacenter'
      },
      timeout: 30000
    });
    
    console.log(`✅ WebScrapingAPI Success - Status: ${response.status}, Length: ${response.data.length} chars`);
    return response.data;
  } catch (error) {
    console.error(`❌ WebScrapingAPI Failed: ${error.message}`);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${error.response.data}`);
    }
    return null;
  }
}

async function testDirectScraping(url) {
  console.log(`🔄 Testing direct scraping for: ${url}`);
  
  try {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'DNT': '1',
        'Connection': 'keep-alive'
      }
    });
    
    console.log(`✅ Direct Scraping Success - Status: ${response.status}, Length: ${response.data.length} chars`);
    return response.data;
  } catch (error) {
    console.error(`❌ Direct Scraping Failed: ${error.response?.status || error.message}`);
    return null;
  }
}

async function debugSpankBang() {
  console.log('\n🔧 DEBUGGING SPANKBANG');
  console.log('='.repeat(40));
  
  const url = 'https://spankbang.com/s/milf/';
  
  // Test direct scraping
  const directData = await testDirectScraping(url);
  
  // Test WebScrapingAPI
  const apiData = await testWebScrapingAPI(url);
  
  // Analyze which method works
  if (directData) {
    console.log('📊 Analyzing direct scraping data...');
    const $ = cheerio.load(directData);
    const videoCount = $('.video-item, .thumb, .video-box').length;
    console.log(`   Found ${videoCount} video elements`);
  }
  
  if (apiData) {
    console.log('📊 Analyzing API data...');
    const $ = cheerio.load(apiData);
    const videoCount = $('.video-item, .thumb, .video-box').length;
    console.log(`   Found ${videoCount} video elements`);
  }
  
  return { directData: !!directData, apiData: !!apiData };
}

async function debugRedTube() {
  console.log('\n🔧 DEBUGGING REDTUBE');
  console.log('='.repeat(40));
  
  const url = 'https://www.redtube.com/?search=milf';
  
  // Test direct scraping
  const directData = await testDirectScraping(url);
  
  // Test WebScrapingAPI  
  const apiData = await testWebScrapingAPI(url);
  
  // Analyze which method works
  if (directData) {
    console.log('📊 Analyzing direct scraping data...');
    const $ = cheerio.load(directData);
    const videoCount = $('.video-item, .video_link_container, .video-box').length;
    console.log(`   Found ${videoCount} video elements`);
  }
  
  if (apiData) {
    console.log('📊 Analyzing API data...');
    const $ = cheerio.load(apiData);
    const videoCount = $('.video-item, .video_link_container, .video-box').length;
    console.log(`   Found ${videoCount} video elements`);
  }
  
  return { directData: !!directData, apiData: !!apiData };
}

async function debugXVideos() {
  console.log('\n🔧 DEBUGGING XVIDEOS');
  console.log('='.repeat(40));
  
  const url = 'https://www.xvideos.com/?k=milf';
  
  // Test direct scraping
  const directData = await testDirectScraping(url);
  
  // Test WebScrapingAPI
  const apiData = await testWebScrapingAPI(url);
  
  // Analyze which method works
  if (directData) {
    console.log('📊 Analyzing direct scraping data...');
    const $ = cheerio.load(directData);
    const videoCount = $('.video-item, .thumb-container, .mozaique').length;
    console.log(`   Found ${videoCount} video elements`);
  }
  
  if (apiData) {
    console.log('📊 Analyzing API data...');
    const $ = cheerio.load(apiData);
    const videoCount = $('.video-item, .thumb-container, .mozaique').length;
    console.log(`   Found ${videoCount} video elements`);
  }
  
  return { directData: !!directData, apiData: !!apiData };
}

async function main() {
  console.log('🛠️  COMPREHENSIVE SCRAPER DEBUGGER');
  console.log('=====================================\n');
  
  const results = {};
  
  try {
    results.spankbang = await debugSpankBang();
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    results.redtube = await debugRedTube();
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    results.xvideos = await debugXVideos();
    
    // Summary
    console.log('\n📋 SUMMARY');
    console.log('='.repeat(40));
    for (const [site, result] of Object.entries(results)) {
      console.log(`${site.toUpperCase()}:`);
      console.log(`  Direct: ${result.directData ? '✅ Works' : '❌ Failed'}`);
      console.log(`  API: ${result.apiData ? '✅ Works' : '❌ Failed'}`);
      
      if (!result.directData && !result.apiData) {
        console.log(`  🚨 CRITICAL: Both methods failed - site may be completely blocked`);
      } else if (!result.directData && result.apiData) {
        console.log(`  💡 RECOMMENDATION: Use WebScrapingAPI for this site`);
      } else if (result.directData && !result.apiData) {
        console.log(`  💡 RECOMMENDATION: Direct scraping works, API has issues`);
      } else {
        console.log(`  💡 RECOMMENDATION: Both methods work - prefer direct scraping`);
      }
    }
    
  } catch (error) {
    console.error('❌ Debugging failed:', error.message);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { debugSpankBang, debugRedTube, debugXVideos, testWebScrapingAPI, testDirectScraping };
