const axios = require('axios');
const cheerio = require('cheerio');

// NOTE: JS function names cannot start with a number. Use 'threeMovs' instead.
const normalizeTitle = (title) => title.replace(/\s+/g, ' ').trim();

module.exports = async function threeMovs(query) {
  const results = [];
  const maxPages = 3;
  try {
    for (let page = 1; page <= maxPages; page++) {
      const url = `https://www.3movs.com/search_videos/?q=${encodeURIComponent(query)}&page=${page}`;
      const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const $ = cheerio.load(data);

      const items = $('a').filter((i, el) => {
        const href = $(el).attr('href') || '';
        return href.includes('/videos/') && $(el).find('img').length > 0;
      });
      if (!items.length) break;

      items.each((i, el) => {
        const href = $(el).attr('href');
        const img = $(el).find('img');
        const preview = img.attr('data-src') || img.attr('src');
        const title = normalizeTitle(img.attr('alt') || $(el).attr('title') || $(el).text());
        if (title && href && preview) {
          results.push({
            title,
            url: href.startsWith('http') ? href : 'https://www.3movs.com' + href,
            preview,
            source: "3movs"
          });
        }
      });
    }
  } catch (err) {
    console.error("3movs error:", err.message);
  }
  return results;
};
