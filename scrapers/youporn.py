import requests
from bs4 import BeautifulSoup

def scrape_youporn(query, mode="straight", page=1):
    results = []
    seen = set()
    if mode == "gay":
        query = f"gay {query}"
    elif mode == "trans":
        query = f"trans {query}"

    # Use ScraperAPI to bypass anti-bot
    max_pages = 50
    max_results = 1000
    for p in range(page, page + max_pages):
        url = f"https://www.youporn.com/results/?search={query}&page={p}"
        try:
            payload = {
                'api_key': '23c1327aeb270f44bb141d469c7f9823',
                'url': url,
                'country_code': 'us',
            }
            r = requests.get('https://api.scraperapi.com/', params=payload, timeout=20)
            soup = BeautifulSoup(r.content, "html.parser")
            found = False
            for video in soup.select("div.video-box"):
                try:
                    a = video.select_one("a.video-box-image")
                    if not a or not a.has_attr("href"):
                        continue
                    href = a.get("href")
                    if isinstance(href, list):
                        href = href[0] if href else None
                    if not href:
                        continue
                    video_url = f"https://www.youporn.com{href}"
                    ellipsis = video.select_one("div.ellipsis")
                    title = a.get("title")
                    if not title and ellipsis is not None:
                        title = ellipsis.get_text(strip=True)
                    if not title:
                        title = ""
                    img = a.select_one("img")
                    preview = ""
                    if img:
                        preview = img.get("src") or img.get("data-src") or ""
                        if isinstance(preview, list):
                            preview = preview[0] if preview else ""
                        preview = str(preview)
                    if not preview or "placeholder" in preview:
                        continue
                    # Deduplicate by video URL
                    if video_url in seen:
                        continue
                    seen.add(video_url)
                    results.append({
                        "title": str(title).strip() if title else "",
                        "url": video_url,
                        "preview": preview.strip(),
                        "source": f"YouPorn ({mode})"
                    })
                    found = True
                    if len(results) >= max_results:
                        return results
                except Exception:
                    continue
            if len(results) >= max_results:
                return results
            if not found and p == page:
                print(f"[YouPorn] No results found on page {p}. Selector may be outdated or site structure changed.")
        except Exception as e:
            print(f"[YouPorn] Error on page {p}: {e}")
    return results
