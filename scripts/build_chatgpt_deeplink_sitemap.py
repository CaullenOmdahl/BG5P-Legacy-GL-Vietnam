#!/usr/bin/env python3
"""Build a Custom GPT deeplink sitemap from the BG5P website assets."""

from __future__ import annotations

from collections import Counter
import json
import os
from pathlib import Path
from urllib.parse import quote


ROOT = Path(__file__).resolve().parents[1]
SITE_PUBLIC = ROOT / "site" / "public"
PACK = ROOT / "chatgpt-bg5-diagnostic-expert"
UPLOAD_SOURCE_MAPS = [
    PACK / "upload_10_files" / "00_BG5P_Diagnostic_Expert_Source_Map.md",
    PACK / "upload_20_files" / "00_BG5P_Diagnostic_Expert_Source_Map.md",
]
OPTIONAL_SITEMAP = PACK / "optional_if_20_file_limit" / "11_BG5P_Web_Deeplink_Sitemap.md"
UPLOAD_20_SITEMAP = PACK / "upload_20_files" / "11_BG5P_Web_Deeplink_Sitemap.md"
BASE_URL = os.environ.get("BG5_SITE_BASE_URL", "https://bg5.caphedigital.com").rstrip("/")

START_MARKER = "<!-- BEGIN BG5P WEB DEEPLINK SITEMAP -->"
END_MARKER = "<!-- END BG5P WEB DEEPLINK SITEMAP -->"


SECTION_DESCRIPTIONS = {
    "engine-main": "Block, cylinder head, pistons, crankshaft, timing belt, oil pan, valvetrain, gaskets.",
    "engine-auxiliaries": "Intake, fuel pipe, injectors, throttle chamber, air cleaner, PCV.",
    "engine-electrical": "Spark plugs, high-tension cords, engine harness, starter, alternator, relays, sensors.",
    "manual-transmission": "Gearbox internals, shift linkage, synchros, clutch-related transmission layout.",
    "differential-propeller": "Rear differential, propeller shaft, differential mounting.",
    "suspension-axle-brake": "Suspension, axles, hubs, brakes, rotors, calipers, brake lines.",
    "steering": "Steering rack, column, pump, tie rods, steering joints.",
    "engine-mounting-cooling": "Engine mounts, radiator, water pump, thermostat, cooling fan, hoses.",
    "body-key-bumper": "Body panels, bumpers, fenders, hood, tailgate, locks, mirrors, glass.",
    "door-parts": "Door shells, door glass, regulators, handles, hinges, weatherstrips.",
    "seat-instrument-panel": "Seats, belts, dashboard, gauges, console, interior trim.",
    "heater-ac": "Heater core, blower, compressor, condenser, evaporator, HVAC controls.",
    "body-electrical-1": "Main harness, fuse box, relays, switches, grounds, battery equipment.",
    "body-electrical-2": "Lighting, wipers, horn, power windows, door locks, rear electrical equipment.",
    "outer-accessories": "Roof rails, mud flaps, emblems, spoilers, antenna, exterior accessories.",
    "inner-accessories": "Floor mats, cargo trim, jack/tool kit, spare tire, cup holder, interior accessories.",
}


def load_json(relative_path: str):
    with (ROOT / relative_path).open("r", encoding="utf-8") as fh:
        return json.load(fh)


def encode_path(path: str) -> str:
    return "/".join(quote(part) for part in path.strip("/").split("/"))


def abs_url(path: str) -> str:
    if path.startswith("http://") or path.startswith("https://"):
        return path
    return f"{BASE_URL}/{encode_path(path)}"


def markdown_escape(value: object) -> str:
    text = str(value).replace("\n", " ").strip()
    return text.replace("|", "\\|")


def zip_backed_archive(path: Path) -> bool:
    try:
        with path.open("rb") as fh:
            return fh.read(2) == b"PK"
    except OSError:
        return False


def title_for_pdf(path: Path, titles: dict[str, str]) -> str:
    name = path.name
    title = titles.get(name)
    if title:
        return title
    return name.removesuffix(".pdf").replace("_", " ").replace(" no OBD", " (no OBD)")


def manual_rows() -> list[dict[str, str]]:
    titles = load_json("site/public/data/manual-titles.json")
    manuals_dir = SITE_PUBLIC / "manuals"
    rows: list[dict[str, str]] = []

    for pdf in sorted(manuals_dir.rglob("*.pdf"), key=lambda p: str(p).lower()):
        if zip_backed_archive(pdf):
            continue
        rel = pdf.relative_to(SITE_PUBLIC).as_posix()
        parts = rel.split("/")
        if len(parts) >= 3 and parts[1] == "EJ20E-SOHC-engine":
            system = "EJ20E engine"
            if len(parts) >= 4 and parts[2] == "EJ20_Electrical_System":
                system = "EJ20E engine electrical extracted archive"
        elif len(parts) >= 5 and parts[1] == "BG-chassis":
            system = "BG chassis / " + " / ".join(parts[2:-1])
        else:
            system = "Service manual"

        title = title_for_pdf(pdf, titles)
        rows.append(
            {
                "title": title,
                "system": system,
                "url": abs_url("/" + rel),
                "pdf_id": pdf.stem,
            }
        )

    duplicate_keys = Counter((row["title"], row["system"]) for row in rows)
    for row in rows:
        if duplicate_keys[(row["title"], row["system"])] > 1:
            row["title"] = f"{row['title']} - {row['pdf_id']}"
        del row["pdf_id"]
        row["when_to_share"] = (
            f"Factory PDF for {row['title']}. Use when the user needs the original procedure, "
            "spec table, diagnostic tree, connector/wiring page, or printable reference."
        )

    return rows


