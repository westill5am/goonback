const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async function hentaigasm(query) {
  const url = `https://hentaigasm.com/?s=${encodeURIComponent(query)}`;
  const results = [];

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    $('.post').each((i, el) => {
      const title = $(el).find('h2 a').text().trim();
      const href = $(el).find('h2 a').attr('href');
      // Try to get the preview image from the first <img> in the post
      let preview = $(el).find('img').attr('data-src') || $(el).find('img').attr('src');

      if (title && href && preview) {
        results.push({
          title,
          url: href,
          preview,
          duration: null,
          source: "Hentaigasm"
        });
      }
    });
  } catch (err) {
    console.error("hentaigasm error:", err.message);
  }

  return results;
};