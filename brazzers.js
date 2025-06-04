const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async function brazzers(query) {
  const results = [];
  const maxPages = 3;
  try {
    for (let page = 1; page <= maxPages; page++) {
      // TODO: Replace with real search URL and selectors for brazzers
      const url = `https://www.brazzers.com/search/${encodeURIComponent(query)}/${page}/`;
      const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const $ = cheerio.load(data);

      const items = $('.video-thumb'); // TODO: update selector
      if (!items.length) break;

      items.each((i, el) => {
        const title = $(el).find('a').attr('title') || $(el).find('.title').text().trim();
        const href = $(el).find('a').attr('href');
        const preview = $(el).find('img').attr('src') || $(el).find('img').attr('data-src');
        if (title && href && preview) {
          results.push({
            title: title.trim(),
            url: href.startsWith('http') ? href : 'https://www.brazzers.com' + href,
            preview,
            source: "brazzers"
          });
        }
      });
    }
  } catch (err) {
    console.error("brazzers error:", err.message);
  }
  return results;
};
