import requests
from bs4 import BeautifulSoup
from .base_scraper import BaseScraper

class SexvidsScraper(BaseScraper):
    def __init__(self):
        super().__init__("https://www.sexvids.com", "SexVids")
    
    def scrape(self, query: str, mode: str = "straight", page: int = 1):
        try:
            url = f"{self.base_url}/search/{requests.utils.quote(query)}/{page}/"
            soup = self.get_soup(url, timeout=8, retries=1)
            return self._parse_results(soup)
        except requests.exceptions.RequestException as e:
            print(f"[SexVids] Failed to scrape: {e}")
            return []

    def _parse_results(self, soup):
        results = []
        for vid in soup.select("div.video"):
            try:
                a = vid.select_one("a")
                if not a or not a.has_attr("href"):
                    continue
                title = self.safe_get_attr(a, "title") or self.safe_get_text(a)
                video_url = self.make_full_url(self.safe_get_attr(a, "href"))
                img = vid.select_one("img")
                preview = self.make_full_url(self.safe_get_attr(img, "src")) if img else ""
                results.append({
                    "title": title,
                    "url": video_url,
                    "preview": preview,
                    "source": "SexVids"
                })
            except Exception as e:
                print(f"[SexVids] Error parsing result: {e}")
                continue
        return results

def scrape_sexvids(query, mode="straight", page=1):
    """Legacy function wrapper for compatibility"""
    scraper = SexvidsScraper()
    return scraper.scrape(query, mode, page)
