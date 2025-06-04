const fs = require('fs');

// List of new scrapers to test
const scrapers = [
  'porntrex.js',
  'ixxx.js', 
  'anyporn.js',
  'pornoxo.js',
  'sexvid.js',
  'pornhits.js',
  'porn4days.js',
  'pornjam.js',
  'porngo.js',
  'pornzog.js'
];

async function testScraper(scraperFile) {
  return new Promise(async (resolve) => {
    const timeout = setTimeout(() => {
      resolve({ name: scraperFile, status: 'timeout', results: 0 });
    }, 30000); // 30 second timeout

    try {
      const scraper = require(`./${scraperFile}`);
      const results = await scraper('teen');
      clearTimeout(timeout);
      resolve({ 
        name: scraperFile, 
        status: 'success', 
        results: results.length,
        sample: results.length > 0 ? results[0].title : null
      });
    } catch (err) {
      clearTimeout(timeout);
      resolve({ name: scraperFile, status: 'error', results: 0, error: err.message });
    }
  });
}

async function testAllScrapers() {
  console.log('Testing new scrapers with 30s timeout each...\n');
  
  const results = [];
  let totalResults = 0;
  let workingScrapers = 0;
  
  for (const scraper of scrapers) {
    if (fs.existsSync(scraper)) {
      console.log(`Testing ${scraper}...`);
      const result = await testScraper(scraper);
      results.push(result);
      
      if (result.status === 'success' && result.results > 0) {
        console.log(`✅ ${scraper}: ${result.results} results`);
        if (result.sample) console.log(`   Sample: ${result.sample.substring(0, 60)}...`);
        totalResults += result.results;
        workingScrapers++;
      } else if (result.status === 'timeout') {
        console.log(`⏰ ${scraper}: Timeout after 30s`);
      } else {
        console.log(`❌ ${scraper}: ${result.error || 'No results'}`);
      }
    } else {
      console.log(`❌ ${scraper}: File not found`);
    }
    console.log('');
  }
  
  console.log('\n=== SUMMARY ===');
  console.log(`Working scrapers: ${workingScrapers}/${scrapers.length}`);
  console.log(`Total results: ${totalResults}`);
  console.log(`Success rate: ${((workingScrapers/scrapers.length)*100).toFixed(1)}%`);
  
  console.log('\n=== DETAILED RESULTS ===');
  results.forEach(result => {
    console.log(`${result.name}: ${result.status} (${result.results} results)`);
  });
}

testAllScrapers();
