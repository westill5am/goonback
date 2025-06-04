// HYBRID SCRAPER TEST
// Tests direct scraping vs WebScrapingAPI fallback
// Run: node test-hybrid-scrapers.js

const scrapers = require('./hybrid-scrapers');

async function testHybridScrapers() {
  console.log('🧪 =================================');
  console.log('🧪 Testing Hybrid Scrapers');
  console.log('🧪 =================================');

  try {
    console.log('\n🔍 Testing Arsenal News scraping...');
    const arsenalNews = await scrapers.scrapeArsenalNews();
    console.log(`✅ Arsenal News: ${arsenalNews.length} articles`);
    if (arsenalNews.length > 0) {
      console.log(`   First article: "${arsenalNews[0].title}"`);
    }

    console.log('\n🔍 Testing Sky Sports scraping...');
    const skyNews = await scrapers.scrapeSkySportsArsenal();
    console.log(`✅ Sky Sports: ${skyNews.length} articles`);
    if (skyNews.length > 0) {
      console.log(`   First article: "${skyNews[0].title}"`);
    }

    console.log('\n🔍 Testing Reddit scraping...');
    const redditPosts = await scrapers.scrapeRedditArsenal();
    console.log(`✅ Reddit: ${redditPosts.length} posts`);
    if (redditPosts.length > 0) {
      console.log(`   Top post: "${redditPosts[0].title}"`);
    }

    console.log('\n🔍 Testing comprehensive scraping...');
    const allContent = await scrapers.getAllArsenalContent();
    console.log(`✅ Total content: ${allContent.length} items`);

    // Show API usage
    const usage = scrapers.getAPIUsage();
    console.log(`\n📊 API Usage: ${usage.used}/${usage.limit} (${usage.remaining} remaining)`);

    // Show sample results
    console.log('\n📋 Sample Results:');
    allContent.slice(0, 5).forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.title} (${item.source})`);
    });

    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testHybridScrapers();
