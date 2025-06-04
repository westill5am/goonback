// Minimal server test
console.log('Starting minimal server test...');

const express = require('express');
const app = express();
const PORT = 8001; // Use different port to avoid conflicts

app.get('/test', (req, res) => {
  res.json({ status: 'OK', message: 'Minimal server working' });
});

app.listen(PORT, () => {
  console.log(`Minimal server running on port ${PORT}`);
  console.log('Test by visiting: http://localhost:8001/test');
});
