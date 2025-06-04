const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async function xxxbunker(query) {
  const url = `https://xxxbunker.com/search/${encodeURIComponent(query)}`;
  const results = [];

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    let videoEls = $('.video-thumb, .video-item, .thumb, .video-block, a[href*="/video/"]');

    videoEls.each((i, el) => {
      try {
        let title = $(el).find('a').attr('title')?.trim() || $(el).find('.title').text().trim() || $(el).attr('title') || $(el).find('img').attr('alt') || $(el).text().trim();
        let href = $(el).find('a').attr('href') || $(el).attr('href');
        let duration = $(el).find('.duration').text().trim() || $(el).find('.video-duration').text().trim();
        let preview = $(el).find('img').attr('data-src') || $(el).find('img').attr('src') || '';

        if (href && !href.startsWith('http')) href = 'https://xxxbunker.com' + href;
        if (preview && preview.startsWith('//')) preview = 'https:' + preview;
        if (preview && preview.startsWith('/')) preview = 'https://xxxbunker.com' + preview;

        if (title && href) {
          results.push({
            title,
            url: href,
            duration,
            preview,
            source: "XXXBunker"
          });
        }
      } catch (parseError) {
        console.error("Error parsing video element:", parseError.message);
      }
    });

    if (results.length === 0) {
      console.error('XXXBunker: No results found. Selectors may be outdated or site structure changed.');
    }
  } catch (err) {
    console.error("xxxbunker error:", err.message);
  }

  return results;
};