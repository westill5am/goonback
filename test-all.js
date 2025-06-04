const fs = require('fs');
const path = require('path');

const testQuery = "big latina tits"; // your test keyword
const scraperDir = __dirname;

// List of all scrapers to test
const scrapers = [
  '3movs', 'ashemaletube', 'beeg', 'biguz', 'brazzers', 'camvideos.org', 'drtuber', 'empflix', 'eporner', 'extremetube',
  'faphouse', 'fapvid', 'fuq', 'fux', 'hardsextube', 'hclips', 'hdtube', 'hdzog', 'hentaigasm', 'hotmovs', 'hqporner',
  'javbangers', 'javhub', 'keezmovies', 'maturetube', 'mofos', 'motherless', 'naughtyamerica', 'newgroundsadult',
  'nuditybay', 'nudogram', 'pichunter', 'pinkrod', 'porn.com', 'porn300', 'porndig', 'porndoe', 'porndude', 'pornerbros',
  'pornheed', 'pornhub', 'pornone', 'pornovideoshub', 'pornrox', 'pornwild', 'proporno', 'realgfporn', 'redtube',
  'rule34video', 'ruleporn', 'sheshaft', 'slutload', 'spankbang', 'spankbangVR', 'thumbzilla', 'tnaflix', 'tubedupe',
  'txxx', 'vporn', 'xbabe', 'xhamster', 'xvideos', 'xvn', 'xxxbunker', 'yespornplease', 'youjizz', 'youporn'
];

const validateResults = (results) => {
  if (!Array.isArray(results)) return false;
  return results.every(result => result && typeof result.title === 'string' && typeof result.url === 'string');
};

(async () => {
  console.log(`🔍 Testing ${scrapers.length} scrapers with query "${testQuery}"\n`);
  for (const scraperName of scrapers) {
    try {
      const scraper = require(path.join(scraperDir, `${scraperName}.js`));
      const results = await scraper(testQuery);
      const count = Array.isArray(results) ? results.length : 0;

      if (validateResults(results)) {
        console.log(`✅ ${scraperName}.js returned ${count} valid results`);
        console.log(`First valid result from ${scraperName}:`, results[0]);
      } else {
        console.warn(`⚠️ ${scraperName}.js returned invalid results`);
      }
    } catch (err) {
      console.error(`❌ ${scraperName}.js failed: ${err.message}`);
    }
  }
})();