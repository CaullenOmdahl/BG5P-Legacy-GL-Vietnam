#!/usr/bin/env python3
"""Generate qualified UI/AI exports from the canonical sourcing snapshot."""

import json
import os
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
OUT = PUBLIC / "llms"
OUT.mkdir(exist_ok=True)
BASE = os.environ.get("BG5_SITE_BASE_URL", "https://bg5.caphedigital.com").rstrip("/")


def url(p):
    return BASE + quote("/" + p.lstrip("/"), safe="/")


def main():
    data = json.loads((PUBLIC / "data/sourcing.json").read_text())
    statuses = json.loads((PUBLIC / "data/parts-status.json").read_text())
    header = f"Schema {data['schema_version']} | Record version {data['content_version']} | Checked {data['checked_date']}\n{data['compatibility']}\nCatalog rows are unreviewed. Candidate relationships are not verified supersessions. Unknown build date yields conditional fitment.\n"

    def save(name, lines):
        p = PUBLIC / name
        p.parent.mkdir(exist_ok=True, parents=True)
        p.write_text(header + "\n" + "\n".join(lines) + "\n")

    def record(p):
        return json.dumps(p, ensure_ascii=False)

    def procedure(g):
        return [f"### {g['title']}", json.dumps(g, ensure_ascii=False)]

    for section in data["sections"]:
        rows = [p for p in data["parts"] if p["section"] == section["slug"]]
        lines = [
            f"# {section['name']}",
            f"{len(section['diagrams'])} diagrams; {len(rows)} records",
            "## Parts (source constraints and missing fields retained)",
        ]
        lines += [record(p) for p in rows]
        for d in section["diagrams"]:
            category = d["code"].split("_")[0]
            if category in statuses:
                lines.append(
                    json.dumps(
                        dict(diagram=d["code"], source_status=statuses[category]),
                        ensure_ascii=False,
                    )
                )
        for g in data["procedures"]:
            if any(d["code"] in g["relatedDiagrams"] for d in section["diagrams"]):
                lines += procedure(g)
        lines += [
            "## Claim sources",
            json.dumps(data["evidence"], ensure_ascii=False),
            "## Directed relationships",
            json.dumps(
                [
                    r
                    for r in data["relationships"]
                    if any(p["number"] in [r["from"], r["to"]] for p in rows)
                ],
                ensure_ascii=False,
            ),
        ]
        save("llms/" + section["slug"] + ".txt", lines)
    for g in data["procedures"]:
        lines = procedure(g) + ["## Catalog candidates; not a shopping list"]
        categories = {d.split("_")[0] for d in g["relatedDiagrams"]}
        lines += [record(p) for p in data["parts"] if p["category"] in categories]
        save("llms/maintenance/" + g["id"] + ".txt", lines)
    index_map = {}
    for p in data["parts"]:
        if p["catalog"]:
            index_map.setdefault(
                (p["number"], p["section_name"]),
                f"{p['number']} | {p['name']} | {p['section_name']} | {p['category']}",
            )
    index = sorted(index_map.values())
    save(
        "llms/parts-index.txt",
        [
            "# OEM index; index entries differ from raw row/unique OEM counts",
            "OEM_NUMBER | PART_NAME | SECTION | DIAGRAM_CODE",
            *index,
            "## Full qualified records",
            url("/data/sourcing.json"),
        ],
    )
    paths = ["/", "/about", "/parts", "/maintenance", "/manuals", "/find-part"]
    paths += ["/maintenance/" + g["id"] for g in data["procedures"]]
    for s in data["sections"]:
        paths.append("/parts/" + s["slug"])
        paths += [
            f"/parts/{s['slug']}/{d['code'].replace('_', '-')}" for d in s["diagrams"]
        ]
    paths += ["/find-part/" + p["id"] for p in data["parts"]]
    save(
        "llms/site-index.txt",
        [
            "# Full site index",
            *[url(p) for p in paths],
            *[url(d["imagePath"]) for s in data["sections"] for d in s["diagrams"]],
            *[url(m["path"]) for m in data["manuals"]],
        ],
    )
    save(
        "llms/manuals.txt",
        [
            "# Manual manifest; Universal is a source heading, not universal fitment",
            *[json.dumps(m, ensure_ascii=False) for m in data["manuals"]],
        ],
    )
    lines = [
        "# BG5P Legacy GL — sourcing and service reference",
        "## Vehicle",
        json.dumps(data["vehicle"], ensure_ascii=False),
        "Owner car: 1997 BG5P GL General Market LHD EJ20E 5MT AWD; factory front brakes and rear drums. Full VIN not stored. Source coverage 1994–1998 is separate from model year.",
        "Diagnostics remain SSM1/no OBD-II; exact connector/pin instructions require source validation.",
        "US 2200 standard 260 mm front brakes share the supported standard family. GT/LSi/Outback 277 mm twin-piston fronts require conversion. An engine or market label alone neither proves nor disproves fitment.",
        "## Find a part",
        "/find-part — OEM/alias/SKU/name search; candidate, conflicting, rejected and unreviewed records remain distinguishable.",
        "## Full Site Index",
        "/llms/site-index.txt",
        "## Structured data",
        "/data/sourcing.json",
        "/data/coverage.json",
        "/llms/manuals.txt",
        "## Procedures",
    ]
    lines += [
        f"[{g['title']}](/llms/maintenance/{g['id']}.txt) — {g['review_status']}; {g['interval_basis']}"
        for g in data["procedures"]
    ]
    lines += ["## Sections"] + [
        f"[{s['name']}](/llms/{s['slug']}.txt) — {len(s['diagrams'])} diagrams"
        for s in data["sections"]
    ]
    lines += [
        "## Part index",
        "/llms/parts-index.txt",
        f"{len(index)} index entries; {sum(bool(p['catalog']) for p in data['parts'])} raw rows; {len({p['number'] for p in data['parts'] if p['catalog']})} distinct OEM numbers",
        f"{len(data['manuals'])} PDFs; nine inherited guides are not fully verified procedures",
        "## Evidence",
        json.dumps(data["evidence"], ensure_ascii=False),
        "## Coverage",
        json.dumps(data["coverage"], ensure_ascii=False),
    ]
    save("llms.txt", lines)
    print(
        "Generated all section, procedure, manual and index exports from "
        + data["content_version"]
    )


if __name__ == "__main__":
    main()
