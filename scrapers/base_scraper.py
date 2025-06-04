# scrapers/base_scraper.py

import requests
from bs4 import BeautifulSoup
import time
import random
from urllib.parse import urljoin, quote

class BaseScraper:
    """Base class for all scrapers with common functionality and error handling"""
    
    def __init__(self, base_url: str, source_name: str):
        self.base_url = base_url
        self.source_name = source_name
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        })
    
    def make_request(self, url: str, timeout: int = 10, retries: int = 2):
        """Make a robust HTTP request with retries and error handling"""
        for attempt in range(retries + 1):
            try:
                # Add random delay to avoid rate limiting
                if attempt > 0:
                    time.sleep(random.uniform(1, 3))
                
                response = self.session.get(url, timeout=timeout)
                response.raise_for_status()
                return response
                
            except requests.exceptions.Timeout:
                if attempt == retries:
                    raise requests.exceptions.RequestException(f"Timeout after {retries + 1} attempts")
                print(f"[{self.source_name}] Timeout on attempt {attempt + 1}, retrying...")
                
            except requests.exceptions.ConnectionError as e:
                if "NameResolutionError" in str(e) or "getaddrinfo failed" in str(e):
                    raise requests.exceptions.RequestException(f"Domain not found: {self.base_url}")
                elif "Connection refused" in str(e):
                    raise requests.exceptions.RequestException(f"Server down or refusing connections")
                else:
                    if attempt == retries:
                        raise requests.exceptions.RequestException(f"Connection error: {e}")
                    print(f"[{self.source_name}] Connection error on attempt {attempt + 1}, retrying...")
                    
            except requests.exceptions.HTTPError as e:
                if e.response.status_code == 403:
                    raise requests.exceptions.RequestException(f"Access forbidden (IP blocked or bot detection)")
                elif e.response.status_code == 404:
                    raise requests.exceptions.RequestException(f"Search endpoint not found")
                elif e.response.status_code >= 500:
                    if attempt == retries:
                        raise requests.exceptions.RequestException(f"Server error: {e.response.status_code}")
                    print(f"[{self.source_name}] Server error {e.response.status_code} on attempt {attempt + 1}, retrying...")
                else:
                    raise requests.exceptions.RequestException(f"HTTP error: {e.response.status_code}")
        
        raise requests.exceptions.RequestException("Max retries exceeded")
    
    def get_soup(self, url: str, timeout: int = 10, retries: int = 2):
        """Get BeautifulSoup object from URL with error handling"""
        response = self.make_request(url, timeout, retries)
        return BeautifulSoup(response.text, 'html.parser')
    
    def make_full_url(self, url: str):
        """Convert relative URL to absolute URL"""
        if not url:
            return ""
        if url.startswith("http"):
            return url
        return urljoin(self.base_url, url)
    
    def safe_get_text(self, element, default: str = ""):
        """Safely extract text from BeautifulSoup element"""
        if element:
            return element.get_text(strip=True)
        return default
    
    def safe_get_attr(self, element, attr: str, default: str = ""):
        """Safely extract attribute from BeautifulSoup element"""
        if element and element.has_attr(attr):
            return element[attr]
        return default

def create_scraper_function(scraper_class):
    """Factory function to create scraper functions from scraper classes"""
    def scraper_function(query: str, mode: str = "straight", page: int = 1):
        try:
            scraper = scraper_class()
            return scraper.scrape(query, mode, page)
        except Exception as e:
            print(f"[{scraper_class.__name__}] Error: {e}")
            return []
    return scraper_function
