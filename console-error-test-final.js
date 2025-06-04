// Final Console Error Test - No Server Startup
console.log('=== FINAL CONSOLE ERROR VALIDATION ===');

let errorCount = 0;
let warningCount = 0;

// Capture console errors
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  errorCount++;
  originalError('🔴 ERROR:', ...args);
};

console.warn = (...args) => {
  warningCount++;
  originalWarn('🟡 WARNING:', ...args);
};

try {
  console.log('--- Testing Module Imports ---');
  
  // Test basic modules
  const express = require('express');
  const cors = require('cors');
  const path = require('path');
  console.log('✓ Core modules imported successfully');
  
  // Test scraper imports
  const scrapers = require('./working-scrapers.js');
  console.log(`✓ Scrapers loaded: ${Object.keys(scrapers).length} scrapers`);
  
  console.log('--- Testing App Configuration ---');
  
  // Test app creation without starting server
  const app = express();
  app.use(cors());
  app.use('/public', express.static(path.join(__dirname, 'public')));
  app.use(express.static('templates'));
  console.log('✓ Express app configured successfully');
  
  console.log('--- Testing Route Definitions ---');
  
  // Test route definitions (without starting server)
  app.get('/test', (req, res) => {
    res.json({ 
      message: 'Hello from test route!', 
      timestamp: new Date().toISOString(),
      availableScrapers: Object.keys(scrapers).length 
    });
  });
  
  app.get('/health', (req, res) => {
    res.status(200).type('text/plain').send('OK');
  });
  
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'index.html'));
  });
  
  console.log('✓ Basic routes defined successfully');
  
  console.log('--- Testing Scraper Functions ---');
  
  // Test a few key scrapers for structure
  const testScrapers = ['3movs', 'pornhub', 'xvideos'];
  for (const scraperName of testScrapers) {
    if (scrapers[scraperName] && typeof scrapers[scraperName] === 'function') {
      console.log(`✓ ${scraperName} scraper structure is valid`);
    } else {
      console.error(`✗ ${scraperName} scraper is invalid or missing`);
    }
  }
  
  console.log('--- Testing File System Paths ---');
  
  const fs = require('fs');
  const templatePath = path.join(__dirname, 'templates', 'index.html');
  const publicPath = path.join(__dirname, 'public');
  
  if (fs.existsSync(templatePath)) {
    console.log('✓ Template file exists');
  } else {
    console.error('✗ Template file missing');
  }
  
  if (fs.existsSync(publicPath)) {
    console.log('✓ Public directory exists');
  } else {
    console.error('✗ Public directory missing');
  }
  
  console.log('=== VALIDATION COMPLETE ===');
  console.log(`Total Errors: ${errorCount}`);
  console.log(`Total Warnings: ${warningCount}`);
  
  if (errorCount === 0) {
    console.log('🎉 NO CONSOLE ERRORS DETECTED! Server is ready for clean startup.');
  } else {
    console.log('❌ Console errors detected. Review above for details.');
  }
  
} catch (error) {
  console.error('Fatal error during validation:', error.message);
  process.exit(1);
}
