#!/usr/bin/env python3
"""Verify manual archive assets and generated archive index pages."""

from __future__ import annotations

import sys
import zipfile
from pathlib import Path


SITE_DIR = Path(__file__).resolve().parents[1]
PROJECT_DIR = SITE_DIR.parent
ENGINE_MANUALS_DIR = SITE_DIR / "public" / "manuals" / "EJ20E-SOHC-engine"
BG_CHASSIS_DIR = PROJECT_DIR / "manuals" / "BG-chassis"

ARCHIVES = {
    "EJ20_Electrical_System.pdf": ENGINE_MANUALS_DIR / "EJ20_Electrical_System",
}


def main() -> int:
    failures: list[str] = []

    for archive_name, extracted_dir in ARCHIVES.items():
        archive_path = ENGINE_MANUALS_DIR / archive_name
        if not archive_path.exists():
            failures.append(f"missing archive source: {archive_path}")
            continue

        if not zipfile.is_zipfile(archive_path):
            failures.append(f"archive source is not ZIP-backed: {archive_path}")
            continue

        with zipfile.ZipFile(archive_path) as archive:
            pdf_members = sorted(
                member
                for member in archive.namelist()
                if member.lower().endswith(".pdf")
            )

        if not pdf_members:
            failures.append(f"archive has no PDF members: {archive_path}")
            continue

        for member in pdf_members:
            expected = extracted_dir / Path(member).name
            if not expected.exists():
                failures.append(f"missing extracted archive member: {expected}")

    if not BG_CHASSIS_DIR.exists():
        failures.append(f"missing BG chassis manual directory: {BG_CHASSIS_DIR}")
    else:
        for index_path in sorted(BG_CHASSIS_DIR.rglob("index.html")):
            text = index_path.read_text(encoding="utf-8")
            lower = text.lower()
            missing = [
                token
                for token in ("<!doctype html", "<head", "<title", "<body")
                if token not in lower
            ]
            if missing:
                failures.append(
                    f"manual index lacks document structure: {index_path} "
                    f"({', '.join(missing)})"
                )

    if failures:
        print("manual archive asset verification failed:", file=sys.stderr)
        for failure in failures:
            print(f"  - {failure}", file=sys.stderr)
        return 1

    print("manual archive asset verification passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
