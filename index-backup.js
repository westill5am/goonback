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
  const query = req.query.q || req.query.query || '';
  if (!query) return res.json({ results: [], error: 'No query provided.' });
  
  const startTime = Date.now();
  
  // Use all confirmed working scrapers
  const workingScrapersToUse = {};
  let scrapersLoaded = 0;
  
  confirmedWorkingScrapers.forEach(name => {
    if (scrapers[name] && typeof scrapers[name] === 'function') {
      workingScrapersToUse[name] = scrapers[name];
      scrapersLoaded++;
    } else {
      console.warn(`Confirmed scraper '${name}' not found or not a function`);
    }
  });

  // Add additional scrapers for more comprehensive results (avoid duplicates)
  additionalScrapers.forEach(name => {
    if (scrapers[name] && typeof scrapers[name] === 'function' && !workingScrapersToUse[name]) {
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
      timestamp: new Date().toISOString(),
      fetched: pagedResults.length,
      totalBeforeFilter: allResults.length
    }
  });
});

// Add common searches and trending searches
const commonSearches = [
  // Demographics & Age
  'mature', 'milf', 'teen', 'young', 'old', 'granny', 'cougar',
  
  // Ethnicity
  'black', 'white', 'asian', 'latina', 'indian', 'brown', 'ebony',
  
  // Body Types
  'bbw', 'thick', 'skinny', 'curvy', 'big ass', 'big tits', 'small tits',
  
  // Categories
  'amateur', 'hardcore', 'lesbian', 'threesome', 'orgy', 'gangbang',
  'anal', 'blowjob', 'handjob', 'facial', 'creampie', 'cumshot',
  
  // Fetish & Kink
  'bdsm', 'bondage', 'domination', 'submission', 'feet', 'pantyhose',
  'lingerie', 'stockings', 'latex', 'cosplay',
  
  // Animated & Fantasy
  'hentai', 'cartoon', 'anime', 'furry', 'monster',
  
  // Romantic & Sensual
  'romantic', 'sensual', 'massage', 'kissing', 'softcore',
  
  // Popular Terms
  'hot', 'sexy', 'beautiful', 'gorgeous', 'naughty', 'wild'
];
const trendingSearches = [
  // Current trending categories
  'stepmom', 'stepsis', 'teacher', 'nurse', 'secretary', 'maid',
  'wife', 'girlfriend', 'neighbor', 'babysitter', 'boss',
  
  // Popular scenarios
  'office', 'kitchen', 'bedroom', 'bathroom', 'car', 'outdoor',
  'public', 'hotel', 'vacation', 'party',
  
  // Trending styles
  'pov', 'virtual reality', 'interactive', 'cam girl', 'live',
  'compilation', 'highlights', 'best of', 'top rated'
];

app.get('/common-searches', (req, res) => {
  res.json({ commonSearches });
});

app.get('/trending-searches', (req, res) => {
  res.json({ trendingSearches });
});

// Add recommendations endpoint
app.get('/recommendations', (req, res) => {
  // Return a mix of common searches and trending searches as recommendations
  const recommendations = [
    ...trendingSearches.slice(0, 8),
    ...commonSearches.slice(0, 7)
  ].slice(0, 15);
  res.json(recommendations);
});

// Add search categories endpoint
app.get('/search-categories', (req, res) => {
  const categories = {
    "Popular": ["milf", "teen", "mature", "lesbian", "amateur"],
    "Ethnicity": ["asian", "ebony", "latina", "indian", "white"],
    "Body Types": ["bbw", "thick", "skinny", "big tits", "big ass"],
    "Categories": ["anal", "blowjob", "threesome", "hardcore", "softcore"],
    "Scenarios": ["office", "kitchen", "bedroom", "outdoor", "public"],
    "Fetish": ["bdsm", "feet", "lingerie", "cosplay", "latex"]
  };
  res.json(categories);
});

// Add random search endpoint
app.get('/random-search', (req, res) => {
  const allTerms = [...commonSearches, ...trendingSearches];
  const randomTerm = allTerms[Math.floor(Math.random() * allTerms.length)];
  res.json({ term: randomTerm });
});

// Debug endpoint to see raw data
// Debug endpoint to see raw data for each working scraper
app.get('/debug-search', async (req, res) => {
  const query = req.query.q || req.query.query || '';
  if (!query) return res.json({ error: 'No query provided.' });
  const debugData = {};
  // Iterate over the same scrapers used in /search
  for (const name of confirmedWorkingScrapers) {
    const scraper = scrapers[name];
    console.log(`Testing scraper: ${name}`);
    try {
      const results = await runScraperWithTimeout(scraper, query, 5000);
      debugData[name] = {
        totalResults: results?.length || 0,
        sampleTitles: results?.slice(0, 3).map(r => r.title) || [],
        status: 'success'
      };
    } catch (e) {
      debugData[name] = {
        error: e.message,
        status: 'failed'
      };
    }
  }
  res.json(debugData);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});