const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8000;
const scrapers = require('./working-scrapers.js');

// Simple in-memory cache for search results
const cache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Performance tracking
const performanceStats = {
  totalSearches: 0,
  cacheHits: 0,
  cacheMisses: 0,
  averageResponseTime: 0,
  fastScraperStats: {},
  mediumScraperStats: {},
  backgroundScraperStats: {},
  searchTimes: []
};

// Search analytics tracking for dynamic trending
const searchAnalytics = {
  searchHistory: new Map(), // term -> { count, lastSearched, firstSearched }
  hourlyStats: new Map(),   // hour -> { searches: Map(term -> count) }
  dailyStats: new Map(),    // date -> { searches: Map(term -> count) }
  maxHistorySize: 10000     // Keep top 10k searched terms
};

// Function to track search analytics
function trackSearch(query) {
  const term = query.toLowerCase().trim();
  const now = Date.now();
  const hour = new Date(now).getHours();
  const date = new Date(now).toDateString();
  
  // Update overall search history
  if (searchAnalytics.searchHistory.has(term)) {
    const stats = searchAnalytics.searchHistory.get(term);
    stats.count++;
    stats.lastSearched = now;
  } else {
    searchAnalytics.searchHistory.set(term, {
      count: 1,
      firstSearched: now,
      lastSearched: now
    });
  }
  
  // Update hourly stats
  if (!searchAnalytics.hourlyStats.has(hour)) {
    searchAnalytics.hourlyStats.set(hour, { searches: new Map() });
  }
  const hourlySearches = searchAnalytics.hourlyStats.get(hour).searches;
  hourlySearches.set(term, (hourlySearches.get(term) || 0) + 1);
  
  // Update daily stats
  if (!searchAnalytics.dailyStats.has(date)) {
    searchAnalytics.dailyStats.set(date, { searches: new Map() });
  }
  const dailySearches = searchAnalytics.dailyStats.get(date).searches;
  dailySearches.set(term, (dailySearches.get(term) || 0) + 1);
  
  // Cleanup old data if needed
  if (searchAnalytics.searchHistory.size > searchAnalytics.maxHistorySize) {
    cleanupAnalytics();
  }
}

// Function to clean up old analytics data
function cleanupAnalytics() {
  // Convert to array, sort by count, keep top entries
  const entries = Array.from(searchAnalytics.searchHistory.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, searchAnalytics.maxHistorySize * 0.8); // Keep 80% of max size
  
  searchAnalytics.searchHistory.clear();
  entries.forEach(([term, stats]) => {
    searchAnalytics.searchHistory.set(term, stats);
  });
  
  console.log(`🧹 Cleaned analytics data, kept ${entries.length} terms`);
}

// Function to get dynamic trending searches
function getDynamicTrendingSearches() {
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);
  const oneDayAgo = now - (24 * 60 * 60 * 1000);
  
  // Get recent searches (last hour + last day with different weights)
  const recentTrends = new Map();
  
  // Weight recent searches higher
  for (const [term, stats] of searchAnalytics.searchHistory.entries()) {
    if (stats.lastSearched > oneHourAgo) {
      // Recent searches get higher weight
      recentTrends.set(term, (stats.count * 3) + (recentTrends.get(term) || 0));
    } else if (stats.lastSearched > oneDayAgo) {
      // Day-old searches get normal weight
      recentTrends.set(term, stats.count + (recentTrends.get(term) || 0));
    }
  }
  
  // Sort by weighted score and filter out common searches
  const trending = Array.from(recentTrends.entries())
    .filter(([term]) => !commonSearches.includes(term)) // Exclude common searches
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([term]) => term);
  
  // If we don't have enough dynamic trends, fill with fallback trending
  if (trending.length < 6) {
    const fallbackTrending = ['big tits', 'amateur', 'stepmom', 'pawg', 'onlyfans', 'cam girl', 'thicc', 'blowjob'];
    const needed = 8 - trending.length;
    const fallbacks = fallbackTrending
      .filter(term => !trending.includes(term) && !commonSearches.includes(term))
      .slice(0, needed);
    trending.push(...fallbacks);
  }
  
  return trending.slice(0, 8);
}

