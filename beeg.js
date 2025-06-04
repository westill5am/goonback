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

module.exports = async function beeg(query) {
  const url = `https://beeg.com/search?q=${encodeURIComponent(query)}`;
  const results = [];

  try {
    const data = await fetchWithScraperAPI(url);
    if (!data) return [];
    
    const $ = cheerio.load(data);

    // Multiple selector patterns for Beeg
    $('.video, .video-item, .thumb, .video-box, article, .video-wrapper').each((i, el) => {
      const $el = $(el);
      
      // Multiple ways to extract title
      const title = $el.find('.video-title').text().trim() ||
                   $el.find('.title').text().trim() ||
                   $el.find('a').attr('title') ||
                   $el.find('img').attr('alt') ||
                   $el.find('h3').text().trim();
      
      // Multiple ways to extract URL
      const href = $el.find('a').attr('href');
      
      // Multiple ways to extract thumbnail and duration
      const thumbnail = $el.find('img').attr('src') || 
                       $el.find('img').attr('data-src') ||
                       $el.find('img').attr('data-original');
      
      const duration = $el.find('.duration').text().trim();

      if (title && href && title.length > 3) {
        results.push({
          title: title.substring(0, 100),
          url: href.startsWith('http') ? href : 'https://beeg.com' + href,
          duration: duration || null,
          thumbnail: thumbnail || '',
          source: "Beeg"
        });
      }
    });

    console.log(`Beeg found ${results.length} results`);
    return results;
  } catch (err) {
    console.error("beeg error:", err.message);
    return [];
  }
};