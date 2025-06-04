// Test individual components to find the issue
console.log('1. Testing basic imports...');
const express = require('express');
const cors = require('cors');
const path = require('path');
console.log('✓ Basic imports successful');

console.log('2. Testing scraper imports...');
try {
  const scrapers = require('./working-scrapers.js');
  console.log(`✓ Scrapers loaded: ${Object.keys(scrapers).length} scrapers`);
  
  // Test specific scrapers
  const testScrapers = ['3movs', 'pornhub', 'xvideos'];
  for (const name of testScrapers) {
    if (scrapers[name] && typeof scrapers[name] === 'function') {
      console.log(`✓ ${name} scraper is valid`);
    } else {
      console.log(`✗ ${name} scraper is missing or invalid`);
    }
  }
} catch (error) {
  console.error('✗ Error loading scrapers:', error.message);
  process.exit(1);
}

console.log('3. Testing Express app creation...');
const app = express();
app.use(cors());
console.log('✓ Express app created successfully');

console.log('4. Testing route setup...');
app.get('/test', (req, res) => {
  res.json({ message: 'Test successful' });
});
console.log('✓ Routes setup successful');

console.log('5. All tests passed! Server should work normally.');