// Response compression middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: ['http://localhost:8000', 'https://goonerbrain.com'],
  credentials: true
}));
app.use(express.static('templates'));

// Performance tracking helper function
function updatePerformanceStats(responseTime) {
  performanceStats.searchTimes.push(responseTime);
  
  // Keep only last 100 response times for rolling average
  if (performanceStats.searchTimes.length > 100) {
    performanceStats.searchTimes = performanceStats.searchTimes.slice(-100);
  }
  
  // Calculate average response time
  performanceStats.averageResponseTime = Math.round(
    performanceStats.searchTimes.reduce((sum, time) => sum + time, 0) / performanceStats.searchTimes.length
  );
}

// Cache warming function - preload popular searches on startup
async function warmCache() {
  console.log('🔥 Starting cache warming with popular searches...');
  const popularQueries = [...commonSearches.slice(0, 2), ...trendingSearches.slice(0, 2)];
  
  for (const query of popularQueries) {
    try {
      console.log(`Warming cache for: ${query}`);
      // Simulate a search request to populate cache
      const fastScrapers = {
        'pornhub': scrapers['pornhub'],
        '3movs': scrapers['3movs'],
        'tubedupe': scrapers['tubedupe']
      };
      
      const results = await Promise.allSettled(
        Object.entries(fastScrapers).map(async ([name, scraper]) => {
          try {
            const results = await runScraperWithTimeout(scraper, query, 8000);
            return { name, results: results || [] };
          } catch (e) {
            return { name, results: [] };
          }
        })
      );
      
      let allResults = [];
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.results.length > 0) {
          allResults = allResults.concat(result.value.results.map(r => ({
            ...r,
            source: result.value.name
          })));
        }
      });
      
      if (allResults.length > 0) {
        const uniqueResults = deduplicateResults(allResults);
        cache.set(query.toLowerCase().trim(), {
          results: uniqueResults,
          timestamp: Date.now()
        });
        console.log(`✅ Cached ${uniqueResults.length} results for: ${query}`);
      }
      
      // Small delay between requests to avoid overwhelming servers
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.log(`❌ Failed to warm cache for ${query}: ${error.message}`);
    }
  }
  console.log('🔥 Cache warming completed');
}

// Utility function to clean cache periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key);
    }
  }
}, 60000); // Clean every minute

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/templates/index.html');
});

// Health check endpoint for cPanel
app.get('/health', (req, res) => {
  res.status(200).type('text/plain').send('OK');
});

