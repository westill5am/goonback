// SMART STARTUP SCRIPT
// Automatically detects system and starts the best server version
// Run: node start-smart.js

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 =================================');
console.log('🚀 GoonerBrain Smart Startup');
console.log('🚀 =================================');

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));

console.log(`📊 Node.js Version: ${nodeVersion}`);

let serverFile = 'index-production.js';
let serverDescription = 'Hybrid Production Server';

if (majorVersion >= 24) {
  console.log('⚠️  Node.js v24+ detected - WebAssembly issues possible');
  console.log('💡 Using hybrid server with API fallback protection');
  serverFile = 'index-production.js';
  serverDescription = 'Hybrid Production Server (WebAssembly Protected)';
} else if (majorVersion >= 20) {
  console.log('✅ Node.js v20+ - Good compatibility');
  serverFile = 'index-production.js';
  serverDescription = 'Hybrid Production Server';
} else if (majorVersion >= 16) {
  console.log('✅ Node.js v16+ - Excellent compatibility');
  serverFile = 'index-production.js';
  serverDescription = 'Hybrid Production Server';
} else {
  console.log('⚠️  Old Node.js version - using emergency server');
  serverFile = 'index-emergency.js';
  serverDescription = 'Emergency Server (Basic Functionality)';
}

// Check if required files exist
const requiredFiles = [
  serverFile,
  'hybrid-scrapers.js',
  'templates/index.html',
  'package.json'
];

let missingFiles = [];
requiredFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.log('❌ Missing required files:');
  missingFiles.forEach(file => console.log(`   - ${file}`));
  console.log('\n💡 Please ensure all files are in place before starting.');
  process.exit(1);
}

// Check dependencies
console.log('\n📦 Checking dependencies...');
try {
  require('express');
  console.log('✅ express found');
} catch (e) {
  console.log('❌ express missing - run: npm install express');
  process.exit(1);
}

try {
  require('axios');
  console.log('✅ axios found');
} catch (e) {
  console.log('❌ axios missing - run: npm install axios');
  process.exit(1);
}

try {
  require('cheerio');
  console.log('✅ cheerio found');
} catch (e) {
  console.log('❌ cheerio missing - run: npm install cheerio');
  process.exit(1);
}

try {
  require('cors');
  console.log('✅ cors found');
} catch (e) {
  console.log('❌ cors missing - run: npm install cors');
  process.exit(1);
}

console.log('\n🎯 Starting server...');
console.log(`🎯 Server: ${serverDescription}`);
console.log(`🎯 File: ${serverFile}`);
console.log(`🎯 URL: http://localhost:8000`);
console.log('🎯 =================================\n');

// Start the server
try {
  require(`./${serverFile}`);
} catch (error) {
  console.error('❌ Failed to start server:', error.message);
  console.log('\n💡 Falling back to emergency server...');
  
  try {
    require('./index-emergency.js');
  } catch (emergencyError) {
    console.error('❌ Emergency server also failed:', emergencyError.message);
    console.log('\n🚨 All server options failed. Please check your setup.');
    process.exit(1);
  }
}
