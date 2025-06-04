const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8000;

console.log('Starting minimal server...');

app.use(cors());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static('templates'));

app.get('/test', (req, res) => {
  res.json({ 
    message: 'Minimal server test successful!', 
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).type('text/plain').send('OK');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

// Mock search endpoint for testing
app.get('/search', (req, res) => {
  const query = req.query.q || req.query.query || '';
  res.json({
    results: [
      {
        title: 'Mock Result 1',
        url: 'https://example.com/1',
        preview: 'https://example.com/thumb1.jpg',
        source: 'mock'
      },
      {
        title: 'Mock Result 2', 
        url: 'https://example.com/2',
        preview: 'https://example.com/thumb2.jpg',
        source: 'mock'
      }
    ],
    totalCount: 2,
    query: query
  });
});

app.get('/recommendations', (req, res) => {
  res.json(['milf', 'teen', 'mature', 'lesbian', 'amateur']);
});

app.get('/trending-searches', (req, res) => {
  res.json({ trendingSearches: ['stepmom', 'teacher', 'nurse'] });
});

app.get('/search-categories', (req, res) => {
  res.json({
    "Popular": ["milf", "teen", "mature"],
    "Categories": ["anal", "blowjob", "threesome"]
  });
});

app.get('/random-search', (req, res) => {
  const terms = ['milf', 'teen', 'mature', 'lesbian'];
  const randomTerm = terms[Math.floor(Math.random() * terms.length)];
  res.json({ term: randomTerm });
});

app.listen(PORT, () => {
  console.log(`Minimal server listening on port ${PORT}`);
  console.log('Server started successfully!');
});
