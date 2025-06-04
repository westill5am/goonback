const axios = require('axios');
const cheerio = require('cheerio');

const SCRAPER_API_KEY = '23c1327aeb270f44bb141d469c7f9823';
const proxyUrl = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&render=true&premium=true&country_code=us&url=`;

async function fetchWithScraperAPI(url) {
  try {
    const response = await axios.get(proxyUrl + encodeURIComponent(url), {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    return response.data;
  } catch (error) {
    console.error('ScraperAPI error:', error.message);
    return null;
  }
}

async function scrapeSpankBang(query) {
  const url = `https://spankbang.com/s/${encodeURIComponent(query)}/`;
  try {
    const data = await fetchWithScraperAPI(url);
    if (!data) return [];
    
    const $ = cheerio.load(data);
    const results = [];

    // Multiple selector patterns for SpankBang
    $('.video-item, .video-list .video-item, .thumb, .video-box, .video').each((index, element) => {
      const $el = $(element);
      
      // Multiple ways to get title
      const title = $el.find('.n').text().trim() || 
                   $el.find('.title').text().trim() ||
                   $el.find('a').attr('title') ||
                   $el.find('img').attr('alt') ||
                   $el.attr('title');
      
      // Get URL
      const href = $el.find('a').first().attr('href') || $el.attr('href');
      
      // Get thumbnail
      const thumbnail = $el.find('img').attr('data-src') || 
                       $el.find('img').attr('src') ||
                       $el.find('img').attr('data-original');

      if (title && href && title.length > 3) {
        const fullUrl = href.startsWith('http') ? href : `https://spankbang.com${href}`;
        results.push({ 
          title: title.substring(0, 100), // Truncate long titles
          url: fullUrl, 
          thumbnail: thumbnail || '',
          source: 'SpankBang'
        });
      }
    });

    return results;
  } catch (error) {
    console.error('Error scraping SpankBang:', error.message);
    return [];
  }
}

module.exports = scrapeSpankBang;
