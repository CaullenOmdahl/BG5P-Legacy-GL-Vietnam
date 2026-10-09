"""Deterministic, lossless catalog migration; curated claims never overwrite source rows."""

import csv
import hashlib
import json
import sys
from collections import Counter
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[2]
SITE = ROOT / "site"
DATA = SITE / "public/data"
sys.path.insert(0, str(ROOT / "scripts"))
from parts_category_metadata import diagram_index


def read(p):
    return json.loads(p.read_text())


def write(p, value):
    p.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n")


def normal(value):
    return "".join(c for c in value.upper() if c.isalnum())


def technical_terms(name):
    terms = {
        "AIR CLEANER": "air filter lọc gió",
        "SPARK PLUG": "spark plug bugi",
        "IGNITION": "ignition đánh lửa",
        "COIL": "coil cuộn đánh lửa",
        "OIL FILTER": "oil filter lọc dầu",
        "STEERING": "steering lái",
        "FENDER": "fender chắn bùn",
        "CLUTCH": "clutch ly hợp",
        "BRAKE": "brake phanh",
        "DIFFERENTIAL": "differential vi sai",
        "TIMING": "timing cam",
        "WIPER": "wiper gạt mưa",
        "RADIATOR": "radiator két nước",
    }
    return " / ".join(value for key, value in terms.items() if key in name.upper())


