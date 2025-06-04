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

async function scrapeRedTube(query) {
  // Try multiple URL formats for RedTube
  const urlFormats = [
    `https://www.redtube.com/?search=${encodeURIComponent(query)}`,
    `https://www.redtube.com/search?query=${encodeURIComponent(query)}`,
    `https://www.redtube.com/${encodeURIComponent(query)}`
  ];
  
  for (let i = 0; i < urlFormats.length; i++) {
    const url = urlFormats[i];
    console.log(`RedTube trying URL format ${i + 1}: ${url}`);
    
    try {
      const data = await fetchWithScraperAPI(url);
      if (!data) continue;
      
      const $ = cheerio.load(data);
      const results = [];
      
      // Check if we got a valid page
      const pageTitle = $('title').text();
      console.log('Page title:', pageTitle);
      
      if (!pageTitle.toLowerCase().includes('redtube')) {
        console.log('Page doesn\'t seem to be RedTube, trying next format...');
        continue;
      }

      // Multiple selector patterns for RedTube
      $('li.videoblock, .video, .video-card, .thumb, .redtube-video, .videoBox, .video-item, article').each((index, element) => {
        const $el = $(element);
        
        // Multiple ways to extract title
        const title = $el.find('.video_title_text').text().trim() ||
                     $el.find('.video-title').text().trim() || 
                     $el.find('.title').text().trim() ||
                     $el.find('h3 a').text().trim() ||
                     $el.find('a').attr('title') || 
                     $el.find('img').attr('alt') ||
                     $el.find('.videoTitle').text().trim() ||
                     $el.find('.video_title').text().trim();
        
        // Multiple ways to extract URL
        const href = $el.find('a').first().attr('href') ||
                    $el.find('.video_link').attr('href') ||
                    $el.find('.thumb_link').attr('href');
        
        // Multiple ways to extract thumbnail
        const thumbnail = $el.find('img').attr('data-thumb_url') ||
                         $el.find('img').attr('data-src') || 
                         $el.find('img').attr('src') ||
                         $el.find('img').attr('data-original');

        if (title && href && title.length > 3) {
          const fullUrl = href.startsWith('http') ? href : `https://www.redtube.com${href}`;
          results.push({ 
            title: title.substring(0, 100),
            url: fullUrl, 
            thumbnail: thumbnail || '',
            source: 'RedTube'
          });
        }
      });

      console.log(`RedTube format ${i + 1} found ${results.length} results`);
      
      if (results.length > 0) {
        return results;
      }
      
    } catch (error) {
      console.error(`RedTube format ${i + 1} error:`, error.message);
    }
  }
  
  console.error('All RedTube URL formats failed');
  return [];
}

module.exports = scrapeRedTube;
