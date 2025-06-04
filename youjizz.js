const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async function youjizz(query) {
  const url = `https://www.youjizz.com/search/?query=${encodeURIComponent(query)}`;
  const results = [];

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    let videoEls = $('.video-thumb, .thumb, .video-box, .item, a[href*="/videos/"]');

    videoEls.each((i, el) => {
      try {
        let title = $(el).find('.title').text().trim() || $(el).attr('title') || $(el).find('a').attr('title') || $(el).find('img').attr('alt') || $(el).text().trim();
        let href = $(el).find('a').attr('href') || $(el).attr('href');
        let duration = $(el).find('.duration').text().trim() || $(el).find('.video-duration').text().trim();
        let preview = $(el).find('img').attr('data-src') || $(el).find('img').attr('src') || '';

        if (href && !href.startsWith('http')) {
          href = 'https://www.youjizz.com' + href;
        }
        if (preview && preview.startsWith('//')) preview = 'https:' + preview;
        if (preview && preview.startsWith('/')) preview = 'https://www.youjizz.com' + preview;

        if (title && href) {
          results.push({
            title: title,
            url: href,
            duration: duration,
            preview: preview,
            source: "YouJizz"
          });
        }
      } catch (parseError) {
        console.error("Error parsing video element:", parseError.message);
      }
    });

    if (results.length === 0) {
      console.error("youjizz: No results found. Selectors may be outdated or site structure changed.");
    }
  } catch (err) {
    console.error("youjizz error:", err.message);
  }

  return results;
};