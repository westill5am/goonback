// Simple WebScrapingAPI test
const axios = require('axios');

const API_KEY = 'gk299us95BHUeOrimJEGU54QASIOXjXw';

console.log('🧪 Testing WebScrapingAPI...');

async function testAPI() {
  try {
    const response = await axios.get('https://api.webscraping.ai/html', {
      params: {
        api_key: API_KEY,
        url: 'https://httpbin.org/json',
        timeout: 5000
      },
      timeout: 10000
    });
    
    console.log('✅ API Working!');
    console.log('Status:', response.status);
    console.log('Data length:', response.data.length);
    console.log('Sample:', response.data.substring(0, 100));
    
    // Now test with a simple adult site
    console.log('\n🔞 Testing with adult site...');
    const adultResponse = await axios.get('https://api.webscraping.ai/html', {
      params: {
        api_key: API_KEY,
        url: 'https://www.redtube.com/',
        timeout: 10000,
        device: 'desktop'
      },
      timeout: 15000
    });
    
    console.log('✅ Adult site test successful!');
    console.log('Status:', adultResponse.status);
    console.log('Data length:', adultResponse.data.length);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testAPI();
