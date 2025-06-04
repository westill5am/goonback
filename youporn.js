const axios = require('axios');
const cheerio = require('cheerio');

const SCRAPER_API_KEY = '23c1327aeb270f44bb141d469c7f9823';
const proxyUrl = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=`;

async function fetchWithScraperAPI(url) {
  try {
    const response = await axios.get(proxyUrl + encodeURIComponent(url));
    return response.data;
  } catch (error) {
    console.error('ScraperAPI error:', error.message);
    return null;
  }
}

async function scrapeYouPorn(query) {
  const url = `https://www.youporn.com/search/?query=${encodeURIComponent(query)}`;
  try {
    const data = await fetchWithScraperAPI(url);
    if (!data) return [];
    
    const $ = cheerio.load(data);
    const results = [];

    $('.video-box, .video-item, .search-item, .video').each((index, element) => {
      const title = $(element).find('.video-title, .title, h3 a, a').text().trim() || 
                   $(element).find('a').attr('title') || 
                   $(element).find('img').attr('alt');
      const href = $(element).find('a').attr('href');
      const thumbnail = $(element).find('img').attr('data-src') || 
                       $(element).find('img').attr('src');

      if (title && href) {
        const fullUrl = href.startsWith('http') ? href : `https://www.youporn.com${href}`;
        results.push({ 
          title, 
          url: fullUrl, 
          thumbnail: thumbnail || '',
          source: 'YouPorn'
        });
      }
    });

    return results;
  } catch (error) {
    console.error('Error scraping YouPorn:', error.message);
    return [];
  }
}

module.exports = scrapeYouPorn;