def maintenance_rows() -> list[dict[str, str]]:
    cards = load_json("site/public/data/maintenance.json")
    rows: list[dict[str, str]] = []
    for card in sorted(cards, key=lambda item: item["title"].lower()):
        related_pdfs = ", ".join(Path(pdf).name for pdf in card.get("relatedPdfs", []))
        related_diagrams = ", ".join(card.get("relatedDiagrams", []))
        rows.append(
            {
                "title": card["title"],
                "page": abs_url(f"/maintenance/{card['id']}"),
                "text": abs_url(f"/llms/maintenance/{card['id']}.txt"),
                "when_to_share": f"{card.get('difficulty', '')} guide; {card.get('interval', '')}. Includes steps, specs, torque values, and related parts.",
                "related": "; ".join(part for part in [related_diagrams, related_pdfs] if part),
            }
        )
    return rows


def section_rows() -> list[dict[str, str]]:
    sections = load_json("site/public/data/sections.json")
    rows: list[dict[str, str]] = []
    for section in sections:
        slug = section["slug"]
        rows.append(
            {
                "section": section["name"],
                "page": abs_url(f"/parts/{slug}"),
                "text": abs_url(f"/llms/{slug}.txt"),
                "diagram_count": str(section["diagramCount"]),
                "when_to_share": SECTION_DESCRIPTIONS.get(slug, "Parts section with exploded diagrams and part-number lookup."),
            }
        )
    return rows


def diagram_rows() -> list[dict[str, str]]:
    sections = load_json("site/public/data/sections.json")
    rows: list[dict[str, str]] = []
    for section in sections:
        slug = section["slug"]
        for diagram in section["diagrams"]:
            url_code = diagram["code"].replace("_", "-")
            rows.append(
                {
                    "code": diagram["code"],
                    "section": section["name"],
                    "name": diagram["name"],
                    "page": abs_url(f"/parts/{slug}/{url_code}"),
                    "image": abs_url(diagram["imagePath"]),
                    "when_to_share": f"Exploded parts graphic for {diagram['name']}. Share the page for labeled parts table; share the image for a direct graphic.",
                }
            )
    return rows


def llms_rows() -> list[dict[str, str]]:
    rows: list[dict[str, str]] = [
        {
            "name": "LLM Text Index",
            "url": abs_url("/llms.txt"),
            "when_to_share": "Top-level machine-readable index for the BG5P site.",
        }
    ]
    llms_dir = SITE_PUBLIC / "llms"
    for txt in sorted(llms_dir.rglob("*.txt"), key=lambda p: str(p).lower()):
        rel = txt.relative_to(SITE_PUBLIC).as_posix()
        rows.append(
            {
                "name": txt.stem.replace("-", " ").title(),
                "url": abs_url("/" + rel),
                "when_to_share": "Machine-readable text reference for retrieval, part lookup, and procedures.",
            }
        )
    return rows


def write_table(lines: list[str], headers: list[str], rows: list[dict[str, str]]) -> None:
    lines.append("| " + " | ".join(headers) + " |")
    lines.append("|" + "|".join("---" for _ in headers) + "|")
    for row in rows:
        lines.append("| " + " | ".join(markdown_escape(row.get(header, "")) for header in headers) + " |")
    lines.append("")


