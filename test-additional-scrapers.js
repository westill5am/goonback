#!/usr/bin/env node
// Test additional scrapers that might be working

const scrapers = require('./working-scrapers.js');

// Additional scrapers to test beyond the confirmed 14
const additionalScrapersToTest = [
  'drtuber', 'empflix', 'eporner', 'extremetube', 'faphouse', 
  'fapvid', 'spankbang', 'redtube', 'ixxx', 'tube8', 'xtube'
];

async function testScraper(name, scraper) {
  try {
    console.log(`🧪 Testing ${name}...`);
    
    const startTime = Date.now();
    const results = await Promise.race([
      scraper('milf'),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 15000)
      )
    ]);
    
    const duration = Date.now() - startTime;
    
    if (Array.isArray(results) && results.length > 0) {
      console.log(`✅ ${name}: ${results.length} results (${duration}ms)`);
      return { name, status: 'working', count: results.length, duration };
    } else {
      console.log(`❌ ${name}: No results`);
      return { name, status: 'no_results', count: 0, duration };
    }
  } catch (error) {
    console.log(`❌ ${name}: Error - ${error.message}`);
    return { name, status: 'error', error: error.message };
  }
}

async function main() {
  console.log('🚀 TESTING ADDITIONAL SCRAPERS');
  console.log('================================');
  
  const results = [];
  
  for (const scraperName of additionalScrapersToTest) {
    if (scrapers[scraperName]) {
      const result = await testScraper(scraperName, scrapers[scraperName]);
      results.push(result);
    } else {
      console.log(`❌ ${scraperName}: Module not found`);
      results.push({ name: scraperName, status: 'not_found' });
    }
  }
  
  console.log('\n📊 ADDITIONAL SCRAPERS TEST SUMMARY:');
  console.log('===================================');
  
  const working = results.filter(r => r.status === 'working');
  const failed = results.filter(r => r.status !== 'working');
  
  console.log(`✅ Working additional scrapers: ${working.length}`);
  working.forEach(r => console.log(`   - ${r.name}: ${r.count} results`));
  
  console.log(`❌ Non-working: ${failed.length}`);
  failed.forEach(r => console.log(`   - ${r.name}: ${r.status}`));
  
  if (working.length > 0) {
    console.log('\n🎯 NEW WORKING SCRAPERS TO ADD:');
    console.log(working.map(r => `'${r.name}'`).join(', '));
    
    const totalExpected = (14 + working.length) * 120; // Estimate 120 results per scraper
    console.log(`\n📈 UPDATED PERFORMANCE ESTIMATE:`);
    console.log(`Total working scrapers: ${14 + working.length}`);
    console.log(`Expected results per search: ${totalExpected}+`);
  }
}

main().catch(console.error);
