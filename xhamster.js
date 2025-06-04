const axios = require('axios');
const cheerio = require('cheerio');

const SCRAPER_API_KEY = '23c1327aeb270f44bb141d469c7f9823';

module.exports = async function xhamster(query) {
  const targetUrl = `https://xhamster.com/search/${encodeURIComponent(query)}`;
  
  // Try multiple ScraperAPI configurations
  const configs = [
    { params: 'render=true&premium=true&country_code=us&session_number=1', timeout: 45000 },
    { params: 'render=false&premium=true&country_code=ca', timeout: 30000 },
    { params: 'render=true&country_code=de', timeout: 35000 }
  ];
  
  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
    const url = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&${config.params}&url=${encodeURIComponent(targetUrl)}`;
    
    try {
      console.log(`xHamster attempt ${i + 1}/${configs.length}`);
      const { data } = await axios.get(url, { 
        timeout: config.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      const $ = cheerio.load(data);
      const results = [];

      // Multiple selectors for xHamster
      $('article.video-thumb, .video-item, .thumb, .video-box, .video, div[data-video-id], .thumb-list__item').each((i, el) => {
        const $el = $(el);
        
        // Multiple ways to extract title
        const title = $el.find('a.video-thumb__title-link').text().trim() ||
                     $el.find('.video-thumb__title').text().trim() ||
                     $el.find('.title').text().trim() ||
                     $el.find('h3 a').text().trim() ||
                     $el.find('a').attr('title') ||
                     $el.find('.video-title').text().trim() ||
                     $el.find('.thumb-image-container a').attr('title');
        
        // Multiple ways to extract URL
        const href = $el.find('a.video-thumb__title-link').attr('href') ||
                    $el.find('a.thumb-image-container__image').attr('href') ||
                    $el.find('a').first().attr('href');
        
        // Extract duration and thumbnail
        const duration = $el.find('.video-thumb__duration, .duration, .video-duration').text().trim();
        const thumbnail = $el.find('img').attr('src') || 
                         $el.find('img').attr('data-src') ||
                         $el.find('img').attr('data-original');

        if (title && href && title.length > 3) {
          const fullUrl = href.startsWith('http') ? href : 'https://xhamster.com' + href;
          results.push({
            title: title.substring(0, 100),
            url: fullUrl,
            duration,
            thumbnail,
            source: "xHamster"
          });
        }
      });

      console.log(`xHamster found ${results.length} results with config ${i + 1}`);
      
      if (results.length > 0) {
        return results;
      }
      
    } catch (err) {
      console.error(`xhamster attempt ${i + 1} error:`, err.message);
      if (i === configs.length - 1) {
        console.error("All xHamster attempts failed");
      }
    }
  }

  return [];
};