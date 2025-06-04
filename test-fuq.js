const fuq = require('./fuq.js');

async function testFuq() {
  console.log('Testing fuq.js with query "test"...');
  
  try {
    const results = await fuq('test');
    console.log(`Results found: ${results.length}`);
    
    if (results.length > 0) {
      console.log('Sample results:');
      results.slice(0, 3).forEach((result, index) => {
        console.log(`${index + 1}. Title: ${result.title}`);
        console.log(`   URL: ${result.url}`);
        console.log(`   Source: ${result.source}`);
        console.log('');
      });
    } else {
      console.log('No results found. This indicates an issue with the scraping logic.');
    }
  } catch (error) {
    console.error('Error testing fuq function:', error);
  }
}

testFuq();
