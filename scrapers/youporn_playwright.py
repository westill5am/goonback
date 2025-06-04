import asyncio
import sys
import json
from playwright.async_api import async_playwright

async def youporn_search(query, max_pages=3):
    results = []
    async with async_playwright() as p:
        # Use non-headless for debugging, can switch to headless=False
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        )
        page = await context.new_page()
        try:
            for page_num in range(1, max_pages + 1):
                url = f"https://www.youporn.com/results/?search={query}&page={page_num}"
                print(f"[YouPorn] Navigating to: {url}")
                await page.goto(url, wait_until='networkidle', timeout=30000)
                await page.wait_for_timeout(2000)
                html = await page.content()
                print(f"[YouPorn] Page HTML length: {len(html)}")
                # Aggressively try selectors and log counts
                selectors = [
                    "a.video-thumb", ".video-thumb", ".video-box", ".video-item",
                    "div.video-thumb", "div.video-box", "div.video-item",
                    "div.video", "div.thumb", "div.thumb-video", "div.video-card",
                ]
                found_any = False
                for sel in selectors:
                    count = await page.evaluate(f"document.querySelectorAll(\"{sel}\").length")
                    print(f"[YouPorn] Selector '{sel}' found {count} elements")
                    if count:
                        found_any = True
                if not found_any:
                    print("[YouPorn] No video elements found on page!")
                # Try to extract video links with aggressive logic
                video_links = await page.evaluate("""
                    (() => {
                        function normalizeUrl(url) {
                            if (!url) return '';
                            if (url.startsWith('//')) return 'https:' + url;
                            if (url.startsWith('/')) return 'https://www.youporn.com' + url;
                            if (!url.startsWith('http')) return 'https://www.youporn.com/' + url.replace(/^\\/*/, '');
                            return url;
                        }
                        function isRealPreview(url) {
                            if (!url) return false;
                            if (url.startsWith('data:image')) return false;
                            if (url.includes('placeholder') || url.length < 20) return false;
                            return true;
                        }
                        const results = [];
                        // Use the exact selector for real thumbnails
                        const thumbSelector = 'img.thumb-image.js_lazy.js-mediabook.js-videoThumbWebm.js-videoPreview.entered.loaded';
                        // Find all video containers (e.g. a.video-thumb or .video-thumb)
                        const videoItems = Array.from(document.querySelectorAll('a.video-thumb, .video-thumb, .video-box, .video-item, div.video-thumb, div.video-box, div.video-item, div.video, div.thumb, div.thumb-video, div.video-card'));
                        for (const item of videoItems) {
                            let href = item.getAttribute('href') || (item.querySelector('a') && item.querySelector('a').getAttribute('href'));
                            let title = item.getAttribute('title') || item.textContent.trim();
                            // Look for the exact thumbnail image inside this item
                            let img = item.querySelector(thumbSelector);
                            let preview = '';
                            if (img) {
                                preview = img.getAttribute('data-src') || img.getAttribute('src') || img.getAttribute('data-original') || '';
                            }
                            preview = normalizeUrl(preview);
                            // Fallback: try any <img> with src that is not base64/placeholder
                            if (!isRealPreview(preview)) {
                                let imgs = item.querySelectorAll('img');
                                for (let img2 of imgs) {
                                    let alt2 = img2.getAttribute('data-src') || img2.getAttribute('src') || img2.getAttribute('data-original') || '';
                                    alt2 = normalizeUrl(alt2);
                                    if (isRealPreview(alt2)) { preview = alt2; break; }
                                }
                            }
                            if (href && title && isRealPreview(preview)) {
                                results.push({
                                    title: title,
                                    url: href.startsWith('http') ? href : 'https://www.youporn.com' + href,
                                    preview: preview,
                                    source: 'YouPorn'
                                });
                            }
                        }
                        return results;
                    })()
                """)
                print(f"[YouPorn] Extracted {len(video_links) if video_links else 0} video links on page {page_num}")
                if not video_links:
                    break
                results.extend(video_links)
        except Exception as e:
            print(f"[YouPorn] Playwright error: {e}", file=sys.stderr)
        finally:
            await browser.close()
    # Remove duplicates
    seen = set()
    unique = []
    for r in results:
        if r['url'] not in seen:
            seen.add(r['url'])
            unique.append(r)
    return unique

async def main():
    if len(sys.argv) < 2:
        print("Usage: python youporn_playwright.py <search_query>")
        sys.exit(1)
    query = sys.argv[1]
    results = await youporn_search(query)
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
