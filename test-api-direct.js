// Direct test of WebScrapingAPI
const axios = require('axios');

console.log('🚀 Starting WebScrapingAPI test...');

const WEBSCRAPINGAPI_KEY = 'gk299us95BHUeOrimJEGU54QASIOXjXw';
const WEBSCRAPINGAPI_URL = 'https://api.webscraping.ai/html';

// Test function
(async () => {
  try {
    console.log('📡 Testing WebScrapingAPI...');
    
    const params = {
      api_key: WEBSCRAPINGAPI_KEY,
      url: 'https://httpbin.org/json',
      device: 'desktop'
    };

    const response = await axios.get(WEBSCRAPINGAPI_URL, {
      params,
      timeout: 15000
    });

    console.log('✅ API Response received!');
    console.log(`Status: ${response.status}`);
    console.log(`Data length: ${response.data.length}`);
    console.log(`Sample: ${response.data.substring(0, 100)}`);
    
  } catch (error) {
    console.error('❌ API Test failed:');
    console.error(`Error: ${error.message}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Response: ${JSON.stringify(error.response.data)}`);
    }
  }
})();
