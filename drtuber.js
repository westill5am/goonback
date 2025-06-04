const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async function drtuber(query) {
  const url = `https://www.drtuber.com/search/${encodeURIComponent(query)}`;
  const results = [];

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    $('.thumb').each((i, el) => {
      const title = $(el).find('a').attr('title');
      const href = $(el).find('a').attr('href');
      const duration = $(el).find('.duration').text().trim();

      if (title && href) {
        results.push({
          title: title.trim(),
          url: 'https://www.drtuber.com' + href,
          duration,
          source: "DrTuber"
        });
      }
    });
  } catch (err) {
    console.error("drtuber error:", err.message);
  }

  return results;
};