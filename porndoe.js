const axios = require('axios');
const cheerio = require('cheerio');

// Helper function to check if a title is invalid
function isInvalidTitle(title) {
  if (!title || title.length < 3) return true;
  
  const invalidPatterns = [
    /^[0-9]+p(\s+[0-9]+p)*$/i,  // Just quality indicators like "720p", "1080p"
    /^\d+p?$/i,                  // Just numbers with optional 'p'
    /^(watch|play|view)$/i,      // Just action words
    /^(hd|4k|uhd)$/i,           // Just quality terms
    /^[\d\s]*$/,                // Just numbers and spaces
    /^[^\w\s]*$/,               // Just special characters
    /^(no title|untitled)$/i     // Default/empty titles
  ];
  
  return invalidPatterns.some(pattern => pattern.test(title.trim()));
}

module.exports = async function porndoe(query) {
  const results = [];
  try {
    // Try multiple URL formats as sites often change their search structure
    const possibleUrls = [
      `https://www.porndoe.com/search/?q=${encodeURIComponent(query)}`,
      `https://www.porndoe.com/search?q=${encodeURIComponent(query)}`,
      `https://www.porndoe.com/search/videos/${encodeURIComponent(query)}/`,
      `https://www.porndoe.com/search/${encodeURIComponent(query)}/`,
      `https://www.porndoe.com/videos/?search=${encodeURIComponent(query)}`
    ];
    
    let data = null;
    let workingUrl = null;
    
    for (const url of possibleUrls) {
      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.porndoe.com/',
          }
        });
        data = response.data;
        workingUrl = url;
        break;
      } catch (err) {
        continue;
      }
    }
    
    if (!data) {
      throw new Error('All URL formats failed');
    }
    const $ = cheerio.load(data);

    // Get video items
    let videoEls = $('div.video-item');
    
    if (videoEls.length === 0) {
      videoEls = $('a[href*="/video/"]'); // fallback
    }

    videoEls.each((i, el) => {
      // Look for the main video link within the video item
      let a = $(el).find('a[href*="/video/"], a[href*="/watch/"]').first();
      
      // If no video link found, try broader search
      if (!a.length) {
        a = $(el).find('a[href]').first();
      }
      
      // If still no link, try parent elements
      if (!a.length) {
        a = $(el).parent().find('a[href*="/video/"], a[href*="/watch/"]').first();
      }
      
      // If no video link found in element, check if element itself is a video link
      if (!a.length) {
        if ($(el).is('a[href*="/video/"], a[href*="/watch/"]')) {
          a = $(el);
        } else {
          return;
        }
      }
      
      let href = a.attr('href');
      if (!href) return;
      
      // Enhanced title extraction with better selectors for PornDoe structure
      let title = '';
      
      // Try various title selectors in order of preference
      const titleSelectors = [
        '.video-item-title', '.video-title', 'h3.title', 'h3', 
        '.title', 'span.title', 'div.title', '.video-name',
        '[data-title]', '.thumb-title'
      ];
      
      for (const selector of titleSelectors) {
        const titleEl = $(el).find(selector);
        if (titleEl.length) {
          title = titleEl.text().trim();
          if (title && !isInvalidTitle(title)) break;
        }
      }
      
      // Fallback to link attributes if no good title found
      if (!title || isInvalidTitle(title)) {
        title = a.attr('title') || a.attr('data-title') || '';
      }
      
      // Try to get title from image alt text
      if (!title || isInvalidTitle(title)) {
        const img = $(el).find('img').first();
        title = img.attr('alt') || img.attr('title') || '';
      }
      
      // Last resort: try to extract from link text but filter out quality indicators
      if (!title || isInvalidTitle(title)) {
        let linkText = a.text().trim();
        // Remove quality indicators and watch buttons from the text
        linkText = linkText.replace(/\b(720p|1080p|360p|480p|4K|HD|Watch|play)\b/gi, '').trim();
        if (linkText && !isInvalidTitle(linkText)) {
          title = linkText;
        }
      }
      
      // Final validation and cleanup
      if (!title || isInvalidTitle(title)) {
        title = 'PornDoe Video';
      }
      
      // Clean up title
      title = title.replace(/\s+/g, ' ').trim();
      
      // Get image for preview - handle both IMG tags and SVG with data-src
      let img = $(el).find('img').first();
      let preview = '';
      
      // First try regular img tags
      if (img.length) {
        preview = img.attr('src') || img.attr('data-src') || img.attr('data-original') || img.attr('data-lazy') || '';
      }
      
      // If no img or no good preview, try SVG elements (PornDoe uses SVG for lazy loading)
      if (!preview || preview.length < 10) {
        const svg = $(el).find('svg.video-item-svg, svg[data-src]').first();
        if (svg.length) {
          preview = svg.attr('data-src') || '';
        }
      }
      
      // If still no preview, look for any element with data-src
      if (!preview || preview.length < 10) {
        const dataSrcEl = $(el).find('[data-src]').first();
        if (dataSrcEl.length) {
          preview = dataSrcEl.attr('data-src') || '';
        }
      }
      
      // Normalize preview URL
      if (preview.startsWith('//')) preview = 'https:' + preview;
      else if (preview.startsWith('/')) preview = 'https://www.porndoe.com' + preview;
      else if (preview && !preview.startsWith('http')) preview = 'https://www.porndoe.com/' + preview.replace(/^\/*/, '');
      
      // Fallback: try parent or sibling img if not found
      if (!preview || preview.length < 10 || preview.includes('placeholder')) {
        let parentImg = $(el).parent().find('img').first();
        if (parentImg.length) {
          let altPreview = parentImg.attr('data-src') || parentImg.attr('src') || parentImg.attr('data-original') || '';
          if (altPreview && altPreview.length > 10 && !altPreview.includes('placeholder')) {
            if (altPreview.startsWith('//')) altPreview = 'https:' + altPreview;
            else if (altPreview.startsWith('/')) altPreview = 'https://www.porndoe.com' + altPreview;
            else if (!altPreview.startsWith('http')) altPreview = 'https://www.porndoe.com/' + altPreview.replace(/^\/*/, '');
            preview = altPreview;
          }
        }
      }
      
      // Skip if essential data is missing
      if (!href || !title || !preview || preview.length < 10 || preview.includes('placeholder')) {
        return;
      }
      if (!href.startsWith('http')) href = 'https://www.porndoe.com' + href;
      
      results.push({
        title: title.trim(),
        url: href,
        preview,
        source: "Porndoe"
      });
    });
    if (results.length === 0) {
      console.error('Porndoe: No results found. Selectors may be outdated or site structure changed.');
    }
  } catch (err) {
    console.error("porndoe error:", err.message);
  }
  return results;
}
