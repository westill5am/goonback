// Comprehensive console error detection script
console.log('=== GOONERBRAIN CONSOLE ERROR DEBUGGER ===');
console.log('Testing all components for console errors...\n');

let errorCount = 0;
let warningCount = 0;

// Capture original console methods to detect errors
const originalError = console.error;
const originalWarn = console.warn;
const originalLog = console.log;

console.error = function(...args) {
  errorCount++;
  originalError.apply(console, ['[ERROR]', ...args]);
};

console.warn = function(...args) {
  warningCount++;
  originalWarn.apply(console, ['[WARN]', ...args]);
};

async function testComponent(name, testFunction) {
  console.log(`\n--- Testing ${name} ---`);
  try {
    await testFunction();
    console.log(`✓ ${name} test completed`);
  } catch (error) {
    console.error(`✗ ${name} failed:`, error.message);
  }
}

async function runTests() {
  // Test 1: Basic imports
  await testComponent('Basic Imports', async () => {
    const express = require('express');
    const cors = require('cors');
    const path = require('path');
    console.log('Basic modules imported successfully');
  });

  // Test 2: Scraper imports
  await testComponent('Scraper Imports', async () => {
    const scrapers = require('./working-scrapers.js');
    console.log(`Scrapers loaded: ${Object.keys(scrapers).length} scrapers`);
    
    // Validate scraper functions
    const invalidScrapers = [];
    for (const [name, scraper] of Object.entries(scrapers)) {
      if (name === 'fetchWithScraperAPI') continue;
      if (typeof scraper !== 'function') {
        invalidScrapers.push(name);
      }
    }
    
    if (invalidScrapers.length > 0) {
      console.warn(`Invalid scrapers found: ${invalidScrapers.join(', ')}`);
    }
  });

  // Test 3: Express app creation
  await testComponent('Express App Creation', async () => {
    const express = require('express');
    const app = express();
    console.log('Express app created successfully');
  });

  // Test 4: File system paths
  await testComponent('File System Paths', async () => {
    const fs = require('fs');
    const path = require('path');
    
    const testPaths = [
      './templates/index.html',
      './public/goonerbrain.png',
      './package.json',
      './working-scrapers.js'
    ];
    
    for (const testPath of testPaths) {
      const fullPath = path.join(__dirname, testPath);
      if (fs.existsSync(fullPath)) {
        console.log(`✓ Found: ${testPath}`);
      } else {
        console.warn(`Missing: ${testPath}`);
      }
    }
  });

  // Test 5: Sample scraper execution (without network calls)
  await testComponent('Scraper Function Structure', async () => {
    const scrapers = require('./working-scrapers.js');
    
    // Test confirmed working scrapers
    const confirmedScrapers = ['3movs', 'pornhub', 'xvideos'];
    
    for (const name of confirmedScrapers) {
      if (scrapers[name] && typeof scrapers[name] === 'function') {
        console.log(`✓ ${name} scraper structure is valid`);
      } else {
        console.error(`✗ ${name} scraper is missing or invalid`);
      }
    }
  });

  // Test 6: Server startup (without actually starting)
  await testComponent('Server Configuration', async () => {
    // Simulate server startup without listening
    const express = require('express');
    const cors = require('cors');
    const path = require('path');
    
    const app = express();
    app.use(cors());
    app.use('/public', express.static(path.join(__dirname, 'public')));
    app.use(express.static('templates'));
    
    // Add test routes
    app.get('/test', (req, res) => {
      res.json({ message: 'test' });
    });
    
    console.log('Server configuration is valid');
  });

  // Test 7: Dependencies check
  await testComponent('Dependencies Check', async () => {
    const packageJson = require('./package.json');
    const dependencies = packageJson.dependencies || {};
    
    console.log('Checking dependencies...');
    for (const [dep, version] of Object.entries(dependencies)) {
      try {
        require(dep);
        console.log(`✓ ${dep} is available`);
      } catch (error) {
        console.error(`✗ ${dep} is missing or has issues`);
      }
    }
  });

  // Final summary
  console.log('\n=== TEST SUMMARY ===');
  console.log(`Total Errors: ${errorCount}`);
  console.log(`Total Warnings: ${warningCount}`);
  
  if (errorCount === 0 && warningCount === 0) {
    console.log('🎉 No console errors detected! Server should run cleanly.');
  } else if (errorCount === 0) {
    console.log('⚠️  Some warnings found, but no critical errors.');
  } else {
    console.log('❌ Critical errors found that need to be fixed.');
  }
}

// Run all tests
runTests().catch(error => {
  console.error('Test runner failed:', error);
});
