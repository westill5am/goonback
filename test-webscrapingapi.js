// Quick test of WebScrapingAPI with the provided key
const axios = require('axios');

const WEBSCRAPINGAPI_KEY = 'gk299us95BHUeOrimJEGU54QASIOXjXw';
const WEBSCRAPINGAPI_URL = 'https://api.webscraping.ai/html';

async function testWebScrapingAPI() {
  console.log('🧪 Testing WebScrapingAPI with provided key...');
  
  try {
    const params = {
      api_key: WEBSCRAPINGAPI_KEY,
      url: 'https://httpbin.org/json',
      device: 'desktop',
      timeout: 10000
    };

    console.log('📡 Making API request...');
    const response = await axios.get(WEBSCRAPINGAPI_URL, {
      params,
      timeout: 15000
    });

    if (response.status === 200) {
      console.log('✅ WebScrapingAPI is working!');
      console.log(`📊 Status: ${response.status}`);
      console.log(`📝 Data length: ${response.data.length} characters`);
      console.log(`🔍 Sample data: ${response.data.substring(0, 100)}...`);
      return true;
    } else {
      console.log(`❌ Unexpected status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ WebScrapingAPI test failed:');
    console.error(`   Error: ${error.message}`);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${error.response.data}`);
    }
    return false;
  }
}

// Test with a simple adult site
async function testAdultSite() {
  console.log('\n🔞 Testing with RedTube (simpler structure)...');
  
  try {
    const params = {
      api_key: WEBSCRAPINGAPI_KEY,
      url: 'https://www.redtube.com/?search=test',
      device: 'desktop',
      timeout: 20000
    };

    console.log('📡 Making API request to RedTube...');
    const response = await axios.get(WEBSCRAPINGAPI_URL, {
      params,
      timeout: 30000
    });

    if (response.status === 200) {
      console.log('✅ RedTube API request successful!');
      console.log(`📊 Status: ${response.status}`);
      console.log(`📝 Data length: ${response.data.length} characters`);
      
      // Check for video content
      const hasVideoLinks = response.data.includes('video') || response.data.includes('thumb');
      console.log(`🎥 Contains video content: ${hasVideoLinks}`);
      
      if (hasVideoLinks) {
        console.log('🎉 Successfully retrieved adult content via API!');
      }
      return true;
    } else {
      console.log(`❌ Unexpected status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Adult site test failed:');
    console.error(`   Error: ${error.message}`);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${error.response.data?.substring(0, 200) || 'No data'}`);
    }
    return false;
  }
}

async function main() {
  console.log('🚀 WebScrapingAPI Testing Tool');
  console.log('===============================\n');
  
  // Test 1: Basic API functionality
  const basicTest = await testWebScrapingAPI();
  
  if (basicTest) {
    // Test 2: Adult site access
    const adultTest = await testAdultSite();
    
    if (adultTest) {
      console.log('\n🎉 All tests passed! WebScrapingAPI is ready for use.');
    } else {
      console.log('\n⚠️  Basic API works, but adult sites may be blocked.');
    }
  } else {
    console.log('\n❌ Basic API test failed. Check API key and connectivity.');
  }
}

if (require.main === module) {
  main().catch(console.error);
}
