#!/usr/bin/env python3
"""Build a conservative ChatGPT knowledge upload pack for the BG5P repo."""

from __future__ import annotations

import csv
import hashlib
import json
import re
import shutil
import subprocess
import zipfile
from datetime import datetime, timezone
from pathlib import Path

from build_chatgpt_deeplink_sitemap import write_deeplink_sitemap


ROOT = Path(__file__).resolve().parents[1]
PACK = ROOT / "chatgpt-bg5-diagnostic-expert"
UPLOAD = PACK / "upload_10_files"
UPLOAD20 = PACK / "upload_20_files"
OPTIONAL = PACK / "optional_if_20_file_limit"

INTERCHANGE_MARKDOWN_SOURCES = [
    "docs/bg5p-consumables-wear-interchange.md",
    "docs/parts-interchange-research.md",
]
OEM_MASTER_CSV = "docs/bg5p-oem-parts-master.csv"
SHARED_ENGINE_CSV = "docs/bg5p-shared-engine-interchange-candidates.csv"
COMMON_ISSUES_RESEARCH = "docs/bg5p-common-issues-internet-research.md"

EXPANDED_UPLOAD_EXTRAS = [
    (
        "optional_if_20_file_limit/10_BG5P_BG_Chassis_Body_Interior_SRS_Searchable.pdf",
        "10_BG5P_BG_Chassis_Body_Interior_SRS_Searchable.pdf",
        "Body, interior, exterior trim, and SRS factory PDF sections.",
    ),
    (
        "optional_if_20_file_limit/11_BG5P_Web_Deeplink_Sitemap.md",
        "11_BG5P_Web_Deeplink_Sitemap.md",
        "Website, manual PDF, exploded-diagram image, and LLM text deeplinks.",
    ),
    (
        "docs/bg5p-consumables-wear-interchange.md",
        "12_BG5P_Consumables_Wear_Interchange.md",
        "Purchase-facing consumables and wear-parts interchange guide.",
    ),
    (
        "docs/bg5p-oem-parts-master.csv",
        "13_BG5P_OEM_Parts_Master.csv",
        "Full EPC-derived OEM parts master with confidence gates.",
    ),
    (
        "docs/bg5p-shared-engine-interchange-candidates.csv",
        "14_BG5P_Shared_Engine_Interchange_Candidates.csv",
        "Shared EJ20E plus EJ18E/EJ25D candidate rows.",
    ),
    (
        "docs/parts-interchange-research.md",
        "15_BG5P_Parts_Interchange_Research.md",
        "Interchange research rules, Car-Part usage boundaries, and source hierarchy.",
    ),
    (
        "docs/bg5p-common-issues-internet-research.md",
        "16_BG5P_Common_Issues_Internet_Research.md",
        "Cited internet research on common BG/BG5 issues and resolutions.",
    ),
]


DTC_ROWS = [
    ("11", "Crankshaft position sensor", "No signal from crankshaft position sensor when ignition is ON; ECM-to-sensor harness short/open."),
    ("21", "Engine coolant temperature sensor", "Engine coolant temperature sensor signal abnormal; ECM-to-sensor harness short/open."),
    ("22", "Knock sensor", "Knock sensor signal abnormal; ECM-to-sensor harness short/open."),
    ("23", "Mass Air Flow (MAF) sensor", "Mass Air Flow sensor signal abnormal; ECM-to-MAF-sensor harness short/open."),
    ("24", "Idle air control solenoid valve", "IAC solenoid valve not functioning; ECM-to-IAC harness short/open."),
    ("26", "Intake air temperature sensor", "Intake air temperature signal abnormal; ECM-to-IAT harness short/open."),
    ("31", "Throttle position sensor", "TPS signal abnormal, TPS installed abnormally, or ECM-to-TPS harness short/open."),
    ("32", "Oxygen sensor (with catalyst vehicles)", "Oxygen sensor not functioning; ECM-to-O2-sensor harness short/open."),
    ("33", "Vehicle speed signal", "Vehicle speed signal abnormal; ECM-to-combination-meter harness short/open."),
    ("35", "Purge control solenoid valve", "Purge control solenoid valve not functioning; ECM-to-purge-solenoid harness short/open."),
    ("38", "Torque control signal", "Abnormal signal from TCM; ECM-to-TCM harness short."),
    ("45", "Pressure sensor", "Pressure sensor signal abnormal; ECM-to-pressure-sensor harness short/open."),
    ("46", "CO resistor (general spec vehicles)", "CO resistor signal abnormal, ECM-to-CO-resistor harness short/open, or CO value not adjusted to spec."),
    ("51", "Neutral position switch", "Neutral position switch signal abnormal; ECM-to-neutral-switch harness short/open."),
    ("53", "Immobiliser system", "Faulty immobiliser system."),
    ("54", "Air intake system", "Loose or damaged intake ducts/hoses causing abnormal pressure sensor signal."),
    ("85", "Charge system", "Charge system abnormal."),
]


