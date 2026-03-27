#!/usr/bin/env python3
"""
Build sections.json from the parts-catalog diagram definitions.

Reads SECTIONS and SUBCATEGORY_NAMES from parts-catalog/download_diagrams.py
and generates site/public/data/sections.json for the frontend.
"""

import json
import re
import sys
from pathlib import Path

# ── Import SECTIONS and SUBCATEGORY_NAMES from parts-catalog ──────────────
SCRIPT_DIR = Path(__file__).resolve().parent            # site/scripts/
SITE_DIR = SCRIPT_DIR.parent                            # site/
PROJECT_ROOT = SITE_DIR.parent                          # repo root
PARTS_CATALOG_DIR = PROJECT_ROOT / "parts-catalog"

sys.path.insert(0, str(PARTS_CATALOG_DIR))
from download_diagrams import SECTIONS, SUBCATEGORY_NAMES  # noqa: E402

OUTPUT_DIR = SITE_DIR / "public" / "data"
OUTPUT_FILE = OUTPUT_DIR / "sections.json"


def folder_to_display_name(folder_name: str) -> str:
    """
    Convert a section folder name to a human-readable display name.

    '01_ENGINE_MAIN'           -> 'Engine Main'
    '04_MANUAL_TRANSMISSION'   -> 'Manual Transmission'
    '12_HEATER_AC'             -> 'Heater & AC'
    '13_BODY_ELECTRICAL_1'     -> 'Body Electrical 1'
    """
    # Strip leading number prefix (e.g. "01_")
    stripped = re.sub(r"^\d+_", "", folder_name)

    # Replace "AC" token with "& AC" before title-casing
    # We work on the underscore-separated tokens.
    tokens = stripped.split("_")
    result_tokens = []
    for token in tokens:
        if token == "AC":
            result_tokens.append("&")
            result_tokens.append("AC")
        else:
            result_tokens.append(token.capitalize())

    return " ".join(result_tokens)


def display_name_to_slug(display_name: str) -> str:
    """
    Convert a display name to a URL-friendly slug.

    'Engine Main'        -> 'engine-main'
    'Heater & AC'        -> 'heater-ac'
    'Body Electrical 1'  -> 'body-electrical-1'
    """
    slug = display_name.lower()
    slug = re.sub(r"[&]", "", slug)       # drop ampersand
    slug = re.sub(r"[^a-z0-9]+", "-", slug)  # non-alphanumeric -> hyphen
    slug = slug.strip("-")
    return slug


def build_sections() -> list[dict]:
    """Build the full sections list from SECTIONS and SUBCATEGORY_NAMES."""
    sections = []

    for folder_name, codes in SECTIONS.items():
        display_name = folder_to_display_name(folder_name)
        slug = display_name_to_slug(display_name)

        diagrams = []
        for code in codes:
            filename = f"B11_{code}_LH_2_LR.gif"
            diagrams.append({
                "code": code,
                "name": SUBCATEGORY_NAMES.get(code, code),
                "filename": filename,
                "imagePath": f"/diagrams/{folder_name}/{filename}",
            })

        sections.append({
            "slug": slug,
            "name": display_name,
            "folderName": folder_name,
            "diagramCount": len(diagrams),
            "diagrams": diagrams,
        })

    return sections


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    sections = build_sections()

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(sections, f, indent=2, ensure_ascii=False)
        f.write("\n")

    # Summary
    total_diagrams = sum(s["diagramCount"] for s in sections)
    print(f"Generated {OUTPUT_FILE}")
    print(f"  Sections: {len(sections)}")
    print(f"  Total diagrams: {total_diagrams}")
    print()
    for s in sections:
        print(f"  {s['slug']:30s}  {s['diagramCount']:3d} diagrams  ({s['name']})")


if __name__ == "__main__":
    main()
