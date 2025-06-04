// EMERGENCY FALLBACK SERVER
// Ultra-minimal server with dummy data to prevent any 503 errors
// Use this when all other servers fail due to Node.js/WebAssembly issues

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Ultra-permissive CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['*'],
  credentials: false
}));

app.use(express.json());
app.use(express.static('templates'));

// Dummy Arsenal content for emergency fallback
const emergencyContent = [
  {
    title: "Arsenal Official - Latest News",
    link: "https://www.arsenal.com/news",
    summary: "Stay updated with the latest Arsenal news, transfers, and match reports",
    source: "Arsenal Official",
    timestamp: new Date().toISOString()
  },
  {
    title: "Arsenal vs Manchester City - Match Preview", 
    link: "https://www.arsenal.com/fixtures",
    summary: "Comprehensive preview of Arsenal's upcoming Premier League fixture",
    source: "Arsenal Official",
    timestamp: new Date().toISOString()
  },
  {
    title: "Transfer Roundup - Arsenal Signings",
    link: "https://www.arsenal.com/news/transfers",
    summary: "Latest transfer news and rumors surrounding Arsenal Football Club",
    source: "Arsenal Official", 
    timestamp: new Date().toISOString()
  },
  {
    title: "Bukayo Saka - Player Analysis",
    link: "https://www.arsenal.com/players",
    summary: "Statistical analysis and performance review of Arsenal's key players",
    source: "Arsenal Official",
    timestamp: new Date().toISOString()
  },
  {
    title: "Arsenal Women - Latest Results",
    link: "https://www.arsenal.com/women",
    summary: "Updates from Arsenal Women's team matches and achievements",
    source: "Arsenal Official",
    timestamp: new Date().toISOString()
  },
  {
    title: "Emirates Stadium - Stadium News",
    link: "https://www.arsenal.com/stadium",
    summary: "News and updates about Emirates Stadium and matchday experience",
    source: "Arsenal Official",
    timestamp: new Date().toISOString()
  },
  {
    title: "Arsenal Academy - Youth Development",
    link: "https://www.arsenal.com/academy",
    summary: "Updates on Arsenal's youth academy and emerging talent",
    source: "Arsenal Official",
    timestamp: new Date().toISOString()
  },
  {
    title: "Mikel Arteta - Manager Updates",
    link: "https://www.arsenal.com/news/manager",
    summary: "Press conferences and tactical insights from Arsenal's manager",
    source: "Arsenal Official",
    timestamp: new Date().toISOString()
  }
];

// System info endpoint
app.get('/system-info', (req, res) => {
  res.json({
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    server: 'emergency-fallback'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    server: 'emergency-fallback',
    nodeVersion: process.version
  });
});

// Main search endpoint - always returns dummy data
app.get('/search', (req, res) => {
  const query = req.query.q || '';
  console.log(`🔍 Emergency search: "${query}"`);
  
  // Filter dummy content based on query
  let results = [...emergencyContent];
  
  if (query.trim()) {
    const queryLower = query.toLowerCase();
    results = emergencyContent.filter(item => 
      item.title.toLowerCase().includes(queryLower) ||
      item.summary.toLowerCase().includes(queryLower)
    );
    
    // If no matches, return all content
    if (results.length === 0) {
      results = [...emergencyContent];
    }
  }
  
  const response = {
    results: results,
    query: query,
    timestamp: new Date().toISOString(),
    status: 'emergency_mode',
    server: 'emergency-fallback',
    nodeVersion: process.version,
    message: 'Running in emergency mode with dummy data'
  };

  console.log(`📤 Emergency response: ${results.length} items`);
  res.json(response);
});

// Common searches endpoint
app.get('/common-searches', (req, res) => {
  res.json({
    commonSearches: [
      'arsenal news',
      'transfers',
      'fixtures',
      'match reports',
      'player stats',
      'bukayo saka',
      'martin odegaard',
      'gabriel jesus',
      'mikel arteta',
      'emirates stadium'
    ]
  });
});

// Trending searches endpoint
app.get('/trending-searches', (req, res) => {
  res.json({
    trendingSearches: [
      'arsenal transfer news',
      'premier league',
      'champions league',
      'arsenal vs city',
      'injury updates'
    ]
  });
});

// Categories endpoint
app.get('/search-categories', (req, res) => {
  res.json({
    categories: {
      news: ['latest news', 'breaking news', 'match reports'],
      transfers: ['summer transfers', 'winter window', 'rumors'],
      matches: ['fixtures', 'results', 'highlights'],
      players: ['player stats', 'interviews', 'profiles']
    }
  });
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

// Catch-all for unknown routes
app.use('*', (req, res) => {
  console.log(`❓ Unknown route: ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found', 
    path: req.originalUrl,
    server: 'emergency-fallback'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('🚨 Emergency server error:', error.message);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: error.message,
    server: 'emergency-fallback'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚨 =================================');
  console.log(`🚨 EMERGENCY SERVER ACTIVE`);
  console.log(`🚨 Running on: http://localhost:${PORT}`);
  console.log(`🚨 Node.js version: ${process.version}`);
  console.log(`🚨 Platform: ${process.platform}`);
  console.log(`🚨 Status: FALLBACK MODE`);
  console.log(`🚨 Data: DUMMY CONTENT ONLY`);
  console.log('🚨 =================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Emergency server shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Emergency server shutting down gracefully'); 
  process.exit(0);
});
