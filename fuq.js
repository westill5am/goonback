const axios = require('axios');
const cheerio = require('cheerio');

const SCRAPER_API_KEY = '23c1327aeb270f44bb141d469c7f9823';
const proxyUrl = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=`;

async function fetchWithScraperAPI(url) {
  try {
    const response = await axios.get(proxyUrl + encodeURIComponent(url));
    return response.data;
  } catch (error) {
    console.error('ScraperAPI error:', error.message);
    return null;
  }
}

module.exports = async function fuq(query) {
  const baseUrl = `https://fuq.com/search/${encodeURIComponent(query)}`;
  const results = [];

  try {
    let page = 1;
    let hasMoreResults = true;

    while (hasMoreResults) {
      const url = `${baseUrl}&page=${page}`;
      const data = await fetchWithScraperAPI(url);
      if (!data) break;

      const $ = cheerio.load(data);

      const links = $('a[href*="/out/"]');
      if (links.length === 0) {
        console.warn(`No links found on page ${page}. Check selectors or site structure.`);
        hasMoreResults = false;
        break;
      }

      links.each((i, el) => {
        try {
          const title = $(el).find('img').attr('alt') || $(el).text().trim();
          const href = $(el).attr('href');

          if (title && href) {
            results.push({
              title: title,
              url: href.startsWith('http') ? href : 'https://fuq.com' + href,
              duration: null, // Placeholder for duration if available
              source: "Fuq",
            });
          } else {
            console.warn(`Missing title or href for element: ${$(el).html()}`);
          }
        } catch (parseError) {
          console.error("Error parsing link element:", parseError.message);
        }
      });

      page++;
    }
  } catch (err) {
    console.error("fuq error:", err.message);
  }

  return results;
};