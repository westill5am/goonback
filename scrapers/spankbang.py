import requests
from bs4 import BeautifulSoup

def scrape_spankbang(query, mode="straight", page=1):
    import re
    results = []
    seen = set()
    # Use ScraperAPI to bypass anti-bot
    max_pages = 50
    max_results = 1000
    for p in range(page, page + max_pages):
        if mode == "gay":
            url = f"https://www.spankbang.com/gay/search?query={query}&p={p}"
        elif mode == "trans":
            url = f"https://www.spankbang.com/search?query=trans+{query}&p={p}"
        else:
            url = f"https://www.spankbang.com/search?query={query}&p={p}"
        try:
            payload = {
                'api_key': '23c1327aeb270f44bb141d469c7f9823',
                'url': url,
                'country_code': 'us',
            }
            r = requests.get('https://api.scraperapi.com/', params=payload, timeout=20)
            if r.status_code != 200:
                results.append({
                    "title": f"HTTP error {r.status_code}",
                    "url": url,
                    "preview": "",
                    "source": f"SpankBang ({mode})",
                    "error": f"HTTP status {r.status_code}"
                })
                continue
            soup = BeautifulSoup(r.content, "html.parser")
            found = False
            for vid in soup.select("div.video-item, .video"):
                try:
                    a = vid.select_one("a")
                    if not a or not a.has_attr('href'):
                        continue
                    href_val = a['href']
                    if isinstance(href_val, list):
                        href_val = href_val[0] if href_val else ''
                    video_url = str(href_val)
                    if not video_url.startswith('http'):
                        video_url = "https://www.spankbang.com" + video_url
                    title_val = a['title'] if a.has_attr('title') else (a.text.strip() if a.text else 'No Title')
                    if isinstance(title_val, list):
                        title_val = title_val[0] if title_val else 'No Title'
                    title = str(title_val)
                    img = vid.select_one("img")
                    preview_val = img.get("src") if img else ""
                    if isinstance(preview_val, list):
                        preview_val = preview_val[0] if preview_val else ''
                    preview = str(preview_val)
                    # Normalize preview URL
                    if preview:
                        if preview.startswith('//'):
                            preview = 'https:' + preview
                        elif preview.startswith('/'):
                            preview = 'https://www.spankbang.com' + preview
                    # Deduplicate by video URL
                    if video_url in seen:
                        continue
                    seen.add(video_url)
                    results.append({
                        "title": title,
                        "url": video_url,
                        "preview": preview,
                        "source": f"SpankBang ({mode})"
                    })
                    found = True
                    if len(results) >= max_results:
                        return results
                except Exception as e:
                    results.append({
                        "title": "Error parsing video",
                        "url": url,
                        "preview": "",
                        "source": f"SpankBang ({mode})",
                        "error": str(e)
                    })
            if not found and p == page:
                results.append({
                    "title": "No results found",
                    "url": url,
                    "preview": "",
                    "source": f"SpankBang ({mode})",
                    "error": "No results found on first page. Selector may be outdated or site structure changed."
                })
            if len(results) >= max_results:
                return results
        except Exception as e:
            results.append({
                "title": "Request error",
                "url": url,
                "preview": "",
                "source": f"SpankBang ({mode})",
                "error": str(e)
            })
        if len(results) >= max_results:
            break
    return results
