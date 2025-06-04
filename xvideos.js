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

module.exports = async function xvideos(query) {
  const baseUrl = `https://www.xvideos.com/?k=${encodeURIComponent(query)}`;
  const results = [];

  try {
    const data = await fetchWithScraperAPI(baseUrl);
    if (!data) return results;

    const $ = cheerio.load(data);

    $('.thumb-block').each((i, el) => {
      try {
        // Fix title extraction - try multiple selectors for actual video titles
        let title = $(el).find('p.title a').attr('title') || 
                   $(el).find('p.title a').text().trim() ||
                   $(el).find('.thumb-under p a').attr('title') ||
                   $(el).find('.thumb-under p a').text().trim() ||
                   $(el).find('a').attr('title') ||
                   $(el).find('.thumb-under > p').text().trim();
        
        const url = 'https://www.xvideos.com' + $(el).find('a').attr('href');
        const preview = $(el).find('img').attr('data-src') || $(el).find('img').attr('src');
        const duration = $(el).find('.duration').text().trim();

        // Clean up title if it's still empty or just resolution
        if (!title || /^\d+p?$/i.test(title) || title === 'Watch') {
          title = 'XVideos Video';
        }

        if (title && url && preview) {
          results.push({
            title,
            url,
            preview,
            duration,
            source: 'XVideos',
          });
        }
      } catch (parseError) {
        console.error('Error parsing video element:', parseError.message);
      }
    });
  } catch (err) {
    console.error('xvideos error:', err.message);
  }

  return results;
};