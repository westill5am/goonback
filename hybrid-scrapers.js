// HYBRID SCRAPERS - Direct scraping with WebScrapingAPI fallback
// Uses direct scraping first, only calls WebScrapingAPI if direct fails
// API Key: gk299us95BHUeOrimJEGU54QASIOXjXw

const axios = require('axios');
const cheerio = require('cheerio');

// WebScrapingAPI configuration
const WEBSCRAPINGAPI_KEY = 'gk299us95BHUeOrimJEGU54QASIOXjXw';
const WEBSCRAPINGAPI_BASE = 'https://api.webscrapingapi.com/v1';

// Rate limiting for API calls
let apiCallCount = 0;
let lastApiReset = Date.now();
const API_RATE_LIMIT = 1000; // Max calls per hour for free tier
const API_RESET_INTERVAL = 3600000; // 1 hour in milliseconds

function canUseAPI() {
  const now = Date.now();
  if (now - lastApiReset > API_RESET_INTERVAL) {
    apiCallCount = 0;
    lastApiReset = now;
  }
  return apiCallCount < API_RATE_LIMIT;
}

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// Fallback function using WebScrapingAPI
async function fetchWithAPI(url, retries = 2) {
  if (!canUseAPI()) {
    throw new Error('API rate limit exceeded');
  }

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`🌐 Using WebScrapingAPI for: ${url} (attempt ${attempt + 1})`);
      
      const response = await axios.get(WEBSCRAPINGAPI_BASE, {
        params: {
          api_key: WEBSCRAPINGAPI_KEY,
          url: url,
          render_js: 1,
          timeout: 10000
        },
        timeout: 15000
      });

      apiCallCount++;
      console.log(`✓ WebScrapingAPI success. Calls used: ${apiCallCount}/${API_RATE_LIMIT}`);
      
      return response.data;
    } catch (error) {
      console.error(`❌ WebScrapingAPI attempt ${attempt + 1} failed:`, error.message);
      if (attempt === retries - 1) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s between retries
    }
  }
}

// Smart fetch function - tries direct first, falls back to API
async function smartFetch(url, options = {}) {
  // First attempt: Direct scraping
  try {
    console.log(`🔍 Direct scraping: ${url}`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        ...options.headers
      },
      timeout: 8000,
      ...options
    });
    
    console.log(`✓ Direct scraping successful for: ${url}`);
    return response.data;
  } catch (directError) {
    console.warn(`⚠️ Direct scraping failed for ${url}:`, directError.message);
    
    // Second attempt: WebScrapingAPI fallback
    try {
      const apiData = await fetchWithAPI(url);
      return apiData;
    } catch (apiError) {
      console.error(`❌ Both direct and API scraping failed for ${url}`);
      throw new Error(`All scraping methods failed: Direct (${directError.message}), API (${apiError.message})`);
    }
  }
}

async function scrapeArsenalNews() {
  try {
    console.log('🔍 Scraping Arsenal.com news...');
    const html = await smartFetch('https://www.arsenal.com/news');
    const $ = cheerio.load(html);
    const articles = [];

    $('.news-list-item, .article-item, .post-item, .card').each((index, element) => {
      if (articles.length >= 10) return false;
      
      const title = $(element).find('h2, h3, .title, .headline, .card-title').first().text().trim();
      const link = $(element).find('a').first().attr('href');
      const summary = $(element).find('p, .summary, .excerpt, .card-text').first().text().trim();
      
      if (title && link) {
        articles.push({
          title: title,
          link: link.startsWith('http') ? link : `https://www.arsenal.com${link}`,
          summary: summary || 'No summary available',
          source: 'Arsenal Official',
          timestamp: new Date().toISOString()
        });
      }
    });

    console.log(`✓ Found ${articles.length} Arsenal.com articles`);
    return articles;
  } catch (error) {
    console.error('❌ Arsenal.com scraping failed:', error.message);
    return [
      {
        title: "Arsenal Official News",
        link: "https://www.arsenal.com/news",
        summary: "Visit Arsenal's official website for the latest news and updates",
        source: "Arsenal Official (Fallback)",
        timestamp: new Date().toISOString()
      }
    ];
  }
}

