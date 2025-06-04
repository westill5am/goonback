// Simple test for new scrapers
console.log('🔥 Testing new scrapers...');

async function quickTest() {
  try {
    const porntrex = require('./porntrex.js');
    console.log('✅ porntrex loaded');
    
    const results = await porntrex('teen');
    console.log(`✅ porntrex results: ${results.length}`);
  } catch (error) {
    console.log(`❌ porntrex error: ${error.message}`);
  }
}

quickTest();
