#!/usr/bin/env python3
"""Generate llms.txt and detail files from the site's JSON data."""

import json
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "data")
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "llms")

def load(name):
    with open(os.path.join(DATA_DIR, name)) as f:
        return json.load(f)

def diagram_key(code):
    """032_01 -> 032"""
    return code.split("_")[0]

def main():
    sections = load("sections.json")
    parts = load("parts.json")
    maintenance = load("maintenance.json")

    os.makedirs(OUT_DIR, exist_ok=True)

    # Build maintenance lookup: diagram_key -> [maintenance guide]
    maint_by_diagram = {}
    for m in maintenance:
        for dc in m.get("relatedDiagrams", []):
            key = diagram_key(dc)
            maint_by_diagram.setdefault(key, []).append(m)

    # Build section slug -> maintenance guides mapping
    maint_by_section = {}
    for s in sections:
        seen_ids = set()
        for d in s["diagrams"]:
            key = diagram_key(d["code"])
            for m in maint_by_diagram.get(key, []):
                if m["id"] not in seen_ids:
                    seen_ids.add(m["id"])
                    maint_by_section.setdefault(s["slug"], []).append(m)

    # Section descriptions for the index
    section_descriptions = {
        "engine-main": "Block, head, pistons, crankshaft, timing belt, oil pan, valvetrain, gaskets",
        "engine-auxiliaries": "Intake, exhaust, fuel injection, air filter, pulleys, belts",
        "engine-electrical": "Spark plugs, alternator, starter motor, sensors, ignition coil",
        "manual-transmission": "Gearbox internals, shift linkage, synchros, clutch assembly",
        "differential-propeller": "Front/rear differentials, propeller shaft, viscous coupling",
        "suspension-axle-brake": "Shocks, springs, control arms, hubs, calipers, rotors, brake lines",
        "steering": "Rack, column, power steering pump, tie rods, U-joints",
        "engine-mounting-cooling": "Engine mounts, radiator, water pump, thermostat, hoses, fan",
        "body-key-bumper": "Body panels, bumpers, fenders, hood, trunk, locks, mirrors, glass",
        "door-parts": "Door shells, glass, window regulators, handles, weatherstrips",
        "seat-instrument-panel": "Seats, seatbelts, dashboard, gauges, glovebox, console",
        "heater-ac": "Heater core, blower motor, A/C compressor, evaporator, controls",
        "body-electrical-1": "Main harness, fuse box, relays, switches, ground points",
        "body-electrical-2": "Headlights, tail lights, wipers, horn, power windows, door locks",
        "outer-accessories": "Roof rails, mud flaps, emblems, antenna, spoiler, tow hook",
        "inner-accessories": "Floor mats, cargo area, jack, tool kit, spare tire, cup holder",
    }

    # --- Generate section files ---
    for s in sections:
        lines = []
        lines.append(f"# {s['name']}")
        lines.append(f"{s['diagramCount']} exploded diagrams | BG5P Legacy GL EJ20E SOHC NA")
        lines.append("")

        # Maintenance guides for this section
        guides = maint_by_section.get(s["slug"], [])
        if guides:
            lines.append("## Maintenance Procedures")
            lines.append("")
            for m in guides:
                lines.append(f"### {m['title']}")
                lines.append(f"Difficulty: {m['difficulty']} | Interval: {m['interval']}")
                lines.append("")
                lines.append("Specs:")
                for spec in m["specs"]:
                    lines.append(f"  {spec['label']}: {spec['value']}")
                lines.append("")
                lines.append("Steps:")
                for i, step in enumerate(m["steps"], 1):
                    lines.append(f"  {i}. {step}")
                lines.append("")
                if m.get("relatedPdfs"):
                    lines.append("Service manuals:")
                    for pdf in m["relatedPdfs"]:
                        lines.append(f"  {pdf}")
                    lines.append("")

        # Parts by diagram
        lines.append("## Parts by Diagram")
        lines.append("")
        for d in s["diagrams"]:
            key = diagram_key(d["code"])
            diagram_parts = parts.get(key, [])
            lines.append(f"### {d['code']}: {d['name']}")
            if not diagram_parts:
                lines.append("(no parts data)")
            else:
                for p in diagram_parts:
                    qty = f" x{p['quantity']}" if p.get("quantity") else ""
                    period = f" | {p['production_period']}" if p.get("production_period") else ""
                    notes = f" | {p['notes']}" if p.get("notes") else ""
                    lines.append(f"{p['oem_number']} | {p['group_name']}{qty}{period}{notes}")
            lines.append("")

        path = os.path.join(OUT_DIR, f"{s['slug']}.txt")
        with open(path, "w") as f:
            f.write("\n".join(lines))
        print(f"  {s['slug']}.txt ({len(lines)} lines)")

    # --- Generate maintenance files ---
    maint_dir = os.path.join(OUT_DIR, "maintenance")
    os.makedirs(maint_dir, exist_ok=True)

    for m in maintenance:
        lines = []
        lines.append(f"# {m['title']}")
        lines.append(f"Difficulty: {m['difficulty']} | Interval: {m['interval']}")
        lines.append("")

        lines.append("## Specs")
        for spec in m["specs"]:
            lines.append(f"  {spec['label']}: {spec['value']}")
        lines.append("")

        lines.append("## Steps")
        for i, step in enumerate(m["steps"], 1):
            lines.append(f"  {i}. {step}")
        lines.append("")

        # Inline the related parts
        lines.append("## Parts")
        for dc in m.get("relatedDiagrams", []):
            key = diagram_key(dc)
            # Find diagram name from sections
            diagram_name = dc
            for s in sections:
                for d in s["diagrams"]:
                    if d["code"] == dc:
                        diagram_name = f"{dc}: {d['name']}"
                        break
            diagram_parts = parts.get(key, [])
            lines.append(f"### {diagram_name}")
            for p in diagram_parts:
                qty = f" x{p['quantity']}" if p.get("quantity") else ""
                lines.append(f"{p['oem_number']} | {p['group_name']}{qty}")
            lines.append("")

        if m.get("relatedPdfs"):
            lines.append("## Service Manuals")
            for pdf in m["relatedPdfs"]:
                lines.append(f"  {pdf}")
            lines.append("")

        # Link to full section
        for s in sections:
            for d in s["diagrams"]:
                if d["code"] in m.get("relatedDiagrams", []):
                    lines.append(f"## Full Section")
                    lines.append(f"/llms/{s['slug']}.txt")
                    lines.append("")
                    break
            else:
                continue
            break

        path = os.path.join(maint_dir, f"{m['id']}.txt")
        with open(path, "w") as f:
            f.write("\n".join(lines))
        print(f"  maintenance/{m['id']}.txt ({len(lines)} lines)")

    # --- Generate parts index ---
    lines = []
    lines.append("# Part Number Index — BG5P Legacy GL")
    lines.append("All OEM part numbers. Search by number or name.")
    lines.append("")
    lines.append("OEM_NUMBER | PART_NAME | SECTION | DIAGRAM_CODE")

    # Build section lookup for each diagram key
    diagram_to_section = {}
    for s in sections:
        for d in s["diagrams"]:
            diagram_to_section[diagram_key(d["code"])] = (s["name"], d["code"], d["name"])

    index_rows = []
    seen = set()
    for cat_key, cat_parts in parts.items():
        section_info = diagram_to_section.get(cat_key, ("Unknown", cat_key, ""))
        for p in cat_parts:
            dedup = (p["oem_number"], section_info[0])
            if dedup in seen:
                continue
            seen.add(dedup)
            index_rows.append(
                f"{p['oem_number']} | {p['group_name']} | {section_info[0]} | {cat_key}"
            )

    index_rows.sort()
    lines.extend(index_rows)

    path = os.path.join(OUT_DIR, "parts-index.txt")
    with open(path, "w") as f:
        f.write("\n".join(lines))
    print(f"  parts-index.txt ({len(lines)} lines)")

    # --- Generate llms.txt (the router/index) ---
    lines = []
    lines.append("# BG5P Legacy GL — Service Reference")
    lines.append("")
    lines.append("> Parts diagrams, maintenance guides, and factory service manuals for the 1994-1998 Subaru BG5P Legacy Touring Wagon GL. Vietnamese market, left-hand drive, EJ20E 2.0L SOHC NA, 5MT AWD.")
    lines.append("")
    lines.append("## Vehicle")
    lines.append("- Model: BG5P | Engine: EJ20E 2.0L Flat-4 SOHC NA | 120 HP / 184 Nm")
    lines.append("- Transmission: 5-speed manual | Drivetrain: Full-time AWD")
    lines.append("- Market: Vietnam (General Market LHD export, built in Gunma, Japan)")
    lines.append("- Diagnostics: SSM1 protocol only — NO OBD-II port")
    lines.append("- Years: 1994-1998 | Steering: Left-hand drive")
    lines.append("")
    lines.append("## How to Search")
    lines.append("")
    lines.append("This reference is split into small files. Fetch only what you need.")
    lines.append("")
    lines.append("| Question type | What to fetch |")
    lines.append("|---|---|")
    lines.append("| Task or procedure (\"how do I change the oil?\") | `/llms/maintenance/{id}.txt` — has steps, specs, AND part numbers |")
    lines.append("| System or category (\"what steering parts exist?\") | `/llms/{section-slug}.txt` — all diagrams and parts for that system |")
    lines.append("| Specific part number (\"what is 30210AA370?\") | `/llms/parts-index.txt` — every OEM number with name and section |")
    lines.append("| General overview | You're reading it |")
    lines.append("")
    lines.append("## Maintenance Procedures")
    lines.append("")
    lines.append("Fetch: `/llms/maintenance/{id}.txt`")
    lines.append("Each file includes the full procedure, all specs/torque values, AND the related OEM part numbers.")
    lines.append("")
    for m in maintenance:
        specs_summary = ", ".join(f"{s['label']}: {s['value']}" for s in m["specs"][:3])
        lines.append(f"- [{m['title']}](/llms/maintenance/{m['id']}.txt): {m['difficulty']} | {m['interval']} | {specs_summary}")
    lines.append("")
    lines.append("## Parts Catalog Sections")
    lines.append("")
    lines.append("Fetch: `/llms/{section-slug}.txt`")
    lines.append("Each file lists every diagram and every OEM part number in that system, plus any related maintenance procedures.")
    lines.append("")
    for s in sections:
        desc = section_descriptions.get(s["slug"], "")
        guide_ids = [m["id"] for m in maint_by_section.get(s["slug"], [])]
        guide_note = f" | Maintenance: {', '.join(guide_ids)}" if guide_ids else ""
        lines.append(f"- [{s['name']}](/llms/{s['slug']}.txt): {s['diagramCount']} diagrams — {desc}{guide_note}")
    lines.append("")
    lines.append("## Part Number Lookup")
    lines.append("")
    lines.append(f"- [Part Number Index](/llms/parts-index.txt): {len(index_rows)} parts, sorted by OEM number")
    lines.append("")
    lines.append("## Service Manuals (PDF, not machine-readable)")
    lines.append("")
    lines.append("363 factory PDFs. Referenced by URL in maintenance and section files above.")
    lines.append("- EJ20E engine manuals: `/manuals/EJ20E-SOHC-engine/{filename}.pdf`")
    lines.append("- BG chassis manuals: `/manuals/BG-chassis/{section}/{subsection}/{filename}.pdf`")
    lines.append("")
    lines.append("## Compatibility Notes")
    lines.append("")
    lines.append("- USDM Legacy used EJ22 (2.2L), NOT EJ20E — engine-specific parts and procedures differ")
    lines.append("- No OBD-II port — diagnostics require SSM1 scan tool or manual CEL code reading")
    lines.append("- BG chassis parts (body, suspension, brakes, steering) are shared across all BG5 variants")
    lines.append("- Engine parts are EJ20E-specific — always verify part numbers against this catalog")
    lines.append("- \"BG5P\" model code: BG=Legacy Wagon 2nd gen, 5=EJ20 series, P=General Market export")

    path = os.path.join(OUT_DIR, "..", "llms.txt")
    with open(path, "w") as f:
        f.write("\n".join(lines))
    print(f"  llms.txt ({len(lines)} lines)")

    print("\nDone.")

if __name__ == "__main__":
    main()
