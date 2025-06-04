import os
# scrapers/porndoe_playwright.py
from playwright.sync_api import sync_playwright

import sys, json

def scrape_porndoe_playwright(query, mode="straight", max_pages=3):
    # Try to load cookies from a file if present (exported from a real browser session)
    cookies_path = os.environ.get("PORNDOE_COOKIES", "porndoe_cookies.json")
    cookies_loaded = False
    context = None
    results = []
    if mode == "gay":
        query = f"gay {query}"
    elif mode == "trans":
        query = f"trans {query}"

    with sync_playwright() as p:
        if os.path.exists(cookies_path):
            try:
                import json as _json
                with open(cookies_path, "r", encoding="utf-8") as f:
                    cookies = _json.load(f)
                browser = p.chromium.launch(headless=False)
                context = browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                    locale="en-US",
                    extra_http_headers={
                        "Accept-Language": "en-US,en;q=0.9",
                        "Referer": "https://www.porndoe.com/",
                        "DNT": "1",
                        "Upgrade-Insecure-Requests": "1",
                        "Sec-Fetch-Site": "same-origin",
                        "Sec-Fetch-Mode": "navigate",
                        "Sec-Fetch-User": "?1",
                        "Sec-Fetch-Dest": "document"
                    }
                )
                context.add_cookies(cookies)
                cookies_loaded = True
            except Exception as e:
                print(f"[Porndoe] Failed to load cookies: {e}")
        if not cookies_loaded:
            browser = p.chromium.launch(headless=False)
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                locale="en-US",
                extra_http_headers={
                    "Accept-Language": "en-US,en;q=0.9",
                    "Referer": "https://www.porndoe.com/",
                    "DNT": "1",
                    "Upgrade-Insecure-Requests": "1",
                    "Sec-Fetch-Site": "same-origin",
                    "Sec-Fetch-Mode": "navigate",
                    "Sec-Fetch-User": "?1",
                    "Sec-Fetch-Dest": "document"
                }
            )
        page = context.new_page() # type: ignore
        if cookies_loaded:
            print(f"[Porndoe] Loaded cookies from {cookies_path}")
        # ... rest of the scraping logic using 'page' ...
        # (Move the rest of the function's code here, using 'page' and 'context')
        # The rest of the function remains unchanged
    results = []
    if mode == "gay":
        query = f"gay {query}"
    elif mode == "trans":
        query = f"trans {query}"

    cookies_path = os.environ.get("PORNDOE_COOKIES", "porndoe_cookies.json")
    cookies_loaded = False
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = None
        # Try to load cookies from a file if present (exported from a real browser session)
        if os.path.exists(cookies_path):
            try:
                import json as _json
                with open(cookies_path, "r", encoding="utf-8") as f:
                    cookies = _json.load(f)
                context = browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                    locale="en-US",
                    extra_http_headers={
                        "Accept-Language": "en-US,en;q=0.9",
                        "Referer": "https://www.porndoe.com/",
                        "DNT": "1",
                        "Upgrade-Insecure-Requests": "1",
                        "Sec-Fetch-Site": "same-origin",
                        "Sec-Fetch-Mode": "navigate",
                        "Sec-Fetch-User": "?1",
                        "Sec-Fetch-Dest": "document"
                    }
                )
                context.add_cookies(cookies)
                cookies_loaded = True
                print(f"[Porndoe] Loaded cookies from {cookies_path}")
            except Exception as e:
                print(f"[Porndoe] Failed to load cookies: {e}")
        if not context:
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                locale="en-US",
                extra_http_headers={
                    "Accept-Language": "en-US,en;q=0.9",
                    "Referer": "https://www.porndoe.com/",
                    "DNT": "1",
                    "Upgrade-Insecure-Requests": "1",
                    "Sec-Fetch-Site": "same-origin",
                    "Sec-Fetch-Mode": "navigate",
                    "Sec-Fetch-User": "?1",
                    "Sec-Fetch-Dest": "document"
                }
            )
        try:
            from playwright_stealth import stealth_sync
            stealth_enabled = True
        except ImportError:
            stealth_enabled = False
        page = context.new_page()
        if stealth_enabled:
            stealth_sync(page)
        for page_num in range(1, max_pages + 1):
            url = f"https://www.porndoe.com/search/videos/{query}/page/{page_num}/"
            print(f"[Porndoe] Navigating to: {url}")
            try:
                page.goto(url, timeout=30000)
            except Exception as e:
                print(f"[Porndoe] page.goto error: {e}")
                continue
            # Wait for main content or scroll to trigger JS
            try:
                page.wait_for_selector('div.video-item', timeout=8000)
            except Exception as e:
                print(f"[Porndoe] wait_for_selector error: {e}")
            try:
                page.mouse.wheel(0, 2000)  # Scroll down to trigger lazy load
            except Exception as e:
                print(f"[Porndoe] mouse.wheel error: {e}")
            try:
                page.wait_for_timeout(2500)
            except Exception as e:
                print(f"[Porndoe] wait_for_timeout error: {e}")
            try:
                html = page.content()
                print(f"[Porndoe] Page HTML length: {len(html)}")
                print(f"[Porndoe] HTML preview: {html[:500].replace(chr(10),' ').replace(chr(13),' ')} ...")
            except Exception as e:
                print(f"[Porndoe] page.content error: {e}")
                continue
            # Optionally dump HTML to file if nothing found
            # Aggressively try selectors and log counts
            selectors = [
                'div.video-item', 'div.thumb', 'div.thumb-video', 'div.video-card',
                'div.video', 'div.result-item', 'div.result-video',
            ]
            found_any = False
            for sel in selectors:
                count = page.evaluate(f"document.querySelectorAll('{sel}').length")
                print(f"[Porndoe] Selector '{sel}' found {count} elements")
                if count:
                    found_any = True
            if not found_any:
                print("[Porndoe] No video elements found on page!")
                # Dump HTML to file for inspection
                with open(f"porndoe_debug_page{page_num}.html", "w", encoding="utf-8") as f:
                    f.write(html)
            # Try to extract video links with aggressive logic
            items = []
            for sel in selectors:
                items = page.query_selector_all(sel)
                if items:
                    break
            for vid in items:
                a = vid.query_selector("a[href]")
                img = vid.query_selector("img")
                if not a or not img:
                    continue
                href = a.get_attribute("href")
                if not href:
                    continue
                title = a.get_attribute("title") or a.inner_text().strip()
                video_url = f"https://www.porndoe.com{href}"
                # Try multiple attributes for preview
                preview = img.get_attribute("src") or img.get_attribute("data-src") or img.get_attribute("data-original") or ""
                # Normalize preview URL
                if preview.startswith("//"):
                    preview = "https:" + preview
                elif preview.startswith("/"):
                    preview = "https://www.porndoe.com" + preview
                elif not preview.startswith("http") and preview:
                    preview = "https://www.porndoe.com/" + preview.lstrip("/")
                # Fallback: try more selectors if not found
                if (not preview or len(preview) < 20 or "placeholder" in preview or preview.startswith("data:image")):
                    # Try to find a better image in child or parent
                    alt_img = vid.query_selector("img[data-src]") or vid.query_selector("img[src]")
                    if alt_img:
                        alt_preview = alt_img.get_attribute("data-src") or alt_img.get_attribute("src") or alt_img.get_attribute("data-original") or ""
                        if alt_preview and len(alt_preview) > 20 and "placeholder" not in alt_preview and not alt_preview.startswith("data:image"):
                            if alt_preview.startswith("//"):
                                alt_preview = "https:" + alt_preview
                            elif alt_preview.startswith("/"):
                                alt_preview = "https://www.porndoe.com" + alt_preview
                            elif not alt_preview.startswith("http"):
                                alt_preview = "https://www.porndoe.com/" + alt_preview.lstrip("/")
                            preview = alt_preview
                # Try even more: look for img in children
                if not preview or len(preview) < 20 or "placeholder" in preview or preview.startswith("data:image"):
                    child_imgs = vid.query_selector_all('img')
                    for img2 in child_imgs:
                        alt2 = img2.get_attribute("data-src") or img2.get_attribute("src") or img2.get_attribute("data-original") or ""
                        if alt2 and len(alt2) > 20 and "placeholder" not in alt2 and not alt2.startswith("data:image"):
                            if alt2.startswith("//"):
                                alt2 = "https:" + alt2
                            elif alt2.startswith("/"):
                                alt2 = "https://www.porndoe.com" + alt2
                            elif not alt2.startswith("http"):
                                alt2 = "https://www.porndoe.com/" + alt2.lstrip("/")
                            preview = alt2
                            break
                if not preview or "placeholder" in preview or len(preview) < 20 or preview.startswith("data:image"):
                    continue
                results.append({
                    "title": title.strip() if title else "",
                    "url": video_url,
                    "preview": preview.strip(),
                    "source": f"Porndoe ({mode})"
                })
            print(f"[Porndoe] Extracted {len(results)} video links so far on page {page_num}")
        browser.close()
    return results

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python porndoe.py <search_query> [mode]")
        sys.exit(1)
    query = sys.argv[1]
    mode = sys.argv[2] if len(sys.argv) > 2 else "straight"
    results = scrape_porndoe_playwright(query, mode)
    print(json.dumps(results, indent=2, ensure_ascii=False))
    print(f"[Porndoe] Total results: {len(results)}")