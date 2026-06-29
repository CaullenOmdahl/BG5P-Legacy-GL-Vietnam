#!/usr/bin/env python3
"""Verify every published diagram has a non-empty parts list."""

import json
import sys
from pathlib import Path


SITE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = SITE_DIR / "public" / "data"
SECTIONS_FILE = DATA_DIR / "sections.json"
PARTS_FILE = DATA_DIR / "parts.json"
PARTS_STATUS_FILE = DATA_DIR / "parts-status.json"


def load_json(path: Path):
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def main() -> int:
    sections = load_json(SECTIONS_FILE)
    parts = load_json(PARTS_FILE)
    statuses = load_json(PARTS_STATUS_FILE) if PARTS_STATUS_FILE.exists() else {}

    missing = []
    for section in sections:
        for diagram in section.get("diagrams", []):
            category_code = diagram["code"].split("_", 1)[0]
            if not parts.get(category_code) and category_code not in statuses:
                missing.append(
                    (
                        section["slug"],
                        diagram["code"],
                        diagram["name"],
                        category_code,
                    )
                )

    if missing:
        unique_codes = sorted({item[3] for item in missing})
        print(
            f"Missing parts data for {len(missing)} diagram page(s) "
            f"across {len(unique_codes)} category code(s)."
        )
        for section_slug, diagram_code, diagram_name, category_code in missing:
            print(f"- {section_slug}/{diagram_code}: {diagram_name} ({category_code})")
        return 1

    total_diagrams = sum(len(section.get("diagrams", [])) for section in sections)
    checked_empty = sorted(
        {
            diagram["code"].split("_", 1)[0]
            for section in sections
            for diagram in section.get("diagrams", [])
            if not parts.get(diagram["code"].split("_", 1)[0])
            and diagram["code"].split("_", 1)[0] in statuses
        }
    )
    if checked_empty:
        print(
            f"All {total_diagrams} diagram page(s) are resolved "
            f"({len(checked_empty)} category code(s) have checked empty status)."
        )
    else:
        print(f"All {total_diagrams} diagram page(s) have parts data.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
