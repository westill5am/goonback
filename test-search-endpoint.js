// Test the search endpoint
const axios = require('axios');

async function testSearchEndpoint() {
  try {
    console.log('🧪 Testing search endpoint...');
    
    const response = await axios.get('http://localhost:8000/search', {
      params: { q: 'test' },
      timeout: 30000
    });
    
    console.log('✅ Search endpoint working!');
    console.log('Status:', response.status);
    console.log('Results count:', response.data.results?.length || 0);
    console.log('Server:', response.data.server);
    console.log('Scraper type:', response.data.scraperType);
    console.log('Status:', response.data.status);
    
    if (response.data.stats) {
      console.log('📊 Stats:');
      console.log('  Direct requests:', response.data.stats.directRequests);
      console.log('  API requests:', response.data.stats.apiRequests);
      console.log('  API usage %:', response.data.stats.apiUsagePercentage);
    }
    
    if (response.data.results && response.data.results.length > 0) {
      console.log('📄 Sample result:');
      console.log('  Title:', response.data.results[0].title);
      console.log('  Source:', response.data.results[0].source);
    }
    
  } catch (error) {
    console.error('❌ Search endpoint error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testSearchEndpoint();
