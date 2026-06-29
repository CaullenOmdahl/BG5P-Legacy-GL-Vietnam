#!/usr/bin/env python3
"""
Extract BG5 EJ20E parts catalog from subaru.epc-data.com for offline archival.

Variant 141-ej20e = BG5 Legacy Wagon, EJ20E 2.0L SOHC NA engine.

The site has a 3-level hierarchy:
  Section  → engine/, body/, trans/, electric/
  Category → engine/006/ (CYLINDER HEAD)
  Part Group → engine/006/11039/ (HEAD ASSEMBLY-CYLINDER)
    → OEM part numbers with qty, dates, applicability

Saves all part data as CSV + offline-browsable HTML.

Usage:
    python3 extract_epc.py                    # Full extraction
    python3 extract_epc.py --resume           # Skip already-downloaded pages
    python3 extract_epc.py --section engine   # Only one section
    python3 extract_epc.py --delay 12         # Custom delay (default 8s)
"""

import argparse
import csv
import os
import re
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path

BASE_URL = "https://subaru.epc-data.com"
VARIANT_PATH = "/legacy/bg5/141-ej20e"
SECTIONS = ["engine", "body", "trans", "electric"]
DELAY = 8
OUTPUT_DIR = Path(__file__).parent
USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0"
MAX_RETRIES = 3
RETRY_DELAY = 30


def fetch(url, retries=MAX_RETRIES):
    """Fetch a URL with retries and rate limit handling."""
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={
                "User-Agent": USER_AGENT,
                "Accept": "text/html,application/xhtml+xml",
                "Accept-Language": "en-US,en;q=0.9",
            })
            with urllib.request.urlopen(req, timeout=30) as resp:
                return resp.read().decode("utf-8", errors="replace")
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = RETRY_DELAY * (attempt + 1)
                print(f"    429 rate limited. Waiting {wait}s (retry {attempt+1}/{retries})...")
                time.sleep(wait)
            else:
                print(f"    HTTP {e.code} for {url}")
                if attempt < retries - 1:
                    time.sleep(DELAY)
                else:
                    return None
        except Exception as e:
            print(f"    Error: {e}")
            if attempt < retries - 1:
                time.sleep(DELAY)
            else:
                return None
    return None


def strip_html(text):
    """Remove HTML tags and clean whitespace."""
    text = re.sub(r'<br\s*/?>', ' ', text)
    text = re.sub(r'<[^>]+>', '', text)
    text = text.replace('&nbsp;', ' ').replace('&amp;', '&')
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def discover_categories(section_html):
    """Extract category links from a section page (level 1 → level 2)."""
    cats = []
    # Links like: <b>006</b> - <a href="/legacy/bg5/141-ej20e/engine/006/">CYLINDER HEAD</a>
    # Or: <a href="...">006 - CYLINDER HEAD</a>
    link_pattern = re.compile(
        r'<a[^>]+href="(' + re.escape(VARIANT_PATH) + r'/\w+/(\w+)/)"[^>]*>([^<]*)</a>',
        re.IGNORECASE
    )
    seen = set()
    for match in link_pattern.finditer(section_html):
        path, code, raw_name = match.group(1), match.group(2), match.group(3).strip()
        if code not in seen and code not in SECTIONS:
            seen.add(code)
            # Clean the name — sometimes it's "006 - CYLINDER HEAD", sometimes just the name
            name = re.sub(r'^\d+\s*-\s*', '', raw_name).strip()
            if not name:
                name = raw_name
            cats.append({"code": code, "name": name, "path": path})
    return cats


def discover_part_groups(category_html):
    """Extract part group links from a category page (level 2 → level 3)."""
    groups = []
    # Pattern: <b>11039</b> - <a href=".../006/11039/">HEAD ASSEMBLY-CYLINDER</a>
    # Found in the detail_list div
    detail_pattern = re.compile(
        r'<b>(\w+)</b>\s*-\s*<a[^>]+href="([^"]+)"[^>]*>([^<]+)</a>',
        re.IGNORECASE
    )
    seen = set()
    for match in detail_pattern.finditer(category_html):
        code, path, name = match.group(1), match.group(2), match.group(3).strip()
        if code not in seen:
            seen.add(code)
            groups.append({"code": code, "name": name, "path": path})
    return groups


