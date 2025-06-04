const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async function tubedupe(query) {
  const url = `https://www.tubedupe.com/search/${encodeURIComponent(query)}`;
  const results = [];

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Try multiple selectors for video cards
    let videoEls = $('.thumb, .video-item, .video, .item, .video-block');
    if (videoEls.length === 0) {
      videoEls = $('a[href*="/video/"]'); // fallback: links to videos
    }

    videoEls.each((i, el) => {
      let title = $(el).find('.title a').text().trim() || $(el).find('.title').text().trim() || $(el).attr('title') || $(el).find('img').attr('alt') || $(el).text().trim();
      let href = $(el).find('.title a').attr('href') || $(el).find('a').attr('href') || $(el).attr('href');
      let duration = $(el).find('.duration').text().trim() || $(el).find('.video-duration').text().trim();
      let preview = $(el).find('img').attr('data-src') || $(el).find('img').attr('src') || '';

      // Normalize href
      if (href && !href.startsWith('http')) href = 'https://www.tubedupe.com' + href;
      // Normalize preview
      if (preview && preview.startsWith('//')) preview = 'https:' + preview;
      if (preview && preview.startsWith('/')) preview = 'https://www.tubedupe.com' + preview;

      if (title && href) {
        results.push({
          title,
          url: href,
          duration,
          preview,
          source: "TubeDupe"
        });
      }
    });

    if (results.length === 0) {
      console.error('TubeDupe: No results found. Selectors may be outdated or site structure changed.');
    }
  } catch (err) {
    console.error("tubedupe error:", err.message);
  }

  return results;
};