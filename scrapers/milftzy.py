# scrapers/milftzy.py

import requests
from bs4 import BeautifulSoup
from .base_scraper import BaseScraper

class MilftzyScraper(BaseScraper):
    def __init__(self):
        super().__init__("https://milftzy.com", "Milftzy")
    
    def scrape(self, query: str, mode: str, page: int):
        """
        Scrape Milftzy search results.
        Note: milftzy.com domain appears to be down, implementing fallback.
        """
        try:
            # Try the primary domain first
            search_url = f"{self.base_url}/search/{requests.utils.quote(query)}/?page={page}"
            soup = self.get_soup(search_url, timeout=5, retries=1)
            return self._parse_results(soup)
            
        except requests.exceptions.RequestException as e:
            # Domain is down, return empty results
            print(f"[Milftzy] Domain appears to be down: {e}")
            return []

    def _parse_results(self, soup):
        results = []
        
        # Each result on Milftzy is wrapped in an element with class "video-item"
        for card in soup.select(".video-item"):
            try:
                # title link
                a = card.select_one("a.thumb")
                if not a:
                    continue
                    
                href = self.safe_get_attr(a, "href")
                url = self.make_full_url(href)

                # thumbnail image
                img = a.select_one("img")
                preview = ""
                if img:
                    preview = self.safe_get_attr(img, "src")
                    preview = self.make_full_url(preview)

                # title text
                title_el = card.select_one(".video-title")
                title = self.safe_get_text(title_el, "Milftzy Video")

                if url and title:
                    results.append({
                        "title": title,
                        "url": url,
                        "preview": preview,
                        "source": "Milftzy"
                    })
            except Exception as e:
                print(f"[Milftzy] Error parsing result: {e}")
                continue

        return results

def scrape_milftzy(query: str, mode: str, page: int):
    """Legacy function wrapper for compatibility"""
    scraper = MilftzyScraper()
    return scraper.scrape(query, mode, page)
