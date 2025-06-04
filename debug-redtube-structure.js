// Debug RedTube HTML structure
const axios = require('axios');
const cheerio = require('cheerio');

async function debugRedTube() {
  try {
    console.log('🔍 Fetching RedTube search page...');
    const response = await axios.get('https://www.redtube.com/?search=milf', {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });
    
    console.log('✅ Response received');
    console.log('Status:', response.status);
    console.log('Data length:', response.data.length);
    
    const $ = cheerio.load(response.data);
    console.log('Page title:', $('title').text());
    
    // Check for various possible selectors
    const selectors = [
      '.video-item',
      '.video_link_container', 
      '.video-box',
      '.thumb',
      '.video',
      '.redtube-video',
      '.video-wrapper',
      '[data-video-id]',
      '.video-title',
      '.video_title'
    ];
    
    selectors.forEach(selector => {
      const count = $(selector).length;
      console.log(`${selector}: ${count} elements`);
      
      if (count > 0 && count < 10) {
        $(selector).each((i, el) => {
          const $el = $(el);
          console.log(`  ${i}: ${$el.prop('tagName')} - classes: ${$el.attr('class')}`);
          const href = $el.find('a').attr('href') || $el.attr('href');
          if (href) console.log(`    href: ${href.substring(0, 50)}`);
        });
      }
    });
    
    // Also check for any video-related text
    const bodyText = response.data.substring(0, 2000);
    console.log('\nFirst 500 chars of body:');
    console.log(bodyText.substring(0, 500));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugRedTube();
