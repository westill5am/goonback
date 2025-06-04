const axios = require('axios');
const cheerio = require('cheerio');

const SCRAPER_API_KEY = '23c1327aeb270f44bb141d469c7f9823';

module.exports = async function xnxx(query) {
  const results = [];
  const maxPages = 3;
  
  try {
    for (let page = 1; page <= maxPages; page++) {
      const searchUrl = `https://www.xnxx.com/search/${encodeURIComponent(query)}/${page}`;
      const proxyUrl = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&render=true&premium=true&country_code=us&url=${encodeURIComponent(searchUrl)}`;
      
      const { data } = await axios.get(proxyUrl, {
        timeout: 45000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const $ = cheerio.load(data);
      
      $('.thumb, .thumb-block, .mozaique .thumb, #content .thumb').each((i, el) => {
        const $el = $(el);
        
        let title = $el.find('.thumb-under p a, .thumb-under a, a[title]').first().attr('title') ||
                    $el.find('a').attr('title') ||
                    $el.find('img').attr('alt') ||
                    $el.find('.thumb-under p a, .thumb-under a').first().text().trim();
        
        let href = $el.find('a').first().attr('href');
        
        const duration = $el.find('.duration, .thumb-duration, .time').first().text().trim();
        
        let preview = $el.find('img').first().attr('data-src') ||
                      $el.find('img').attr('src') ||
                      $el.find('img').attr('data-original');
        
        if (title && href) {
          title = title.replace(/^\s*[\d\-]+\s*/, '').trim();
          
          if (href.startsWith('/')) {
            href = 'https://www.xnxx.com' + href;
          }
          
          if (preview && !preview.startsWith('http')) {
            if (preview.startsWith('//')) {
              preview = 'https:' + preview;
            } else if (preview.startsWith('/')) {
              preview = 'https://www.xnxx.com' + preview;
            }
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
      
      if ($('.thumb, .thumb-block, .mozaique .thumb, #content .thumb').length === 0) {
        break;
      }
    }
  } catch (err) {
    console.error("xnxx error:", err.message);
  }
  
  return results.slice(0, 200);
};