async function scrapeSkySportsArsenal() {
  try {
    console.log('🔍 Scraping Sky Sports Arsenal news...');
    const html = await smartFetch('https://www.skysports.com/arsenal-news');
    const $ = cheerio.load(html);
    const articles = [];

    $('.news-list__item, .tile, .story, .card').each((index, element) => {
      if (articles.length >= 10) return false;
      
      const title = $(element).find('h3, h4, .news-list__headline, .tile__headline, .card-title').first().text().trim();
      const link = $(element).find('a').first().attr('href');
      const summary = $(element).find('p, .news-list__summary, .tile__summary, .card-text').first().text().trim();
      
      if (title && link) {
        articles.push({
          title: title,
          link: link.startsWith('http') ? link : `https://www.skysports.com${link}`,
          summary: summary || 'No summary available',
          source: 'Sky Sports',
          timestamp: new Date().toISOString()
        });
      }
    });

    console.log(`✓ Found ${articles.length} Sky Sports articles`);
    return articles;
  } catch (error) {
    console.error('❌ Sky Sports scraping failed:', error.message);
    return [
      {
        title: "Arsenal News - Sky Sports",
        link: "https://www.skysports.com/arsenal-news",
        summary: "Latest Arsenal news and analysis from Sky Sports",
        source: "Sky Sports (Fallback)",
        timestamp: new Date().toISOString()
      }
    ];
  }
}

async function scrapeRedditArsenal() {
  try {
    console.log('🔍 Scraping Reddit r/Gunners...');
    const response = await axios.get('https://www.reddit.com/r/Gunners/hot.json?limit=15', {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'application/json',
      },
      timeout: 10000
    });

    const posts = response.data.data.children;
    const articles = [];

    posts.forEach(post => {
      if (articles.length >= 10) return;
      
      const data = post.data;
      if (data.title && !data.stickied && data.score > 20) {
        articles.push({
          title: data.title,
          link: `https://www.reddit.com${data.permalink}`,
          summary: data.selftext ? data.selftext.substring(0, 200) + '...' : 'Reddit discussion',
          source: 'Reddit r/Gunners',
          timestamp: new Date(data.created_utc * 1000).toISOString(),
          score: data.score
        });
      }
    });

    console.log(`✓ Found ${articles.length} Reddit posts`);
    return articles;
  } catch (error) {
    console.error('❌ Reddit scraping failed:', error.message);
    return [
      {
        title: "Arsenal Discussions - Reddit",
        link: "https://www.reddit.com/r/Gunners",
        summary: "Join the Arsenal community discussions on Reddit",
        source: "Reddit r/Gunners (Fallback)",
        timestamp: new Date().toISOString()
      }
    ];
  }
}

async function scrapeBBCArsenal() {
  try {
    console.log('🔍 Scraping BBC Sport Arsenal news...');
    const html = await smartFetch('https://www.bbc.com/sport/football/teams/arsenal');
    const $ = cheerio.load(html);
    const articles = [];

    $('.gel-layout__item, .sp-c-fixture, .qa-story-headline, .media__content').each((index, element) => {
      if (articles.length >= 8) return false;
      
      const title = $(element).find('h3, h4, .sp-c-fixture__title, .qa-story-headline, .media__title').first().text().trim();
      const link = $(element).find('a').first().attr('href');
      const summary = $(element).find('p, .media__summary').first().text().trim();
      
      if (title && link && title.toLowerCase().includes('arsenal')) {
        articles.push({
          title: title,
          link: link.startsWith('http') ? link : `https://www.bbc.com${link}`,
          summary: summary || 'BBC Sport coverage',
          source: 'BBC Sport',
          timestamp: new Date().toISOString()
        });
      }
    });

    console.log(`✓ Found ${articles.length} BBC Sport articles`);
    return articles;
  } catch (error) {
    console.error('❌ BBC Sport scraping failed:', error.message);
    return [
      {
        title: "Arsenal - BBC Sport",
        link: "https://www.bbc.com/sport/football/teams/arsenal",
        summary: "Arsenal news and fixtures from BBC Sport",
        source: "BBC Sport (Fallback)",
        timestamp: new Date().toISOString()
      }
    ];
  }
}

async function scrapeESPNArsenal() {
  try {
    console.log('🔍 Scraping ESPN Arsenal news...');
    const html = await smartFetch('https://www.espn.com/soccer/team/_/id/359/arsenal');
    const $ = cheerio.load(html);
    const articles = [];

    $('.contentItem, .news-feed-item, .story-feed__item').each((index, element) => {
      if (articles.length >= 8) return false;
      
      const title = $(element).find('h3, h4, .contentItem__title, .story-feed__headline').first().text().trim();
      const link = $(element).find('a').first().attr('href');
      const summary = $(element).find('p, .contentItem__subhead').first().text().trim();
      
      if (title && link) {
        articles.push({
          title: title,
          link: link.startsWith('http') ? link : `https://www.espn.com${link}`,
          summary: summary || 'ESPN coverage',
          source: 'ESPN',
          timestamp: new Date().toISOString()
        });
      }
    });

    console.log(`✓ Found ${articles.length} ESPN articles`);
    return articles;
  } catch (error) {
    console.error('❌ ESPN scraping failed:', error.message);
    return [
      {
        title: "Arsenal - ESPN",
        link: "https://www.espn.com/soccer/team/_/id/359/arsenal",
        summary: "Arsenal news and analysis from ESPN",
        source: "ESPN (Fallback)",
        timestamp: new Date().toISOString()
      }
    ];
  }
}

