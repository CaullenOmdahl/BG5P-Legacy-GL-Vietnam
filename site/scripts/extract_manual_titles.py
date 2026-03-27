#!/usr/bin/env python3
"""
Extract titles from BG-chassis PDF files using pdftotext.

Reads each PDF, extracts the first two meaningful lines
(section type + topic name), and writes a JSON mapping of
filename → human-readable title to public/data/manual-titles.json.
"""

import json
import re
import subprocess
from pathlib import Path

SITE_DIR = Path(__file__).resolve().parent.parent
CHASSIS_DIR = SITE_DIR / "public" / "manuals" / "BG-chassis"
OUTPUT = SITE_DIR / "public" / "data" / "manual-titles.json"

# Short forms for the section-type prefixes
SECTION_TYPE_SHORT = {
    "SPECIFICATIONS AND SERVICE DATA": "Specs",
    "COMPONENT PARTS": "Components",
    "SERVICE PROCEDURE": "Service",
    "WIRING DIAGRAM": "Wiring",
    "ON-BOARD DIAGNOSTICS": "Diagnostics",
    "PREPARATION": "Preparation",
    "GENERAL DESCRIPTION": "Overview",
    "GENERAL": "General",
    "SUPPLEMENTAL RESTRAINT SYSTEM": "SRS",
    "INDEX": "Index",
    "PRECAUTIONS": "Precautions",
}


def extract_title(pdf_path: Path) -> str:
    """Return a human-readable title for the given PDF."""
    try:
        result = subprocess.run(
            ["pdftotext", str(pdf_path), "-"],
            capture_output=True,
            text=True,
            timeout=15,
            errors="replace",
        )
        raw = result.stdout
    except Exception:
        return pdf_path.stem

    # Clean lines: non-empty, not pure numbers/hyphens/codes
    lines = []
    for line in raw.splitlines():
        line = line.strip()
        if not line:
            continue
        # Skip lines that are only digits, hyphens, section numbers like "4-4"
        if re.match(r"^[\d\-\.]+$", line):
            continue
        # Skip lines that look like diagram codes (e.g. B4M0065B)
        if re.match(r"^[A-Z][0-9][A-Z]\d{4}[A-Z]?$", line):
            continue
        lines.append(line)

    if not lines:
        return pdf_path.stem

    # First line is usually the section type
    section_type = lines[0] if lines else ""
    short_type = SECTION_TYPE_SHORT.get(section_type.upper(), section_type.title())

    # Second line (or first if no distinct section type) is the topic
    topic = ""
    for line in lines[1:3]:
        # Look for a line starting with a number like "1. Brakes" or "6. ABS System"
        m = re.match(r"^\d+\.\s+(.+)$", line)
        if m:
            topic = m.group(1).strip()
            break
        # Or just take it as-is if it looks like a title
        if len(line) > 3 and not re.match(r"^[A-Z]:\s", line):
            topic = line
            break

    if topic:
        return f"{topic} — {short_type}"
    return short_type or pdf_path.stem


def main():
    titles: dict[str, str] = {}
    pdf_files = sorted(CHASSIS_DIR.rglob("*.pdf"))
    print(f"Processing {len(pdf_files)} PDFs…")

    for i, pdf_path in enumerate(pdf_files, 1):
        title = extract_title(pdf_path)
        titles[pdf_path.name] = title
        if i % 50 == 0:
            print(f"  {i}/{len(pdf_files)}")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(titles, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"Written {len(titles)} titles to {OUTPUT}")

    # Print a sample
    sample = list(titles.items())[:10]
    print("\nSample:")
    for fname, title in sample:
        print(f"  {fname}: {title}")


if __name__ == "__main__":
    main()