// Enhanced search endpoint with comprehensive performance tracking and caching
app.get('/search', async (req, res) => {
  const startTime = Date.now();
  const query = req.query.q || req.query.query || '';
  if (!query) return res.json({ results: [], error: 'No query provided.' });
  
  // Track search analytics
  trackSearch(query);
  
  // Update performance stats
  performanceStats.totalSearches++;
  
  const cacheKey = query.toLowerCase().trim();
  const now = Date.now();
  
  // Check cache first
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (now - cached.timestamp < CACHE_DURATION) {
      performanceStats.cacheHits++;
      console.log(`Cache hit for: ${query}`);
      
      const skip = parseInt(req.query.skip, 10) || 0;
      const results = cached.results.slice(skip, skip + 100); // Return 100 at a time
        const responseTime = Date.now() - startTime;
      updatePerformanceStats(responseTime);
      
      return res.json({
        results,
        totalCount: cached.results.length,
        nextSkip: skip + results.length,
        cached: true,
        performance: {
          responseTimeMs: responseTime,
          source: 'cache',
          cacheAge: Math.round((now - cached.timestamp) / 1000)
        },
        debug: {
          query,
          timestamp: new Date().toISOString(),
          fetched: results.length,
          totalCached: cached.results.length,
          responseTimeMs: responseTime
        }
      });
    } else {
      cache.delete(cacheKey);
    }
  }
  
  // Cache miss - track scraper performance
  performanceStats.cacheMisses++;
  const scraperStartTime = Date.now();
    // Fast scrapers that typically respond quickly
  const fastScrapers = {
    'pornhub': scrapers['pornhub'],
    '3movs': scrapers['3movs'],
    'tubedupe': scrapers['tubedupe'],
    'drtuber': scrapers['drtuber'],
    'extremetube': scrapers['extremetube']
  };
  
  // Slower but reliable scrapers
  const mediumScrapers = {
    'hentaigasm': scrapers['hentaigasm'],
    'porndoe': scrapers['porndoe'],
    'eporner': scrapers['eporner'],
    'empflix': scrapers['empflix'],
    'fuq': scrapers['fuq']
  };
  
  // Additional background scrapers for maximum results
  const backgroundScrapers = {
    'faphouse': scrapers['faphouse'],
    'fapvid': scrapers['fapvid'],
    'xvideos': scrapers['xvideos'],
    'pornovideoshub': scrapers['pornovideoshub'],
    'gaytube': scrapers['gaytube'],
    'ashemaletube': scrapers['ashemaletube']
  };
  
  let allResults = [];
  console.log('=== NEW SEARCH REQUEST ===');
  console.log('Query:', query);

  try {
    // First, get results from fast scrapers (5 second timeout)
    const fastResults = await Promise.allSettled(
      Object.entries(fastScrapers).map(async ([name, scraper]) => {
        console.log(`Fast scraper: ${name}`);
        try {
          const results = await runScraperWithTimeout(scraper, query, 5000);
          return { name, results: results || [] };
        } catch (e) {
          console.log(`${name}: Error - ${e.message}`);
          return { name, results: [] };
        }
      })
    );

    // Process fast results
    fastResults.forEach(result => {
      if (result.status === 'fulfilled' && result.value.results.length > 0) {
        allResults = allResults.concat(result.value.results.map(r => ({
          ...r,
          source: result.value.name
        })));
        console.log(`${result.value.name}: Added ${result.value.results.length} results`);
      }
    });    // If we have enough results from fast scrapers, send partial response
    if (allResults.length >= 15) {
      const uniqueResults = deduplicateResults(allResults);
      
      // Continue with slower scrapers in background for more results
      Promise.allSettled([
        // Medium scrapers
        ...Object.entries(mediumScrapers).map(async ([name, scraper]) => {
          try {
            const results = await runScraperWithTimeout(scraper, query, 15000);
            if (results && results.length > 0) {
              const newResults = results.map(r => ({ ...r, source: name }));
              const existingResults = cache.get(cacheKey)?.results || uniqueResults;
              const combinedResults = deduplicateResults([...existingResults, ...newResults]);
              
              // Update cache with combined results
              cache.set(cacheKey, {
                results: combinedResults,
                timestamp: Date.now()
              });
              console.log(`Background ${name}: Added ${results.length} results to cache`);
            }
          } catch (e) {
            console.log(`Background ${name}: Error - ${e.message}`);
          }
        }),
        // Background scrapers for maximum coverage
        ...Object.entries(backgroundScrapers).map(async ([name, scraper]) => {
          try {
            const results = await runScraperWithTimeout(scraper, query, 20000);
            if (results && results.length > 0) {
              const newResults = results.map(r => ({ ...r, source: name }));
              const existingResults = cache.get(cacheKey)?.results || uniqueResults;
              const combinedResults = deduplicateResults([...existingResults, ...newResults]);
              
              // Update cache with combined results
              cache.set(cacheKey, {
                results: combinedResults,
                timestamp: Date.now()
              });
              console.log(`Background ${name}: Added ${results.length} results to cache`);
            }
          } catch (e) {
            console.log(`Background ${name}: Error - ${e.message}`);
          }
        })
      ]);      // Cache current results
      cache.set(cacheKey, {
        results: uniqueResults,
        timestamp: now
      });      const skip = parseInt(req.query.skip, 10) || 0;
      const pagedResults = uniqueResults.slice(skip, skip + 100); // Increased from 50 to 100

      const responseTime = Date.now() - startTime;
      updatePerformanceStats(responseTime);

      return res.json({
        results: pagedResults,
        totalCount: uniqueResults.length,
        nextSkip: skip + pagedResults.length,
        partial: true,
        performance: {
          responseTimeMs: responseTime,
          source: 'fast_scrapers',
          scrapersUsed: fastScrapers.length
        },
        debug: {
          query,
          timestamp: new Date().toISOString(),
          fetched: pagedResults.length,
          totalBeforeFilter: allResults.length,
          uniqueTotal: uniqueResults.length,
          responseTimeMs: responseTime
        }
      });
    }

    // If not enough results from fast scrapers, wait for medium scrapers too
    const mediumResults = await Promise.allSettled(
      Object.entries(mediumScrapers).map(async ([name, scraper]) => {
        console.log(`Medium scraper: ${name}`);
        try {
          const results = await runScraperWithTimeout(scraper, query, 15000);
          return { name, results: results || [] };
        } catch (e) {
          console.log(`${name}: Error - ${e.message}`);
          return { name, results: [] };
        }
      })
    );

    // Process medium results
    mediumResults.forEach(result => {
      if (result.status === 'fulfilled' && result.value.results.length > 0) {
        allResults = allResults.concat(result.value.results.map(r => ({
          ...r,
          source: result.value.name
        })));
        console.log(`${result.value.name}: Added ${result.value.results.length} results`);
      }
    });

    const uniqueResults = deduplicateResults(allResults);
    
    // Cache results
    cache.set(cacheKey, {
      results: uniqueResults,
      timestamp: now
    });

    console.log(`Final result count: ${allResults.length}`);
    console.log(`Unique result count after deduplication: ${uniqueResults.length}`);    // Add performance headers
    res.set({
      'Cache-Control': 'public, max-age=300', // 5 minutes
      'ETag': `"${cacheKey}-${uniqueResults.length}"`
    });    const skip = parseInt(req.query.skip, 10) || 0;
    const pagedResults = uniqueResults.slice(skip, skip + 100); // Increased from 50 to 100

    const responseTime = Date.now() - startTime;
    updatePerformanceStats(responseTime);

    res.json({
      results: pagedResults,
      totalCount: uniqueResults.length,
      nextSkip: skip + pagedResults.length,
      performance: {
        responseTimeMs: responseTime,
        source: 'full_search',
        scrapersUsed: Object.keys(fastScrapers).length + Object.keys(mediumScrapers).length
      },
      debug: {
        query,
        timestamp: new Date().toISOString(),
        fetched: pagedResults.length,
        totalBeforeFilter: allResults.length,
        uniqueTotal: uniqueResults.length,
        responseTimeMs: responseTime
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Search failed',
      results: [],
      debug: { error: error.message }
    });
  }
});