PDF_GROUPS = {
    "02_BG5P_EJ20E_Fuel_Ignition_Electrical_Searchable.pdf": [
        "manuals/EJ20E-SOHC-engine/EJ20_SOHC_Fuel_Injection_no_OBD.pdf",
        "manuals/EJ20E-SOHC-engine/EJ20_SOHC_Ignition_no_OBD.pdf",
        "manuals/EJ20E-SOHC-engine/EJ20_Electrical_System.pdf",
        "manuals/EJ20E-SOHC-engine/EJ20_Starting_Charging.pdf",
        "manuals/EJ20E-SOHC-engine/EJ20_SOHC_Emission_Control_no_OBD.pdf",
        "manuals/EJ20E-SOHC-engine/EJ20_Speed_Control.pdf",
    ],
    "03_BG5P_EJ20E_Mechanical_Cooling_Lubrication_Searchable.pdf": [
        "manuals/EJ20E-SOHC-engine/EJ20_SOHC_Mechanical.pdf",
        "manuals/EJ20E-SOHC-engine/EJ20_SOHC_Intake.pdf",
        "manuals/EJ20E-SOHC-engine/EJ20_Cooling.pdf",
        "manuals/EJ20E-SOHC-engine/EJ20_Lubrication.pdf",
        "manuals/EJ20E-SOHC-engine/EJ20_SOHC_Exhaust_no_OBD.pdf",
    ],
}


def natural_key(path: Path) -> list[object]:
    parts = re.split(r"(\d+)", str(path))
    return [int(part) if part.isdigit() else part.lower() for part in parts]


def pdfs_under(*relative_dirs: str) -> list[Path]:
    pdfs: list[Path] = []
    for relative_dir in relative_dirs:
        pdfs.extend((ROOT / relative_dir).rglob("*.pdf"))
    return sorted(pdfs, key=natural_key)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def csv_row_count(path: Path) -> int:
    with path.open("r", encoding="utf-8", newline="") as fh:
        return max(0, sum(1 for _ in fh) - 1)


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


def pdf_page_count(path: Path) -> int | None:
    try:
        info = run(["pdfinfo", str(path)])
    except (FileNotFoundError, subprocess.CalledProcessError):
        return None
    match = re.search(r"^Pages:\s+(\d+)$", info, re.MULTILINE)
    return int(match.group(1)) if match else None


def text_probe(path: Path) -> int:
    try:
        text = run(["pdftotext", "-f", "1", "-l", "3", str(path), "-"])
    except (FileNotFoundError, subprocess.CalledProcessError):
        return 0
    return len(text.strip())


def is_encrypted_pdf(path: Path) -> bool:
    try:
        info = run(["pdfinfo", str(path)])
    except (FileNotFoundError, subprocess.CalledProcessError):
        return False
    match = re.search(r"^Encrypted:\s+(.+)$", info, re.MULTILINE)
    return bool(match and match.group(1).lower().startswith("yes"))


def normalize_pdf(source: Path, output: Path) -> Path:
    output.unlink(missing_ok=True)
    run(
        [
            "gs",
            "-q",
            "-dBATCH",
            "-dNOPAUSE",
            "-sDEVICE=pdfwrite",
            "-dCompatibilityLevel=1.7",
            f"-sOutputFile={output}",
            str(source),
        ]
    )
    return output


def prepare_pdf_inputs(inputs: list[Path], temp_dir: Path) -> list[Path]:
    prepared: list[Path] = []
    temp_dir.mkdir(parents=True, exist_ok=True)

    for source in inputs:
        if zipfile.is_zipfile(source):
            with zipfile.ZipFile(source) as archive:
                pdf_members = sorted(
                    [name for name in archive.namelist() if name.lower().endswith(".pdf")],
                    key=str.lower,
                )
                for idx, member in enumerate(pdf_members, start=1):
                    target = temp_dir / f"{source.stem}_zip_{idx:03d}_{Path(member).name}"
                    target.write_bytes(archive.read(member))
                    prepared.extend(prepare_pdf_inputs([target], temp_dir))
            continue

        if is_encrypted_pdf(source):
            target = temp_dir / f"{source.stem}_decrypted.pdf"
            prepared.append(normalize_pdf(source, target))
            continue

        prepared.append(source)

    return prepared


def merge_pdf(inputs: list[Path], output: Path, temp_dir: Path) -> None:
    output.unlink(missing_ok=True)
    prepared = prepare_pdf_inputs(inputs, temp_dir / output.stem)
    run(["pdfunite", *[str(path) for path in prepared], str(output)])


def copy_pdf(source: Path, output: Path) -> None:
    output.unlink(missing_ok=True)
    shutil.copy2(source, output)


def load_json(relative_path: str):
    with (ROOT / relative_path).open("r", encoding="utf-8") as fh:
        return json.load(fh)


def file_size_mb(path: Path) -> str:
    return f"{path.stat().st_size / (1024 * 1024):.2f} MB"


def write_text(path: Path, content: str) -> None:
    path.write_text(content.rstrip() + "\n", encoding="utf-8")


