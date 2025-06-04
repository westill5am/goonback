const axios = require('axios');
const cheerio = require('cheerio');
module.exports = async function xvn(query) {
  const results = [];
  try {
    // Replace with the real xvn search URL
    const url = "https://www.xvn.com/search/?q=" + encodeURIComponent(query);
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Try multiple selectors for video cards
    let videoEls = $('.video-item, .thumb, .video, .item, .video-block');
    if (videoEls.length === 0) {
      videoEls = $('a[href*="/video/"]'); // fallback: links to videos
    }

    videoEls.each((i, el) => {
      let title = $(el).find('.title').text().trim() || $(el).attr('title') || $(el).find('img').attr('alt') || $(el).text().trim();
      let href = $(el).find('a').attr('href') || $(el).attr('href');
      let duration = $(el).find('.duration').text().trim() || $(el).find('.video-duration').text().trim();
      let preview = $(el).find('img').attr('data-src') || $(el).find('img').attr('src') || '';

      // Normalize href
      if (href && !href.startsWith('http')) href = 'https://www.xvn.com' + href;
      // Normalize preview
      if (preview && preview.startsWith('//')) preview = 'https:' + preview;
      if (preview && preview.startsWith('/')) preview = 'https://www.xvn.com' + preview;

      if (title && href) {
        results.push({
          title,
          url: href,
          duration,
          preview,
          source: "xvn"
        });
      }
    });

    if (results.length === 0) {
      console.error('xvn: No results found. Selectors may be outdated or site structure changed.');
    }
  } catch (err) {
    console.error("xvn error:", err.message);
  }
  return results;
};
