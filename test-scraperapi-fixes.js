// Test script for ScraperAPI-fixed scrapers
const fs = require('fs');

async function testScraperAPIFixes() {
  console.log('🧪 Testing ScraperAPI Fixed Scrapers...\n');
  
  const fixedScrapers = [
    { name: 'spankbang', file: './spankbang.js' },
    { name: 'redtube', file: './redtube.js' },
    { name: 'youporn', file: './youporn.js' },
    { name: 'xhamster', file: './xhamster.js' }
  ];

  const results = {};
  
  for (const scraper of fixedScrapers) {
    console.log(`🔍 Testing ${scraper.name}...`);
    
    try {
      if (!fs.existsSync(scraper.file)) {
        console.log(`❌ ${scraper.name}: File not found`);
        continue;
      }
      
      const scraperModule = require(scraper.file);
      const startTime = Date.now();
      const scraperResults = await scraperModule('milf');
      const endTime = Date.now();
      
      results[scraper.name] = {
        success: true,
        count: scraperResults.length,
        time: endTime - startTime,
        sample: scraperResults[0] || null
      };
      
      console.log(`✅ ${scraper.name}: ${scraperResults.length} results in ${endTime - startTime}ms`);
      if (scraperResults.length > 0) {
        console.log(`   📋 Sample: "${scraperResults[0].title?.substring(0, 50)}..."`);
      }
      
    } catch (error) {
      results[scraper.name] = {
        success: false,
        error: error.message,
        time: 0,
        count: 0
      };
      console.log(`❌ ${scraper.name}: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
  
  // Summary
  console.log('📊 SUMMARY REPORT:');
  console.log('==================');
  
  const working = Object.values(results).filter(r => r.success && r.count > 0);
  const total = Object.keys(results).length;
  
  console.log(`Working Scrapers: ${working.length}/${total}`);
  console.log(`Total Results: ${working.reduce((sum, r) => sum + r.count, 0)}`);
  console.log(`Average Time: ${Math.round(working.reduce((sum, r) => sum + r.time, 0) / working.length)}ms`);
  
  console.log('\n🎯 NEXT STEPS:');
  const failed = Object.entries(results).filter(([name, data]) => !data.success || data.count === 0);
  if (failed.length > 0) {
    console.log('❌ Failed scrapers need attention:');
    failed.forEach(([name, data]) => {
      console.log(`   - ${name}: ${data.error || 'No results returned'}`);
    });
  } else {
    console.log('✅ All ScraperAPI fixes working! Ready to implement more fixes.');
  }
}

testScraperAPIFixes().catch(console.error);