def make_source_map(generated: list[Path], groups: dict[str, list[Path]]) -> None:
    titles = load_json("site/public/data/manual-titles.json")
    generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    source_map_path = UPLOAD / "00_BG5P_Diagnostic_Expert_Source_Map.md"
    if source_map_path not in generated:
        generated = [source_map_path, *generated]

    lines = [
        "# BG5P Diagnostic Expert Source Map",
        "",
        f"Generated: {generated_at}",
        "",
        "Upload only the files in `upload_10_files/` for the conservative build.",
        "Recommended build: upload the files in `upload_20_files/` when the GPT editor allows 20 knowledge files.",
        "Fallback build: upload only the files in `upload_10_files/` if an account or model surface enforces a 10-file limit.",
        "",
        "## Vehicle Scope",
        "",
        "- Subaru Legacy Touring Wagon GL, model code BG5P.",
        "- Vietnamese-market / general-market LHD export, approximately 1997.",
        "- EJ20E 2.0L naturally aspirated SOHC flat-four.",
        "- 5-speed manual transmission, full-time AWD.",
        "- SSM1 / Subaru Select Monitor era. No OBD-II workflow should be assumed.",
        "",
        "## Integrated Parts Interchange Sources",
        "",
        "These repository sources are integrated into the strict 10-file upload set, so they do not require separate GPT knowledge-file slots.",
        "",
        "| Source | Integrated Into | Rows / Lines | SHA-256 | Purpose |",
        "|---|---|---:|---|---|",
    ]

    interchange_sources = [
        (
            ROOT / INTERCHANGE_MARKDOWN_SOURCES[0],
            "08_BG5P_Maintenance_Parts_LLM_Corpus.md",
            "Purchase-facing consumables and wear-parts interchange guide with confidence labels.",
        ),
        (
            ROOT / INTERCHANGE_MARKDOWN_SOURCES[1],
            "08_BG5P_Maintenance_Parts_LLM_Corpus.md",
            "Parts-interchange research rules, Car-Part/Hollander usage boundaries, and source hierarchy.",
        ),
        (
            ROOT / OEM_MASTER_CSV,
            "09_BG5P_Parts_Diagram_Index.csv",
            "Full local EPC-derived OEM part master with interchange signal and confidence gate fields.",
        ),
        (
            ROOT / SHARED_ENGINE_CSV,
            "09_BG5P_Parts_Diagram_Index.csv",
            "Rows where EPC text explicitly mentions EJ20E plus donor engine tokens such as EJ18E or EJ25D.",
        ),
    ]

    for source, integrated_into, purpose in interchange_sources:
        if not source.exists():
            continue
        rel = source.relative_to(ROOT)
        if source.suffix.lower() == ".csv":
            detail = f"{csv_row_count(source)} rows"
        else:
            detail = f"{len(source.read_text(encoding='utf-8').splitlines())} lines"
        lines.append(
            f"| `{rel}` | `{integrated_into}` | {detail} | `{sha256(source)[:16]}` | {purpose} |"
        )

    lines.extend([
        "",
        "## Recommended 20-File Upload Set",
        "",
        "Use `upload_20_files/` for the normal Custom GPT build. It currently uses 17 files, leaving 3 upload slots free for future additions.",
        "",
        "- Files `00` through `09` are the same core diagnostic set as `upload_10_files/`.",
        "- Files `10` through `16` add body/SRS manuals, website deeplinks, first-class interchange evidence, and internet issue research.",
        "- The fallback 10-file set still contains integrated summaries of the interchange sources inside files `08` and `09`.",
        "",
        "| Added File | Purpose |",
        "|---|---|",
    ])

    for _, upload_name, purpose in EXPANDED_UPLOAD_EXTRAS:
        lines.append(f"| `upload_20_files/{upload_name}` | {purpose} |")

    lines.extend([
        "",
        "## Strict Upload Set",
        "",
        "| File | Size | Pages / Rows | SHA-256 | Purpose |",
        "|---|---:|---:|---|---|",
    ])

    for path in generated:
        rel = path.relative_to(PACK)
        if path == source_map_path:
            detail = "self"
            size = "self"
            digest = "self"
        elif path.suffix.lower() == ".pdf":
            detail = str(pdf_page_count(path) or "?")
            size = file_size_mb(path)
            digest = f"`{sha256(path)[:16]}`"
        elif path.suffix.lower() == ".csv":
            with path.open("r", encoding="utf-8", newline="") as fh:
                detail = str(max(0, sum(1 for _ in fh) - 1))
            size = file_size_mb(path)
            digest = f"`{sha256(path)[:16]}`"
        else:
            detail = str(len(path.read_text(encoding="utf-8").splitlines()))
            size = file_size_mb(path)
            digest = f"`{sha256(path)[:16]}`"
        purpose = purpose_for(path.name)
        lines.append(f"| `{rel}` | {size} | {detail} | {digest} | {purpose} |")

    lines.extend([
        "",
        "## Source Grouping",
        "",
        "Use this section when the GPT needs to cite the original manual family behind an answer.",
        "",
    ])

    for output_name, source_paths in groups.items():
        lines.append(f"### {output_name}")
        lines.append("")
        for source in source_paths:
            title = titles.get(source.name, "")
            source_rel = source.relative_to(ROOT)
            suffix = f" - {title}" if title else ""
            lines.append(f"- `{source_rel}`{suffix}")
        lines.append("")

    lines.extend([
        "## Retrieval Notes",
        "",
        "- Prefer EJ20E no-OBD engine manuals for engine diagnosis, sensors, fuel injection, ignition, ECM I/O, and CEL/MIL flash code procedures.",
        "- Use BG chassis manuals for body, wiring, suspension, brakes, steering, transmission, AWD, and shared electrical layout.",
        "- Treat USDM BG engine-specific procedures as lower confidence for this car unless they are chassis/shared-system procedures.",
        "- The PDFs in this pack were verified with `pdftotext` probes and expose selectable/searchable text. Raster image detail may still require opening the original diagram visually.",
        "- If a response depends on an exploded diagram, ask for the diagram code or part number and use `09_BG5P_Parts_Diagram_Index.csv` plus `08_BG5P_Maintenance_Parts_LLM_Corpus.md`.",
        "",
    ])

    write_text(UPLOAD / "00_BG5P_Diagnostic_Expert_Source_Map.md", "\n".join(lines))


