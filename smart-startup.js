// SMART STARTUP SCRIPT
// Automatically detects issues and starts the best server configuration
// This script prevents 503 errors by choosing the right server for your environment

console.log('🚀 GoonerBrain Smart Startup');
console.log('🚀 ========================\n');

const path = require('path');
const fs = require('fs');

// Check Node.js version compatibility
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));

console.log(`📊 Node.js Version: ${nodeVersion}`);

let serverChoice = 'index-production.js';
let warningLevel = 'none';

if (majorVersion >= 24) {
  console.log('❌ CRITICAL: Node.js v24+ detected - high risk of 503 errors!');
  console.log('🔄 Switching to emergency server with maximum protection...');
  serverChoice = 'index-emergency.js';
  warningLevel = 'critical';
} else if (majorVersion >= 20) {
  console.log('⚠️  WARNING: Node.js v20+ may have stability issues');
  console.log('🛡️  Using production server with enhanced protection...');
  serverChoice = 'index-production.js';
  warningLevel = 'moderate';
} else if (majorVersion === 18 || majorVersion === 16) {
  console.log('✅ EXCELLENT: Node.js version is optimal');
  console.log('🚀 Using full-featured production server...');
  serverChoice = 'index-production.js';
  warningLevel = 'none';
} else {
  console.log('⚠️  WARNING: Very old Node.js version');
  console.log('🛡️  Using basic emergency server for safety...');
  serverChoice = 'index-emergency.js';
  warningLevel = 'moderate';
}

// Check if required files exist
const requiredFiles = [
  'index-production.js',
  'index-emergency.js', 
  'working-scrapers.js',
  'readablestream-polyfill.js'
];

console.log('\n📁 Checking required files...');
let missingFiles = [];
requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING!`);
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.log('\n🚨 CRITICAL: Missing required files!');
  console.log('💡 Please ensure all server files are present');
  process.exit(1);
}

// Test dependencies
console.log('\n📦 Testing dependencies...');
const requiredPackages = ['express', 'cors', 'axios', 'cheerio'];
let missingPackages = [];

requiredPackages.forEach(pkg => {
  try {
    require.resolve(pkg);
    console.log(`✅ ${pkg}`);
  } catch (e) {
    console.log(`❌ ${pkg} - NOT INSTALLED!`);
    missingPackages.push(pkg);
  }
});

if (missingPackages.length > 0) {
  console.log('\n🚨 MISSING PACKAGES DETECTED!');
  console.log('💡 Run this command to install dependencies:');
  console.log(`   npm install ${missingPackages.join(' ')}`);
  process.exit(1);
}

// Memory check
const memory = process.memoryUsage();
console.log(`\n💾 Memory: ${Math.round(memory.heapUsed / 1024 / 1024)}MB used`);

// Start the appropriate server
console.log(`\n🚀 Starting ${serverChoice}...`);
console.log('🚀 ========================');

if (warningLevel === 'critical') {
  console.log('🚨 RUNNING IN EMERGENCY MODE');
  console.log('🚨 Limited functionality to prevent crashes');
  console.log('🚨 Recommend upgrading to Node.js v16.20.2');
} else if (warningLevel === 'moderate') {
  console.log('⚠️  RUNNING WITH ENHANCED PROTECTION');
  console.log('⚠️  Some features may be limited for stability');
} else {
  console.log('✅ RUNNING IN FULL PRODUCTION MODE');
  console.log('✅ All features available');
}

console.log('🚀 ========================\n');

// Start the chosen server
try {
  require(path.join(__dirname, serverChoice));
} catch (error) {
  console.error('🚨 CRITICAL: Failed to start server!');
  console.error('Error:', error.message);
  
  // Try emergency fallback
  if (serverChoice !== 'index-emergency.js') {
    console.log('\n🔄 Attempting emergency fallback...');
    try {
      require(path.join(__dirname, 'index-emergency.js'));
    } catch (fallbackError) {
      console.error('🚨 EMERGENCY FALLBACK ALSO FAILED!');
      console.error('Error:', fallbackError.message);
      process.exit(1);
    }
  } else {
    process.exit(1);
  }
}
