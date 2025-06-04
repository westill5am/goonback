// Syntax validation script
console.log('=== SYNTAX VALIDATION ===');

try {
  console.log('Testing syntax...');
  require('./index.js');
  console.log('✓ No syntax errors found');
} catch (error) {
  console.error('✗ Syntax error found:');
  console.error(error.message);
  console.error('Stack:', error.stack);
}

console.log('=== VALIDATION COMPLETE ===');