def purpose_for(name: str) -> str:
    purposes = {
        "00_BG5P_Diagnostic_Expert_Source_Map.md": "Vehicle scope, file inventory, source provenance, upload strategy.",
        "01_BG5P_EJ20E_No_OBD_Diagnostics_Searchable.pdf": "Core no-OBD diagnostic trees, CEL/MIL flash codes, ECM I/O, DTC procedures.",
        "02_BG5P_EJ20E_Fuel_Ignition_Electrical_Searchable.pdf": "Fuel injection, ignition, engine electrical, starting/charging, emissions, speed control.",
        "03_BG5P_EJ20E_Mechanical_Cooling_Lubrication_Searchable.pdf": "Mechanical service, intake, cooling, lubrication, exhaust.",
        "04_BG5P_BG_Chassis_Wiring_Electrical_Searchable.pdf": "BG chassis wiring diagrams, connector conventions, body and engine electrical.",
        "05_BG5P_BG_Chassis_Drivetrain_Clutch_AWD_Searchable.pdf": "Manual transmission, differential, clutch, AWD system.",
        "06_BG5P_BG_Chassis_Suspension_Brakes_Steering_HVAC_Searchable.pdf": "Suspension, brakes, steering, wheels/axles, HVAC, pedals/cables.",
        "07_BG5P_Diagnostic_Quick_Reference.md": "Concise diagnostic workflow, DTC list, service intervals, common specs.",
        "08_BG5P_Maintenance_Parts_LLM_Corpus.md": "LLM-friendly maintenance, parts, consumables, wear-parts interchange, and sourcing research text.",
        "09_BG5P_Parts_Diagram_Index.csv": "Structured OEM part, diagram, interchange signal, confidence gate, and shared-engine candidate lookup table.",
    }
    return purposes.get(name, "")


def make_quick_reference() -> None:
    maintenance = load_json("site/public/data/maintenance.json")
    lines = [
        "# BG5P Diagnostic Quick Reference",
        "",
        "## Identity",
        "",
        "| Field | Value |",
        "|---|---|",
        "| Model | Subaru Legacy Touring Wagon GL |",
        "| Model code | BG5P |",
        "| Market | Vietnam / general-market LHD export |",
        "| Approximate year | 1997 |",
        "| Engine | EJ20E 2.0L NA SOHC flat-four |",
        "| Transmission | 5-speed manual |",
        "| Drivetrain | Full-time AWD |",
        "| Diagnostics | SSM1 / Subaru Select Monitor era; no OBD-II assumption |",
        "",
        "## Diagnostic Rules",
        "",
        "1. For engine diagnosis, start with `01_BG5P_EJ20E_No_OBD_Diagnostics_Searchable.pdf`.",
        "2. Do not translate Subaru two-digit flash codes into generic OBD-II P-codes unless a source explicitly supports it.",
        "3. For wiring questions, use `04_BG5P_BG_Chassis_Wiring_Electrical_Searchable.pdf` first, then ask for the exact connector/diagram if visual tracing is needed.",
        "4. For mechanical service and torque specs, prefer the EJ20E PDF set over USDM EJ22/EJ25 engine procedures.",
        "5. For chassis, brakes, steering, HVAC, manual transmission, AWD, and body electrical, BG chassis sources are acceptable shared-platform references.",
        "",
        "## Manual CEL / MIL Code Reading",
        "",
        "- Turn ignition OFF.",
        "- Connect the read memory connector under the dash / lower instrument-panel area.",
        "- Turn ignition ON.",
        "- Read CHECK ENGINE / MIL flashes.",
        "- Long ON segment, about 1.3 seconds, means tens digit.",
        "- Short ON segment, about 0.2 seconds, means ones digit.",
        "- Middle ON segment, about 0.5 seconds, means OK code.",
        "- Record the DTC before clearing memory or disconnecting connectors.",
        "",
        "## Inspection Mode Without Subaru Select Monitor",
        "",
        "- Warm the engine first.",
        "- Turn ignition OFF.",
        "- Set manual transmission to neutral.",
        "- Connect the green test mode connector.",
        "- Turn ignition ON and confirm MIL comes on.",
        "- Start the engine.",
        "- Drive above 11 km/h / 7 mph for at least 1 minute.",
        "- Warm above 2,000 rpm.",
        "- Read and record any MIL DTCs.",
        "",
        "## Clear Memory Without Subaru Select Monitor",
        "",
        "- Turn ignition OFF.",
        "- Set manual transmission to neutral.",
        "- Connect both test mode connector and read memory connector.",
        "- Turn ignition ON.",
        "- Start engine and drive above 11 km/h / 7 mph for at least 1 minute.",
        "- Warm above 2,000 rpm.",
        "- If DTC remains, repair before treating memory clear as complete.",
        "- After memory clear with Subaru Select Monitor, initialize ISC by turning ignition ON and waiting 3 seconds before starting.",
        "",
        "## EJ20E No-OBD DTC List",
        "",
        "| DTC | Item | Diagnostic meaning |",
        "|---|---|---|",
    ]

    for code, item, meaning in DTC_ROWS:
        lines.append(f"| {code} | {item} | {meaning} |")

    lines.extend([
        "",
        "## Maintenance and Service Specs",
        "",
    ])

    for item in maintenance:
        lines.append(f"### {item['title']}")
        lines.append("")
        lines.append(f"- Difficulty: {item.get('difficulty', '')}")
        lines.append(f"- Interval: {item.get('interval', '')}")
        lines.append("- Specs:")
        for spec in item.get("specs", []):
            lines.append(f"  - {spec.get('label', '')}: {spec.get('value', '')}")
        lines.append("- Steps:")
        for idx, step in enumerate(item.get("steps", []), start=1):
            lines.append(f"  {idx}. {step}")
        related_pdfs = item.get("relatedPdfs") or []
        if related_pdfs:
            lines.append("- Related PDFs:")
            for pdf in related_pdfs:
                lines.append(f"  - {pdf}")
        related_diagrams = item.get("relatedDiagrams") or []
        if related_diagrams:
            lines.append("- Related diagrams: " + ", ".join(related_diagrams))
        lines.append("")

    write_text(UPLOAD / "07_BG5P_Diagnostic_Quick_Reference.md", "\n".join(lines))


