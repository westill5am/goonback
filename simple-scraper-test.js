// Simple test to check if scrapers file has issues
console.log('Testing scrapers file...');

try {
  console.log('Before require...');
  const scrapers = require('./working-scrapers.js');
  console.log('After require...');
  console.log('Scrapers object keys:', Object.keys(scrapers));
  console.log('Test completed successfully');
} catch (error) {
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
}
