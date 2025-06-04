// Comprehensive test script to identify console errors
console.log('=== TESTING GOONERBRAIN COMPONENTS ===');

// Test 1: Check scraper imports
console.log('\n1. Testing scraper imports...');
try {
  const scrapers = require('./working-scrapers.js');
  console.log(`✓ Scrapers loaded: ${Object.keys(scrapers).length} scrapers found`);
  
  // Test scraper functions
  const scraperNames = Object.keys(scrapers);
  let validScrapers = 0;
  let invalidScrapers = [];
  
  for (const name of scraperNames) {
    if (name === 'fetchWithScraperAPI') continue; // Skip utility function
    if (typeof scrapers[name] === 'function') {
      validScrapers++;
    } else {
      invalidScrapers.push(name);
    }
  }
  
  console.log(`✓ Valid scrapers: ${validScrapers}`);
  if (invalidScrapers.length > 0) {
    console.log(`⚠ Invalid scrapers: ${invalidScrapers.join(', ')}`);
  }
  
} catch (error) {
  console.error('✗ Error loading scrapers:', error.message);
}

// Test 2: Check core dependencies
console.log('\n2. Testing core dependencies...');
try {
  const express = require('express');
  const cors = require('cors');
  const path = require('path');
  console.log('✓ Express, CORS, and Path loaded successfully');
} catch (error) {
  console.error('✗ Error loading dependencies:', error.message);
}

// Test 3: Test file paths
console.log('\n3. Testing file paths...');
const path = require('path');
const fs = require('fs');

const testPaths = [
  './templates/index.html',
  './public/goonerbrain.png',
  './package.json'
];

for (const testPath of testPaths) {
  try {
    const fullPath = path.join(__dirname, testPath);
    if (fs.existsSync(fullPath)) {
      console.log(`✓ Found: ${testPath}`);
    } else {
      console.log(`⚠ Missing: ${testPath}`);
    }
  } catch (error) {
    console.log(`✗ Error checking ${testPath}: ${error.message}`);
  }
}

// Test 4: Test a sample scraper function
console.log('\n4. Testing sample scraper function...');
try {
  const scrapers = require('./working-scrapers.js');
  const testScraper = scrapers['3movs'];
  
  if (typeof testScraper === 'function') {
    console.log('✓ 3movs scraper is a valid function');
    
    // Test with a simple query (but don't actually run it to avoid network calls)
    console.log('✓ Scraper function structure looks correct');
  } else {
    console.log('✗ 3movs scraper is not a valid function');
  }
} catch (error) {
  console.error('✗ Error testing scraper:', error.message);
}

// Test 5: Test server configuration (without starting)
console.log('\n5. Testing server configuration...');
try {
  const express = require('express');
  const app = express();
  
  // Test middleware setup
  const cors = require('cors');
  app.use(cors());
  app.use('/public', express.static(path.join(__dirname, 'public')));
  app.use(express.static('templates'));
  
  console.log('✓ Express app configuration is valid');
} catch (error) {
  console.error('✗ Error with server configuration:', error.message);
}

console.log('\n=== TEST COMPLETE ===');
console.log('If no errors shown above, the server should start successfully.');