def make_llm_corpus() -> None:
    llm_files = sorted((ROOT / "site/public/llms").glob("*.txt"), key=natural_key)
    llm_files.extend(sorted((ROOT / "site/public/llms/maintenance").glob("*.txt"), key=natural_key))
    lines = [
        "# BG5P Maintenance and Parts LLM Corpus",
        "",
        "This file concatenates the repository's existing LLM-friendly text exports for BG5P parts sections and maintenance procedures.",
        "The paths below are source paths from the local website project.",
        "",
    ]
    for source in llm_files:
        rel = source.relative_to(ROOT)
        lines.append(f"## Source: {rel}")
        lines.append("")
        lines.append(source.read_text(encoding="utf-8", errors="replace").strip())
        lines.append("")

    lines.extend([
        "# Integrated Parts Interchange And Consumables Evidence",
        "",
        "The following source documents are included verbatim so the GPT can answer purchase, sourcing, and interchange questions without consuming extra knowledge-file slots.",
        "Use these documents as advice and evidence maps, then use `09_BG5P_Parts_Diagram_Index.csv` for structured OEM-number lookup, interchange signals, confidence gates, and shared-engine candidate rows.",
        "",
    ])

    for relative_source in INTERCHANGE_MARKDOWN_SOURCES:
        source = ROOT / relative_source
        if not source.exists():
            continue
        lines.append(f"## Source: {relative_source}")
        lines.append("")
        lines.append(source.read_text(encoding="utf-8", errors="replace").strip())
        lines.append("")

    for relative_source in [OEM_MASTER_CSV, SHARED_ENGINE_CSV]:
        source = ROOT / relative_source
        if not source.exists():
            continue
        with source.open("r", encoding="utf-8", newline="") as fh:
            reader = csv.reader(fh)
            headers = next(reader, [])
        lines.append(f"## Structured Source Available In CSV: {relative_source}")
        lines.append("")
        lines.append(f"- Rows: {csv_row_count(source)}")
        lines.append(f"- Columns: {', '.join(headers)}")
        lines.append("- Integrated target: `09_BG5P_Parts_Diagram_Index.csv`")
        lines.append("")
    write_text(UPLOAD / "08_BG5P_Maintenance_Parts_LLM_Corpus.md", "\n".join(lines))


