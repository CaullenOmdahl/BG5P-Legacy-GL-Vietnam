#!/usr/bin/env python3
"""Build BG5P parts interchange evidence CSVs from the local EPC-derived data."""

from __future__ import annotations

import csv
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from parts_category_metadata import diagram_index  # noqa: E402

DATA_DIR = ROOT / "site" / "public" / "data"
DOCS_DIR = ROOT / "docs"

PARTS_JSON = DATA_DIR / "parts.json"
SECTIONS_JSON = DATA_DIR / "sections.json"

MASTER_CSV = DOCS_DIR / "bg5p-oem-parts-master.csv"
SHARED_ENGINE_CSV = DOCS_DIR / "bg5p-shared-engine-interchange-candidates.csv"

ENGINE_RE = re.compile(r"\bEJ\d{2}[A-Z]?\b", re.IGNORECASE)
MODEL_APPLICATION_PREFIXES = ("*S.", "S.", "2W.", "W.", "LX.", "25.", "MT.")
OPTION_NOTE_VALUES = {"EUR.RUSTPROOF"}


MASTER_FIELDS = [
    "category_code",
    "section",
    "diagram",
    "group_code",
    "group_name",
    "oem_number",
    "quantity",
    "production_period",
    "applies_for_models",
    "notes",
    "engine_tokens",
    "interchange_signal",
    "confidence_gate",
    "required_verification",
]

SHARED_FIELDS = [
    "category_code",
    "section",
    "diagram",
    "group_code",
    "group_name",
    "oem_number",
    "quantity",
    "production_period",
    "applies_for_models",
    "notes",
    "donor_engine_tokens",
    "confidence_statement",
    "required_verification",
]


def read_json(path: Path):
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def engine_tokens(row: dict) -> list[str]:
    text = " ".join(
        str(row.get(field, ""))
        for field in ("production_period", "applies_for_models", "notes")
    )
    return sorted({match.group(0).upper() for match in ENGINE_RE.finditer(text)})


def looks_like_model_application(value: str) -> bool:
    return value.startswith(MODEL_APPLICATION_PREFIXES) and bool(ENGINE_RE.search(value))


def normalize_application_fields(row: dict) -> dict:
    normalized = dict(row)
    applies = str(normalized.get("applies_for_models", ""))
    notes = str(normalized.get("notes", ""))

    if applies in OPTION_NOTE_VALUES and looks_like_model_application(notes):
        normalized["applies_for_models"] = notes
        normalized["notes"] = applies
    elif not applies and looks_like_model_application(notes):
        normalized["applies_for_models"] = notes
        normalized["notes"] = ""

    return normalized


def classify(row: dict, section: str, tokens: list[str]) -> tuple[str, str, str]:
    text = " ".join(
        str(row.get(field, "")).upper()
        for field in ("production_period", "applies_for_models", "notes", "group_name")
    )
    has_ej20e = "EJ20E" in tokens
    donor_tokens = [token for token in tokens if token != "EJ20E"]

    if has_ej20e and donor_tokens:
        return (
            "shared_engine_candidate",
            "95%+ only after the donor is from the same BG/B11 production range and the OEM/stamped part number matches.",
            "Confirm donor frame/engine, same OEM number or supersession, production date, side/trim, and physical connector/mounting match.",
        )

    if has_ej20e:
        return (
            "ej20e_specific_target_part",
            "Target-fit evidence only; no cross-engine interchange claim.",
            "Use exact OEM number or supersession for purchases; do not substitute a donor engine without separate evidence.",
        )

    if tokens:
        return (
            "non_ej20e_reference_only",
            "Below 95% for this car unless separate evidence proves the same OEM number also applies to BG5/EJ20E.",
            "Do not buy for the BG5P without an exact EJ20E/BG5 application, supersession, or stamped-number match.",
        )

    if section in {"Manual Transmission", "Differential Propeller"} or any(
        marker in text for marker in ("F4W", "F4WD", "MT", "TY752")
    ):
        return (
            "drivetrain_option_specific",
            "Can reach 95%+ only after matching transmission code, AWD/final-drive data, and OEM number.",
            "Confirm transmission code, rear diff ratio, prop shaft length, axle spline/count, and OEM number.",
        )

    if not row.get("applies_for_models") and not row.get("notes"):
        return (
            "common_or_unspecified_bg_chassis_part",
            "Can reach 95%+ only when the donor has the same OEM number or a verified Subaru supersession.",
            "Confirm same BG wagon body style, LHD/RHD where relevant, side, color/trim, and OEM number.",
        )

    return (
        "requires_option_confirmation",
        "Below 95% until the option code and donor vehicle evidence are resolved.",
        "Confirm all application notes before buying.",
    )


def build_rows(parts: dict, diagrams: dict[str, tuple[str, str]]) -> list[dict]:
    rows: list[dict] = []
    for category_code, entries in sorted(parts.items()):
        section, diagram = diagrams.get(category_code, ("Unknown", "Unknown"))
        for row in entries:
            row = normalize_application_fields(row)
            tokens = engine_tokens(row)
            signal, confidence_gate, required = classify(row, section, tokens)
            rows.append(
                {
                    "category_code": category_code,
                    "section": section,
                    "diagram": diagram,
                    "group_code": row.get("group_code", ""),
                    "group_name": row.get("group_name", ""),
                    "oem_number": row.get("oem_number", ""),
                    "quantity": row.get("quantity", ""),
                    "production_period": row.get("production_period", ""),
                    "applies_for_models": row.get("applies_for_models", ""),
                    "notes": row.get("notes", ""),
                    "engine_tokens": ";".join(tokens),
                    "interchange_signal": signal,
                    "confidence_gate": confidence_gate,
                    "required_verification": required,
                }
            )
    return rows


def write_csv(path: Path, fields: list[str], rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, lineterminator="\n")
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row.get(field, "") for field in fields})


def main() -> None:
    parts = read_json(PARTS_JSON)
    sections = read_json(SECTIONS_JSON)
    diagrams = diagram_index(sections)

    master_rows = build_rows(parts, diagrams)
    shared_rows = []
    seen_shared_rows: set[tuple[str, ...]] = set()
    for row in master_rows:
        tokens = [token for token in row["engine_tokens"].split(";") if token]
        donor_tokens = [token for token in tokens if token != "EJ20E"]
        if row["interchange_signal"] != "shared_engine_candidate":
            continue
        shared_row = {
            **row,
            "donor_engine_tokens": ";".join(donor_tokens),
            "confidence_statement": row["confidence_gate"],
        }
        shared_key = tuple(str(shared_row.get(field, "")) for field in SHARED_FIELDS)
        if shared_key in seen_shared_rows:
            continue
        seen_shared_rows.add(shared_key)
        shared_rows.append(shared_row)

    write_csv(MASTER_CSV, MASTER_FIELDS, master_rows)
    write_csv(SHARED_ENGINE_CSV, SHARED_FIELDS, shared_rows)

    print(f"Wrote {MASTER_CSV.relative_to(ROOT)} ({len(master_rows)} rows)")
    print(f"Wrote {SHARED_ENGINE_CSV.relative_to(ROOT)} ({len(shared_rows)} rows)")


if __name__ == "__main__":
    main()
