# scrapers/sparkalive.py
import requests
from bs4 import BeautifulSoup
from .base_scraper import BaseScraper

class SparkAliveScraper(BaseScraper):
    def __init__(self):
        super().__init__("https://sparkalive.com", "SparkAlive")
    
    def scrape(self, query: str, mode: str, page: int):
        """
        Scrapes the SparkAlive website for video results.
        Note: Domain appears to be for sale, implementing graceful failure.
        """
        try:
            # Check if the domain is actually serving content
            search_url = f"{self.base_url}/search?q={requests.utils.quote(query)}&page={page}&mode={mode}"
            
            # Use shorter timeout since domain appears to be problematic
            soup = self.get_soup(search_url, timeout=5, retries=1)
            
            # Check if we got a "domain for sale" page
            if "domain for sale" in soup.get_text().lower():
                print(f"[SparkAlive] Domain appears to be for sale, skipping")
                return []
                
            return self._parse_results(soup)
            
        except requests.exceptions.RequestException as e:
            print(f"[SparkAlive] Domain unavailable: {e}")
            return []

    def _parse_results(self, soup):
        results = []
        
        # Find all video results (adjust the selector based on the actual HTML structure)
        video_cards = soup.find_all('div', class_='video-card')
        
        for card in video_cards:
            try:
                title_elem = card.find('h3')
                title = self.safe_get_text(title_elem, "No title")
                
                url_elem = card.find('a')
                url = self.make_full_url(self.safe_get_attr(url_elem, "href")) if url_elem else ""
                
                preview_elem = card.find('img')
                preview = self.make_full_url(self.safe_get_attr(preview_elem, "src")) if preview_elem else ""

                results.append({
                    "title": title,
                    "url": url,
                    "preview": preview,
                    "source": "SparkAlive"
                })
            except Exception as e:
                print(f"[SparkAlive] Error parsing video card: {e}")
                continue
        
        return results

def scrape_sparkalive(query: str, mode: str, page: int):
    """Legacy function wrapper for compatibility"""
    scraper = SparkAliveScraper()
    return scraper.scrape(query, mode, page)
