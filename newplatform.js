const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeNewPlatform(query) {
  const url = `https://newplatform.com/search?q=${encodeURIComponent(query)}`;
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const results = [];

    $('.video-item').each((index, element) => {
      const title = $(element).find('.title').text().trim();
      const url = $(element).find('a').attr('href');
      const thumbnail = $(element).find('img').attr('src');

      if (title && url && thumbnail) {
        results.push({ title, url, thumbnail });
      }
    });

    return results;
  } catch (error) {
    console.error('Error scraping NewPlatform:', error.message);
    return [];
  }
}

module.exports = scrapeNewPlatform;
