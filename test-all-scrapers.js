// COMPREHENSIVE SCRAPER TESTING AND DEBUGGING TOOL
// Tests all scrapers and integrates WebScrapingAPI fallbacks

const fs = require('fs');
const path = require('path');

// Import hybrid scrapers
let hybridScrapers;
try {
  hybridScrapers = require('./hybrid-adult-scrapers');
  console.log('✅ Hybrid adult scrapers loaded successfully');
} catch (error) {
  console.error('❌ Failed to load hybrid scrapers:', error.message);
  process.exit(1);
}

// Test configuration
const TEST_CONFIG = {
  queries: ['milf', 'teen', 'blonde', 'anal'],
  scrapers: ['spankbang', 'redtube', 'xvideos', 'pornhub'],
  maxResults: 5,
  timeout: 30000
};

// Results storage
const testResults = {
  timestamp: new Date().toISOString(),
  summary: {
    totalTests: 0,
    passed: 0,
    failed: 0,
    scraperStatus: {}
  },
  detailedResults: [],
  recommendations: []
};

async function testScraper(scraperName, query) {
  console.log(`\n🔍 Testing ${scraperName} with query: "${query}"`);
  
  const testResult = {
    scraper: scraperName,
    query: query,
    timestamp: new Date().toISOString(),
    status: 'unknown',
    resultCount: 0,
    method: 'unknown',
    error: null,
    executionTime: 0,
    recommendations: []
  };

  const startTime = Date.now();

  try {
    // Test with hybrid scraper system
    const searchResult = await hybridScrapers.searchAllHybrid(query, [scraperName]);
    
    testResult.executionTime = Date.now() - startTime;
    testResult.resultCount = searchResult.results.length;
    testResult.method = searchResult.stats.apiCount > 0 ? 'WebScrapingAPI' : 'Direct';
    
    if (searchResult.results.length > 0) {
      testResult.status = 'success';
      console.log(`✅ ${scraperName}: ${searchResult.results.length} results (${testResult.method})`);
      
      // Sample first result
      const firstResult = searchResult.results[0];
      console.log(`   📝 Sample: "${firstResult.title.substring(0, 50)}..."`);
      console.log(`   🔗 URL: ${firstResult.link}`);
      
    } else {
      testResult.status = 'no_results';
      testResult.recommendations.push('Consider updating selectors or URL patterns');
      console.log(`⚠️  ${scraperName}: No results found`);
    }

  } catch (error) {
    testResult.executionTime = Date.now() - startTime;
    testResult.status = 'error';
    testResult.error = error.message;
    
    console.log(`❌ ${scraperName}: Error - ${error.message}`);
    
    // Analyze error and provide recommendations
    if (error.message.includes('403')) {
      testResult.recommendations.push('403 Forbidden - Site blocking requests. Implement WebScrapingAPI fallback');
    } else if (error.message.includes('timeout')) {
      testResult.recommendations.push('Request timeout - Increase timeout or optimize scraping logic');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      testResult.recommendations.push('Network/DNS issue - Check site URL and connectivity');
    } else if (error.message.includes('Cannot read property')) {
      testResult.recommendations.push('Selector issue - Update CSS selectors for current site structure');
    } else {
      testResult.recommendations.push('Unknown error - Debug scraper implementation');
    }
  }

  return testResult;
}

async function testAllScrapers() {
  console.log('🚀 Starting comprehensive scraper testing...');
  console.log(`📊 Testing ${TEST_CONFIG.scrapers.length} scrapers with ${TEST_CONFIG.queries.length} queries each`);
  
  // Get initial stats
  const initialStats = hybridScrapers.getUsageStats();
  console.log(`📈 Initial stats - Direct: ${initialStats.directScrapingCount}, API: ${initialStats.apiUsageCount}`);

  for (const scraper of TEST_CONFIG.scrapers) {
    console.log(`\n🔧 ============ Testing ${scraper.toUpperCase()} ============`);
    
    testResults.summary.scraperStatus[scraper] = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      averageResults: 0,
      preferredMethod: 'unknown'
    };

    for (const query of TEST_CONFIG.queries) {
      testResults.summary.totalTests++;
      testResults.summary.scraperStatus[scraper].totalTests++;
      
      const result = await testScraper(scraper, query);
      testResults.detailedResults.push(result);
      
      if (result.status === 'success') {
        testResults.summary.passed++;
        testResults.summary.scraperStatus[scraper].passed++;
      } else {
        testResults.summary.failed++;
        testResults.summary.scraperStatus[scraper].failed++;
      }
      
      // Wait between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Calculate scraper-specific stats
    const scraperResults = testResults.detailedResults.filter(r => r.scraper === scraper);
    const successfulResults = scraperResults.filter(r => r.status === 'success');
    
    if (successfulResults.length > 0) {
      testResults.summary.scraperStatus[scraper].averageResults = 
        successfulResults.reduce((sum, r) => sum + r.resultCount, 0) / successfulResults.length;
      
      const directCount = successfulResults.filter(r => r.method === 'Direct').length;
      const apiCount = successfulResults.filter(r => r.method === 'WebScrapingAPI').length;
      
      testResults.summary.scraperStatus[scraper].preferredMethod = 
        directCount >= apiCount ? 'Direct' : 'WebScrapingAPI';
    }
  }

  // Get final stats
  const finalStats = hybridScrapers.getUsageStats();
  console.log(`\n📊 Final stats - Direct: ${finalStats.directScrapingCount}, API: ${finalStats.apiUsageCount}`);
  
  return testResults;
}

