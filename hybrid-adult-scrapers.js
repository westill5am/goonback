
const axios = require('axios');
const cheerio = require('cheerio');

// New WebScrapingAPI key - replacing old ScraperAPI
const WEBSCRAPINGAPI_KEY = 'wH1WMxxJcUCEm3z2MPyMQJ9ISLVtiLLe';
const WEBSCRAPINGAPI_URL = 'https://api.webscrapingapi.com/v2';

// Counter for API usage tracking
let apiUsageCount = 0;
let directScrapingCount = 0;

// Direct scraping with proper headers and error handling
async function fetchDirectly(url, options = {}) {
  try {
    console.log(`🔄 Trying direct scraping for: ${url}`);
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
        ...options.headers
      },
      ...options
    });
    
    directScrapingCount++;
    console.log(`✅ Direct scraping successful for: ${url}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 503) {
      console.log(`❌ 503 Service Unavailable for: ${url} - Will try WebScrapingAPI`);
    } else if (error.response?.status === 403) {
      console.log(`❌ 403 Forbidden for: ${url} - Will try WebScrapingAPI`);
    } else if (error.response?.status === 429) {
      console.log(`❌ 429 Rate Limited for: ${url} - Will try WebScrapingAPI`);
    } else {
      console.log(`❌ Direct scraping failed for: ${url} - ${error.message} - Will try WebScrapingAPI`);
    }
    return null;
  }
}

// WebScrapingAPI fallback - Fixed with proper error handling
async function fetchWithWebScrapingAPI(url, options = {}) {
  try {
    console.log(`🔄 Using WebScrapingAPI for: ${url}`);
    
    // Build URL with parameters (like the curl example)
    const params = new URLSearchParams({
      api_key: WEBSCRAPINGAPI_KEY,
      url: url
    });
    
    const apiUrl = `${WEBSCRAPINGAPI_URL}?${params.toString()}`;
    
    const response = await axios.get(apiUrl, {
      timeout: 15000,  // Reduced timeout to prevent hanging
      headers: {
        'content-type': 'application/json'
      }
    });

    apiUsageCount++;
    console.log(`✅ WebScrapingAPI used successfully for: ${url} (Usage count: ${apiUsageCount})`);
    return response.data;
  } catch (error) {
    console.error(`❌ WebScrapingAPI failed for: ${url} - ${error.message}`);
    if (error.code === 'ECONNABORTED') {
      console.error(`⏰ WebScrapingAPI timeout - request took too long`);
    }
    return null;
  }
}

// Hybrid fetch function - tries direct first, then WebScrapingAPI
async function hybridFetch(url, options = {}) {
  console.log(`🔍 Starting hybrid fetch for: ${url}`);
  
  // Try direct scraping first
  let data = await fetchDirectly(url, options);
  
  // If direct scraping fails, try WebScrapingAPI
  if (!data) {
    console.log(`🔄 Direct scraping failed, trying WebScrapingAPI for: ${url}`);
    data = await fetchWithWebScrapingAPI(url, options.webscrapingapi || {});
  }
  
  return data;
}

// SpankBang hybrid scraper
async function scrapeSpankBangHybrid(query) {
  console.log(`🎯 Running SpankBang hybrid scraper with query: ${query}`);
  const url = `https://spankbang.com/s/${encodeURIComponent(query)}/`;
  
  const data = await hybridFetch(url);
  if (!data) {
    console.log(`❌ No data received for SpankBang query: ${query}`);
    return [];
  }
    const $ = cheerio.load(data);
  const results = [];

  // Try multiple approaches to find videos on SpankBang
  const selectors = [
    '.video-item',
    '.video-list .video-item', 
    '.thumb',
    '.video-box',
    '.video',
    'a[href*="/video/"]'
  ];
  // Use broader approach for SpankBang with improved filtering
  $('a[href*="/video/"], a[href*="/s/"]').each((index, element) => {
    const $el = $(element);
    const href = $el.attr('href');
    // Filter out ads, promos, premium, and non-video links
    if (
      href &&
      (href.includes('/video/') || href.includes('/s/')) &&
      !href.includes('ads') &&
      !href.includes('promo') &&
      !href.includes('premium') &&
      !href.includes('javascript') &&
      !href.includes('external') &&
      href.startsWith('/')
    ) {
      const title =
        $el.find('.n').text().trim() ||
        $el.find('.title').text().trim() ||
        $el.attr('title') ||
        $el.find('img').attr('alt') ||
        $el.text().trim();

      const thumbnail =
        $el.find('img').attr('data-src') ||
        $el.find('img').attr('src') ||
        $el.find('img').attr('data-original');

      if (
        title &&
        title.length > 3 &&
        title.length < 200 &&
        !title.includes('SpankBang') &&
        !title.toLowerCase().includes('ad') &&
        !title.toLowerCase().includes('promo') &&
        !title.toLowerCase().includes('premium')
      ) {
        const fullUrl = `https://spankbang.com${href}`;
        results.push({
          title: title.substring(0, 100),
          url: fullUrl,
          thumbnail: thumbnail || '',
          source: 'spankbang'
        });
      }
    }
  });

  console.log(`✅ SpankBang hybrid scraper found ${results.length} results`);
  return results;
}

