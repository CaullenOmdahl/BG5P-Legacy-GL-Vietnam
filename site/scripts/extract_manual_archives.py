#!/usr/bin/env python3
"""Extract ZIP-backed manual archives that were published with .pdf names."""

from __future__ import annotations

import zipfile
from pathlib import Path


SITE_DIR = Path(__file__).resolve().parents[1]
ENGINE_MANUALS_DIR = SITE_DIR / "public" / "manuals" / "EJ20E-SOHC-engine"

ARCHIVES = {
    "EJ20_Electrical_System.pdf": ENGINE_MANUALS_DIR / "EJ20_Electrical_System",
}


def main() -> int:
    extracted = 0

    for archive_name, output_dir in ARCHIVES.items():
        archive_path = ENGINE_MANUALS_DIR / archive_name
        if not zipfile.is_zipfile(archive_path):
            print(f"Skipping non-ZIP archive source: {archive_path}")
            continue

        output_dir.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(archive_path) as archive:
            for member in sorted(archive.namelist()):
                if not member.lower().endswith(".pdf"):
                    continue
                target = output_dir / Path(member).name
                target.write_bytes(archive.read(member))
                extracted += 1
                print(f"{archive_name} -> {target.relative_to(SITE_DIR)}")

    print(f"Extracted {extracted} manual archive member(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
