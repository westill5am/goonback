from .pornhub import scrape_pornhub
from .xvideos import scrape_xvideos
from .spankbang import scrape_spankbang
from .redgifs import scrape_redgifs
from .eporner import scrape_eporner
from .txxx import scrape_txxx
from .hqporner import scrape_hqporner
from .rule34 import scrape_rule34
from .youporn import scrape_youporn
from .tube8 import scrape_tube8
from .beeg import beeg_search as scrape_beeg
from .bravotube import scrape_bravotube
from .erome import scrape_erome
from .fux import scrape_fux
from .hclips import scrape_hclips
from .milftzy import scrape_milftzy
from .motherless import scrape_motherless
from .porndig import scrape_porndig
from .porndoe import scrape_porndoe_playwright as scrape_porndoe
from .pornhat import scrape_pornhat
from .sexvids import scrape_sexvids
from .shecahat import scrape_shecahat
from .sparkalive import scrape_sparkalive
from .xhamster import scrape_xhamster
## from .yespornplease import scrape_yespornplease
# Add more as you create more .py files

SCRAPER_FUNCS = [
    # Only working scrapers as of June 2025:
    # 3movs.js, ashemaletube.js, hentaigasm.js, pornovideoshub.js, xvideos.js
    # Python equivalents:
    # - 3movs: not in Python, JS only
    # - ashemaletube: not in Python, JS only
    # - hentaigasm: not in this list, likely JS only
    # - pornovideoshub: not in this list, likely JS only
    # - xvideos: scrape_xvideos
    scrape_xvideos,
    # Add more here if/when they return results
]
