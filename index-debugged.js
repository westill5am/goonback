const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8000;

// Add error handling for scraper imports
let scrapers;
try {
  scrapers = require('./working-scrapers.js');
  console.log('Scrapers loaded successfully');
} catch (error) {
  console.error('Error loading scrapers:', error.message);
  process.exit(1);
}

app.use(cors());

// Serve static files from /public folder at URL path /public
app.use('/public', express.static(path.join(__dirname, 'public')));

// Serve template files
app.use(express.static('templates'));

// Health check endpoint for cPanel
app.get('/health', (req, res) => {
  res.status(200).type('text/plain').send('OK');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

// Simple test route to check server is responding quickly
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Hello from test route!', 
    timestamp: new Date().toISOString(),
    availableScrapers: Object.keys(scrapers).length 
  });
});

// Unified search endpoint using all confirmed working scrapers
const confirmedWorkingScrapers = [
  '3movs', 'ashemaletube', 'fuq', 'hentaigasm', 'porndoe', 'pornhub', 
  'pornovideoshub', 'tubedupe', 'xvideos', 'youporn', 'xnxx',
  'porntrex', 'anyporn', 'pornoxo'
];

// Additional scrapers to test (may have intermittent success)
const additionalScrapers = [
  'drtuber', 'empflix', 'eporner', 'extremetube', 'faphouse', 
  'fapvid', 'spankbang', 'redtube', 'ixxx', 'tube8'
];

// Timeout function with better error handling
const runScraperWithTimeout = async (scraper, query, timeoutMs = 15000) => {
  return Promise.race([
    scraper(query).catch(err => {
      throw new Error(`Scraper error: ${err.message}`);
    }),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    )
  ]);
};

app.get('/search', async (req, res) => {
  const startTime = Date.now();
  const query = req.query.q || req.query.query || '';
  
  if (!query) {
    return res.status(400).json({ 
      results: [], 
      error: 'No query provided.',
      totalCount: 0
    });
  }

  // Validate and collect available scrapers
  const workingScrapersToUse = {};
  let scrapersLoaded = 0;
  
  // Add confirmed working scrapers
  confirmedWorkingScrapers.forEach(name => {
    if (scrapers[name] && typeof scrapers[name] === 'function') {
      workingScrapersToUse[name] = scrapers[name];
      scrapersLoaded++;
    } else {
      console.warn(`Confirmed scraper '${name}' not found or not a function`);
    }
  });

  // Add additional scrapers if they exist
  additionalScrapers.forEach(name => {
    if (scrapers[name] && typeof scrapers[name] === 'function') {
      workingScrapersToUse[name] = scrapers[name];
      scrapersLoaded++;
    }
  });

  if (scrapersLoaded === 0) {
    return res.status(500).json({
      results: [],
      error: 'No working scrapers available',
      totalCount: 0
    });
  }

  let allResults = [];
  const scraperStats = {
    total: scrapersLoaded,
    successful: 0,
    failed: 0,
    timeouts: 0,
    rateLimited: 0
  };

  console.log('=== NEW SEARCH REQUEST ===');
  console.log('Query:', query);
  console.log(`Using ${scrapersLoaded} scrapers (${confirmedWorkingScrapers.length} confirmed + ${additionalScrapers.length} additional)`);

  // Run scrapers with better error tracking
  await Promise.all(Object.entries(workingScrapersToUse).map(async ([name, scraper]) => {
    console.log(`Trying scraper: ${name}`);
    
    try {
      const results = await runScraperWithTimeout(scraper, query, 15000);
      
      if (Array.isArray(results) && results.length > 0) {
        // Validate result structure
        const validResults = results.filter(r => 
          r && typeof r === 'object' && r.url && r.title
        ).map(r => ({
          ...r,
          source: name,
          timestamp: new Date().toISOString()
        }));
        
        allResults = allResults.concat(validResults);
        scraperStats.successful++;
        console.log(`${name}: Added ${validResults.length} valid results (${results.length} total)`);
      } else {
        console.log(`${name}: No results returned`);
        scraperStats.failed++;
      }
    } catch (e) {
      if (e.message.includes('429')) {
        console.log(`${name}: Rate limited (429) - will retry later`);
        scraperStats.rateLimited++;
      } else if (e.message === 'Timeout') {
        console.log(`${name}: Timeout after 15 seconds`);
        scraperStats.timeouts++;
      } else {
        console.log(`${name}: Error - ${e.message}`);
        scraperStats.failed++;
      }
    }
  }));

  console.log(`Final result count: ${allResults.length}`);

  // Deduplicate results by URL with better validation
  const uniqueResults = [];
  const seenUrls = new Set();
  
  for (const item of allResults) {
    if (item.url && !seenUrls.has(item.url)) {
      seenUrls.add(item.url);
      uniqueResults.push(item);
    }
  }

  const processingTime = Date.now() - startTime;
  console.log(`Unique result count after deduplication: ${uniqueResults.length}`);
  console.log(`Processing time: ${processingTime}ms`);

  // Add cache-busting headers
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  const skip = parseInt(req.query.skip, 10) || 0;
  let pagedResults = uniqueResults;
  
  if (skip > 0 && skip < uniqueResults.length) {
    pagedResults = uniqueResults.slice(skip);
  }

  console.log(`Number of results sent in response: ${pagedResults.length}`);

  res.json({
    results: pagedResults,
    totalCount: uniqueResults.length,
    nextSkip: skip + pagedResults.length,
    stats: {
      query,
      processingTimeMs: processingTime,
      scraperStats,
      totalResults: allResults.length,
      uniqueResults: uniqueResults.length,
      timestamp: new Date().toISOString()
    }
  });
});