function generateRecommendations(results) {
  console.log('\n📋 ============ RECOMMENDATIONS ============');
  
  const recommendations = [];
  
  // Analyze overall performance
  const successRate = (results.summary.passed / results.summary.totalTests) * 100;
  console.log(`📈 Overall success rate: ${successRate.toFixed(1)}%`);
  
  if (successRate < 50) {
    recommendations.push('❗ Critical: Less than 50% success rate. Major scraper updates needed.');
  } else if (successRate < 75) {
    recommendations.push('⚠️  Warning: Success rate below 75%. Some scrapers need attention.');
  } else {
    recommendations.push('✅ Good: Success rate above 75%. Minor optimizations recommended.');
  }

  // Analyze each scraper
  for (const [scraper, stats] of Object.entries(results.summary.scraperStatus)) {
    const scraperSuccessRate = (stats.passed / stats.totalTests) * 100;
    console.log(`\n🔧 ${scraper.toUpperCase()}:`);
    console.log(`   Success: ${stats.passed}/${stats.totalTests} (${scraperSuccessRate.toFixed(1)}%)`);
    console.log(`   Avg Results: ${stats.averageResults.toFixed(1)}`);
    console.log(`   Preferred: ${stats.preferredMethod}`);
    
    if (scraperSuccessRate === 0) {
      recommendations.push(`❌ ${scraper}: Complete failure - Implement WebScrapingAPI fallback`);
    } else if (scraperSuccessRate < 50) {
      recommendations.push(`⚠️  ${scraper}: Poor performance - Update selectors and add WebScrapingAPI`);
    } else if (stats.preferredMethod === 'WebScrapingAPI') {
      recommendations.push(`💰 ${scraper}: Relies on WebScrapingAPI - Consider optimizing direct scraping`);
    } else {
      recommendations.push(`✅ ${scraper}: Working well with direct scraping`);
    }
  }

  // API usage analysis
  const finalStats = hybridScrapers.getUsageStats();
  const apiUsagePercentage = finalStats.apiUsagePercentage || 0;
  
  console.log(`\n💰 API Usage: ${apiUsagePercentage.toFixed(1)}%`);
  
  if (apiUsagePercentage > 50) {
    recommendations.push('💸 High API usage - Focus on fixing direct scraping to reduce costs');
  } else if (apiUsagePercentage > 25) {
    recommendations.push('💡 Moderate API usage - Some scrapers need direct scraping improvements');
  } else {
    recommendations.push('💚 Low API usage - Good balance between direct and API scraping');
  }

  return recommendations;
}

async function saveResults(results) {
  const reportPath = path.join(__dirname, 'scraper-test-report.json');
  const readableReportPath = path.join(__dirname, 'scraper-test-report.txt');
  
  // Save JSON report
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  
  // Create readable report
  let readableReport = `SCRAPER TEST REPORT\n`;
  readableReport += `Generated: ${results.timestamp}\n`;
  readableReport += `=`.repeat(50) + '\n\n';
  
  readableReport += `SUMMARY:\n`;
  readableReport += `Total Tests: ${results.summary.totalTests}\n`;
  readableReport += `Passed: ${results.summary.passed}\n`;
  readableReport += `Failed: ${results.summary.failed}\n`;
  readableReport += `Success Rate: ${((results.summary.passed / results.summary.totalTests) * 100).toFixed(1)}%\n\n`;
  
  readableReport += `SCRAPER PERFORMANCE:\n`;
  for (const [scraper, stats] of Object.entries(results.summary.scraperStatus)) {
    const successRate = (stats.passed / stats.totalTests) * 100;
    readableReport += `${scraper.toUpperCase()}:\n`;
    readableReport += `  Success: ${stats.passed}/${stats.totalTests} (${successRate.toFixed(1)}%)\n`;
    readableReport += `  Avg Results: ${stats.averageResults.toFixed(1)}\n`;
    readableReport += `  Preferred Method: ${stats.preferredMethod}\n\n`;
  }
  
  readableReport += `RECOMMENDATIONS:\n`;
  results.recommendations.forEach(rec => {
    readableReport += `- ${rec}\n`;
  });
  
  fs.writeFileSync(readableReportPath, readableReport);
  
  console.log(`\n📄 Reports saved:`);
  console.log(`   JSON: ${reportPath}`);
  console.log(`   Text: ${readableReportPath}`);
}

// Main execution
async function main() {
  try {
    console.log('🧪 COMPREHENSIVE SCRAPER TESTING TOOL');
    console.log('=====================================\n');
    
    const results = await testAllScrapers();
    const recommendations = generateRecommendations(results);
    
    results.recommendations = recommendations;
    
    // Display recommendations
    recommendations.forEach(rec => console.log(rec));
    
    await saveResults(results);
    
    console.log('\n✅ Testing completed successfully!');
    
  } catch (error) {
    console.error('❌ Testing failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { testAllScrapers, generateRecommendations, saveResults };