def extract_parts_from_group(html):
    """Extract OEM part data from a part group page (level 3)."""
    parts = []

    # The parts table has class "parts-in-stock-widget_parts-table"
    # Find the table
    table_match = re.search(
        r'<table[^>]*parts-in-stock-widget_parts-table[^>]*>(.*?)</table>',
        html, re.DOTALL | re.IGNORECASE
    )
    if not table_match:
        return parts

    table_html = table_match.group(1)

    # Extract header
    header_match = re.search(r'<tr>(.*?)</tr>', table_html, re.DOTALL | re.IGNORECASE)

    # Extract data rows
    row_pattern = re.compile(
        r'<tr[^>]*class="parts-in-stock-widget_part-row"[^>]*>(.*?)</tr>',
        re.DOTALL | re.IGNORECASE
    )

    for row_match in row_pattern.finditer(table_html):
        row_html = row_match.group(1)

        # Extract OEM part number
        oem_match = re.search(r'parts-in-stock-widget_part-oem[^>]*>([^<]+)', row_html)
        oem = oem_match.group(1).strip() if oem_match else ""

        # Extract all td cells
        cells = re.findall(r'<td[^>]*>(.*?)</td>', row_html, re.DOTALL | re.IGNORECASE)
        cleaned = [strip_html(c) for c in cells]

        # The cells typically are:
        # [0] OEM number (already got it), [1] qty, [2] production period,
        # [3] applicable option, [4] spec/color, [5] color/trim code,
        # [6] applies for models, [7] notes, [8] replacements, [9] price, [10] in stock
        part = {
            "oem_number": oem,
            "quantity": cleaned[1] if len(cleaned) > 1 else "",
            "production_period": cleaned[2] if len(cleaned) > 2 else "",
            "applicable_option": cleaned[3] if len(cleaned) > 3 else "",
            "spec_color": cleaned[4] if len(cleaned) > 4 else "",
            "trim_code": cleaned[5] if len(cleaned) > 5 else "",
            "applies_for_models": cleaned[6] if len(cleaned) > 6 else "",
            "notes": cleaned[7] if len(cleaned) > 7 else "",
            "replacements": cleaned[8] if len(cleaned) > 8 else "",
        }
        if oem:
            parts.append(part)

    return parts


def extract_applicability(html):
    """Extract the 'Applies for models' info from a category or group page."""
    match = re.search(
        r'<th>Applies for models</th>.*?<td>([^<]+)</td>.*?<td>([^<]+)</td>',
        html, re.DOTALL | re.IGNORECASE
    )
    if match:
        return {"models": strip_html(match.group(1)), "period": strip_html(match.group(2))}
    return None


def safe_dirname(code, name):
    """Create a safe directory name from code and name."""
    safe = re.sub(r'[^\w\-]', '_', name).strip('_')[:60]
    return f"{code}_{safe}"


