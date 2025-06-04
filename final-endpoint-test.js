console.log('=== FINAL COMPREHENSIVE CONSOLE ERROR TEST ===');

// Test all endpoints systematically
const testEndpoints = async () => {
  const http = require('http');
  
  const testRequest = (path) => {
    return new Promise((resolve, reject) => {
      const req = http.get(`http://localhost:8000${path}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            path,
            statusCode: res.statusCode,
            contentLength: data.length,
            success: res.statusCode === 200
          });
        });
      });
      
      req.on('error', (err) => {
        resolve({
          path,
          error: err.message,
          success: false
        });
      });
      
      req.setTimeout(10000, () => {
        req.destroy();
        resolve({
          path,
          error: 'Timeout',
          success: false
        });
      });
    });
  };
  
  const endpoints = [
    '/test',
    '/health',
    '/recommendations',
    '/search-categories',
    '/common-searches',
    '/trending-searches',
    '/random-search'
  ];
  
  console.log('Testing basic endpoints...');
  
  for (const endpoint of endpoints) {
    try {
      const result = await testRequest(endpoint);
      if (result.success) {
        console.log(`✓ ${endpoint} - Status: ${result.statusCode}, Size: ${result.contentLength} bytes`);
      } else {
        console.log(`✗ ${endpoint} - Error: ${result.error || result.statusCode}`);
      }
    } catch (error) {
      console.log(`✗ ${endpoint} - Exception: ${error.message}`);
    }
  }
  
  console.log('\nTesting search endpoint...');
  try {
    const searchResult = await testRequest('/search?q=test');
    if (searchResult.success) {
      console.log(`✓ /search?q=test - Status: ${searchResult.statusCode}, Size: ${searchResult.contentLength} bytes`);
    } else {
      console.log(`✗ /search?q=test - Error: ${searchResult.error || searchResult.statusCode}`);
    }
  } catch (error) {
    console.log(`✗ /search?q=test - Exception: ${error.message}`);
  }
  
  console.log('\n=== TEST COMPLETE ===');
  console.log('🎉 All endpoints tested. Check output above for any issues.');
  
  process.exit(0);
};

// Wait for server to be ready then run tests
setTimeout(testEndpoints, 2000);
