import asyncio
import sys
import json
import os
from playwright.async_api import async_playwright

async def beeg_search(query, max_pages=3):
    """Search beeg using Playwright for JavaScript rendering"""
    import random
    import time
    results = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        )
        page = await context.new_page()

        try:
            for page_num in range(1, max_pages + 1):
                if page_num == 1:
                    url = f"https://beeg.com/search?q={query}"
                else:
                    url = f"https://beeg.com/search?q={query}&page={page_num}"

                try:
                    await page.goto(url, wait_until='networkidle', timeout=30000)
                    await page.wait_for_timeout(7000)  # Wait longer for content to load

                    # DEBUG: Dump HTML to file for inspection
                    html = await page.content()
                    debug_path = os.path.join(os.path.dirname(__file__), f'beeg_debug_{page_num}.html')
                    with open(debug_path, 'w', encoding='utf-8') as f:
                        f.write(html)
                    print(f"[beeg.py] Saved debug HTML: {debug_path}")

                    # Try to find video cards by <article> (fallback to old selector if needed)
                    video_links = await page.evaluate('''
                        () => {
                            function normalizeUrl(url) {
                                if (!url) return '';
                                if (url.startsWith('http')) return url;
                                if (url.startsWith('//')) return 'https:' + url;
                                if (url.startsWith('/')) return 'https://beeg.com' + url;
                                return url;
                            }
                            const results = [];
                            // Try <article> based cards
                            const articles = document.querySelectorAll('article');
                            for (const art of articles) {
                                const link = art.querySelector('a[href*="/video/"]');
                                if (!link) continue;
                                const href = link.getAttribute('href');
                                let title = '';
                                // Try to get title from .title, .video-title, or alt
                                const titleEl = art.querySelector('.title, .video-title, [alt]');
                                if (titleEl) {
                                    title = titleEl.textContent?.trim() || titleEl.getAttribute('alt') || '';
                                } else {
                                    title = link.getAttribute('title') || link.textContent?.trim() || '';
                                }
                                // Try to find preview image
                                let preview = '';
                                const img = art.querySelector('img');
                                if (img) {
                                    preview = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-original') || '';
                                }
                                if (href && title) {
                                    results.push({
                                        title: title,
                                        url: normalizeUrl(href),
                                        preview: normalizeUrl(preview),
                                        source: 'beeg'
                                    });
                                }
                            }
                            // Fallback: old selector
                            if (results.length === 0) {
                                const videoLinks = document.querySelectorAll('a[href*="/video/"]');
                                for (const link of videoLinks) {
                                    const href = link.getAttribute('href');
                                    let title = link.getAttribute('title') || link.textContent?.trim() || '';
                                    let preview = '';
                                    const img = link.querySelector('img') || link.parentElement?.querySelector('img') || link.closest('article')?.querySelector('img');
                                    if (img) {
                                        preview = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-original') || '';
                                    }
                                    if (href && title) {
                                        results.push({
                                            title: title,
                                            url: normalizeUrl(href),
                                            preview: normalizeUrl(preview),
                                            source: 'beeg'
                                        });
                                    }
                                }
                            }
                            return results;
                        }
                    ''')

                    if not video_links:
                        break
                    results.extend(video_links)

                    # Add a random delay between requests to avoid anti-bot detection
                    await page.wait_for_timeout(random.randint(1200, 2500))

                except Exception as e:
                    print(f"Error on page {page_num}: {e}", file=sys.stderr)
                    # Add error info to results for this page
                    results.append({
                        'title': f'Error on page {page_num}',
                        'url': url,
                        'preview': '',
                        'source': 'beeg',
                        'error': str(e)
                    })
                    break

        except Exception as e:
            print(f"beeg error: {e}", file=sys.stderr)
            results.append({
                'title': 'beeg error',
                'url': '',
                'preview': '',
                'source': 'beeg',
                'error': str(e)
            })
        finally:
            await browser.close()
    
    # Remove duplicates based on URL
    seen_urls = set()
    unique_results = []
    for result in results:
        if result['url'] not in seen_urls:
            seen_urls.add(result['url'])
            unique_results.append(result)
    
    return unique_results

async def main():
    if len(sys.argv) < 2:
        print("Usage: python beeg.py <search_query>")
        sys.exit(1)
    
    query = sys.argv[1]
    results = await beeg_search(query)
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