def make_parts_csv() -> None:
    parts = load_json("site/public/data/parts.json")
    sections = load_json("site/public/data/sections.json")

    diagram_map: dict[str, list[dict[str, str]]] = {}
    for section in sections:
        for diagram in section.get("diagrams", []):
            prefix = diagram.get("code", "").split("_", 1)[0]
            diagram_map.setdefault(prefix, []).append(
                {
                    "section_slug": section.get("slug", ""),
                    "section_name": section.get("name", ""),
                    "diagram_code": diagram.get("code", ""),
                    "diagram_name": diagram.get("name", ""),
                    "image_path": diagram.get("imagePath", ""),
                }
            )

    master_path = ROOT / OEM_MASTER_CSV
    shared_path = ROOT / SHARED_ENGINE_CSV

    output = UPLOAD / "09_BG5P_Parts_Diagram_Index.csv"
    with output.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(
            fh,
            fieldnames=[
                "diagram_prefix",
                "section_slug",
                "section_name",
                "diagram_codes",
                "diagram_names",
                "image_paths",
                "source_section",
                "source_diagram",
                "oem_number",
                "part_name",
                "quantity",
                "production_period",
                "applies_for_models",
                "notes",
                "group_code",
                "engine_tokens",
                "interchange_signal",
                "confidence_gate",
                "required_verification",
                "shared_engine_candidate",
                "donor_engine_tokens",
                "shared_confidence_statement",
                "shared_required_verification",
            ],
            lineterminator="\n",
        )
        writer.writeheader()

        if master_path.exists():
            shared_rows: dict[tuple[str, str, str, str, str, str], dict[str, str]] = {}
            if shared_path.exists():
                with shared_path.open("r", encoding="utf-8", newline="") as shared_fh:
                    for row in csv.DictReader(shared_fh):
                        key = (
                            row.get("category_code", ""),
                            row.get("group_code", ""),
                            row.get("oem_number", ""),
                            row.get("production_period", ""),
                            row.get("applies_for_models", ""),
                            row.get("notes", ""),
                        )
                        shared_rows[key] = row

            with master_path.open("r", encoding="utf-8", newline="") as master_fh:
                for row in csv.DictReader(master_fh):
                    prefix = row.get("category_code", "")
                    diagrams = diagram_map.get(prefix, [])
                    shared_key = (
                        row.get("category_code", ""),
                        row.get("group_code", ""),
                        row.get("oem_number", ""),
                        row.get("production_period", ""),
                        row.get("applies_for_models", ""),
                        row.get("notes", ""),
                    )
                    shared = shared_rows.get(shared_key, {})
                    writer.writerow(
                        {
                            "diagram_prefix": prefix,
                            "section_slug": "; ".join(sorted({d["section_slug"] for d in diagrams})),
                            "section_name": "; ".join(sorted({d["section_name"] for d in diagrams})) or row.get("section", ""),
                            "diagram_codes": "; ".join(d["diagram_code"] for d in diagrams),
                            "diagram_names": "; ".join(sorted({d["diagram_name"] for d in diagrams})) or row.get("diagram", ""),
                            "image_paths": "; ".join(d["image_path"] for d in diagrams),
                            "source_section": row.get("section", ""),
                            "source_diagram": row.get("diagram", ""),
                            "oem_number": row.get("oem_number", ""),
                            "part_name": row.get("group_name", ""),
                            "quantity": row.get("quantity", ""),
                            "production_period": row.get("production_period", ""),
                            "applies_for_models": row.get("applies_for_models", ""),
                            "notes": row.get("notes", ""),
                            "group_code": row.get("group_code", ""),
                            "engine_tokens": row.get("engine_tokens", ""),
                            "interchange_signal": row.get("interchange_signal", ""),
                            "confidence_gate": row.get("confidence_gate", ""),
                            "required_verification": row.get("required_verification", ""),
                            "shared_engine_candidate": "yes" if shared else "",
                            "donor_engine_tokens": shared.get("donor_engine_tokens", ""),
                            "shared_confidence_statement": shared.get("confidence_statement", ""),
                            "shared_required_verification": shared.get("required_verification", ""),
                        }
                    )
            return

        for prefix in sorted(parts.keys(), key=lambda value: natural_key(Path(value))):
            diagrams = diagram_map.get(prefix, [])
            for part in parts[prefix]:
                writer.writerow(
                    {
                        "diagram_prefix": prefix,
                        "section_slug": "; ".join(sorted({d["section_slug"] for d in diagrams})),
                        "section_name": "; ".join(sorted({d["section_name"] for d in diagrams})),
                        "diagram_codes": "; ".join(d["diagram_code"] for d in diagrams),
                        "diagram_names": "; ".join(sorted({d["diagram_name"] for d in diagrams})),
                        "image_paths": "; ".join(d["image_path"] for d in diagrams),
                        "source_section": "",
                        "source_diagram": "",
                        "oem_number": part.get("oem_number", ""),
                        "part_name": part.get("group_name", ""),
                        "quantity": part.get("quantity", ""),
                        "production_period": part.get("production_period", ""),
                        "applies_for_models": part.get("applies_for_models", ""),
                        "notes": part.get("notes", ""),
                        "group_code": part.get("group_code", ""),
                        "engine_tokens": "",
                        "interchange_signal": "",
                        "confidence_gate": "",
                        "required_verification": "",
                        "shared_engine_candidate": "",
                        "donor_engine_tokens": "",
                        "shared_confidence_statement": "",
                        "shared_required_verification": "",
                    }
                )


