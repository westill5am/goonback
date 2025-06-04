const axios = require('axios');
const cheerio = require('cheerio');

const SCRAPER_API_KEY = '23c1327aeb270f44bb141d469c7f9823';

async function debugRedTube() {
  const url = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&render=true&premium=true&country_code=us&url=` + 
              encodeURIComponent('https://www.redtube.com/?search=milf');
  
  try {
    console.log('Testing RedTube URL:', 'https://www.redtube.com/?search=milf');
    const response = await axios.get(url, { timeout: 30000 });
    const $ = cheerio.load(response.data);
    
    console.log('Page title:', $('title').text());
    console.log('Page contains "RedTube":', response.data.includes('RedTube'));
    console.log('Page length:', response.data.length);
    
    // Test multiple selectors
    console.log('Found li.videoblock:', $('li.videoblock').length);
    console.log('Found .video:', $('.video').length);
    console.log('Found .video-card:', $('.video-card').length);
    console.log('Found .videoBox:', $('.videoBox').length);
    console.log('Found li elements:', $('li').length);
    console.log('Found div elements:', $('div').length);
    
    // Check for any video-related classes
    const allClasses = [];
    $('*').each((i, el) => {
      const className = $(el).attr('class');
      if (className && className.includes('video')) {
        allClasses.push(className);
      }
    });
    console.log('Video-related classes found:', [...new Set(allClasses)].slice(0, 10));
    
    // Try to find any links with video in href
    const videoLinks = [];
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (href && href.includes('video')) {
        videoLinks.push(href);
      }
    });
    console.log('Video links found:', videoLinks.slice(0, 5));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugRedTube();
