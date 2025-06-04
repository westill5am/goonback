const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async function porn300(query) {
  const url = `https://www.porn300.com/search/${encodeURIComponent(query)}`;
  const results = [];

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    $('.video-block').each((i, el) => {
      const title = $(el).find('.title a').text().trim();
      const href = $(el).find('a').attr('href');
      const duration = $(el).find('.duration').text().trim();

      if (title && href) {
        results.push({
          title,
          url: 'https://www.porn300.com' + href,
          duration,
          source: "Porn300"
        });
      }
    });
  } catch (err) {
    console.error("porn300 error:", err.message);
  }

  return results;
};