def build():
    curated = read(SITE / "sourcing/claims.json")
    sections = read(DATA / "sections.json")
    meta = diagram_index(sections)
    section_by_name = {s["name"]: s["slug"] for s in sections}
    parts = []
    collisions = Counter()
    for category, rows in read(DATA / "parts.json").items():
        name, diagram = meta[category]
        for row in rows:
            digest = hashlib.sha256(
                json.dumps([category, row], sort_keys=True).encode()
            ).hexdigest()[:16]
            collisions[digest] += 1
            pid = f"catalog-{digest}-{collisions[digest]}"
            checks = [
                "Match installed component, exact applied-model and production date; catalog inclusion does not confirm fitment."
            ]
            parts.append(
                dict(
                    id=pid,
                    number=row["oem_number"],
                    normalized_number=normal(row["oem_number"]),
                    aliases=[],
                    name=row.get("group_name", ""),
                    name_vi=technical_terms(row.get("group_name", "")),
                    category=category,
                    section=section_by_name.get(name, ""),
                    section_name=name,
                    position="unknown",
                    catalog=row,
                    provenance=dict(
                        kind="local_epc_extract",
                        path="public/data/parts.json",
                        category=category,
                        review_status="unreviewed",
                        original_source_variant="Mixed imported EPC variants; exact source not retained per row",
                    ),
                    constraints=dict(
                        production_period=row.get("production_period", ""),
                        applies_for_models=row.get("applies_for_models", ""),
                        notes=row.get("notes", ""),
                    ),
                    quantity=dict(
                        catalog_value=row.get("quantity", ""),
                        per_car=None,
                        order_unit="unknown",
                        units_per_pack=None,
                    ),
                    dimensions=[],
                    interfaces=[],
                    diagram_callout=row.get("group_code", ""),
                    fitment=dict(
                        target="owner-bg5p-1997",
                        status="unreviewed",
                        evidence=[],
                        exclusions=[],
                        unresolved=checks,
                    ),
                    relationships=[],
                    shared_applications=[],
                    offers=[],
                )
            )
    parts += curated["parts"]
    procedures = read(SITE / "sourcing/procedures.json")
    manuals = []
    titles = read(DATA / "manual-titles.json")
    for pdf in sorted((SITE / "public/manuals").rglob("*.pdf")):
        if b"%PDF" not in pdf.read_bytes()[:1024]:
            continue
        engine = "EJ20E-SOHC-engine" in pdf.parts
        manuals.append(
            dict(
                id=pdf.stem,
                path="/" + pdf.relative_to(SITE / "public").as_posix(),
                title=titles.get(pdf.name, pdf.stem.replace("_", " ")),
                publisher="Subaru",
                publication=pdf.stem,
                revision=None,
                year="unknown" if engine else "1997",
                market="EJ20 SOHC non-OBD source; exact publication market unverified"
                if engine
                else "USDM",
                applicability="EJ20 SOHC: check revision, catalyst and equipment per page"
                if engine
                else "USDM Legacy: check engine, transmission, LHD, ABS and brake family per page; Universal is a source heading",
                reviewed_pages=([3, 5, 7] if pdf.stem == "MSA5TCD97L3677" else []),
                review_status="selected_pages_reviewed"
                if pdf.stem == "MSA5TCD97L3677"
                else "unreviewed",
                description=pdf.parent.name,
                rights="Existing repository asset; reuse rights not independently established. No additional redistribution.",
            )
        )
    coverage = []
    for section in sections:
        rows = [p for p in parts if p["section"] == section["slug"]]
        coverage.append(
            dict(
                section=section["slug"],
                diagrams=len(section["diagrams"]),
                catalog_rows=sum(bool(p["catalog"]) for p in rows),
                reviewed_claims=sum(
                    p["fitment"]["status"] != "unreviewed" for p in rows
                ),
                confirmed_fits=sum(p["fitment"]["status"] == "confirmed" for p in rows),
                review_trigger="New OEM evidence, changed installed equipment, contradictory dimensions or dated offer",
                editor="Repository maintainers; no owner reassignment",
            )
        )
    data = dict(
        schema_version=1,
        checked_date=curated["checked_date"],
        vehicle=curated["vehicle"],
        compatibility=curated["compatibility"],
        sections=sections,
        parts=parts,
        relationships=curated["relationships"],
        evidence=curated["evidence"],
        procedures=procedures,
        manuals=manuals,
        coverage=coverage,
    )
    data["content_version"] = hashlib.sha256(
        json.dumps(data, sort_keys=True).encode()
    ).hexdigest()[:16]
    assert len({p["id"] for p in parts}) == len(parts), "Duplicate record ID"
    evidence_ids = {e["id"] for e in data["evidence"]}
    statuses = {"confirmed", "candidate", "conflicting", "rejected", "unreviewed"}
    relation_types = {
        "oem_supersession",
        "oem_interchange",
        "aftermarket_cross_reference",
        "shared_application",
        "modification_required",
    }
    for p in parts:
        assert p["fitment"]["status"] in statuses
        assert set(p["fitment"]["evidence"]) <= evidence_ids
        assert all(d["unit"] and d["source"] in evidence_ids for d in p["dimensions"])
        if p["fitment"]["status"] == "confirmed":
            assert p["fitment"]["evidence"] and not p["fitment"]["unresolved"]
            assert all(
                e["checked_date"] and e["source_type"] != "research_lead"
                for e in data["evidence"]
                if e["id"] in p["fitment"]["evidence"]
            )
    for r in data["relationships"]:
        assert r["type"] in relation_types and r["status"] in statuses
        assert r["from"] != r["to"] and set(r["evidence"]) <= evidence_ids
        if r["status"] == "confirmed":
            assert r["checked_date"] and r["evidence"] and not r["unresolved"]
    write(DATA / "sourcing.json", data)
    write(DATA / "maintenance.json", procedures)
    search_parts = []
    for p in parts:
        search_parts.append(
            {
                k: p[k]
                for k in [
                    "id",
                    "number",
                    "normalized_number",
                    "name",
                    "name_vi",
                    "aliases",
                    "fitment",
                ]
            }
        )
        search_parts[-1]["related_numbers"] = [
            r["to"] if r["from"] == p["number"] else r["from"]
            for r in data["relationships"]
            if p["number"] in [r["from"], r["to"]]
        ]
    write(
        DATA / "sourcing-search.json",
        dict(content_version=data["content_version"], parts=search_parts),
    )
    write(
        SITE / "public/data/coverage.json",
        dict(
            content_version=data["content_version"],
            sections=coverage,
            raw_rows=sum(bool(p["catalog"]) for p in parts),
            unique_oem=len({p["number"] for p in parts if p["catalog"]}),
            indexed_entries=len(
                {(p["number"], p["section_name"]) for p in parts if p["catalog"]}
            ),
            manuals=len(manuals),
        ),
    )
    with (ROOT / "docs/bg5p-sourcing-records.csv").open("w", newline="") as f:
        fields = [
            "id",
            "number",
            "section",
            "position",
            "fitment_status",
            "content_version",
            "catalog",
            "quantity",
            "dimensions",
            "constraints",
            "evidence",
            "unresolved",
        ]
        writer = csv.DictWriter(f, fieldnames=fields, lineterminator="\n")
        writer.writeheader()
        for p in parts:
            writer.writerow(
                {
                    **{k: p[k] for k in ["id", "number", "section", "position"]},
                    "fitment_status": p["fitment"]["status"],
                    "content_version": data["content_version"],
                    **{
                        k: json.dumps(p[k], ensure_ascii=False)
                        for k in ["catalog", "quantity", "dimensions", "constraints"]
                    },
                    "evidence": json.dumps(p["fitment"]["evidence"]),
                    "unresolved": json.dumps(p["fitment"]["unresolved"]),
                }
            )
    print(
        f"Sourcing {data['content_version']}: {len(parts)} records, {len(manuals)} PDFs, {len(procedures)} guides"
    )


if __name__ == "__main__":
    build()
