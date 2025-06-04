const axios = require('axios');
const cheerio = require('cheerio');

async function debugBeeg() {
  const url = 'https://beeg.com/search?q=anal';
  
  try {
    console.log('Fetching:', url);
    const { data, status } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    console.log('Response status:', status);
    console.log('Response length:', data.length);
    console.log('First 500 chars:', data.substring(0, 500));
    
    const $ = cheerio.load(data);
    console.log('Total elements:', $('*').length);
    console.log('Article elements:', $('article').length);
    console.log('Video title elements:', $('.video-title').length);
    console.log('Links:', $('a').length);
    
    // Try different selectors
    console.log('Divs with video in class:', $('div[class*="video"]').length);
    console.log('Elements with href containing video:', $('a[href*="video"]').length);
    
  } catch (err) {
    console.error('Error:', err.message);
    console.error('Status:', err.response?.status);
    console.error('Headers:', err.response?.headers);
  }
}

debugBeeg();
