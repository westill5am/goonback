const axios = require('axios');
const cheerio = require('cheerio');

const normalizeTitle = (title) => title.replace(/\s+/g, ' ').trim();

module.exports = async function empflix(query) {
  const results = [];
  const maxPages = 3;
  try {
    for (let page = 1; page <= maxPages; page++) {
      // TODO: Replace with real search URL and selectors for empflix
      const url = `https://www.empflix.com/search/${encodeURIComponent(query)}/${page}/`;
      const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const $ = cheerio.load(data);

      const items = $('.video-thumb'); // TODO: update selector
      if (!items.length) break;

      items.each((i, el) => {
        const title = normalizeTitle($(el).find('a').attr('title') || $(el).find('.title').text());
        const href = $(el).find('a').attr('href');
        const preview = $(el).find('img').attr('src') || $(el).find('img').attr('data-src');
        if (title && href && preview) {
          results.push({
            title,
            url: href.startsWith('http') ? href : 'https://www.empflix.com' + href,
            preview,
            source: "empflix"
          });
        }
      });
    }
  } catch (err) {
    console.error("empflix error:", err.message);
  }
  return results;
};
