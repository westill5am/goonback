// Quick status check for all scrapers
const fs = require('fs');

const workingScrapers = [
  '3movs.js',
  'ashemaletube.js', 
  'fuq.js',
  'hentaigasm.js',
  'porndoe.js',
  'pornhub.js',
  'pornovideoshub.js',
  'tubedupe.js',
  'xvideos.js',
  'youporn.js'
];

const newScrapers = [
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

async function testScraper(scraperFile, timeout = 10000) {
  return new Promise(async (resolve) => {
    const timer = setTimeout(() => {
      resolve({ status: 'timeout', results: 0 });
    }, timeout);

    try {
      const scraper = require(`./${scraperFile}`);
      const results = await scraper('teen');
      clearTimeout(timer);
      resolve({ status: 'success', results: results.length });
    } catch (err) {
      clearTimeout(timer);
      resolve({ status: 'error', results: 0, error: err.message });
    }
  });
}

async function statusCheck() {
  console.log('GOONERBRAIN SCRAPER STATUS CHECK');
  console.log('================================\n');
  
  // Test working scrapers
  console.log('EXISTING WORKING SCRAPERS:');
  console.log('--------------------------');
  let workingCount = 0;
  let totalResults = 0;
  
  for (const scraper of workingScrapers) {
    if (fs.existsSync(scraper)) {
      const result = await testScraper(scraper, 8000);
      if (result.status === 'success' && result.results > 0) {
        console.log(`✅ ${scraper}: ${result.results} results`);
        workingCount++;
        totalResults += result.results;
      } else {
        console.log(`❌ ${scraper}: ${result.status}`);
      }
    }
  }
  
  console.log(`\nExisting working: ${workingCount}/${workingScrapers.length}`);
  console.log(`Existing total results: ${totalResults}\n`);
  
  // Test new scrapers
  console.log('NEW SCRAPERS:');
  console.log('-------------');
  let newWorkingCount = 0;
  let newTotalResults = 0;
  
  for (const scraper of newScrapers) {
    if (fs.existsSync(scraper)) {
      const result = await testScraper(scraper, 8000);
      if (result.status === 'success' && result.results > 0) {
        console.log(`✅ ${scraper}: ${result.results} results`);
        newWorkingCount++;
        newTotalResults += result.results;
      } else {
        console.log(`❌ ${scraper}: ${result.status}`);
      }
    }
  }
  
  console.log(`\nNew working: ${newWorkingCount}/${newScrapers.length}`);
  console.log(`New total results: ${newTotalResults}\n`);
  
  // Summary
  const totalWorking = workingCount + newWorkingCount;
  const grandTotal = totalResults + newTotalResults;
  
  console.log('=== FINAL SUMMARY ===');
  console.log(`Total working scrapers: ${totalWorking}/${workingScrapers.length + newScrapers.length}`);
  console.log(`Total results per search: ${grandTotal}`);
  console.log(`Success rate: ${((totalWorking/(workingScrapers.length + newScrapers.length))*100).toFixed(1)}%`);
  
  // Progress toward goals
  console.log('\n=== PROGRESS TOWARD GOALS ===');
  console.log(`Target: 20+ working scrapers`);
  console.log(`Current: ${totalWorking} working scrapers`);
  console.log(`Progress: ${Math.min(100, (totalWorking/20*100)).toFixed(1)}%`);
  
  console.log(`\nTarget: 1000+ results per search`);
  console.log(`Current: ${grandTotal} results per search`);
  console.log(`Progress: ${Math.min(100, (grandTotal/1000*100)).toFixed(1)}%`);
}

statusCheck();
