// Direct test of hybrid scrapers with debugging
const hybridScrapers = require('./hybrid-adult-scrapers');

async function testScrapers() {
  console.log('🧪 Testing hybrid scrapers directly...');
  
  try {
    console.log('📊 Initial stats:', hybridScrapers.getUsageStats());
    
    // Test RedTube only (simpler)
    console.log('\n🔞 Testing RedTube scraper...');
    const results = await hybridScrapers.scrapeRedTubeHybrid('test');
    console.log('RedTube results:', results.length);
    
    if (results.length > 0) {
      console.log('Sample result:', {
        title: results[0].title,
        source: results[0].source,
        url: results[0].url.substring(0, 50) + '...'
      });
    }
    
    console.log('\n📊 Final stats:', hybridScrapers.getUsageStats());
    
    // Test full search
    console.log('\n🚀 Testing full search...');
    const searchResult = await hybridScrapers.searchAllHybrid('milf', ['redtube']);
    console.log('Search results:', searchResult.results.length);
    console.log('Search stats:', searchResult.stats);
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testScrapers();
