#!/usr/bin/env node

// 🎯 FINAL PERFORMANCE TEST - GoonerBrain Scraper Optimization
// Tests all enhanced scrapers and provides next action recommendations

const fs = require('fs');

async function finalPerformanceTest() {
  console.log('🎯 GOONERBRAIN FINAL PERFORMANCE TEST');
  console.log('=====================================\n');
  
  // Test known working scrapers
  const workingScrapers = [
    { name: '3movs', file: './3movs.js', expected: 70 },
    { name: 'ashemaletube', file: './ashemaletube.js', expected: 90 },
    { name: 'fuq', file: './fuq.js', expected: 200 },
    { name: 'hentaigasm', file: './hentaigasm.js', expected: 20 },
    { name: 'porndoe', file: './porndoe.js', expected: 45 },
    { name: 'pornhub', file: './pornhub.js', expected: 70 },
    { name: 'pornovideoshub', file: './pornovideoshub.js', expected: 4 },
    { name: 'tubedupe', file: './tubedupe.js', expected: 120 },
    { name: 'xvideos', file: './xvideos.js', expected: 25 }
  ];
  
  // Test ScraperAPI enhanced scrapers
  const scraperAPIScrapers = [
    { name: 'spankbang', file: './spankbang.js', expected: 150 },
    { name: 'youporn', file: './youporn.js', expected: 30 }
  ];
  
  let totalResults = 0;
  let workingCount = 0;
  const results = {};
  
  console.log('🔍 TESTING CORE WORKING SCRAPERS:');
  console.log('----------------------------------');
  
  for (const scraper of workingScrapers) {
    if (!fs.existsSync(scraper.file)) {
      console.log(`❌ ${scraper.name}: File not found`);
      continue;
    }
    
    try {
      const scraperModule = require(scraper.file);
      const startTime = Date.now();
      const scraperResults = await scraperModule('milf');
      const endTime = Date.now();
      
      const count = scraperResults.length;
      totalResults += count;
      
      if (count > 0) {
        workingCount++;
        console.log(`✅ ${scraper.name.padEnd(20)} ${count.toString().padStart(3)} results (${endTime - startTime}ms)`);
        results[scraper.name] = { success: true, count, time: endTime - startTime };
      } else {
        console.log(`⚠️ ${scraper.name.padEnd(20)} ${count.toString().padStart(3)} results (${endTime - startTime}ms)`);
        results[scraper.name] = { success: false, count: 0, time: endTime - startTime };
      }
    } catch (error) {
      console.log(`❌ ${scraper.name.padEnd(20)} ERROR: ${error.message.substring(0, 40)}...`);
      results[scraper.name] = { success: false, count: 0, error: error.message };
    }
  }
  
  console.log('\n🚀 TESTING SCRAPERAPI ENHANCED SCRAPERS:');
  console.log('----------------------------------------');
  
  for (const scraper of scraperAPIScrapers) {
    if (!fs.existsSync(scraper.file)) {
      console.log(`❌ ${scraper.name}: File not found`);
      continue;
    }
    
    try {
      const scraperModule = require(scraper.file);
      const startTime = Date.now();
      const scraperResults = await scraperModule('milf');
      const endTime = Date.now();
      
      const count = scraperResults.length;
      totalResults += count;
      
      if (count > 0) {
        workingCount++;
        console.log(`🔥 ${scraper.name.padEnd(20)} ${count.toString().padStart(3)} results (${endTime - startTime}ms) [ScraperAPI]`);
        results[scraper.name] = { success: true, count, time: endTime - startTime, enhanced: true };
      } else {
        console.log(`⚠️ ${scraper.name.padEnd(20)} ${count.toString().padStart(3)} results (${endTime - startTime}ms) [ScraperAPI]`);
        results[scraper.name] = { success: false, count: 0, time: endTime - startTime, enhanced: true };
      }
    } catch (error) {
      console.log(`❌ ${scraper.name.padEnd(20)} ERROR: ${error.message.substring(0, 40)}...`);
      results[scraper.name] = { success: false, count: 0, error: error.message, enhanced: true };
    }
  }
  
  // Summary
  console.log('\n📊 PERFORMANCE SUMMARY:');
  console.log('========================');
  console.log(`Working Scrapers: ${workingCount}/${workingScrapers.length + scraperAPIScrapers.length}`);
  console.log(`Total Results: ${totalResults}`);
  console.log(`Success Rate: ${(workingCount / (workingScrapers.length + scraperAPIScrapers.length) * 100).toFixed(1)}%`);
  
  // Performance analysis
  console.log('\n🎯 PERFORMANCE ANALYSIS:');
  console.log('=========================');
  
  if (totalResults >= 1000) {
    console.log('🎉 EXCELLENT! Results target achieved (1000+)');
  } else if (totalResults >= 800) {
    console.log('🚀 GREAT! Close to results target (800+/1000)');
  } else {
    console.log('💪 GOOD PROGRESS! Need more working scrapers for 1000+ target');
  }
  
  if (workingCount >= 20) {
    console.log('🎉 OUTSTANDING! Scraper count target achieved (20+)');
  } else if (workingCount >= 15) {
    console.log('🚀 EXCELLENT! Close to scraper target (15+/20)');
  } else if (workingCount >= 10) {
    console.log('💪 GOOD! Half way to scraper target (10+/20)');
  } else {
    console.log('🔧 NEEDS WORK! More scrapers needed for target');
  }
  
  // Next steps
  console.log('\n🎯 RECOMMENDED NEXT STEPS:');
  console.log('===========================');
  
  if (workingCount < 15) {
    console.log('1. 🔧 Fix RedTube selectors (ScraperAPI working, selectors need update)');
    console.log('2. 🔧 Resolve xHamster 403 issues (try different ScraperAPI params)');
    console.log('3. 🧪 Test and verify BigUz and PinkRod ScraperAPI implementations');
    console.log('4. 🚀 Implement ScraperAPI for eporner, xxxbunker, thumbzilla');
  }
  
  if (totalResults < 1000) {
    console.log('5. 🎯 Focus on high-volume sites (fuq, pornhub variants)');
    console.log('6. 📈 Optimize page limits for working scrapers');
  }
  
  console.log('7. 🔄 Create automated testing pipeline');
  console.log('8. 📱 Update frontend with dynamic trending searches');
  
  console.log('\n✨ STATUS: GoonerBrain optimization in progress!');
  console.log(`📈 Current: ${workingCount} working scrapers, ${totalResults} results per search`);
  console.log(`🎯 Target: 20+ working scrapers, 1000+ results per search`);
  
  const progressToScrapers = Math.min(100, (workingCount / 20 * 100)).toFixed(1);
  const progressToResults = Math.min(100, (totalResults / 1000 * 100)).toFixed(1);
  console.log(`📊 Progress: ${progressToScrapers}% to scraper target, ${progressToResults}% to results target`);
}

// Handle both direct execution and module import
if (require.main === module) {
  finalPerformanceTest().catch(console.error);
} else {
  module.exports = finalPerformanceTest;
}