// Common searches and trending searches
const commonSearches = [
  'mature', 'milf', 'teen', 'young', 'old', 'granny', 'cougar',
  'black', 'white', 'asian', 'latina', 'indian', 'brown', 'ebony',
  'bbw', 'thick', 'skinny', 'curvy', 'big ass', 'big tits', 'small tits',
  'amateur', 'hardcore', 'lesbian', 'threesome', 'orgy', 'gangbang',
  'anal', 'blowjob', 'handjob', 'facial', 'creampie', 'cumshot',
  'bdsm', 'bondage', 'domination', 'submission', 'feet', 'pantyhose',
  'lingerie', 'stockings', 'latex', 'cosplay',
  'hentai', 'cartoon', 'anime', 'furry', 'monster',
  'romantic', 'sensual', 'massage', 'kissing', 'softcore',
  'hot', 'sexy', 'beautiful', 'gorgeous', 'naughty', 'wild'
];

const trendingSearches = [
  'stepmom', 'stepsis', 'teacher', 'nurse', 'secretary', 'maid',
  'wife', 'girlfriend', 'neighbor', 'babysitter', 'boss',
  'office', 'kitchen', 'bedroom', 'bathroom', 'car', 'outdoor',
  'public', 'hotel', 'vacation', 'party',
  'pov', 'virtual reality', 'interactive', 'cam girl', 'live',
  'compilation', 'highlights', 'best of', 'top rated'
];

// API endpoints with better error handling
app.get('/common-searches', (req, res) => {
  try {
    res.json({ commonSearches });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch common searches' });
  }
});

app.get('/trending-searches', (req, res) => {
  try {
    res.json({ trendingSearches });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending searches' });
  }
});

// Recommendations endpoint
app.get('/recommendations', (req, res) => {
  try {
    const recommendations = [
      ...trendingSearches.slice(0, 8),
      ...commonSearches.slice(0, 7)
    ].slice(0, 15);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Search categories endpoint
app.get('/search-categories', (req, res) => {
  try {
    const categories = {
      "Popular": ["milf", "teen", "mature", "lesbian", "amateur"],
      "Ethnicity": ["asian", "ebony", "latina", "indian", "white"],
      "Body Types": ["bbw", "thick", "skinny", "big tits", "big ass"],
      "Categories": ["anal", "blowjob", "threesome", "hardcore", "softcore"],
      "Scenarios": ["office", "kitchen", "bedroom", "outdoor", "public"],
      "Fetish": ["bdsm", "feet", "lingerie", "cosplay", "latex"]
    };
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch search categories' });
  }
});

// Random search endpoint
app.get('/random-search', (req, res) => {
  try {
    const allTerms = [...commonSearches, ...trendingSearches];
    const randomTerm = allTerms[Math.floor(Math.random() * allTerms.length)];
    res.json({ term: randomTerm });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get random search term' });
  }
});

// Debug endpoint with better error handling
app.get('/debug-search', async (req, res) => {
  const query = req.query.q || req.query.query || '';
  
  if (!query) {
    return res.status(400).json({ error: 'No query provided.' });
  }

  const debugData = {};
  
  for (const name of confirmedWorkingScrapers) {
    if (!scrapers[name]) {
      debugData[name] = {
        error: 'Scraper not found',
        status: 'missing'
      };
      continue;
    }

    const scraper = scrapers[name];
    console.log(`Testing scraper: ${name}`);
    
    try {
      const startTime = Date.now();
      const results = await runScraperWithTimeout(scraper, query, 5000);
      const endTime = Date.now();
      
      debugData[name] = {
        totalResults: results?.length || 0,
        sampleTitles: results?.slice(0, 3).map(r => r.title) || [],
        status: 'success',
        responseTimeMs: endTime - startTime
      };
    } catch (e) {
      debugData[name] = {
        error: e.message,
        status: 'failed'
      };
    }
  }
  
  res.json({
    query,
    timestamp: new Date().toISOString(),
    debugData
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT. Graceful shutdown...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM. Graceful shutdown...');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Available scrapers: ${Object.keys(scrapers).length}`);
  console.log(`Confirmed working scrapers: ${confirmedWorkingScrapers.length}`);
  console.log(`Additional scrapers: ${additionalScrapers.length}`);
});
