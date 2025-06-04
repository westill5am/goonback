const fs = require('fs');
const path = require('path');

// List of new scrapers to check
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

console.log('Checking scraper URL formats...\n');

newScrapers.forEach(scraper => {
  try {
    const content = fs.readFileSync(scraper, 'utf8');
    
    // Look for the search URL pattern
    const urlMatch = content.match(/const searchUrl = `([^`]+)`/);
    
    if (urlMatch) {
      console.log(`${scraper}: ${urlMatch[1]}`);
    } else {
      console.log(`${scraper}: URL pattern not found`);
    }
  } catch (err) {
    console.log(`${scraper}: Error reading file - ${err.message}`);
  }
});
