// Simple RedTube structure check
const axios = require('axios');

async function checkRedTube() {
  try {
    const response = await axios.get('https://www.redtube.com/?search=milf', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    console.log('✅ RedTube response received');
    console.log('Status:', response.status);
    console.log('Content length:', response.data.length);
    
    // Extract title
    const titleMatch = response.data.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      console.log('Page title:', titleMatch[1]);
    }
    
    // Look for video-related classes
    const classMatches = response.data.match(/class="[^"]*video[^"]*"/gi) || [];
    console.log('Video classes found:', classMatches.length);
    if (classMatches.length > 0) {
      console.log('Sample classes:', classMatches.slice(0, 3));
    }
    
    // Look for video links
    const linkMatches = response.data.match(/href="\/[0-9]+/g) || [];
    console.log('Video links found:', linkMatches.length);
    if (linkMatches.length > 0) {
      console.log('Sample links:', linkMatches.slice(0, 3));
    }
    
    // Look for common video selectors in the HTML
    const htmlContent = response.data;
    const checks = [
      { name: 'video-item', pattern: /video-item/gi },
      { name: 'thumb', pattern: /class="[^"]*thumb/gi },
      { name: 'video-box', pattern: /video-box/gi },
      { name: 'data-id', pattern: /data-id/gi },
      { name: 'videoblock', pattern: /videoblock/gi }
    ];
    
    checks.forEach(check => {
      const matches = htmlContent.match(check.pattern) || [];
      console.log(`${check.name}: ${matches.length} matches`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkRedTube();
