#!/usr/bin/env python3
"""
Build sections.json from the parts-catalog diagram definitions.

Reads SECTIONS and SUBCATEGORY_NAMES from parts-catalog/download_diagrams.py
and generates site/public/data/sections.json for the frontend.
"""

import csv
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
SECTIONS_FILE = OUTPUT_DIR / "sections.json"
PARTS_FILE = OUTPUT_DIR / "parts.json"

# EPC extraction output directories (from extract_epc.py)
EPC_SECTIONS = ["engine", "body", "trans", "electric"]


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


def build_parts() -> dict:
    """
    Build parts data from EPC extraction CSVs.

    Maps diagram category codes (e.g., "006") to lists of parts,
    keyed by the 3-digit category code so the frontend can match
    diagram codes like "006_01" to category "006".

    Returns empty dict if no CSVs exist yet.
    """
    parts_by_category = {}

    for epc_section in EPC_SECTIONS:
        section_dir = PARTS_CATALOG_DIR / epc_section
        if not section_dir.exists():
            continue

        # Read from master CSV if it exists, otherwise read individual category CSVs
        csv_files = []
        master_csv = section_dir / "all_parts.csv"
        if master_csv.exists():
            csv_files = [master_csv]
        else:
            csv_files = sorted(section_dir.rglob("parts.csv"))

        for csv_file in csv_files:
            with open(csv_file, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    cat_code = row.get("category_code", "").strip()
                    if not cat_code:
                        continue
                    parts_by_category.setdefault(cat_code, []).append({
                        "oem_number": row.get("oem_number", ""),
                        "quantity": row.get("quantity", ""),
                        "production_period": row.get("production_period", ""),
                        "applies_for_models": row.get("applies_for_models", ""),
                        "notes": row.get("notes", ""),
                        "replacements": row.get("replacements", ""),
                        "group_code": row.get("group_code", ""),
                        "group_name": row.get("group_name", ""),
                    })

    return parts_by_category


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # ── sections.json ──
    sections = build_sections()
    with open(SECTIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(sections, f, indent=2, ensure_ascii=False)
        f.write("\n")

    total_diagrams = sum(s["diagramCount"] for s in sections)
    print(f"Generated {SECTIONS_FILE}")
    print(f"  Sections: {len(sections)}")
    print(f"  Total diagrams: {total_diagrams}")
    print()
    for s in sections:
        print(f"  {s['slug']:30s}  {s['diagramCount']:3d} diagrams  ({s['name']})")

    # ── parts.json ──
    parts = build_parts()
    with open(PARTS_FILE, "w", encoding="utf-8") as f:
        json.dump(parts, f, indent=2, ensure_ascii=False)
        f.write("\n")

    total_parts = sum(len(v) for v in parts.values())
    print(f"\nGenerated {PARTS_FILE}")
    print(f"  Categories with parts: {len(parts)}")
    print(f"  Total part entries: {total_parts}")
    if not parts:
        print("  (No EPC CSVs found yet — run extract_epc.py first)")


if __name__ == "__main__":
    main()
