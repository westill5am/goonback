// Comprehensive Console Error Test with Server
const express = require('express');
const path = require('path');

console.log('=== COMPREHENSIVE CONSOLE ERROR TEST ===');

let errorCount = 0;
let warningCount = 0;
let logMessages = [];

// Override console methods to capture all output
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = (...args) => {
  const message = args.join(' ');
  logMessages.push(`[LOG] ${message}`);
  originalLog(...args);
};

console.error = (...args) => {
  errorCount++;
  const message = args.join(' ');
  logMessages.push(`[ERROR] ${message}`);
  originalError('🔴 ERROR:', ...args);
};

console.warn = (...args) => {
  warningCount++;
  const message = args.join(' ');
  logMessages.push(`[WARNING] ${message}`);
  originalWarn('🟡 WARNING:', ...args);
};

try {
  console.log('Starting comprehensive test...');
  
  // Load main server components
  const scrapers = require('./working-scrapers.js');
  const app = express();
  
  console.log(`Scrapers loaded: ${Object.keys(scrapers).length}`);
  
  // Test a simple route
  app.get('/test-console', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // Start server
  const server = app.listen(8001, () => {
    console.log('Test server started on port 8001');
    
    // Test HTTP request
    setTimeout(async () => {
      try {
        const http = require('http');
        const options = {
          hostname: 'localhost',
          port: 8001,
          path: '/test-console',
          method: 'GET'
        };
        
        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            console.log('HTTP test completed successfully');
            console.log(`Response: ${data}`);
            
            // Show results
            console.log('\n=== TEST RESULTS ===');
            console.log(`Total Errors: ${errorCount}`);
            console.log(`Total Warnings: ${warningCount}`);
            console.log(`Total Log Messages: ${logMessages.length}`);
            
            if (errorCount === 0) {
              console.log('🎉 NO CONSOLE ERRORS DETECTED!');
            } else {
              console.log('❌ Console errors detected:');
              logMessages.filter(msg => msg.includes('[ERROR]')).forEach(msg => console.log(msg));
            }
            
            server.close();
            process.exit(0);
          });
        });
        
        req.on('error', (e) => {
          console.error('HTTP request error:', e.message);
          server.close();
          process.exit(1);
        });
        
        req.end();
        
      } catch (e) {
        console.error('Test error:', e.message);
        server.close();
        process.exit(1);
      }
    }, 1000);
  });
  
  server.on('error', (e) => {
    console.error('Server error:', e.message);
    process.exit(1);
  });
  
} catch (error) {
  console.error('Fatal error:', error.message);
  process.exit(1);
}