def build_sitemap() -> str:
    maint = maintenance_rows()
    sections = section_rows()
    diagrams = diagram_rows()
    manuals = manual_rows()
    llms = llms_rows()

    lines = [
        "# BG5P Web Deeplink Sitemap for Custom GPT",
        "",
        "Generated by: scripts/build_chatgpt_deeplink_sitemap.py",
        f"Base URL: {BASE_URL}",
        "",
        "Use this sitemap to hand users direct website, PDF, and graphics links after answering from the uploaded knowledge files.",
        "",
        "## GPT Usage Rules",
        "",
        "1. Use uploaded knowledge files as the source of diagnostic facts.",
        "2. Use this sitemap only to pass users direct links to original PDFs, exploded diagrams, website pages, and machine-readable text endpoints.",
        "3. If browsing is disabled or a link cannot be opened in-session, still provide the URL but do not claim the live page was inspected.",
        "4. For parts graphics, prefer the diagram page URL when the user needs part numbers; use the raw image URL when the user only needs the picture.",
        "5. For manuals, prefer the direct PDF URL when the user asks for a source document, printable procedure, wiring diagram, or diagnostic tree.",
        "6. Do not give the old `EJ20_Electrical_System.pdf` URL. It was a ZIP-backed archive; use the extracted member PDF links listed below.",
        "",
        "## Top-Level Pages",
        "",
    ]

    write_table(
        lines,
        ["name", "url", "when_to_share"],
        [
            {
                "name": "Home",
                "url": abs_url("/"),
                "when_to_share": "General BG5P site entry point.",
            },
            {
                "name": "About",
                "url": abs_url("/about"),
                "when_to_share": "Vehicle background, market notes, and site scope.",
            },
            {
                "name": "Service Manuals",
                "url": abs_url("/manuals"),
                "when_to_share": f"Browse/search {len(manuals)} openable factory PDFs.",
            },
            {
                "name": "Manuals API",
                "url": abs_url("/api/manuals"),
                "when_to_share": "Structured manual index for tools or troubleshooting link coverage.",
            },
            {
                "name": "Parts Catalog",
                "url": abs_url("/parts"),
                "when_to_share": f"Browse {len(diagrams)} exploded parts diagrams.",
            },
            {
                "name": "Maintenance Guides",
                "url": abs_url("/maintenance"),
                "when_to_share": "Quick service procedures with specs, steps, related PDFs, and diagrams.",
            },
            {
                "name": "LLM Text Index",
                "url": abs_url("/llms.txt"),
                "when_to_share": "Machine-readable router for maintenance, parts, and manual references.",
            },
        ],
    )

    lines.extend(["## Maintenance Guide Deeplinks", ""])
    write_table(lines, ["title", "page", "text", "when_to_share", "related"], maint)

    lines.extend(["## Parts Section Deeplinks", ""])
    write_table(lines, ["section", "page", "text", "diagram_count", "when_to_share"], sections)

    lines.extend(["## Exploded Diagram Graphics Deeplinks", ""])
    write_table(lines, ["code", "section", "name", "page", "image", "when_to_share"], diagrams)

    lines.extend(["## Service Manual PDF Deeplinks", ""])
    write_table(lines, ["title", "system", "url", "when_to_share"], manuals)

    lines.extend(["## Machine-Readable Text Deeplinks", ""])
    write_table(lines, ["name", "url", "when_to_share"], llms)

    lines.extend(
        [
            "## Link Patterns",
            "",
            "- Manual PDF: `https://bg5.caphedigital.com/manuals/.../{filename}.pdf`",
            "- Extracted EJ20 electrical PDF: `https://bg5.caphedigital.com/manuals/EJ20E-SOHC-engine/EJ20_Electrical_System/{filename}.pdf`",
            "- Diagram page: `https://bg5.caphedigital.com/parts/{section-slug}/{diagram-code-with-dashes}`",
            "- Raw diagram image: `https://bg5.caphedigital.com/diagrams/{section_folder}/{filename}.gif`",
            "- Maintenance page: `https://bg5.caphedigital.com/maintenance/{guide-id}`",
            "- LLM text: `https://bg5.caphedigital.com/llms/{section-slug}.txt` or `/llms/maintenance/{guide-id}.txt`",
            "",
        ]
    )

    return "\n".join(lines).rstrip() + "\n"


def stable_source_map_metadata(source_map: str) -> str:
    return "\n".join(
        "Generated by: scripts/build_chatgpt_bg5_pack.py" if line.startswith("Generated: ") else line
        for line in source_map.splitlines()
    )


def embed_sitemap(source_map_path: Path, sitemap: str) -> bool:
    if not source_map_path.exists():
        return False

    source_map = stable_source_map_metadata(source_map_path.read_text(encoding="utf-8"))
    block = f"\n\n{START_MARKER}\n{sitemap.rstrip()}\n{END_MARKER}\n"
    if START_MARKER in source_map and END_MARKER in source_map:
        before = source_map.split(START_MARKER, 1)[0].rstrip()
        after = source_map.split(END_MARKER, 1)[1].lstrip()
        updated = f"{before}{block}"
        if after:
            updated += "\n" + after
    else:
        updated = source_map.rstrip() + block

    source_map_path.write_text(updated.rstrip() + "\n", encoding="utf-8")
    return True


def write_deeplink_sitemap() -> list[Path]:
    sitemap = build_sitemap()
    OPTIONAL_SITEMAP.parent.mkdir(parents=True, exist_ok=True)
    OPTIONAL_SITEMAP.write_text(sitemap, encoding="utf-8")
    UPLOAD_20_SITEMAP.parent.mkdir(parents=True, exist_ok=True)
    UPLOAD_20_SITEMAP.write_text(sitemap, encoding="utf-8")

    embedded = []
    for source_map in UPLOAD_SOURCE_MAPS:
        if embed_sitemap(source_map, sitemap):
            embedded.append(source_map)
    return embedded


def main() -> None:
    embedded = write_deeplink_sitemap()
    print(f"Wrote {OPTIONAL_SITEMAP.relative_to(ROOT)}")
    print(f"Wrote {UPLOAD_20_SITEMAP.relative_to(ROOT)}")
    for source_map in embedded:
        print(f"Embedded sitemap in {source_map.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