// AI-Powered Search Recommendations
app.get('/recommendations', (req, res) => {
  const userHistory = Array.from(searchAnalytics.searchHistory.entries());
  const recommendations = userHistory
    .sort((a, b) => b[1].count - a[1].count) // Sort by popularity
    .slice(0, 5) // Top 5 terms
    .map(([term]) => term);

  res.json(recommendations);
});

// Content Quality Ratings
const ratings = new Map(); // term -> { totalRating, ratingCount }
app.post('/rate', (req, res) => {
  const { term, rating } = req.body;
  if (!term || !rating || rating < 1 || rating > 5) {
    return res.status(400).send('Invalid rating');
  }

  if (!ratings.has(term)) {
    ratings.set(term, { totalRating: 0, ratingCount: 0 });
  }

  const termRatings = ratings.get(term);
  termRatings.totalRating += rating;
  termRatings.ratingCount++;

  res.send('Rating submitted');
});

// Filter results from hentaigasm scraper
function filterHentaigasmResults(results) {
  const allowedKeywords = ["hentai", "hentia", "henti", "hentii", "anime", "cartoon", "rule34", "animation", "family guy", "toons", "south park", "show"];
  return results.filter(result => {
    return allowedKeywords.some(keyword => result.title.toLowerCase().includes(keyword));
  });
}

// Modify scraper logic to apply filter
async function runScraperWithTimeout(scraper, query, timeout) {
  try {
    const results = await scraper(query, timeout);
    if (scraper.name === 'hentaigasm') {
      return filterHentaigasmResults(results);
    }
    return results;
  } catch (error) {
    console.error(`Error running scraper ${scraper.name}:`, error);
    return [];
  }
}

// Utility function to deduplicate results
function deduplicateResults(results) {
  const uniqueResults = [];
  const seenUrls = new Set();
  const seenTitles = new Set();
  
  for (const item of results) {
    const urlKey = item.url?.toLowerCase() || '';
    const titleKey = item.title?.toLowerCase().substring(0, 50) || '';
    
    if (urlKey && !seenUrls.has(urlKey) && !seenTitles.has(titleKey)) {
      seenUrls.add(urlKey);
      seenTitles.add(titleKey);
      uniqueResults.push(item);
    }
  }
  
  return uniqueResults;
}

