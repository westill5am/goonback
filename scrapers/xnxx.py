import requests
from bs4 import BeautifulSoup

def scrape_xnxx(query, max_pages=10):
    results = []
    for page in range(1, max_pages + 1):
        url = f"https://www.xnxx.com/search/{query}/{page}"
        payload = {
            'api_key': '23c1327aeb270f44bb141d469c7f9823',
            'url': url,
            'country_code': 'us',
        }
        try:
            response = requests.get('https://api.scraperapi.com/', params=payload, timeout=20)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            videos = soup.select('.thumb-block')
            for video in videos:
                try:
                    a = video.select_one('a')
                    href = a["href"] if a and "href" in a.attrs else None
                    title = a["title"] if a and "title" in a.attrs else None
                    video_url = f"https://www.xnxx.com{href}" if href else None
                    img = video.select_one('img')
                    preview = img["data-src"] if img and "data-src" in img.attrs else img["src"] if img and "src" in img.attrs else None
                    results.append({
                        "title": title,
                        "url": video_url,
                        "preview": preview,
                        "source": "xnxx"
                    })
                except Exception as e:
                    print(f"Error parsing video info: {e}")
                    continue
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            break
    return results
