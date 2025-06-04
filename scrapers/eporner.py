import requests
from bs4 import BeautifulSoup

def scrape_eporner(query, mode="straight", page=1):
    results = []
    seen = set()
    # Use ScraperAPI to bypass anti-bot
    max_pages = 50
    max_results = 1000
    for p in range(page, page + max_pages):
        # No gay subdomain, but you can bias keywords
        if mode == "gay":
            url = f"https://www.eporner.com/search/{p}/?q=gay+{query}"
        elif mode == "trans":
            url = f"https://www.eporner.com/search/{p}/?q=trans+{query}"
        else:
            url = f"https://www.eporner.com/search/{p}/?q={query}"
        try:
            payload = {
                'api_key': '23c1327aeb270f44bb141d469c7f9823',
                'url': url,
                'country_code': 'us',
            }
            r = requests.get('https://api.scraperapi.com/', params=payload, timeout=20)
            if r.status_code != 200:
                print(f"[Eporner] Non-200 status: {r.status_code} for {url}")
                continue
            soup = BeautifulSoup(r.content, "html.parser")
            found = False
            for vid in soup.select("div.mb-video, div.mb-3, .video-thumb"):
                try:
                    a = vid.select_one("a")
                    if not a or not a.has_attr('href'):
                        continue
                    title = a.get('title') or a.text.strip()
                    href = a.get('href')
                    if isinstance(href, list):
                        href = href[0] if href else None
                    if not href:
                        continue
                    video_url = f"https://www.eporner.com{href}"
                    img = vid.select_one("img")
                    preview = img.get('data-src') or img.get('src') if img else ""
                    if isinstance(preview, list):
                        preview = preview[0] if preview else ""
                    preview = str(preview)
                    if preview.startswith('//'):
                        preview = 'https:' + preview
                    if not preview or "placeholder" in preview:
                        continue
                    # Deduplicate by video URL
                    if video_url in seen:
                        continue
                    seen.add(video_url)
                    results.append({
                        "title": title,
                        "url": video_url,
                        "preview": preview,
                        "source": f"Eporner ({mode})"
                    })
                    found = True
                    if len(results) >= max_results:
                        return results
                except Exception as e:
                    print(f"[Eporner] Error parsing video: {e}")
                    continue
            if len(results) >= max_results:
                return results
            if not found:
                print(f"[Eporner] No results found on page {p}. Selector may be outdated or site structure changed.")
        except Exception as e:
            print(f"[Eporner] Error on page {p}: {e}")
    return results
