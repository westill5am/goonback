import asyncio
import sys
import json
import os
from playwright.async_api import async_playwright

async def ashemaletube_search(query, max_pages=3):
    """Search ashemaletube using Playwright for JavaScript rendering"""
    results = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        )
        page = await context.new_page()
        
        try:
            for page_num in range(1, max_pages + 1):
                url = f"https://www.ashemaletube.com/search/?q={query}&page={page_num}"
                
                try:
                    await page.goto(url, wait_until='networkidle', timeout=30000)
                    await page.wait_for_timeout(2000)  # Wait for content to load
                    
                    # Wait for video elements to be present
                    await page.wait_for_selector('a[href*="/videos/"]', timeout=10000)
                    
                    # Extract video links
                    video_links = await page.evaluate('''
                        () => {
                            const results = [];
                            const videoLinks = document.querySelectorAll('a[href*="/videos/"]');
                            
                            for (const link of videoLinks) {
                                const href = link.getAttribute('href');
                                let title = '';
                                
                                // Try to get title from title attribute
                                title = link.getAttribute('title') || '';
                                
                                // If no title attribute, try to get it from text content
                                if (!title) {
                                    title = link.textContent?.trim() || '';
                                }
                                
                                // Try to find an image within the link or nearby
                                let preview = '';
                                const img = link.querySelector('img') || 
                                           link.parentElement?.querySelector('img') ||
                                           link.closest('div')?.querySelector('img');
                                           
                                if (img) {
                                    preview = img.getAttribute('src') || 
                                             img.getAttribute('data-src') || 
                                             img.getAttribute('data-original') || '';
                                }
                                
                                if (href && title && !results.some(r => r.url === href)) {
                                    results.push({
                                        title: title,
                                        url: href.startsWith('http') ? href : 'https://www.ashemaletube.com' + href,
                                        preview: preview.startsWith('http') ? preview : (preview ? 'https://www.ashemaletube.com' + preview : ''),
                                        source: 'ashemaletube'
                                    });
                                }
                            }
                            
                            return results;
                        }
                    ''')
                    
                    if not video_links:
                        break
                        
                    results.extend(video_links)
                    
                except Exception as e:
                    print(f"Error on page {page_num}: {e}", file=sys.stderr)
                    break
                    
        except Exception as e:
            print(f"ashemaletube error: {e}", file=sys.stderr)
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
        print("Usage: python ashemaletube.py <search_query>")
        sys.exit(1)
    
    query = sys.argv[1]
    results = await ashemaletube_search(query)
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
