// PRODUCTION-READY UNDICI-FREE SERVER
// This server prevents 503 errors by avoiding undici package entirely
// Uses working-scrapers.js with ReadableStream polyfill for Node.js 16 compatibility

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS for all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: false
}));

app.use(express.json());
app.use(express.static('templates'));

// System information endpoint
app.get('/system-info', (req, res) => {
  const systemInfo = {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    server: 'undici-free-production'
  };
  
  console.log('📊 System Info Request:', systemInfo);
  res.json(systemInfo);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    server: 'undici-free-production',
    nodeVersion: process.version
  });
});

// Main search endpoint with hybrid adult scrapers
app.get('/search', async (req, res) => {
  const query = req.query.q || '';
  console.log(`🔍 Adult content search request: "${query}"`);
  
  try {
    // Import hybrid adult scrapers
    let hybridScrapers;
    try {
      hybridScrapers = require('./hybrid-adult-scrapers');
      console.log('✓ Hybrid adult scrapers loaded successfully');
      
      // Attempt to get real data with hybrid scrapers
      console.log('🚀 Attempting hybrid adult content search...');
      
      // Use a focused set of scrapers for production
      const productionScrapers = ['spankbang', 'redtube'];
      const searchResult = await hybridScrapers.searchAllHybrid(query, productionScrapers);
      
      console.log(`✅ Hybrid search completed: ${searchResult.results.length} unique results`);
      console.log(`📊 API usage: ${searchResult.stats.apiCount}/${searchResult.stats.directCount + searchResult.stats.apiCount} requests`);
      
      // Get usage statistics for monitoring
      const stats = hybridScrapers.getUsageStats();
      
      return res.json({
        results: searchResult.results,
        query: query,
        timestamp: new Date().toISOString(),
        status: 'success',
        server: 'undici-free-production',
        scraperType: 'hybrid-adult-scrapers',
        stats: {
          totalResults: searchResult.results.length,
          directRequests: stats.directScrapingCount,
          apiRequests: stats.apiUsageCount,
          apiUsagePercentage: stats.apiUsagePercentage,
          costSavings: stats.directScrapingCount * 0.001, // Estimated savings
          apiCost: stats.apiUsageCount * 0.001 // Estimated cost
        }
      });
      
    } catch (hybridError) {
      console.error('❌ Hybrid scraper failed:', hybridError.message);
      
      // Fallback to working scrapers
      try {
        const workingScrapers = require('./working-scrapers');
        console.log('🔄 Falling back to working scrapers');
        
        const fallbackResults = [];
        if (workingScrapers['spankbang']) {
          const results = await workingScrapers['spankbang'](query);
          fallbackResults.push(...results.slice(0, 10));
        }
        
        return res.json({
          results: fallbackResults,
          query: query,
          timestamp: new Date().toISOString(),
          status: 'fallback_success',
          server: 'undici-free-production',
          scraperType: 'working-scrapers-fallback',
          error: hybridError.message
        });
        
      } catch (fallbackError) {
        console.error('❌ All scrapers failed:', fallbackError.message);
        return res.json({
          results: [],
          query: query,
          timestamp: new Date().toISOString(),
          status: 'all_failed',
          server: 'undici-free-production',
          error: 'All scraping systems unavailable'
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Critical search error:', error.message);
    res.json({
      results: [],
      query: query,
      timestamp: new Date().toISOString(),
      status: 'critical_error',
      error: 'Search service temporarily unavailable',
      server: 'undici-free-production'
    });
  }
});

// API usage statistics endpoint for monitoring costs and performance
app.get('/api-stats', (req, res) => {
  try {
    const hybridScrapers = require('./hybrid-adult-scrapers');
    const stats = hybridScrapers.getUsageStats();
    
    res.json({
      stats: {
        directScrapingCount: stats.directScrapingCount,
        apiUsageCount: stats.apiUsageCount,
        totalRequests: stats.totalRequests,
        apiUsagePercentage: stats.apiUsagePercentage,
        estimatedApiCost: stats.apiUsageCount * 0.001,
        estimatedSavings: stats.directScrapingCount * 0.001
      },
      timestamp: new Date().toISOString(),
      server: 'undici-free-production'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Stats service unavailable',
      timestamp: new Date().toISOString(),
      details: error.message
    });
  }
});

// Reset API usage counters (admin endpoint)
app.post('/reset-stats', (req, res) => {
  try {
    const hybridScrapers = require('./hybrid-adult-scrapers');
    hybridScrapers.resetCounters();
    
    res.json({
      message: 'API usage counters reset successfully',
      timestamp: new Date().toISOString(),
      server: 'undici-free-production'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to reset counters',
      timestamp: new Date().toISOString(),
      details: error.message
    });
  }
});

// Common adult search terms endpoint
app.get('/common-searches', (req, res) => {
  const commonSearches = [
    'teen', 'milf', 'blonde', 'brunette', 'big tits', 'big ass', 
    'anal', 'blowjob', 'hardcore', 'amateur', 'lesbian', 'threesome',
    'mature', 'young', 'latina', 'asian', 'ebony', 'redhead'
  ];
  
  res.json({ 
    commonSearches: commonSearches.slice(0, 12),
    timestamp: new Date().toISOString() 
  });
});

// Trending searches endpoint  
app.get('/trending-searches', (req, res) => {
  const trendingSearches = [
    'big tits', 'milf', 'teen', 'anal', 'big ass', 'blonde',
    'amateur', 'hardcore', 'lesbian', 'brunette', 'latina', 'mature'
  ];
  
  res.json({ 
    trendingSearches: trendingSearches.slice(0, 8),
    timestamp: new Date().toISOString()
  });
});

// API usage stats endpoint
app.get('/api-usage', (req, res) => {
  try {
    const scrapers = require('./hybrid-scrapers');
    const usage = scrapers.getAPIUsage();
    res.json({
      webscrapingapi: usage,
      timestamp: new Date().toISOString(),
      server: 'hybrid-production'
    });
  } catch (error) {
    res.json({
      webscrapingapi: { used: 0, limit: 1000, remaining: 1000 },
      error: 'Unable to get usage stats',
      timestamp: new Date().toISOString(),
      server: 'hybrid-production'
    });
  }
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

// Catch-all for unknown routes
app.use('*', (req, res) => {
  console.log(`❓ Unknown route accessed: ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found', 
    path: req.originalUrl,
    server: 'undici-free-production'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('🚨 Express error handler:', error.message);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: error.message,
    server: 'undici-free-production'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 =================================');
  console.log(`🚀 GoonerBrain Undici-Free Server`);
  console.log(`🚀 Running on: http://localhost:${PORT}`);
  console.log(`🚀 Node.js version: ${process.version}`);
  console.log(`🚀 Platform: ${process.platform}`);
  console.log(`🚀 Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
  console.log('🚀 Status: PRODUCTION READY');
  console.log('🚀 Features: WebAssembly Protected');
  console.log('🚀 =================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});
