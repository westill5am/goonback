import requests
from bs4 import BeautifulSoup
from .base_scraper import BaseScraper

class YesPornPleaseScraper(BaseScraper):
    def __init__(self):
        # Note: yespornplease.se domain appears to have DNS issues
        super().__init__("https://yespornplease.se", "YesPornPlease")
    
    def scrape(self, query, mode="straight", page=1):
        try:
            # Modify query based on mode
            search_query = query
            if mode == "gay":
                search_query = f"gay {query}"
            elif mode == "trans":
                search_query = f"trans {query}"
            
            url = f"{self.base_url}/search/?q={requests.utils.quote(search_query)}&p={page}"
            soup = self.get_soup(url, timeout=5, retries=1)
            return self._parse_results(soup, mode)
            
        except requests.exceptions.RequestException as e:
            print(f"[YesPornPlease] Domain unavailable: {e}")
            return []

    def _parse_results(self, soup, mode):
        results = []
        
        for vid in soup.select("div.viditem"):
            try:
                a = vid.select_one("a")
                if not a or not a.has_attr("href"):
                    continue
                    
                title = self.safe_get_attr(a, "title") or self.safe_get_text(a)
                if not title:
                    continue
                    
                video_url = self.safe_get_attr(a, "href")
                video_url = self.make_full_url(video_url)
                
                img = vid.select_one("img")
                preview = ""
                if img:
                    preview = self.safe_get_attr(img, "src")
                    preview = self.make_full_url(preview)
                
                if title and video_url:
                    results.append({
                        "title": title,
                        "url": video_url,
                        "preview": preview,
                        "source": f"YesPornPlease ({mode})"
                    })
            except Exception as e:
                print(f"[YesPornPlease] Error parsing result: {e}")
                continue
                
        return results

def scrape_yespornplease(query, mode="straight", page=1):
    """Legacy function wrapper for compatibility"""
    scraper = YesPornPleaseScraper()
    return scraper.scrape(query, mode, page)
