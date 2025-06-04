const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async function eporner(query) {
  const url = `https://www.eporner.com/search/${encodeURIComponent(query)}/`;
  const results = [];

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Try multiple selectors for video cards
    let videoEls = $('.mb-3, .video-thumb, .thumb, .video-block, .video-item');
    if (videoEls.length === 0) {
      videoEls = $('a[href*="/video/"]'); // fallback: links to videos
    }

    videoEls.each((i, el) => {
      let title = $(el).find('img').attr('alt')?.trim() || $(el).find('.title').text().trim() || $(el).attr('title') || $(el).find('a').attr('title') || $(el).text().trim();
      let href = $(el).find('a').attr('href') || $(el).attr('href');
      let duration = $(el).find('.text-white').text().trim() || $(el).find('.duration').text().trim();
      let preview = $(el).find('img').attr('data-src') || $(el).find('img').attr('src') || '';

      // Normalize href
      if (href && !href.startsWith('http')) {
        href = 'https://www.eporner.com' + href;
      }
      // Normalize preview
      if (preview && preview.startsWith('//')) preview = 'https:' + preview;
      if (preview && preview.startsWith('/')) preview = 'https://www.eporner.com' + preview;

      if (title && href) {
        results.push({
          title,
          url: href,
          duration,
          preview,
          source: "Eporner"
        });
      }
    });

    if (results.length === 0) {
      console.error("eporner: No results found. Selectors may be outdated or site structure changed.");
    }
  } catch (err) {
    console.error("eporner error:", err.message);
  }

  return results;
};