// Load ReadableStream polyfill FIRST - CRITICAL for Node.js 16 compatibility
require('./readablestream-polyfill');

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

module.exports = {
  // Confirmed working core scrapers
  '3movs': require('./3movs.js'),
  'ashemaletube': require('./ashemaletube.js'),
  'fuq': require('./fuq.js'),
  'hentaigasm': require('./hentaigasm.js'),
  'porndoe': require('./porndoe.js'),
  'pornhub': require('./pornhub.js'),
  'pornovideoshub': require('./pornovideoshub.js'),
  'tubedupe': require('./tubedupe.js'),
  'xvideos': require('./xvideos.js'),
  'youporn': require('./youporn.js'),
  'xnxx': require('./xnxx.js'),
  
  // New confirmed working scrapers
  'porntrex': require('./porntrex.js'),
  'anyporn': require('./anyporn.js'),
  'pornoxo': require('./pornoxo.js'),
  
  // Additional scrapers (some may need testing)
  'drtuber': require('./drtuber.js'),
  'empflix': require('./empflix.js'),
  'eporner': require('./eporner.js'),
  'extremetube': require('./extremetube.js'),
  'faphouse': require('./faphouse.js'),
  'fapvid': require('./fapvid.js'),
  'spankbang': require('./spankbang.js'),
  'redtube': require('./redtube.js'),
  'ixxx': require('./ixxx.js'),
  'tube8': require('./tube8.js'),
  'xtube': require('./xtube.js'),
  
  fetchWithScraperAPI,
};