def make_readme() -> None:
    lines = [
        "# BG5P Diagnostic Expert ChatGPT Pack",
        "",
        "Recommended: upload the files in `upload_20_files/` to the custom GPT Knowledge area.",
        "",
        "Fallback: upload the 10 files in `upload_10_files/` only if your GPT editor or account surface enforces a 10-file limit.",
        "",
        "The 20-file build currently uses 17 files, leaving 3 spare slots for future additions.",
        "",
        "The pack also integrates repository parts-interchange evidence without adding upload slots: `08_BG5P_Maintenance_Parts_LLM_Corpus.md` includes the consumables/interchange Markdown reports, and `09_BG5P_Parts_Diagram_Index.csv` includes the OEM master, confidence gates, and shared-engine candidate fields.",
        "",
        "## Recommended 20-File Upload Order",
        "",
        "1. `00_BG5P_Diagnostic_Expert_Source_Map.md`",
        "2. `01_BG5P_EJ20E_No_OBD_Diagnostics_Searchable.pdf`",
        "3. `02_BG5P_EJ20E_Fuel_Ignition_Electrical_Searchable.pdf`",
        "4. `03_BG5P_EJ20E_Mechanical_Cooling_Lubrication_Searchable.pdf`",
        "5. `04_BG5P_BG_Chassis_Wiring_Electrical_Searchable.pdf`",
        "6. `05_BG5P_BG_Chassis_Drivetrain_Clutch_AWD_Searchable.pdf`",
        "7. `06_BG5P_BG_Chassis_Suspension_Brakes_Steering_HVAC_Searchable.pdf`",
        "8. `07_BG5P_Diagnostic_Quick_Reference.md`",
        "9. `08_BG5P_Maintenance_Parts_LLM_Corpus.md`",
        "10. `09_BG5P_Parts_Diagram_Index.csv`",
        "11. `10_BG5P_BG_Chassis_Body_Interior_SRS_Searchable.pdf`",
        "12. `11_BG5P_Web_Deeplink_Sitemap.md`",
        "13. `12_BG5P_Consumables_Wear_Interchange.md`",
        "14. `13_BG5P_OEM_Parts_Master.csv`",
        "15. `14_BG5P_Shared_Engine_Interchange_Candidates.csv`",
        "16. `15_BG5P_Parts_Interchange_Research.md`",
        "17. `16_BG5P_Common_Issues_Internet_Research.md`",
        "",
        "## Fallback 10-File Upload Order",
        "",
        "1. `00_BG5P_Diagnostic_Expert_Source_Map.md`",
        "2. `01_BG5P_EJ20E_No_OBD_Diagnostics_Searchable.pdf`",
        "3. `02_BG5P_EJ20E_Fuel_Ignition_Electrical_Searchable.pdf`",
        "4. `03_BG5P_EJ20E_Mechanical_Cooling_Lubrication_Searchable.pdf`",
        "5. `04_BG5P_BG_Chassis_Wiring_Electrical_Searchable.pdf`",
        "6. `05_BG5P_BG_Chassis_Drivetrain_Clutch_AWD_Searchable.pdf`",
        "7. `06_BG5P_BG_Chassis_Suspension_Brakes_Steering_HVAC_Searchable.pdf`",
        "8. `07_BG5P_Diagnostic_Quick_Reference.md`",
        "9. `08_BG5P_Maintenance_Parts_LLM_Corpus.md`",
        "10. `09_BG5P_Parts_Diagram_Index.csv`",
        "",
        "## Optional Extra Folder",
        "",
        "`optional_if_20_file_limit/` keeps standalone copies of extras used to compose the 20-file build.",
        "",
        "`optional_if_20_file_limit/11_BG5P_Web_Deeplink_Sitemap.md` is a standalone copy of the website deeplink sitemap. The same sitemap is already embedded in `00_BG5P_Diagnostic_Expert_Source_Map.md`, so do not upload both unless you intentionally want a separate searchable sitemap file.",
        "",
        "## GPT Instructions",
        "",
        "Paste `GPT_INSTRUCTIONS.md` into the custom GPT Instructions field. Do not upload it as Knowledge unless you intentionally want it counted as a knowledge file.",
        "",
    ]
    write_text(PACK / "README.md", "\n".join(lines))


def make_gpt_instructions() -> None:
    lines = [
        "# BG5 Diagnostic Expert - Custom GPT Instructions",
        "",
        "You are a BG5P Subaru Legacy Touring Wagon diagnostic assistant. Your job is to help diagnose, repair, and identify parts for a Vietnamese-market/general-market LHD BG5P Legacy GL with EJ20E SOHC naturally aspirated engine, 5-speed manual transmission, full-time AWD, and SSM1/no-OBD-II diagnostics.",
        "",
        "Use the uploaded knowledge files as the primary source. Prefer the EJ20E no-OBD manuals for engine diagnosis. Use BG chassis manuals for chassis, wiring, brakes, steering, suspension, HVAC, body electrical, transmission, and AWD. Do not assume USDM EJ22 or OBD-II procedures apply unless a source explicitly supports the claim.",
        "",
        "When answering diagnostic questions:",
        "",
        "1. Start with the symptom, system, and available evidence.",
        "2. Ask for missing high-value observations only when needed: MIL behavior, two-digit flash codes, connector color/location, battery voltage, engine starts/no-start, recent repairs, and whether SSM1 data is available.",
        "3. Give a prioritized diagnostic path with checks that can be performed safely using basic tools before specialized tools.",
        "4. Cite the knowledge file name and manual section/page label when available.",
        "5. Separate proven source facts from inference.",
        "6. For wiring or exploded-diagram work, request the diagram code, connector ID, or part number if the prompt lacks enough context.",
        "7. Be explicit when a procedure is for EJ20E no-OBD engine systems versus BG chassis shared systems.",
        "8. Do not invent torque specs, part numbers, pinouts, or DTC definitions. Say when the uploaded sources do not contain the exact answer.",
        "9. When useful, use the web deeplink sitemap embedded in `00_BG5P_Diagnostic_Expert_Source_Map.md` to give users direct links to original PDFs, exploded-diagram pages, raw diagram images, and LLM text endpoints. Do not claim a live link was opened unless browsing or another tool actually opened it.",
        "10. For part interchange or purchase advice, use the integrated consumables/interchange research in `08_BG5P_Maintenance_Parts_LLM_Corpus.md` and the confidence/interchange columns in `09_BG5P_Parts_Diagram_Index.csv`. Never promote a part to 95%+ confidence unless the evidence resolves OEM number or documented supersession plus all option splits.",
        "11. In the recommended 20-file build, also use the first-class interchange files and `16_BG5P_Common_Issues_Internet_Research.md` when the question is about common BG/BG5 failures, sourcing used parts, or likely fixes observed outside the factory manuals.",
        "",
        "For no-OBD engine fault codes, use Subaru two-digit DTCs and MIL/CEL flash-code logic. Long flashes are tens, short flashes are ones, and OK code uses the middle-length flash.",
        "",
    ]
    write_text(PACK / "GPT_INSTRUCTIONS.md", "\n".join(lines))


