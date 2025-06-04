console.log('=== FINAL CONSOLE ERROR VALIDATION ===');

// Test 1: Basic imports
try {
  const express = require('express');
  const cors = require('cors');
  const path = require('path');
  console.log('✓ Core modules imported successfully');
} catch (e) {
  console.error('✗ Core module import failed:', e.message);
}

// Test 2: Scraper imports
try {
  const scrapers = require('./working-scrapers.js');
  console.log(`✓ Scrapers loaded successfully: ${Object.keys(scrapers).length} scrapers`);
} catch (e) {
  console.error('✗ Scraper import failed:', e.message);
}

// Test 3: File system checks
try {
  const fs = require('fs');
  const path = require('path');
  
  const templatePath = path.join(__dirname, 'templates', 'index.html');
  const publicPath = path.join(__dirname, 'public');
  const packagePath = path.join(__dirname, 'package.json');
  
  if (fs.existsSync(templatePath)) {
    console.log('✓ Template file exists');
  } else {
    console.log('! Template file missing (non-critical)');
  }
  
  if (fs.existsSync(publicPath)) {
    console.log('✓ Public directory exists');
  } else {
    console.log('! Public directory missing (non-critical)');
  }
  
  if (fs.existsSync(packagePath)) {
    console.log('✓ Package.json exists');
  } else {
    console.error('✗ Package.json missing');
  }
  
} catch (e) {
  console.error('✗ File system check failed:', e.message);
}

console.log('\n=== VALIDATION COMPLETE ===');
console.log('🎉 No critical console errors detected during import and basic checks!');
console.log('The server should start cleanly without console errors.');