// Ultra-limited common searches - only the 4 most universally popular terms globally
const commonSearches = [
  'milf', 'teen', 'anal', 'lesbian'
];

// Store all the detailed search terms in categories for the categories page
const searchCategories = {
  demographics: [
    'mature', 'milf', 'teen', 'young', 'old', 'granny', 'cougar', 'mom', 'mommy', 'mother',
    'daughter', 'sister', 'aunt', 'niece', 'grandmother', 'stepmom', 'stepsis', 'stepdaughter'
  ],
  ethnicity: [
    'black', 'white', 'asian', 'latina', 'indian', 'brown', 'ebony', 'african', 'chinese', 'japanese',
    'korean', 'thai', 'vietnamese', 'filipino', 'arab', 'middle eastern', 'mexican', 'brazilian',
    'colombian', 'argentinian', 'spanish', 'italian', 'french', 'german', 'russian', 'polish',
    'czech', 'hungarian', 'british', 'irish', 'scandinavian', 'dutch', 'turkish', 'persian'
  ],
  bodyTypes: [
    'bbw', 'thick', 'skinny', 'curvy', 'big ass', 'big tits', 'small tits', 'huge tits', 'natural tits',
    'fake tits', 'big boobs', 'small boobs', 'perky tits', 'saggy tits', 'big nipples', 'puffy nipples',
    'big butt', 'round ass', 'tight ass', 'fat ass', 'bubble butt', 'pawg', 'slim', 'petite',
    'tall', 'short', 'muscular', 'fit', 'athletic', 'chubby', 'plump', 'voluptuous', 'busty',
    'flat chest', 'hairy', 'shaved', 'trimmed', 'landing strip', 'bald pussy', 'hairy pussy'
  ],
  hairEyes: [
    'blonde', 'brunette', 'redhead', 'black hair', 'brown hair', 'gray hair', 'silver hair',
    'short hair', 'long hair', 'curly hair', 'straight hair', 'ponytail', 'pigtails',
    'blue eyes', 'brown eyes', 'green eyes', 'hazel eyes', 'gray eyes'
  ],
  categories: [
    'amateur', 'hardcore', 'lesbian', 'threesome', 'orgy', 'gangbang', 'group sex', 'foursome',
    'anal', 'blowjob', 'handjob', 'facial', 'creampie', 'cumshot', 'oral', 'deepthroat',
    'titfuck', 'footjob', 'rimjob', 'fingering', 'masturbation', 'solo', 'mutual masturbation',
    'missionary', 'doggy style', 'cowgirl', 'reverse cowgirl', 'sideways', 'standing',
    'double penetration', 'triple penetration', 'fisting', 'squirting', 'gaping'
  ],
  fetish: [
    'bdsm', 'bondage', 'domination', 'submission', 'slave', 'master', 'mistress', 'dom', 'sub',
    'feet', 'foot worship', 'pantyhose', 'stockings', 'nylons', 'lingerie', 'latex', 'leather',
    'rubber', 'pvc', 'spandex', 'cosplay', 'roleplay', 'uniform', 'schoolgirl', 'nurse',
    'maid', 'secretary', 'teacher', 'cop', 'doctor', 'cheerleader', 'waitress'
  ],
  toys: [
    'dildo', 'vibrator', 'butt plug', 'strap on', 'sex machine', 'fucking machine',
    'glass dildo', 'big dildo', 'double dildo', 'realistic dildo', 'rabbit vibrator'
  ],
  locations: [
    'bedroom', 'bathroom', 'kitchen', 'living room', 'office', 'car', 'public', 'outdoor',
    'beach', 'pool', 'shower', 'bathtub', 'hotel', 'motel', 'vacation', 'party',
    'club', 'bar', 'restaurant', 'gym', 'locker room', 'changing room', 'library',
    'classroom', 'hospital', 'prison', 'park', 'forest', 'camping', 'boat', 'plane'
  ],
  relationships: [
    'wife', 'husband', 'girlfriend', 'boyfriend', 'ex girlfriend', 'ex wife', 'neighbor',
    'babysitter', 'boss', 'employee', 'coworker', 'student', 'professor', 'tutor',
    'landlord', 'tenant', 'roommate', 'friend', 'stranger', 'delivery guy', 'plumber',
    'electrician', 'mechanic', 'doctor', 'patient', 'therapist', 'masseuse', 'trainer'
  ],
  fantasy: [
    'hentai', 'cartoon', 'anime', 'manga', 'furry', 'monster', 'alien', 'demon', 'angel',
    'vampire', 'werewolf', 'zombie', 'robot', 'cyborg', 'superhero', 'superheroine'
  ],
  names: [
    'mia', 'lisa', 'sara', 'anna', 'jessica', 'ashley', 'nicole', 'rachel', 'stephanie',
    'jennifer', 'amanda', 'melissa', 'michelle', 'christina', 'samantha', 'tiffany',
    'brittany', 'vanessa', 'rebecca', 'laura', 'maria', 'elizabeth', 'victoria', 'natasha'
  ],
  timing: [
    'morning', 'afternoon', 'evening', 'night', 'midnight', 'first time', 'last time',
    'daily', 'weekly', 'multiple times', 'all day', 'all night', 'quick', 'slow'
  ],
  emotions: [
    'romantic', 'sensual', 'passionate', 'rough', 'gentle', 'wild', 'crazy', 'kinky',
    'naughty', 'dirty', 'nasty', 'slutty', 'innocent', 'shy', 'confident', 'aggressive',
    'submissive', 'dominant', 'horny', 'wet', 'tight', 'loose', 'experienced', 'inexperienced'
  ],
  descriptors: [
    'hot', 'sexy', 'beautiful', 'gorgeous', 'stunning', 'amazing', 'incredible', 'perfect',
    'cute', 'sweet', 'lovely', 'attractive', 'pretty', 'handsome', 'muscular', 'ripped',
    'toned', 'soft', 'smooth', 'silky', 'creamy', 'juicy', 'delicious', 'tasty'
  ],
  clothing: [
    'naked', 'nude', 'topless', 'bottomless', 'dress', 'skirt', 'jeans', 'shorts', 'bikini',
    'swimsuit', 'underwear', 'bra', 'panties', 'thong', 'g-string', 'boyshorts', 'briefs',
    'boxers', 'pajamas', 'nightgown', 'robe', 'towel', 'heels', 'boots', 'sandals'
  ],
  technology: [
    'webcam', 'cam girl', 'camshow', 'live', 'streaming', 'video call', 'sexting',
    'phone sex', 'virtual reality', 'vr', 'interactive', 'pov', 'point of view',
    '360 degree', '4k', 'hd', 'ultra hd', 'high quality', 'premium'
  ],
  collections: [
    'compilation', 'best of', 'top rated', 'most viewed', 'most popular', 'trending',
    'new', 'latest', 'recent', 'classic', 'vintage', 'retro', 'old school',
    'highlights', 'scenes', 'clips', 'moments', 'collection', 'playlist'
  ],
  seasonal: [
    'christmas', 'halloween', 'valentine', 'new year', 'birthday', 'anniversary',
    'spring', 'summer', 'fall', 'winter', 'vacation', 'holiday', 'weekend'
  ],
  sizes: [
    'small', 'medium', 'large', 'extra large', 'huge', 'giant', 'massive', 'tiny',
    'mini', 'micro', 'macro', 'big', 'little', 'long', 'short', 'wide', 'narrow',
    'thick', 'thin', 'fat', 'slim', 'petite', 'tall', 'average'
  ],
  colors: [
    'pink', 'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'black', 'white',
    'brown', 'tan', 'pale', 'dark', 'light', 'bright', 'colorful', 'rainbow'
  ],
  numbers: [
    'one', 'two', 'three', 'four', 'five', 'multiple', 'many', 'few', 'several',
    'double', 'triple', 'quadruple', 'single', 'pair', 'couple', 'group', 'crowd'
  ],
  explicit: [
    'pussy', 'cock', 'dick', 'penis', 'vagina', 'tits', 'boobs', 'ass', 'butt',
    'sex', 'fuck', 'fucking', 'sucking', 'licking', 'riding', 'penetration',
    'insertion', 'stimulation', 'pleasure', 'orgasm', 'climax', 'cum', 'cumming'
  ],
  niches: [
    'interracial', 'gay', 'bisexual', 'transgender', 'shemale', 'ladyboy',
    'crossdresser', 'femboy', 'sissy', 'cuckold', 'hotwife', 'swinger',
    'bukkake', 'gokkun', 'creampie eating', 'snowballing', 'dp', 'dvp', 'dap'
  ]
};