// RedTube hybrid scraper
async function scrapeRedTubeHybrid(query) {
  console.log(`🎯 Running RedTube hybrid scraper with query: ${query}`);
  const url = `https://www.redtube.com/?search=${encodeURIComponent(query)}`;
  
  const data = await hybridFetch(url);
  if (!data) {
    console.log(`❌ No data received for RedTube query: ${query}`);
    return [];
  }
    const $ = cheerio.load(data);
  const results = [];

  // Try multiple selectors that RedTube might use
  const selectors = [
    '.video-item',
    '.video_link_container', 
    '.video-box',
    '.videoblock',
    '.thumb',
    '[data-id]',
    'a[href*="/"]'
  ];
  // Use a broader approach to find video links
  $('a[href*="/"]').each((index, element) => {
    const $el = $(element);
    const href = $el.attr('href');
    
    // Check if this looks like a video URL and filter out ads
    if (href && 
        /\/\d+/.test(href) && 
        !href.includes('category') && 
        !href.includes('tag') &&
        !href.includes('adtng.com') &&
        !href.includes('ads') &&
        !href.includes('promo') &&
        href.startsWith('/')) {
      
      const title = $el.find('img').attr('alt') || 
                   $el.attr('title') ||
                   $el.text().trim() ||
                   $el.find('.video_title, .title').text().trim();
      
      const thumbnail = $el.find('img').attr('data-thumb_url') || 
                       $el.find('img').attr('data-src') ||
                       $el.find('img').attr('src');

      if (title && 
          title.length > 3 && 
          title.length < 200 &&
          !title.includes('RedTube') &&
          !title.includes('Brazzers') &&
          !title.toLowerCase().includes('ad') &&
          !title.toLowerCase().includes('premium')) {
        
        const fullUrl = `https://www.redtube.com${href}`;
        results.push({
          title: title.substring(0, 100),
          url: fullUrl,
          thumbnail: thumbnail || '',
          source: 'redtube'
        });
      }
    }
  });

  console.log(`✅ RedTube hybrid scraper found ${results.length} results`);
  return results;
}

// Main search function
async function searchAllHybrid(query, scraperNames = ['spankbang', 'redtube']) {
  console.log(`🚀 Starting hybrid search for: "${query}" across ${scraperNames.length} scrapers`);
  console.log(`📊 Current stats - Direct: ${directScrapingCount}, API: ${apiUsageCount}`);
  
  const promises = scraperNames.map(async (scraperName) => {
    try {
      let results = [];
      
      if (scraperName === 'spankbang') {
        results = await scrapeSpankBangHybrid(query);
      } else if (scraperName === 'redtube') {
        results = await scrapeRedTubeHybrid(query);
      }
      
      return { scraper: scraperName, results, count: results.length };
    } catch (error) {
      console.error(`❌ Error in ${scraperName}:`, error.message);
      return { scraper: scraperName, results: [], count: 0, error: error.message };
    }
  });

  const allResults = await Promise.all(promises);
  
  // Combine and deduplicate results
  const combinedResults = [];
  const seenUrls = new Set();
  
  allResults.forEach(({ scraper, results, count, error }) => {
    if (error) {
      console.log(`❌ ${scraper}: ERROR - ${error}`);
    } else {
      console.log(`✅ ${scraper}: ${count} results`);
    }
    
    results.forEach(result => {
      if (!seenUrls.has(result.url)) {
        seenUrls.add(result.url);
        combinedResults.push(result);
      }
    });
  });

  console.log(`📊 Final stats - Direct: ${directScrapingCount}, API: ${apiUsageCount}`);
  console.log(`🎯 Total unique results: ${combinedResults.length}`);
  
  return {
    results: combinedResults,
    stats: {
      directCount: directScrapingCount,
      apiCount: apiUsageCount,
      totalResults: combinedResults.length,
      scraperStats: allResults
    }
  };
}

// Get usage statistics
function getUsageStats() {
  return {
    directScrapingCount,
    apiUsageCount,
    totalRequests: directScrapingCount + apiUsageCount,
    apiUsagePercentage: (directScrapingCount + apiUsageCount) > 0 ? 
      (apiUsageCount / (directScrapingCount + apiUsageCount) * 100) : 0
  };
}

// Reset counters
function resetCounters() {
  directScrapingCount = 0;
  apiUsageCount = 0;
  console.log('🔄 Counters reset');
}

module.exports = {
  searchAllHybrid,
  scrapeSpankBangHybrid,
  scrapeRedTubeHybrid,
  hybridFetch,
  getUsageStats,
  resetCounters
};
