#!/usr/bin/env python3
"""Verify generated catalog artifacts do not expose avoidable placeholder labels."""

from __future__ import annotations

import csv
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SITE_DIR = ROOT / "site"
MASTER_CSV = ROOT / "docs" / "bg5p-oem-parts-master.csv"
PARTS_INDEX = SITE_DIR / "public" / "llms" / "parts-index.txt"
SHARED_INTERCHANGE_CSVS = [
    ROOT / "docs" / "bg5p-shared-engine-interchange-candidates.csv",
    ROOT
    / "chatgpt-bg5-diagnostic-expert"
    / "upload_20_files"
    / "14_BG5P_Shared_Engine_Interchange_Candidates.csv",
    SITE_DIR / "chatbot-knowledge" / "14_BG5P_Shared_Engine_Interchange_Candidates.csv",
]

EXPECTED_CATEGORY_LABELS = {
    "560": ("Body Key Bumper", "TRUNK LID"),
    "651": ("Seat Instrument Panel", "REAR WINDOW GLASS"),
    "656": ("Seat Instrument Panel", "REAR SHELF"),
}


def read_master_rows() -> list[dict[str, str]]:
    with MASTER_CSV.open("r", encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def read_parts_index_rows() -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for line in PARTS_INDEX.read_text(encoding="utf-8").splitlines():
        columns = [column.strip() for column in line.split("|")]
        if len(columns) != 4 or columns[0] == "OEM_NUMBER":
            continue
        rows.append(
            {
                "oem_number": columns[0],
                "part_name": columns[1],
                "section": columns[2],
                "diagram_code": columns[3],
            }
        )
    return rows


def duplicate_csv_row_numbers(csv_path: Path) -> list[int]:
    seen: set[tuple[str, ...]] = set()
    duplicates: list[int] = []
    with csv_path.open("r", encoding="utf-8", newline="") as handle:
        for line_number, row in enumerate(csv.reader(handle), start=1):
            key = tuple(row)
            if key in seen:
                duplicates.append(line_number)
                continue
            seen.add(key)
    return duplicates


def main() -> None:
    failures: list[str] = []

    master_rows = read_master_rows()
    unknown_master = [row for row in master_rows if "Unknown" in {row["section"], row["diagram"]}]
    if unknown_master:
        failures.append(
            f"{MASTER_CSV.relative_to(ROOT)} contains {len(unknown_master)} row(s) with Unknown section/diagram labels"
        )

    parts_index_rows = read_parts_index_rows()
    unknown_index = [row for row in parts_index_rows if row["section"] == "Unknown"]
    if unknown_index:
        failures.append(
            f"{PARTS_INDEX.relative_to(SITE_DIR)} contains {len(unknown_index)} row(s) with Unknown section labels"
        )

    for csv_path in SHARED_INTERCHANGE_CSVS:
        duplicate_lines = duplicate_csv_row_numbers(csv_path)
        if duplicate_lines:
            failures.append(
                f"{csv_path.relative_to(ROOT)} contains duplicate row(s) at line(s): "
                f"{', '.join(str(line) for line in duplicate_lines)}"
            )

    by_category: dict[str, list[dict[str, str]]] = {}
    for row in master_rows:
        by_category.setdefault(row["category_code"], []).append(row)

    for category_code, (section, diagram) in EXPECTED_CATEGORY_LABELS.items():
        rows = by_category.get(category_code, [])
        if not rows:
            failures.append(f"Category {category_code} is missing from {MASTER_CSV.relative_to(ROOT)}")
            continue
        mismatches = [
            row
            for row in rows
            if row["section"] != section or row["diagram"] != diagram
        ]
        if mismatches:
            failures.append(
                f"Category {category_code} must be labelled {section} / {diagram}, "
                f"but {len(mismatches)} row(s) differ"
            )

    if failures:
        for failure in failures:
            print(failure)
        raise SystemExit(1)

    print("Catalog quality checks passed.")


if __name__ == "__main__":
    main()
