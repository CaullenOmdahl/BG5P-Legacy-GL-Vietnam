#!/usr/bin/env python3
"""Build deployable text knowledge for the BG5P website chatbot."""

from __future__ import annotations

import json
import shutil
import subprocess
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PACK = ROOT / "chatgpt-bg5-diagnostic-expert"
UPLOAD = PACK / "upload_20_files"
SITE_KNOWLEDGE = ROOT / "site" / "chatbot-knowledge"
TEXT_DIR = SITE_KNOWLEDGE / "pdf-text"

TEXT_EXTENSIONS = {".md", ".csv"}
PDF_EXTENSIONS = {".pdf"}


def run(command: list[str]) -> str:
    completed = subprocess.run(
        command,
        cwd=ROOT,
        check=True,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    return completed.stdout


def copy_text_file(source: Path, target: Path) -> dict[str, object]:
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, target)
    return {
        "source": str(source.relative_to(ROOT)),
        "target": str(target.relative_to(SITE_KNOWLEDGE)),
        "kind": source.suffix.lower().lstrip("."),
        "bytes": target.stat().st_size,
    }


def extract_pdf_text(source: Path, target: Path) -> dict[str, object]:
    target.parent.mkdir(parents=True, exist_ok=True)
    text = run(["pdftotext", "-layout", str(source), "-"])
    target.write_text(text.strip() + "\n", encoding="utf-8")
    return {
        "source": str(source.relative_to(ROOT)),
        "target": str(target.relative_to(SITE_KNOWLEDGE)),
        "kind": "pdf-text",
        "bytes": target.stat().st_size,
    }


def main() -> None:
    if not UPLOAD.exists():
        raise SystemExit(f"Missing GPT upload folder: {UPLOAD}")

    shutil.rmtree(SITE_KNOWLEDGE, ignore_errors=True)
    SITE_KNOWLEDGE.mkdir(parents=True, exist_ok=True)

    manifest: list[dict[str, object]] = []

    instructions = PACK / "GPT_INSTRUCTIONS.md"
    if instructions.exists():
        manifest.append(copy_text_file(instructions, SITE_KNOWLEDGE / "GPT_INSTRUCTIONS.md"))

    readme = PACK / "README.md"
    if readme.exists():
        manifest.append(copy_text_file(readme, SITE_KNOWLEDGE / "PACK_README.md"))

    for source in sorted(UPLOAD.iterdir(), key=lambda p: p.name):
        suffix = source.suffix.lower()
        if suffix in TEXT_EXTENSIONS:
            manifest.append(copy_text_file(source, SITE_KNOWLEDGE / source.name))
        elif suffix in PDF_EXTENSIONS:
            manifest.append(extract_pdf_text(source, TEXT_DIR / f"{source.stem}.txt"))

    metadata = {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source_upload_folder": str(UPLOAD.relative_to(ROOT)),
        "documents": manifest,
    }
    (SITE_KNOWLEDGE / "manifest.json").write_text(
        json.dumps(metadata, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    print(f"Wrote {len(manifest)} chatbot knowledge files to {SITE_KNOWLEDGE}")


if __name__ == "__main__":
    main()
