// FULL SCRAPER TEST: Test every .js scraper in the backend
const fs = require('fs');
const path = require('path');
const hybridScrapers = require('./hybrid-adult-scrapers');

const SCRAPER_DIR = __dirname;
const EXCLUDE = [
  'hybrid-adult-scrapers.js', 'hybrid-scrapers.js', 'working-scrapers.js',
  'test-all-scrapers.js', 'test-all-scrapers-full.js', 'index.js', 'index-production.js',
  'readablestream-polyfill.js', 'package.json', 'package-lock.json', 'main.py', 'models', 'node_modules', 'templates', 'public', 'scraper', 'scrapers', 'README', 'start-server', 'minimal-server.js', 'minimal-test.js', 'final-', 'test-', 'debug-', 'quick-', 'integration-', 'syntax-', 'status-', 'smart-', 'build.sh', 'jsconfig.json', 'stderr.log', 'COMPLETION', 'ENHANCEMENT', 'OPTIMIZATION', 'FIXES', 'FINAL', 'CURRENT', 'SCRAPER_STATUS', 'scraper_test_output.txt', 'scraper-test-report', 'scraper.py', 'requirements.txt', 'render.yaml', 'tos.html', 'start-server.bat', 'start-server.ps1', 'start-smart.js', 'index-backup.js', 'index-debugged.js', 'index-emergency.js', 'index-fixed.js', 'index-optimized.js', 'index-production-fixed.js', 'index-production.js', 'index.html', '__pycache__', '.env', '.pytest_cache', '.renderignore', 'tmp', 'public', 'static', 'README-503-FIX.md', 'README-HYBRID.md', 'README.md', 'README.txt', 'README', 'package-optimized.json', 'package.json', 'package-lock.json', 'node_modules', 'models', 'templates', 'public', 'tmp', 'scraper', 'scrapers', 'main.py', 'requirements.txt', 'stderr.log', 'COMPLETION_SUMMARY.md', 'ENHANCEMENT_SUMMARY.md', 'OPTIMIZATION_COMPLETE.md', 'OPTIMIZATION_PROGRESS.md', 'FIXES_COMPLETE.md', 'FINAL_SUCCESS_REPORT.md', 'CURRENT_STATUS_REPORT.md', 'SCRAPER_STATUS_REPORT.md', 'scraper_test_output.txt', 'scraper-test-report.json', 'scraper-test-report.txt', 'README-503-FIX.md', 'README-HYBRID.md', 'README.md', 'README.txt', 'README', 'package-optimized.json', 'package.json', 'package-lock.json', 'node_modules', 'models', 'templates', 'public', 'tmp', 'scraper', 'scrapers', 'main.py', 'requirements.txt', 'stderr.log', 'COMPLETION_SUMMARY.md', 'ENHANCEMENT_SUMMARY.md', 'OPTIMIZATION_COMPLETE.md', 'OPTIMIZATION_PROGRESS.md', 'FIXES_COMPLETE.md', 'FINAL_SUCCESS_REPORT.md', 'CURRENT_STATUS_REPORT.md', 'SCRAPER_STATUS_REPORT.md', 'scraper_test_output.txt', 'scraper-test-report.json', 'scraper-test-report.txt', 'README-503-FIX.md', 'README-HYBRID.md', 'README.md', 'README.txt', 'README', 'package-optimized.json', 'package.json', 'package-lock.json', 'node_modules', 'models', 'templates', 'public', 'tmp', 'scraper', 'scrapers', 'main.py', 'requirements.txt', 'stderr.log', 'COMPLETION_SUMMARY.md', 'ENHANCEMENT_SUMMARY.md', 'OPTIMIZATION_COMPLETE.md', 'OPTIMIZATION_PROGRESS.md', 'FIXES_COMPLETE.md', 'FINAL_SUCCESS_REPORT.md', 'CURRENT_STATUS_REPORT.md', 'SCRAPER_STATUS_REPORT.md', 'scraper_test_output.txt', 'scraper-test-report.json', 'scraper-test-report.txt', 'README-503-FIX.md', 'README-HYBRID.md', 'README.md', 'README.txt', 'README', 'package-optimized.json', 'package.json', 'package-lock.json', 'node_modules', 'models', 'templates', 'public', 'tmp', 'scraper', 'scrapers', 'main.py', 'requirements.txt', 'stderr.log', 'COMPLETION_SUMMARY.md', 'ENHANCEMENT_SUMMARY.md', 'OPTIMIZATION_COMPLETE.md', 'OPTIMIZATION_PROGRESS.md', 'FIXES_COMPLETE.md', 'FINAL_SUCCESS_REPORT.md', 'CURRENT_STATUS_REPORT.md', 'SCRAPER_STATUS_REPORT.md', 'scraper_test_output.txt', 'scraper-test-report.json', 'scraper-test-report.txt', 'README-503-FIX.md', 'README-HYBRID.md', 'README.md', 'README.txt', 'README', 'package-optimized.json', 'package.json', 'package-lock.json', 'node_modules', 'models', 'templates', 'public', 'tmp', 'scraper', 'scrapers', 'main.py', 'requirements.txt', 'stderr.log', 'COMPLETION_SUMMARY.md', 'ENHANCEMENT_SUMMARY.md', 'OPTIMIZATION_COMPLETE.md', 'OPTIMIZATION_PROGRESS.md', 'FIXES_COMPLETE.md', 'FINAL_SUCCESS_REPORT.md', 'CURRENT_STATUS_REPORT.md', 'SCRAPER_STATUS_REPORT.md', 'scraper_test_output.txt', 'scraper-test-report.json', 'scraper-test-report.txt', 'README-503-FIX.md', 'README-HYBRID.md', 'README.md', 'README.txt', 'README', 'package-optimized.json', 'package.json', 'package-lock.json', 'node_modules', 'models', 'templates', 'public', 'tmp', 'scraper', 'scrapers', 'main.py', 'requirements.txt', 'stderr.log', 'COMPLETION_SUMMARY.md', 'ENHANCEMENT_SUMMARY.md', 'OPTIMIZATION_COMPLETE.md', 'OPTIMIZATION_PROGRESS.md', 'FIXES_COMPLETE.md', 'FINAL_SUCCESS_REPORT.md', 'CURRENT_STATUS_REPORT.md', 'SCRAPER_STATUS_REPORT.md', 'scraper_test_output.txt', 'scraper-test-report.json', 'scraper-test-report.txt', 'README-503-FIX.md', 'README-HYBRID.md', 'README.md', 'README.txt', 'README', 'package-optimized.json', 'package.json', 'package-lock.json', 'node_modules', 'models', 'templates', 'public', 'tmp', 'scraper', 'scrapers', 'main.py', 'requirements.txt', 'stderr.log', 'COMPLETION_SUMMARY.md', 'ENHANCEMENT_SUMMARY.md', 'OPTIMIZATION_COMPLETE.md', 'OPTIMIZATION_PROGRESS.md', 'FIXES_COMPLETE.md', 'FINAL_SUCCESS_REPORT.md', 'CURRENT_STATUS_REPORT.md', 'SCRAPER_STATUS_REPORT.md', 'scraper_test_output.txt', 'scraper-test-report.json', 'scraper-test-report.txt', 'README-503-FIX.md', 'README-HYBRID.md', 'README.md', 'README.txt', 'README', 'package-optimized.json', 'package.json', 'package-lock.json', 'node_modules', 'models', 'templates', 'public', 'tmp', 'scraper', 'scrapers', 'main.py', 'requirements.txt', 'stderr.log', 'COMPLETION_SUMMARY.md', 'ENHANCEMENT_SUMMARY.md', 'OPTIMIZATION_COMPLETE.md', 'OPTIMIZATION_PROGRESS.md', 'FIXES_COMPLETE.md', 'FINAL_SUCCESS_REPORT.md', 'CURRENT_STATUS_REPORT.md', 'SCRAPER_STATUS_REPORT.md', 'scraper_test_output.txt', 'scraper-test-report.json', 'scraper-test-report.txt']

// Find all .js files that are likely scrapers
const allFiles = fs.readdirSync(SCRAPER_DIR);
const scraperFiles = allFiles.filter(f => f.endsWith('.js') && !EXCLUDE.some(ex => f.includes(ex)));

console.log('🧪 Found', scraperFiles.length, 'scraper files.');

const queries = ['milf', 'teen', 'blonde', 'anal'];

(async () => {
  for (const file of scraperFiles) {
    const name = file.replace('.js', '');
    try {
      console.log(`\n====================\nTesting: ${name}`);
      for (const query of queries) {
        try {
          const results = await hybridScrapers.searchAllHybrid(query, [name]);
          if (results.results && results.results.length > 0) {
            console.log(`  ✅ ${name} (${query}): ${results.results.length} results`);
          } else {
            console.log(`  ❌ ${name} (${query}): No results`);
          }
        } catch (err) {
          console.log(`  ❌ ${name} (${query}): ERROR - ${err.message}`);
        }
      }
    } catch (err) {
      console.log(`  ❌ Failed to test ${name}: ${err.message}`);
    }
  }
})();
