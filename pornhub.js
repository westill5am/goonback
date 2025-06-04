const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async function pornhub(query) {
  const url = `https://www.pornhub.com/video/search?search=${encodeURIComponent(query)}`;
  const results = [];

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Select video containers with better selectors
    $('.pcVideoListItem, .videoblock, .phimage').each((i, el) => {
      try {
        const linkEl = $(el).find('a[href*="/view_video.php?viewkey="]').first();
        const href = linkEl.attr('href');
        
        // Try multiple selectors for title extraction
        let title = linkEl.find('img').attr('alt') ||
                   linkEl.attr('title') ||
                   $(el).find('.title a').attr('title') ||
                   $(el).find('.title a').text().trim() ||
                   $(el).find('.videoTitle a').text().trim() ||
                   $(el).find('img').attr('title') ||
                   linkEl.text().trim();
        
        // Get preview image
        let preview = linkEl.find('img').attr('data-src') || 
                     linkEl.find('img').attr('data-thumb_url') ||
                     linkEl.find('img').attr('src');
        
        // Get duration
        let duration = $(el).find('.duration, .marker-overlays .duration').text().trim();
        
        // Clean up and validate title
        if (!title || /^\d+p?$/i.test(title) || title === 'Watch' || title.length < 3) {
          title = 'Pornhub Video';
        }
        
        // Only add if we have essential data
        if (title && href && preview) {
          results.push({
            title: title.trim(),
            url: href.startsWith('http') ? href : 'https://www.pornhub.com' + href,
            preview,
            duration: duration || null,
            source: "Pornhub"
          });
        }
      } catch (parseError) {
        console.error('Error parsing PornHub video element:', parseError.message);
      }
    });
  } catch (err) {
    console.error("pornhub error:", err.message);
  }

  // console.log('Pornhub results:', results); // Debug log removed
  return results;
};