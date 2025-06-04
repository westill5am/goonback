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

module.exports = async function pinkrod(query) {
  const url = `https://www.pinkrod.com/search/${encodeURIComponent(query)}/`;
  const results = [];

  try {
    const data = await fetchWithScraperAPI(url);
    if (!data) return [];
    
    const $ = cheerio.load(data);

    // Multiple selector patterns for PinkRod
    $('.item, .video-item, .thumb, .video, .video-box').each((i, el) => {
      const $el = $(el);
      const title = $el.find('a').attr('title') ||
                   $el.find('.title').text().trim() ||
                   $el.find('a').text().trim() ||
                   $el.find('img').attr('alt');
      const href = $el.find('a').attr('href');
      const duration = $el.find('.duration').text().trim();
      const thumbnail = $el.find('img').attr('src') || 
                       $el.find('img').attr('data-src');

      if (title && href && title.length > 3) {
        results.push({
          title: title.trim().substring(0, 100),
          url: href.startsWith('http') ? href : 'https://www.pinkrod.com' + href,
          duration: duration || null,
          thumbnail: thumbnail || '',
          source: "PinkRod"
        });
      }
    });
  } catch (err) {
    console.error("pinkrod error:", err.message);
  }

  return results;
};