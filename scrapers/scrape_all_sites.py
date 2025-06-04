# scrapers/scrape_all_sites.py

from . import SCRAPER_FUNCS
import time
import requests

def scrape_all_sites(query: str, mode: str = "straight", page: int = 1):
    """
    Run each scraper in SCRAPER_FUNCS against (query, mode, page),
    concatenate all their results into a single list.
    Each scraper must have signature: fn(query, mode, page) -> List[dict]
    """
    all_results = []
    failed_scrapers = []
    successful_scrapers = []

    for fn in SCRAPER_FUNCS:
        try:
            start_time = time.time()
            results = fn(query, mode, page)
            elapsed = time.time() - start_time
            
            if results:
                all_results.extend(results)
                successful_scrapers.append(f"{fn.__name__} ({len(results)} results in {elapsed:.2f}s)")
            else:
                print(f"[scrape_all_sites] {fn.__name__} returned no results")
                
        except requests.exceptions.RequestException as e:
            # Network-related errors
            error_msg = str(e)
            if "NameResolutionError" in error_msg or "getaddrinfo failed" in error_msg:
                print(f"[scrape_all_sites] {fn.__name__} failed: Domain not found or DNS issue")
            elif "Connection refused" in error_msg:
                print(f"[scrape_all_sites] {fn.__name__} failed: Connection refused (server down)")
            elif "403" in error_msg or "Forbidden" in error_msg:
                print(f"[scrape_all_sites] {fn.__name__} failed: Access forbidden (IP blocked or bot detection)")
            else:
                print(f"[scrape_all_sites] {fn.__name__} failed: Network error - {error_msg}")
            failed_scrapers.append(fn.__name__)
            
        except Exception as e:
            # Other errors
            print(f"[scrape_all_sites] {fn.__name__} failed: {type(e).__name__} - {e}")
            failed_scrapers.append(fn.__name__)

    print(f"[scrape_all_sites] Summary: {len(successful_scrapers)} successful, {len(failed_scrapers)} failed")
    print(f"[scrape_all_sites] Total results: {len(all_results)}")
    
    return all_results
