const axios = require('axios');
const cheerio = require('cheerio');

const SCRAPER_API_KEY = '23c1327aeb270f44bb141d469c7f9823';

module.exports = async function xnxx(query) {
  const results = [];
  const maxPages = 3;
  
  try {
    for (let page = 0; page <= maxPages - 1; page++) {
      const searchUrl = `https://www.xnxx.com/search/${encodeURIComponent(query)}/${page}`;
      const proxyUrl = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&render=true&premium=true&country_code=us&url=${encodeURIComponent(searchUrl)}`;
      
      const { data } = await axios.get(proxyUrl, {
        timeout: 45000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const $ = cheerio.load(data);
      
      $('.thumb, .mozaique .thumb-block, .video-thumb').each((i, el) => {
        const $el = $(el);
        
        let title = $el.find('a').attr('title') ||
                    $el.find('.thumb-under p a').text().trim() ||
                    $el.find('img').attr('alt');
        
        let href = $el.find('a').first().attr('href');
        
        const duration = $el.find('.duration, .thumb-under .metadata').first().text().trim();
        
        let preview = $el.find('img').first().attr('data-src') ||
                      $el.find('img').attr('src') ||
                      $el.find('img').attr('data-original');
        
        if (title && href) {
          title = title.replace(/^\s*[\d\-]+\s*/, '').trim();
          
          if (href.startsWith('/')) {
            href = 'https://www.xnxx.com' + href;
          }
          
          if (preview && !preview.startsWith('http')) {
            preview = preview.startsWith('/') ? 'https:' + preview : 'https://www.xnxx.com/' + preview;
          }
          
          results.push({
            title: title,
            url: href,
            duration: duration || '',
            preview: preview || '',
            source: "XNXX"
          });
        }
      });
      
      if ($('.thumb, .mozaique .thumb-block, .video-thumb').length === 0) {
        break;
      }
    }
  } catch (err) {
    console.error("xnxx error:", err.message);
  }
  
  return results.slice(0, 200);
};
