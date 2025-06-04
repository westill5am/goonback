import requests
from bs4 import BeautifulSoup

def scrape_xhamster(query, mode="straight", page=1):
    results = []
    base_url = "https://xhamster.com"
    if mode == "gay":
        search_url = f"{base_url}/gay/search/{query}/{page}"
    elif mode == "trans":
        search_url = f"{base_url}/trans/search/{query}/{page}"
    else:
        search_url = f"{base_url}/search/{query}/{page}"
    # Use ScraperAPI to bypass anti-bot
    payload = {
        'api_key': '23c1327aeb270f44bb141d469c7f9823',
        'url': search_url,
        'country_code': 'us',
    }
    try:
        r = requests.get('https://api.scraperapi.com/', params=payload, timeout=20)
        r.raise_for_status()
        soup = BeautifulSoup(r.content, "html.parser")
        for vid in soup.select("div.video-thumb-info"):
            try:
                a = vid.find_parent("a")
                img = vid.find_previous("img")
                href = getattr(a, "href", None) if a else None
                title = getattr(a, "title", None) if a else vid.text.strip()
                video_url = href if href and href.startswith('http') else f"{base_url}{href}" if href else None
                preview = getattr(img, "src", None) if img else None
                if preview and preview.startswith('//'):
                    preview = 'https:' + preview
                results.append({
                    "title": title,
                    "url": video_url,
                    "preview": preview,
                    "source": "xHamster"
                })
            except Exception as e:
                print(f"Error parsing video info: {e}")
                continue
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
    return results