def process_section(section, delay, resume=False):
    """Process an entire section (engine/body/trans/electric)."""
    section_dir = OUTPUT_DIR / section
    section_dir.mkdir(parents=True, exist_ok=True)

    section_url = f"{BASE_URL}{VARIANT_PATH}/{section}/"
    print(f"\n{'='*60}")
    print(f"SECTION: {section.upper()}")
    print(f"{'='*60}")
    print(f"Fetching: {section_url}")

    section_html = fetch(section_url)
    if not section_html:
        print("  FAILED to fetch section page. Skipping.")
        return []

    time.sleep(delay)

    categories = discover_categories(section_html)
    print(f"Found {len(categories)} categories")

    # Master CSV for the entire section
    master_csv_path = section_dir / "all_parts.csv"
    master_rows = []

    for i, cat in enumerate(categories):
        cat_code = cat["code"]
        cat_name = cat["name"]
        cat_dir = section_dir / safe_dirname(cat_code, cat_name)
        cat_dir.mkdir(parents=True, exist_ok=True)

        done_marker = cat_dir / ".done"
        if resume and done_marker.exists():
            print(f"  [{i+1}/{len(categories)}] {cat_code}: {cat_name} — skipped (done)")
            # Load existing CSV data for master
            cat_csv = cat_dir / "parts.csv"
            if cat_csv.exists():
                with open(cat_csv, 'r', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        master_rows.append(row)
            continue

        print(f"  [{i+1}/{len(categories)}] {cat_code}: {cat_name}")

        cat_url = f"{BASE_URL}{cat['path']}"
        cat_html = fetch(cat_url)
        if not cat_html:
            print(f"    FAILED to fetch category page")
            time.sleep(delay)
            continue

        time.sleep(delay)

        # Save raw HTML
        (cat_dir / "page.html").write_text(cat_html, encoding="utf-8")

        # Get applicability info
        applicability = extract_applicability(cat_html)

        # Discover part groups within this category
        groups = discover_part_groups(cat_html)
        print(f"    {len(groups)} part groups")

        cat_parts = []

        for j, grp in enumerate(groups):
            grp_code = grp["code"]
            grp_name = grp["name"]

            grp_url = f"{BASE_URL}{grp['path']}"
            grp_html = fetch(grp_url)
            if not grp_html:
                print(f"      {grp_code}: {grp_name} — FAILED")
                time.sleep(delay)
                continue

            parts = extract_parts_from_group(grp_html)

            for p in parts:
                p["section"] = section
                p["category_code"] = cat_code
                p["category_name"] = cat_name
                p["group_code"] = grp_code
                p["group_name"] = grp_name
                cat_parts.append(p)

            if parts:
                print(f"      {grp_code}: {grp_name} — {len(parts)} OEM part(s)")
            else:
                print(f"      {grp_code}: {grp_name} — no parts extracted")

            time.sleep(delay)

        # Save category CSV
        if cat_parts:
            fieldnames = [
                "section", "category_code", "category_name",
                "group_code", "group_name", "oem_number", "quantity",
                "production_period", "applicable_option", "spec_color",
                "trim_code", "applies_for_models", "notes", "replacements"
            ]
            cat_csv = cat_dir / "parts.csv"
            with open(cat_csv, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
                writer.writeheader()
                writer.writerows(cat_parts)
            print(f"    Saved {len(cat_parts)} total parts to CSV")

        master_rows.extend(cat_parts)

        # Create category HTML
        create_category_html(cat_dir, cat_code, cat_name, groups, cat_parts, applicability)

        done_marker.touch()

    # Save master CSV for entire section
    if master_rows:
        fieldnames = [
            "section", "category_code", "category_name",
            "group_code", "group_name", "oem_number", "quantity",
            "production_period", "applicable_option", "spec_color",
            "trim_code", "applies_for_models", "notes", "replacements"
        ]
        with open(master_csv_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
            writer.writeheader()
            writer.writerows(master_rows)
        print(f"\nSection master CSV: {len(master_rows)} parts → {master_csv_path}")

    # Create section index
    create_section_index(section, categories)

    return categories


def create_category_html(cat_dir, code, name, groups, parts, applicability):
    """Create offline HTML for a category."""
    html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>{code} — {name} | BG5 EJ20E Parts</title>
<style>
body {{ font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }}
h1 {{ color: #003366; }} h2 {{ color: #336699; }}
.info {{ color: #666; margin-bottom: 15px; }}
table {{ border-collapse: collapse; width: 100%; background: white; margin: 15px 0; }}
th {{ background: #003366; color: white; padding: 6px 10px; text-align: left; font-size: 13px; }}
td {{ border: 1px solid #ddd; padding: 5px 10px; font-size: 13px; }}
tr:nth-child(even) {{ background: #f9f9f9; }}
tr:hover {{ background: #e9e9e9; }}
a {{ color: #003366; }}
.nav {{ margin-bottom: 15px; }}
.oem {{ font-weight: bold; font-family: monospace; }}
.group-header {{ background: #e8f0fe; padding: 8px 10px; margin: 15px 0 5px 0; font-weight: bold; }}
</style></head><body>
<div class="nav"><a href="../index.html">&larr; Back to section index</a></div>
<h1>{code} — {name}</h1>
<p class="info">BG5 Legacy Wagon — EJ20E 2.0L SOHC NA | Source: subaru.epc-data.com</p>
"""
    if applicability:
        html += f'<p class="info">Applies to: {applicability["models"]} | Period: {applicability["period"]}</p>\n'

    # Group parts by group_code
    by_group = {}
    for p in parts:
        key = (p.get("group_code", ""), p.get("group_name", ""))
        by_group.setdefault(key, []).append(p)

    for (grp_code, grp_name), grp_parts in by_group.items():
        html += f'<div class="group-header">{grp_code}: {grp_name}</div>\n'
        html += '<table><tr><th>OEM Part Number</th><th>Qty</th><th>Period</th><th>Models</th><th>Notes</th><th>Replacements</th></tr>\n'
        for p in grp_parts:
            html += f'<tr><td class="oem">{p["oem_number"]}</td><td>{p["quantity"]}</td>'
            html += f'<td>{p["production_period"]}</td><td>{p["applies_for_models"]}</td>'
            html += f'<td>{p["notes"]}</td><td>{p["replacements"]}</td></tr>\n'
        html += '</table>\n'

    if not parts:
        html += '<p>No OEM parts data extracted for this category. Check page.html for raw data.</p>\n'

    html += '</body></html>'
    (cat_dir / "index.html").write_text(html, encoding='utf-8')


def create_section_index(section, categories):
    """Create index page for a section."""
    section_dir = OUTPUT_DIR / section
    label = {
        "engine": "Engine & Fuel System",
        "body": "Body, Trim & Accessories",
        "trans": "Chassis, Powertrain & Brake",
        "electric": "Electrics & Lamps"
    }.get(section, section.upper())

    html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>{label} | BG5 EJ20E Parts Catalog</title>
<style>
body {{ font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }}
h1 {{ color: #003366; }}
.info {{ color: #666; }}
table {{ border-collapse: collapse; width: 100%; background: white; margin: 15px 0; }}
th {{ background: #003366; color: white; padding: 8px 12px; text-align: left; }}
td {{ border: 1px solid #ddd; padding: 8px 12px; }}
tr:hover {{ background: #e9e9e9; }}
a {{ color: #003366; }}
.nav {{ margin-bottom: 15px; }}
.done {{ color: green; }} .pending {{ color: #999; }}
</style></head><body>
<div class="nav"><a href="../index.html">&larr; Back to catalog</a></div>
<h1>{label}</h1>
<p class="info">BG5 Legacy Wagon — EJ20E 2.0L SOHC NA | {len(categories)} categories</p>
<table><tr><th>Code</th><th>Category</th><th>Status</th></tr>
"""
    for cat in categories:
        dirname = safe_dirname(cat["code"], cat["name"])
        done = (section_dir / dirname / ".done").exists()
        status_class = "done" if done else "pending"
        status_text = "extracted" if done else "pending"
        html += f'<tr><td>{cat["code"]}</td><td><a href="{dirname}/index.html">{cat["name"]}</a></td>'
        html += f'<td class="{status_class}">{status_text}</td></tr>\n'

    html += '</table></body></html>'
    (section_dir / "index.html").write_text(html, encoding='utf-8')


def create_main_index(all_sections):
    """Create the main catalog index."""
    total = sum(len(v) for v in all_sections.values())

    # Count total parts from master CSVs
    total_parts = 0
    for section in all_sections:
        master_csv = OUTPUT_DIR / section / "all_parts.csv"
        if master_csv.exists():
            with open(master_csv, 'r', encoding='utf-8') as f:
                total_parts += sum(1 for _ in f) - 1  # minus header

    html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>BG5 EJ20E Parts Catalog — Offline Archive</title>
<style>
body {{ font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }}
h1 {{ color: #003366; }} h2 {{ color: #336699; }}
.info {{ color: #666; line-height: 1.6; }}
table {{ border-collapse: collapse; width: 100%; background: white; margin: 15px 0; }}
th {{ background: #003366; color: white; padding: 8px 12px; text-align: left; }}
td {{ border: 1px solid #ddd; padding: 8px 12px; }}
tr:hover {{ background: #e9e9e9; }}
a {{ color: #003366; }}
.note {{ background: #fff3cd; border: 1px solid #ffc107; padding: 12px; border-radius: 4px; margin: 15px 0; }}
.stats {{ background: #d4edda; border: 1px solid #28a745; padding: 12px; border-radius: 4px; margin: 15px 0; }}
</style></head><body>
<h1>BG5 EJ20E Parts Catalog — Offline Archive</h1>
<p class="info">
<strong>Vehicle:</strong> Subaru Legacy Touring Wagon BG5<br>
<strong>Engine:</strong> EJ20E 2.0L Flat-4 SOHC NA (120 HP / 184 Nm)<br>
<strong>EPC Variant:</strong> 141-ej20e (08.1997+)<br>
<strong>Source:</strong> subaru.epc-data.com
</p>
<div class="stats">
<strong>Archive contents:</strong> {total} categories | {total_parts} OEM part entries<br>
Each section also has an <code>all_parts.csv</code> master file for searching/filtering.
</div>
<div class="note">
<strong>Note:</strong> This archive contains OEM part numbers, quantities, production periods, and
model applicability extracted from the Subaru EPC. Exploded diagrams are not included (they
require JavaScript rendering). For visual diagrams, use
<a href="https://partsouq.com/en/catalog/genuine/locate?c=Subaru">PartSouq</a> and search for BG5.
</div>
<h2>Sections</h2>
<table><tr><th>Section</th><th>Categories</th><th>CSV</th></tr>
"""
    for section, cats in all_sections.items():
        label = {
            "engine": "Engine & Fuel System",
            "body": "Body, Trim & Accessories",
            "trans": "Chassis, Powertrain & Brake",
            "electric": "Electrics & Lamps"
        }.get(section, section.upper())
        html += f'<tr><td><a href="{section}/index.html">{label}</a></td>'
        html += f'<td>{len(cats)} categories</td>'
        html += f'<td><a href="{section}/all_parts.csv">all_parts.csv</a></td></tr>\n'

    html += '</table></body></html>'
    (OUTPUT_DIR / "index.html").write_text(html, encoding='utf-8')


def main():
    parser = argparse.ArgumentParser(description="Extract BG5 EJ20E parts catalog")
    parser.add_argument("--resume", action="store_true", help="Skip already-downloaded categories")
    parser.add_argument("--section", choices=SECTIONS, help="Only extract one section")
    parser.add_argument("--delay", type=int, default=DELAY, help=f"Delay between requests (default: {DELAY}s)")
    args = parser.parse_args()

    delay = args.delay
    sections = [args.section] if args.section else SECTIONS

    print("BG5 EJ20E Parts Catalog Extractor")
    print(f"Output:  {OUTPUT_DIR}")
    print(f"Delay:   {delay}s between requests")
    print(f"Resume:  {args.resume}")
    print(f"Sections: {', '.join(sections)}")

    all_sections = {}
    for section in sections:
        cats = process_section(section, delay, resume=args.resume)
        if cats:
            all_sections[section] = cats

    if all_sections:
        create_main_index(all_sections)
        total_cats = sum(len(v) for v in all_sections.values())
        print(f"\n{'='*60}")
        print(f"DONE — {total_cats} categories across {len(all_sections)} sections")
        print(f"Open: {OUTPUT_DIR / 'index.html'}")
    else:
        print("\nNo sections processed successfully.")


if __name__ == "__main__":
    main()
