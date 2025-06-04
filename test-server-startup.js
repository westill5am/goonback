// Simple test to run server and capture errors
console.log('Starting server test...');

try {
  require('./index.js');
  console.log('Server started successfully');
} catch (error) {
  console.error('Server startup error:', error);
  console.error('Stack trace:', error.stack);
}
