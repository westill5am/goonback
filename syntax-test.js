// Simple syntax validation test
try {
  require('./index.js');
  console.log('✅ Syntax validation passed - no errors found');
} catch (error) {
  console.error('❌ Syntax error found:', error.message);
  process.exit(1);
}
