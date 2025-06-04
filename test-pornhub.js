const scraper = require('./pornhub.js');
(async () => {
  const results = await scraper('milf');
  console.log(JSON.stringify(results, null, 2));
})();
