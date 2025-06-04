// Test script for newly enhanced scrapers
const fs = require('fs');

async function testEnhancedScrapers() {
  console.log('🧪 Testing Enhanced Scrapers...\n');
  
  const enhancedScrapers = [
    { name: 'spankbang', file: './spankbang.js' },
    { name: 'youporn', file: './youporn.js' },
    { name: 'biguz', file: './biguz.js' },
    { name: 'pinkrod', file: './pinkrod.js' },
    { name: 'beeg', file: './beeg.js' }
  ];

  const results = {};
  let totalResults = 0;
  
  for (const scraper of enhancedScrapers) {
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
      
      totalResults += scraperResults.length;
      
      if (scraperResults.length > 0) {
        console.log(`✅ ${scraper.name}: ${scraperResults.length} results in ${endTime - startTime}ms`);
        console.log(`   📋 Sample: "${scraperResults[0].title?.substring(0, 50)}..."`);
      } else {
        console.log(`⚠️ ${scraper.name}: 0 results in ${endTime - startTime}ms`);
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
  console.log('📊 ENHANCED SCRAPERS SUMMARY:');
  console.log('==============================');
  
  const working = Object.values(results).filter(r => r.success && r.count > 0);
  const total = Object.keys(results).length;
  
  console.log(`Working Scrapers: ${working.length}/${total}`);
  console.log(`Total Results: ${totalResults}`);
  console.log(`Average Time: ${Math.round(working.reduce((sum, r) => sum + r.time, 0) / working.length)}ms`);
  
  console.log('\n🎯 PERFORMANCE TARGETS:');
  console.log(`Current Working Scrapers: ${working.length}`);
  console.log(`Target: 20+ working scrapers`);
  console.log(`Current Results: ${totalResults}`);
  console.log(`Target: 1000+ results per search`);
  
  const successRate = (working.length / total * 100).toFixed(1);
  console.log(`Success Rate: ${successRate}%`);
  
  if (working.length >= 15) {
    console.log('🎉 EXCELLENT! Approaching target of 20+ working scrapers!');
  } else if (working.length >= 10) {
    console.log('🚀 GOOD PROGRESS! Half way to 20 working scrapers target!');
  } else {
    console.log('💪 MAKING PROGRESS! Continue enhancing more scrapers!');
  }
}

testEnhancedScrapers().catch(console.error);
