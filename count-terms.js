const http = require('http');

http.get('http://localhost:8000/search-categories', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const categories = JSON.parse(data).categories;
    let total = 0;
    
    Object.keys(categories).forEach(key => {
      const count = categories[key].length;
      console.log(`${key}: ${count} terms`);
      total += count;
    });
    
    console.log(`\nTotal search terms: ${total}`);
    console.log(`Number of categories: ${Object.keys(categories).length}`);
  });
}).on('error', err => {
  console.error('Error:', err.message);
});
