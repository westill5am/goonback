const fs = require('fs');
const path = require('path');

// New scrapers to test
const newScrapers = [
  'porntrex',
  'ixxx', 
  'anyporn',
  'pornoxo',
  'sexvid',
  'pornhits',
  'porn4days',
  'pornjam',
  'porngo',
  'pornzog',
  'xnxx'
];

async function testNewScrapers() {
  console.log('🔥 TESTING 10 NEW SCRAPERS');
  console.log('==========================');
  
  const query = 'teen';
  const results = [];
  
  for (const scraperName of newScrapers) {
    try {
      const scraperPath = path.join(__dirname, `${scraperName}.js`);
      
      if (!fs.existsSync(scraperPath)) {
        console.log(`❌ ${scraperName.padEnd(15)} - File not found`);
        continue;
      }
      
      const scraper = require(scraperPath);
      const startTime = Date.now();
      
      console.log(`🧪 Testing ${scraperName}...`);
      const scraperResults = await scraper(query);
      const duration = Date.now() - startTime;
      
      if (scraperResults && scraperResults.length > 0) {
        console.log(`✅ ${scraperName.padEnd(15)} ${scraperResults.length.toString().padStart(3)} results (${duration}ms) [ScraperAPI]`);
        results.push({
          name: scraperName,
          count: scraperResults.length,
          working: true,
          duration: duration,
          samples: scraperResults.slice(0, 2)
        });
      } else {
        console.log(`⚠️ ${scraperName.padEnd(15)}   0 results (${duration}ms) [ScraperAPI]`);
        results.push({
          name: scraperName,
          count: 0,
          working: false,
          duration: duration
        });
      }
    } catch (error) {
      console.log(`❌ ${scraperName.padEnd(15)} ERROR: ${error.message}`);
      results.push({
        name: scraperName,
        count: 0,
        working: false,
        error: error.message
      });
    }
  }
  
  console.log('\n📊 NEW SCRAPERS SUMMARY:');
  console.log('========================');
  
  const workingScrapers = results.filter(r => r.working);
  const totalResults = workingScrapers.reduce((sum, r) => sum + r.count, 0);
  
  console.log(`Working Scrapers: ${workingScrapers.length}/${newScrapers.length}`);
  console.log(`Total Results: ${totalResults}`);
  console.log(`Success Rate: ${((workingScrapers.length / newScrapers.length) * 100).toFixed(1)}%`);
  
  if (workingScrapers.length > 0) {
    console.log('\n🎯 WORKING NEW SCRAPERS:');
    workingScrapers.forEach(scraper => {
      console.log(`✅ ${scraper.name}: ${scraper.count} results`);
      if (scraper.samples && scraper.samples.length > 0) {
        console.log(`   Sample: "${scraper.samples[0].title}" (${scraper.samples[0].source})`);
      }
    });
  }
  
  const brokenScrapers = results.filter(r => !r.working);
  if (brokenScrapers.length > 0) {
    console.log('\n❌ BROKEN NEW SCRAPERS:');
    brokenScrapers.forEach(scraper => {
      console.log(`❌ ${scraper.name}: ${scraper.error || 'No results'}`);
    });
  }
  
  return {
    total: newScrapers.length,
    working: workingScrapers.length,
    totalResults: totalResults,
    workingScrapers: workingScrapers.map(s => s.name)
  };
}

if (require.main === module) {
  testNewScrapers().then(summary => {
    console.log('\n🚀 NEW SCRAPERS TEST COMPLETE!');
    console.log(`Added ${summary.working} working scrapers generating ${summary.totalResults} results`);
  }).catch(console.error);
}

module.exports = testNewScrapers;
