// ENHANCED CONSOLE ERROR DEBUGGER
// Detects Node.js version issues, WebAssembly problems, and undici conflicts
// Run this before starting your server to diagnose potential 503 errors

console.log('🔍 =================================');
console.log('🔍 GoonerBrain Error Diagnostics');
console.log('🔍 =================================');

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));

console.log(`📊 Node.js Version: ${nodeVersion}`);

if (majorVersion >= 24) {
  console.log('❌ CRITICAL: Node.js v24+ detected!');
  console.log('❌ This version causes WebAssembly memory errors with undici');
  console.log('💡 SOLUTION: Switch to Node.js v16.20.2');
  console.log('💡 Command: nvm use 16.20.2 (if using nvm)');
} else if (majorVersion >= 20) {
  console.log('⚠️  WARNING: Node.js v20+ may have compatibility issues');
  console.log('💡 RECOMMENDED: Use Node.js v16.20.2 for maximum stability');
} else if (majorVersion === 18 || majorVersion === 16) {
  console.log('✅ GOOD: Node.js version is compatible');
} else {
  console.log('⚠️  WARNING: Very old Node.js version detected');
  console.log('💡 RECOMMENDED: Upgrade to Node.js v16.20.2');
}

// Check memory usage
const memory = process.memoryUsage();
console.log(`💾 Memory Usage:`);
console.log(`   - Heap Used: ${Math.round(memory.heapUsed / 1024 / 1024)}MB`);
console.log(`   - Heap Total: ${Math.round(memory.heapTotal / 1024 / 1024)}MB`);
console.log(`   - External: ${Math.round(memory.external / 1024 / 1024)}MB`);

if (memory.heapUsed > 100 * 1024 * 1024) {
  console.log('⚠️  WARNING: High memory usage detected');
}

// Check for problematic packages
console.log(`📦 Checking for problematic packages...`);

try {
  require.resolve('undici');
  console.log('❌ FOUND: undici package (may cause WebAssembly errors)');
  console.log('💡 SOLUTION: Use undici-free server (index-production.js)');
} catch (e) {
  console.log('✅ GOOD: undici package not found');
}

// Test ReadableStream availability
console.log(`🌊 Testing ReadableStream...`);
if (typeof globalThis.ReadableStream === 'undefined') {
  console.log('❌ ReadableStream not available');
  console.log('💡 SOLUTION: Polyfill will be loaded automatically');
} else {
  console.log('✅ ReadableStream available');
}

// Test basic HTTP server capability
console.log(`🌐 Testing HTTP server capability...`);
try {
  const http = require('http');
  const testServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
  });
  
  testServer.listen(0, () => {
    const port = testServer.address().port;
    console.log(`✅ HTTP server test passed on port ${port}`);
    testServer.close();
  });
} catch (error) {
  console.log('❌ HTTP server test failed:', error.message);
}

// Test Express availability
console.log(`📡 Testing Express...`);
try {
  const express = require('express');
  console.log('✅ Express loaded successfully');
} catch (error) {
  console.log('❌ Express failed to load:', error.message);
  console.log('💡 SOLUTION: Run "npm install express"');
}

// Test scraper dependencies
console.log(`🕷️  Testing scraper dependencies...`);
try {
  const axios = require('axios');
  console.log('✅ axios loaded successfully');
} catch (error) {
  console.log('❌ axios failed to load:', error.message);
  console.log('💡 SOLUTION: Run "npm install axios"');
}

try {
  const cheerio = require('cheerio');
  console.log('✅ cheerio loaded successfully');
} catch (error) {
  console.log('❌ cheerio failed to load:', error.message);
  console.log('💡 SOLUTION: Run "npm install cheerio"');
}

// Platform information
console.log(`🖥️  Platform Information:`);
console.log(`   - OS: ${process.platform}`);
console.log(`   - Architecture: ${process.arch}`);
console.log(`   - CPU Count: ${require('os').cpus().length}`);
console.log(`   - Total Memory: ${Math.round(require('os').totalmem() / 1024 / 1024 / 1024)}GB`);

// Final recommendations
console.log('\n🎯 =================================');
console.log('🎯 FINAL RECOMMENDATIONS');
console.log('🎯 =================================');

if (majorVersion >= 24) {
  console.log('🚨 URGENT: Switch to Node.js v16.20.2 immediately');
  console.log('🚨 Current version will cause 503 Service Unavailable errors');
} else {
  console.log('✅ Node.js version is acceptable');
}

console.log('📋 Server Files to Use:');
console.log('   - PRIMARY: index-production.js (undici-free, WebAssembly protected)');
console.log('   - BACKUP: index-emergency.js (dummy data fallback)');
console.log('   - SCRAPERS: working-scrapers.js (with ReadableStream polyfill)');

console.log('\n🔧 Commands to Run:');
console.log('   1. npm install');
console.log('   2. node index-production.js');
console.log('   3. Test: curl http://localhost:8000/health');

console.log('\n✅ Diagnostic complete. Check above for any issues to resolve.');
console.log('🔍 =================================\n');
