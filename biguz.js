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

module.exports = async function biguz(query) {
  const results = [];
  const maxPages = 2; // Reduced for faster testing
  try {
    for (let page = 1; page <= maxPages; page++) {
      const url = `https://www.biguz.com/search/${encodeURIComponent(query)}/${page}/`;
      const data = await fetchWithScraperAPI(url);
      if (!data) continue;
      
      const $ = cheerio.load(data);

      // Multiple selector patterns for BigUz
      $('.video-thumb, .video-item, .thumb, .video-box, .video').each((i, el) => {
        const $el = $(el);
        const title = $el.find('a').attr('title') || 
                     $el.find('.title').text().trim() ||
                     $el.find('a').text().trim() ||
                     $el.find('img').attr('alt');
        const href = $el.find('a').attr('href');
        const preview = $el.find('img').attr('src') || 
                       $el.find('img').attr('data-src') ||
                       $el.find('img').attr('data-original');
        
        if (title && href && title.length > 3) {
          results.push({
            title: title.trim().substring(0, 100),
            url: href.startsWith('http') ? href : 'https://www.biguz.com' + href,
            preview: preview || '',
            source: "BigUz"
          });
        }
      });
      
      // Break if no results found on this page
      if ($('.video-thumb, .video-item, .thumb').length === 0) break;
    }
  } catch (err) {
    console.error("biguz error:", err.message);
  }
  return results;
};