async function scrapeArsenalFixtures() {
  try {
    console.log('🔍 Scraping Arsenal fixtures...');
    const html = await smartFetch('https://www.arsenal.com/fixtures');
    const $ = cheerio.load(html);
    const fixtures = [];

    $('.fixture-item, .match-item, .fixture-list__item').each((index, element) => {
      if (fixtures.length >= 5) return false;
      
      const opponent = $(element).find('.opponent, .team-name, .fixture__opponent').text().trim();
      const date = $(element).find('.date, .match-date, .fixture__date').text().trim();
      const venue = $(element).find('.venue, .location, .fixture__venue').text().trim();
      const competition = $(element).find('.competition, .fixture__competition').text().trim();
      
      if (opponent) {
        fixtures.push({
          title: `Arsenal vs ${opponent}`,
          link: 'https://www.arsenal.com/fixtures',
          summary: `${competition ? competition + ': ' : ''}Arsenal vs ${opponent}${venue ? ' at ' + venue : ''}${date ? ' on ' + date : ''}`,
          source: 'Arsenal Fixtures',
          timestamp: new Date().toISOString()
        });
      }
    });

    console.log(`✓ Found ${fixtures.length} fixtures`);
    return fixtures;
  } catch (error) {
    console.error('❌ Fixtures scraping failed:', error.message);
    return [
      {
        title: "Arsenal Fixtures",
        link: "https://www.arsenal.com/fixtures",
        summary: "View upcoming Arsenal matches and results",
        source: "Arsenal Fixtures (Fallback)",
        timestamp: new Date().toISOString()
      }
    ];
  }
}

async function getAllArsenalContent() {
  console.log('🚀 Starting hybrid Arsenal content scraping...');
  console.log(`📊 API calls available: ${API_RATE_LIMIT - apiCallCount}/${API_RATE_LIMIT}`);
  
  try {
    // Run all scrapers in parallel for better performance
    const [arsenalNews, skyNews, redditPosts, bbcNews, espnNews, fixtures] = await Promise.allSettled([
      scrapeArsenalNews(),
      scrapeSkySportsArsenal(),
      scrapeRedditArsenal(),
      scrapeBBCArsenal(),
      scrapeESPNArsenal(),
      scrapeArsenalFixtures()
    ]);

    const allContent = [];
    
    // Combine all results
    if (arsenalNews.status === 'fulfilled') allContent.push(...arsenalNews.value);
    if (skyNews.status === 'fulfilled') allContent.push(...skyNews.value);
    if (redditPosts.status === 'fulfilled') allContent.push(...redditPosts.value);
    if (bbcNews.status === 'fulfilled') allContent.push(...bbcNews.value);
    if (espnNews.status === 'fulfilled') allContent.push(...espnNews.value);
    if (fixtures.status === 'fulfilled') allContent.push(...fixtures.value);

    // Remove duplicates based on title similarity
    const uniqueContent = [];
    const seenTitles = new Set();
    
    allContent.forEach(item => {
      const titleKey = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!seenTitles.has(titleKey)) {
        seenTitles.add(titleKey);
        uniqueContent.push(item);
      }
    });

    // Sort by timestamp (newest first)
    uniqueContent.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    console.log(`✅ Successfully scraped ${uniqueContent.length} unique items`);
    console.log(`📊 API calls used this session: ${apiCallCount}/${API_RATE_LIMIT}`);
    
    return uniqueContent.slice(0, 30); // Return top 30 items
    
  } catch (error) {
    console.error('❌ Comprehensive scraping failed:', error.message);
    
    // Return fallback content if everything fails
    return [
      {
        title: "Arsenal Official Website",
        link: "https://www.arsenal.com",
        summary: "Visit Arsenal's official website for the latest news",
        source: "Emergency Fallback",
        timestamp: new Date().toISOString()
      },
      {
        title: "Arsenal News - Sky Sports",
        link: "https://www.skysports.com/arsenal-news",
        summary: "Arsenal news and updates from Sky Sports",
        source: "Emergency Fallback",
        timestamp: new Date().toISOString()
      },
      {
        title: "Arsenal Reddit Community",
        link: "https://www.reddit.com/r/Gunners",
        summary: "Join Arsenal fans on Reddit for discussions",
        source: "Emergency Fallback",
        timestamp: new Date().toISOString()
      }
    ];
  }
}

// Export functions
module.exports = {
  getAllArsenalContent,
  scrapeArsenalNews,
  scrapeSkySportsArsenal,
  scrapeRedditArsenal,
  scrapeBBCArsenal,
  scrapeESPNArsenal,
  scrapeArsenalFixtures,
  smartFetch,
  getAPIUsage: () => ({ used: apiCallCount, limit: API_RATE_LIMIT, remaining: API_RATE_LIMIT - apiCallCount })
};