const trendingSearches = [
  // Current trending/popular terms (limited to 8 most relevant)
  'big tits', 'amateur', 'stepmom', 'pawg', 'onlyfans', 'cam girl', 'thicc', 'blowjob'
];

app.get('/common-searches', (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  res.json({ commonSearches });
});

// Dynamic trending searches endpoint
app.get('/trending-searches', (req, res) => {
  const trendingSearches = getDynamicTrendingSearches();
  res.json(trendingSearches);
});

app.get('/search-categories', (req, res) => {
  res.set('Cache-Control', 'public, max-age=7200'); // Cache for 2 hours
  res.json({ categories: searchCategories });
});

// New endpoint for random search terms (for auto-search functionality)
app.get('/random-search', (req, res) => {
  res.set('Cache-Control', 'no-cache'); // Don't cache random results
  
  // Combine common searches and some popular category terms for variety
  const allTerms = [
    ...commonSearches,
    ...Object.values(searchCategories).flat().slice(0, 50) // Add first 50 terms from categories
  ];
  
  // Remove duplicates
  const uniqueTerms = [...new Set(allTerms)];
  
  // Select random term
  const randomTerm = uniqueTerms[Math.floor(Math.random() * uniqueTerms.length)];
  
  res.json({ 
    randomTerm,
    timestamp: new Date().toISOString(),
    totalAvailable: uniqueTerms.length
  });
});

