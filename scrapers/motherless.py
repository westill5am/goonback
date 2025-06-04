import requests
from bs4 import BeautifulSoup

def scrape_motherless(query, mode="straight", page=1):
    results = []
    url = f"https://motherless.com/videos?q={query}&page={page}"
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        r = requests.get(url, headers=headers, timeout=10)
        r.raise_for_status()
        soup = BeautifulSoup(r.content, "html.parser")
        for vid in soup.select("div.thumbvideo-container"):
            try:
                a = vid.select_one("a.thumbvideo")
                href = a.attrs.get("href") if a else None
                title = a.attrs.get("title") if a else (a.text.strip() if a else None)
                video_url = f"https://motherless.com{href}" if href else None
                img = vid.select_one("img")
                preview = img.attrs.get("data-src") if img else img.attrs.get("src") if img else None
                results.append({
                    "title": title,
                    "url": video_url,
                    "preview": preview,
                    "source": "Motherless"
                })
            except Exception as e:
                print(f"Error parsing video info: {e}")
                continue
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
    return results
