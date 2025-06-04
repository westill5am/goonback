import requests
from bs4 import BeautifulSoup
import json # Added import

def scrape_xvideos(query, mode="straight", page=1):
    results = []
    seen_urls = set()
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.xvideos.com/',
    }
    max_pages = 50  # Increase to allow up to 1000+ results
    max_results = 1000

    # Determine base URL for resolving relative paths based on mode
    if mode == "gay":
        base_url_for_relative_paths = "https://www.gayxvideos.com"
    else:  # straight, trans
        base_url_for_relative_paths = "https://www.xvideos.com"

    for p in range(page, page + max_pages):
        if mode == "gay":
            search_page_url = f"https://www.gayxvideos.com/?k={query}&p={p}"
        elif mode == "trans":
            search_page_url = f"https://www.xvideos.com/?k=transgender+{query}&p={p}"
        else:
            search_page_url = f"https://www.xvideos.com/?k={query}&p={p}"
        try:
            # Use ScraperAPI to bypass anti-bot
            payload = {
                'api_key': '23c1327aeb270f44bb141d469c7f9823',
                'url': search_page_url, # Use the constructed search_page_url
                'country_code': 'us',  # Optional, can remove if not needed
            }
            r = requests.get('https://api.scraperapi.com/', params=payload, timeout=20)
            if r.status_code != 200:
                results.append({
                    "title": f"HTTP error {r.status_code}",
                    "url": search_page_url,
                    "preview": "",
                    "source": f"Xvideos ({mode})",
                    "error": f"HTTP status {r.status_code}"
                })
                continue
            soup = BeautifulSoup(r.content, "html.parser")
            found = False
            for vid in soup.select("div.thumb-block"):
                try:
                    a = vid.select_one("a")
                    img = vid.select_one("img")
                    if not a or not img:
                        continue
                    href = a.get("href") if a.has_attr("href") else None
                    if isinstance(href, list):
                        href = href[0] if href else None
                    href = str(href) if href else ''
                    if not href:
                        continue
                    title = a.get("title") or a.text.strip() or 'No Title'
                    if isinstance(title, list):
                        title = title[0] if title else 'No Title'
                    title = str(title)
                    video_url = href
                    if not video_url.startswith('http'):
                        video_url = f"{base_url_for_relative_paths}{video_url}" # Use mode-specific base URL
                    preview = img.get("data-src") or img.get("src") or ""
                    if isinstance(preview, list):
                        preview = preview[0] if preview else ""
                    preview = str(preview)
                    # Normalize preview URL
                    if preview:
                        if preview.startswith('//'):
                            preview = 'https:' + preview
                        elif preview.startswith('/'):
                            preview = base_url_for_relative_paths + preview # Use mode-specific base URL
                    if not preview or "placeholder" in preview:
                        continue
                    # Deduplicate by video URL
                    if video_url in seen_urls:
                        continue
                    seen_urls.add(video_url)
                    results.append({
                        "title": title.strip() if title else "",
                        "url": video_url,
                        "preview": preview.strip(),
                        "source": f"Xvideos ({mode})"
                    })
                    found = True
                    if len(results) >= max_results:
                        return results
                except Exception as e:
                    results.append({
                        "title": "Error parsing video",
                        "url": search_page_url,
                        "preview": "",
                        "source": f"Xvideos ({mode})",
                        "error": str(e)
                    })
            if not found and p == page:
                results.append({
                    "title": "No results found",
                    "url": search_page_url,
                    "preview": "",
                    "source": f"Xvideos ({mode})",
                    "error": "No results found on first page. Selector may be outdated or site structure changed."
                })
            if len(results) >= max_results:
                return results
        except Exception as e:
            results.append({
                "title": "Request error",
                "url": search_page_url, # Use search_page_url here
                "preview": "",
                "source": f"Xvideos ({mode})",
                "error": str(e)
            })
        if len(results) >= max_results:
            break
    return results

if __name__ == "__main__":
    # Example usage for testing
    print("Testing with query 'test' and mode 'straight':")
    results_straight = scrape_xvideos("test", mode="straight", page=1)
    print(json.dumps(results_straight, indent=2))
    print(f"\nFound {len(results_straight)} results for 'straight' mode.\n")

    print("\nTesting with query 'example' and mode 'gay':")
    results_gay = scrape_xvideos("example", mode="gay", page=1)
    print(json.dumps(results_gay, indent=2))
    print(f"\nFound {len(results_gay)} results for 'gay' mode.\n")

    print("\nTesting with query 'demo' and mode 'trans':")
    results_trans = scrape_xvideos("demo", mode="trans", page=1)
    print(json.dumps(results_trans, indent=2))
    print(f"\nFound {len(results_trans)} results for 'trans' mode.\n")

    # Test case for potentially no results or specific scenarios
    print("\nTesting with a specific query 'nonexistentqueryxyz123' and mode 'straight':")
    results_no_results = scrape_xvideos("nonexistentqueryxyz123", mode="straight", page=1)
    print(json.dumps(results_no_results, indent=2))
    print(f"\nFound {len(results_no_results)} results for 'nonexistentqueryxyz123' (straight).\n")

    # You can uncomment and modify the above examples to test different scenarios.
    # To run this test, execute the script from your terminal:
    # python c:\Users\D\Desktop\goonerbrain\goonerbrain-backend-main\scrapers\xvideos.py