// New endpoint for search analytics (for admin/debugging)
app.get('/search-analytics', (req, res) => {
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);
  const oneDayAgo = now - (24 * 60 * 60 * 1000);
  
  // Get top searches in different time periods
  const topAllTime = Array.from(searchAnalytics.searchHistory.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([term, stats]) => ({ term, count: stats.count, lastSearched: new Date(stats.lastSearched) }));
  
  const topRecent = Array.from(searchAnalytics.searchHistory.entries())
    .filter(([, stats]) => stats.lastSearched > oneHourAgo)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([term, stats]) => ({ term, count: stats.count, lastSearched: new Date(stats.lastSearched) }));
  
  res.json({
    analytics: {
      totalUniqueSearches: searchAnalytics.searchHistory.size,
      totalSearchCount: Array.from(searchAnalytics.searchHistory.values()).reduce((sum, stats) => sum + stats.count, 0),
      topAllTime,
      topRecentHour: topRecent,
      performance: {
        totalSearches: performanceStats.totalSearches,
        cacheHitRate: performanceStats.totalSearches > 0 ? (performanceStats.cacheHits / performanceStats.totalSearches * 100).toFixed(2) + '%' : '0%',
        averageResponseTime: performanceStats.averageResponseTime
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Optimized scraper timeout function
const runScraperWithTimeout = async (scraper, query, timeoutMs = 15000) => {
  return Promise.race([
    scraper(query),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    )
  ]);
};

// Fast debug endpoint
app.get('/debug-search', async (req, res) => {
  const query = req.query.q || req.query.query || '';
  if (!query) return res.json({ error: 'No query provided.' });

  const workingScrapers = ['3movs', 'pornhub', 'hentaigasm', 'porndoe', 'tubedupe'];
  const debugData = {};
  
  const results = await Promise.allSettled(
    workingScrapers.map(async (name) => {
      const scraper = scrapers[name];
      console.log(`Testing scraper: ${name}`);
      try {
        const results = await runScraperWithTimeout(scraper, query, 5000);
        return {
          name,
          totalResults: results?.length || 0,
          sampleTitles: results?.slice(0, 3).map(r => r.title) || [],
          status: 'success'
        };
      } catch (e) {
        return {
          name,
          error: e.message,
          status: 'failed'
        };
      }
    })
  );

  results.forEach(result => {
    if (result.status === 'fulfilled') {
      debugData[result.value.name] = {
        totalResults: result.value.totalResults,
        sampleTitles: result.value.sampleTitles,
        status: result.value.status
      };
    } else {
      debugData['unknown'] = {
        error: result.reason?.message || 'Unknown error',
        status: 'failed'
      };
    }
  });

  res.json(debugData);
});

// Cache status endpoint
app.get('/cache-status', (req, res) => {
  const cacheStats = {
    totalEntries: cache.size,
    entries: Array.from(cache.keys()).map(key => ({
      query: key,
      resultCount: cache.get(key).results.length,
      timestamp: new Date(cache.get(key).timestamp).toISOString(),
      ageMinutes: Math.round((Date.now() - cache.get(key).timestamp) / 60000)
    }))
  };
  res.json(cacheStats);
});

// Performance statistics endpoint
app.get('/performance-stats', (req, res) => {
  const stats = {
    ...performanceStats,
    cacheHitRatio: performanceStats.totalSearches > 0 
      ? Math.round((performanceStats.cacheHits / performanceStats.totalSearches) * 100) 
      : 0,
    cacheMissRatio: performanceStats.totalSearches > 0 
      ? Math.round((performanceStats.cacheMisses / performanceStats.totalSearches) * 100) 
      : 0,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    activeCache: cache.size,
    timestamp: new Date().toISOString()
  };
  res.json(stats);
});

// Search status endpoint for specific queries
app.get('/search-status/:query', (req, res) => {
  const query = req.params.query.toLowerCase().trim();
  const cached = cache.get(query);
  
  if (cached) {
    res.json({
      query: req.params.query,
      cached: true,
      resultCount: cached.results.length,
      cacheAge: Math.round((Date.now() - cached.timestamp) / 1000),
      cacheAgeMinutes: Math.round((Date.now() - cached.timestamp) / 60000),
      expires: new Date(cached.timestamp + CACHE_DURATION).toISOString(),
      status: 'ready'
    });
  } else {
    res.json({
      query: req.params.query,
      cached: false,
      status: 'not_cached',
      message: 'Query not in cache - will require fresh search'
    });
  }
});

// New endpoint to show scraper status and optimization
app.get('/scraper-status', (req, res) => {
  const fastScrapers = ['pornhub', '3movs', 'tubedupe', 'drtuber', 'extremetube'];
  const mediumScrapers = ['hentaigasm', 'porndoe', 'eporner', 'empflix', 'fuq'];
  const backgroundScrapers = ['faphouse', 'fapvid', 'xvideos', 'pornovideoshub', 'gaytube', 'ashemaletube'];
  
  res.json({
    optimization: 'Maximum Result Search',
    configuration: {
      fastScrapers: {
        count: fastScrapers.length,
        names: fastScrapers,
        timeout: '5 seconds',
        description: 'Quick response scrapers for immediate results'
      },
      mediumScrapers: {
        count: mediumScrapers.length,
        names: mediumScrapers,
        timeout: '15 seconds',
        description: 'Reliable scrapers for comprehensive results'
      },
      backgroundScrapers: {
        count: backgroundScrapers.length,
        names: backgroundScrapers,
        timeout: '20 seconds',
        description: 'Additional scrapers for maximum coverage'
      }
    },
    totalScrapers: fastScrapers.length + mediumScrapers.length + backgroundScrapers.length,
    strategy: 'Multi-tier parallel execution with background processing',
    resultsPerPage: 100,
    caching: '10 minutes with auto-cleanup'
  });
});

app.listen(PORT, async () => {
  console.log(`🚀 Optimized GoonerBrain server listening on port ${PORT}`);
  console.log(`🗄️  Cache duration: ${CACHE_DURATION / 60000} minutes`);
  console.log(`⚡ Performance tracking: Enabled`);
  console.log(`📊 Scraper configuration: 16 total (5 fast + 5 medium + 6 background)`);
  console.log(`📄 Results per page: 100`);
  
  // Start cache warming in background after server starts
  setTimeout(() => {
    warmCache().catch(err => {
      console.error('Cache warming failed:', err.message);
    });
  }, 2000); // Wait 2 seconds after server start
});