def make_upload_20_set() -> None:
    shutil.rmtree(UPLOAD20, ignore_errors=True)
    UPLOAD20.mkdir(parents=True, exist_ok=True)

    for source in sorted(UPLOAD.iterdir(), key=natural_key):
        if source.is_file():
            shutil.copy2(source, UPLOAD20 / source.name)

    for relative_source, upload_name, _purpose in EXPANDED_UPLOAD_EXTRAS:
        source = ROOT / relative_source
        if not source.exists():
            source = PACK / relative_source
        if source.exists():
            shutil.copy2(source, UPLOAD20 / upload_name)


def main() -> None:
    shutil.rmtree(PACK, ignore_errors=True)
    UPLOAD.mkdir(parents=True, exist_ok=True)
    UPLOAD20.mkdir(parents=True, exist_ok=True)
    OPTIONAL.mkdir(parents=True, exist_ok=True)
    temp_dir = PACK / "_build_tmp"

    groups: dict[str, list[Path]] = {}

    diagnostics_pdf = ROOT / "manuals/EJ20E-SOHC-engine/EJ20_SOHC_Diagnostics_no_OBD.pdf"
    diagnostics_out = UPLOAD / "01_BG5P_EJ20E_No_OBD_Diagnostics_Searchable.pdf"
    copy_pdf(diagnostics_pdf, diagnostics_out)
    groups[diagnostics_out.name] = [diagnostics_pdf]

    for output_name, rel_sources in PDF_GROUPS.items():
        inputs = [ROOT / rel for rel in rel_sources]
        output = UPLOAD / output_name
        merge_pdf(inputs, output, temp_dir)
        groups[output.name] = inputs

    wiring_sources = pdfs_under(
        "manuals/BG-chassis/WIRING DIAGRAM SECTION",
        "manuals/BG-chassis/ELECTRICAL SECTION",
    )
    wiring_out = UPLOAD / "04_BG5P_BG_Chassis_Wiring_Electrical_Searchable.pdf"
    merge_pdf(wiring_sources, wiring_out, temp_dir)
    groups[wiring_out.name] = wiring_sources

    drivetrain_sources = pdfs_under(
        "manuals/BG-chassis/TRANSMISSION",
        "manuals/BG-chassis/ENGINE - UNIVERSAL/CLUTCH",
    )
    drivetrain_out = UPLOAD / "05_BG5P_BG_Chassis_Drivetrain_Clutch_AWD_Searchable.pdf"
    merge_pdf(drivetrain_sources, drivetrain_out, temp_dir)
    groups[drivetrain_out.name] = drivetrain_sources

    chassis_sources = pdfs_under(
        "manuals/BG-chassis/MECHANICAL COMPONENTS SECTION/AIR CONDITIONING SYSTEM",
        "manuals/BG-chassis/MECHANICAL COMPONENTS SECTION/BRAKES",
        "manuals/BG-chassis/MECHANICAL COMPONENTS SECTION/HEATER AND VENTILATOR",
        "manuals/BG-chassis/MECHANICAL COMPONENTS SECTION/PEDAL SYSTEM AND CONTROL CABLES",
        "manuals/BG-chassis/MECHANICAL COMPONENTS SECTION/STEERING SYSTEM",
        "manuals/BG-chassis/MECHANICAL COMPONENTS SECTION/SUSPENSION",
        "manuals/BG-chassis/MECHANICAL COMPONENTS SECTION/WHEELS AND AXLES",
    )
    chassis_out = UPLOAD / "06_BG5P_BG_Chassis_Suspension_Brakes_Steering_HVAC_Searchable.pdf"
    merge_pdf(chassis_sources, chassis_out, temp_dir)
    groups[chassis_out.name] = chassis_sources

    body_sources = pdfs_under("manuals/BG-chassis/BODY SECTION")
    body_out = OPTIONAL / "10_BG5P_BG_Chassis_Body_Interior_SRS_Searchable.pdf"
    merge_pdf(body_sources, body_out, temp_dir)

    make_quick_reference()
    make_llm_corpus()
    make_parts_csv()

    generated = sorted(UPLOAD.iterdir(), key=natural_key)
    make_source_map(generated, groups)
    write_deeplink_sitemap()
    generated = sorted(UPLOAD.iterdir(), key=natural_key)

    make_gpt_instructions()
    make_readme()
    write_deeplink_sitemap()
    make_upload_20_set()
    shutil.rmtree(temp_dir, ignore_errors=True)

    failed_text = [path.name for path in generated if path.suffix.lower() == ".pdf" and text_probe(path) < 100]
    if failed_text:
        raise SystemExit(f"PDF text verification failed for: {', '.join(failed_text)}")

    print(f"Built {len(generated)} strict upload files in {UPLOAD}")
    for path in generated:
        print(f"{path.name}\t{file_size_mb(path)}")
    expanded = sorted(UPLOAD20.iterdir(), key=natural_key)
    print(f"Built {len(expanded)} recommended upload files in {UPLOAD20}")
    for path in expanded:
        print(f"{path.name}\t{file_size_mb(path)}")
    print(f"Optional extra: {body_out.relative_to(ROOT)} ({file_size_mb(body_out)})")


if __name__ == "__main__":
    main()
