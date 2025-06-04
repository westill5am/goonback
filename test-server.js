// Test script to validate server syntax
console.log('Testing server syntax...');

try {
  // Try to require the main server file without starting it
  const fs = require('fs');
  const code = fs.readFileSync('./index.js', 'utf8');
  
  // Basic syntax validation
  new Function(code);
  console.log('✅ Syntax validation passed!');
  
  // Try to actually require the module (this will catch runtime issues)
  console.log('Loading server module...');
  require('./index.js');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
