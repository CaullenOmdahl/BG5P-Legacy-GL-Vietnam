#!/usr/bin/env python3
"""
Scrape subcategory names from epc-data.com section index pages.

Fetches the 4 section index pages for BG5 EJ20E and extracts category code -> name
mappings from the links. Then maps each diagram code from SECTIONS to a human-readable
name by matching the 3-digit prefix.

Output: a complete SUBCATEGORY_NAMES dict ready to paste into download_diagrams.py.
"""

import re
import time
import requests
from collections import OrderedDict

# Import SECTIONS from download_diagrams.py (same directory)
from download_diagrams import SECTIONS

SECTION_URLS = [
    "https://subaru.epc-data.com/legacy/bg5/141-ej20e/engine/",
    "https://subaru.epc-data.com/legacy/bg5/141-ej20e/body/",
    "https://subaru.epc-data.com/legacy/bg5/141-ej20e/trans/",
    "https://subaru.epc-data.com/legacy/bg5/141-ej20e/electric/",
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0",
}


def fetch_category_names() -> dict[str, str]:
    """
    Fetch all 4 section index pages and extract category code -> name mappings.

    Links look like:
        <a href="/legacy/bg5/141-ej20e/engine/006/">CYLINDER HEAD</a>

    Returns dict like {"006": "CYLINDER HEAD", "010": "PISTON & CRANKSHAFT", ...}
    """
    category_names = {}

    session = requests.Session()
    session.headers.update(HEADERS)

    for i, url in enumerate(SECTION_URLS):
        if i > 0:
            time.sleep(5)  # polite delay between requests

        print(f"Fetching: {url}")
        for attempt in range(5):
            resp = session.get(url, timeout=30)
            if resp.status_code == 429:
                wait = 10 * (attempt + 1)
                print(f"  Rate limited, retrying in {wait}s...")
                time.sleep(wait)
                continue
            resp.raise_for_status()
            break
        else:
            print(f"  FAILED after 5 attempts: {url}")
            continue
        html = resp.text

        # Match links like: href="/legacy/bg5/141-ej20e/engine/006/">CYLINDER HEAD</a>
        # The 3-digit code is in the URL path, the name is the link text.
        pattern = r'href="/legacy/bg5/141-ej20e/[^/]+/(\d{3})/"[^>]*>([^<]+)</a>'
        matches = re.findall(pattern, html)

        for code, name in matches:
            name = name.strip()
            # Strip "XXX - " prefix if present (e.g., "006 - CYLINDER HEAD" -> "CYLINDER HEAD")
            name = re.sub(r"^\d{3}\s*-\s*", "", name)
            if name:
                category_names[code] = name
                print(f"  {code} -> {name}")

    return category_names


def build_subcategory_names(category_names: dict[str, str]) -> dict[str, str]:
    """
    Map each diagram code (e.g., "100_01") to a category name by matching
    the 3-digit prefix (e.g., "100") against the category_names dict.
    """
    subcategory_names = {}
    mapped = 0
    unmapped = 0

    for section_name, codes in SECTIONS.items():
        for code in codes:
            prefix = code.split("_")[0]  # e.g., "100_01" -> "100"
            name = category_names.get(prefix)
            if name:
                subcategory_names[code] = name
                mapped += 1
            else:
                unmapped += 1
                print(f"  WARNING: No name found for {code} (prefix {prefix})")

    return subcategory_names, mapped, unmapped


def print_dict(subcategory_names: dict[str, str]):
    """Print the dict in Python syntax, ready to copy-paste."""
    print("\n# ── Copy-paste this into download_diagrams.py ──")
    print("SUBCATEGORY_NAMES = {")

    # Group by section for readability
    for section_name, codes in SECTIONS.items():
        print(f"    # {section_name}")
        for code in codes:
            name = subcategory_names.get(code)
            if name:
                print(f'    "{code}": "{name}",')
            else:
                print(f'    # "{code}": ???,  # unmapped')
        print()

    print("}")


def main():
    print("=== Scraping epc-data.com for BG5 EJ20E category names ===\n")

    category_names = fetch_category_names()
    print(f"\nFound {len(category_names)} unique category codes.\n")

    subcategory_names, mapped, unmapped = build_subcategory_names(category_names)
    total = mapped + unmapped

    print_dict(subcategory_names)

    print(f"\n=== Summary ===")
    print(f"Total diagrams: {total}")
    print(f"Mapped:   {mapped}/{total}")
    print(f"Unmapped: {unmapped}/{total}")


if __name__ == "__main__":
    main()
