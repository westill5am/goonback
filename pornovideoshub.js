const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async function pornovideoshub(query) {
  const url = `https://pornovideoshub.com/?s=${encodeURIComponent(query)}`;
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
          source: "PornoVideosHub"
        });
      }
    });
  } catch (err) {
    console.error("pornovideoshub error:", err.message);
  }

  return results;
};