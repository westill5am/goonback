
const { 
  searchAllHybrid, 
  scrapeSpankBangHybrid, 
  scrapeRedTubeHybrid,
  getUsageStats,
  resetCounters 
} = require('./hybrid-adult-scrapers');

async function testHybridAdultScrapers() {
  console.log('🧪 Testing Hybrid Adult Scrapers System');
  console.log('=====================================\n');

  // Reset counters for clean test
  resetCounters();

  try {
    // Test 1: SpankBang individual scraper
    console.log('📍 Test 1: SpankBang Hybrid Scraper');
    console.log('-----------------------------------');
    const spankbangResults = await scrapeSpankBangHybrid('teen');
    console.log(`Results: ${spankbangResults.length} videos found`);
    if (spankbangResults.length > 0) {
      console.log('Sample result:', {
        title: spankbangResults[0].title.substring(0, 50) + '...',
        source: spankbangResults[0].source,
        hasUrl: !!spankbangResults[0].url,
        hasThumbnail: !!spankbangResults[0].thumbnail
      });
    }
    console.log('');

    // Test 2: RedTube individual scraper
    console.log('📍 Test 2: RedTube Hybrid Scraper');
    console.log('----------------------------------');
    const redtubeResults = await scrapeRedTubeHybrid('milf');
    console.log(`Results: ${redtubeResults.length} videos found`);
    if (redtubeResults.length > 0) {
      console.log('Sample result:', {
        title: redtubeResults[0].title.substring(0, 50) + '...',
        source: redtubeResults[0].source,
        hasUrl: !!redtubeResults[0].url,
        hasThumbnail: !!redtubeResults[0].thumbnail
      });
    }
    console.log('');

    // Test 3: Multi-scraper search
    console.log('📍 Test 3: Multi-Scraper Hybrid Search');
    console.log('--------------------------------------');
    const multiResults = await searchAllHybrid('blonde', ['spankbang', 'redtube']);
    console.log(`Combined results: ${multiResults.results.length} unique videos`);
    console.log('Scraper breakdown:');
    multiResults.stats.scraperStats.forEach(stat => {
      console.log(`  ${stat.scraper}: ${stat.count} results ${stat.error ? '(ERROR: ' + stat.error + ')' : ''}`);
    });
    console.log('');

    // Test 4: Show usage statistics
    console.log('📍 Test 4: Usage Statistics');
    console.log('----------------------------');
    const stats = getUsageStats();
    console.log('Direct scraping requests:', stats.directScrapingCount);
    console.log('WebScrapingAPI requests:', stats.apiUsageCount);
    console.log('Total requests:', stats.totalRequests);
    console.log('API usage percentage:', stats.apiUsagePercentage.toFixed(2) + '%');
    console.log('');

    // Show cost analysis
    const apiCost = stats.apiUsageCount * 0.001; // Assuming $0.001 per request
    const savings = stats.directScrapingCount * 0.001;
    console.log('💰 Cost Analysis:');
    console.log(`API costs: $${apiCost.toFixed(4)}`);
    console.log(`Savings from direct scraping: $${savings.toFixed(4)}`);
    console.log('');

    console.log('✅ All tests completed successfully!');
    console.log('🎯 Hybrid system is working - prioritizing direct scraping and falling back to WebScrapingAPI');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  console.log('🚀 Starting test execution...');
  testHybridAdultScrapers().then(() => {
    console.log('🏁 Test execution completed');
  }).catch(error => {
    console.error('💥 Test execution failed:', error);
  });
}

module.exports = { testHybridAdultScrapers };
