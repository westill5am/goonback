// Test WebScrapingAPI v2 with new key
const axios = require('axios');

const API_KEY = 'wH1WMxxJcUCEm3z2MPyMQJ9ISLVtiLLe';
const API_URL = 'https://api.webscrapingapi.com/v2';

console.log('🧪 Testing WebScrapingAPI v2...');

async function testAPIv2() {
  try {
    console.log('📡 Testing basic functionality...');
    
    // Test with simple JSON endpoint first
    const response = await axios.get(API_URL, {
      params: {
        api_key: API_KEY,
        url: 'https://api.ipify.org/?format=json'
      },
      headers: {
        'content-type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('✅ API v2 Working!');
    console.log('Status:', response.status);
    console.log('Response:', response.data);
    
    // Now test with RedTube
    console.log('\n🔞 Testing with RedTube...');
    const adultResponse = await axios.get(API_URL, {
      params: {
        api_key: API_KEY,
        url: 'https://www.redtube.com/'
      },
      headers: {
        'content-type': 'application/json'
      },
      timeout: 20000
    });
    
    console.log('✅ Adult site test successful!');
    console.log('Status:', adultResponse.status);
    console.log('Data length:', adultResponse.data.length);
    console.log('Contains video info:', adultResponse.data.includes('video') || adultResponse.data.includes('RedTube'));
    
    return true;
    
  } catch (error) {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    }
    return false;
  }
}

testAPIv2();
