const axios = require('axios');
const cheerio = require('cheerio');

const SCRAPER_API_KEY = '23c1327aeb270f44bb141d469c7f9823';
const normalizeTitle = (title) => title.replace(/\s+/g, ' ').trim();

module.exports = async function txxx(query) {
  const searchUrl = `https://www.txxx.com/search/${encodeURIComponent(query)}/`;
  const proxyUrl = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&render=true&premium=true&country_code=us&url=${encodeURIComponent(searchUrl)}`;
  const results = [];

  try {
    const { data } = await axios.get(proxyUrl, {
      timeout: 45000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const $ = cheerio.load(data);

    // Try multiple selectors for video cards
    let videoEls = $('.thumb, .video-item, .video, .item, .video-block');
    if (videoEls.length === 0) {
      videoEls = $('a[href*="/video/"]'); // fallback: links to videos
    }

    videoEls.each((i, el) => {
      let title = normalizeTitle($(el).find('a').attr('title') || $(el).find('.title').text() || $(el).attr('title') || $(el).find('img').attr('alt') || $(el).text());
      let href = $(el).find('a').attr('href') || $(el).attr('href');
      let duration = $(el).find('.duration').text().trim() || $(el).find('.video-duration').text().trim();
      let preview = $(el).find('img').attr('data-src') || $(el).find('img').attr('src') || '';

      // Normalize href
      if (href && !href.startsWith('http')) href = 'https://www.txxx.com' + href;
      // Normalize preview
      if (preview && preview.startsWith('//')) preview = 'https:' + preview;
      if (preview && preview.startsWith('/')) preview = 'https://www.txxx.com' + preview;

      if (title && href) {
        results.push({
          title,
          url: href,
          duration,
          preview,
          source: "TXXX"
        });
      }
    });

    if (results.length === 0) {
      console.error('TXXX: No results found. Selectors may be outdated or site structure changed.');
    }
  } catch (err) {
    console.error("txxx error:", err.message);
  }

  return results;
};