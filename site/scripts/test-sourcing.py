"""Acceptance checks for the migrated, qualified sourcing data."""

import json
import csv
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class SourcingContract(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads((ROOT / "public/data/sourcing.json").read_text())

    def test_lossless_catalog_and_unique_identity(self):
        raw = json.loads((ROOT / "public/data/parts.json").read_text())
        records = [p for p in self.data["parts"] if p["catalog"]]
        self.assertEqual(len(records), sum(map(len, raw.values())))
        self.assertEqual(
            len({p["id"] for p in self.data["parts"]}), len(self.data["parts"])
        )
        for category, rows in raw.items():
            self.assertCountEqual(
                rows, [p["catalog"] for p in records if p["category"] == category]
            )
        self.assertTrue(all(p["fitment"]["status"] == "unreviewed" for p in records))

    def test_authored_source_freshness(self):
        curated = json.loads((ROOT / "sourcing/claims.json").read_text())
        for field in ["vehicle", "compatibility", "evidence", "relationships"]:
            self.assertEqual(self.data[field], curated[field])
        self.assertCountEqual(
            [
                {k: v for k, v in p.items() if k != "search_terms"}
                for p in self.data["parts"]
                if not p["catalog"]
            ],
            curated["parts"],
        )
        self.assertEqual(
            self.data["procedures"],
            json.loads((ROOT / "sourcing/procedures.json").read_text()),
        )
        manifest = json.loads((ROOT / "chatbot-knowledge/manifest.json").read_text())
        self.assertEqual(manifest["content_version"], self.data["content_version"])
        for record in manifest["documents"]:
            self.assertEqual(
                record["bytes"],
                (ROOT / "chatbot-knowledge" / record["target"]).stat().st_size,
            )

    def test_pilot_variant_constraints(self):
        parts = {p["number"]: p for p in self.data["parts"] if not p["catalog"]}
        self.assertEqual(parts["09.5673.11"]["dimensions"][0]["value"], 260)
        self.assertEqual(parts["P 78 009"]["constraints"]["build_from"], "1996-05")
        self.assertEqual(parts["P 78 004"]["constraints"]["build_to"], "1996-04")
        self.assertEqual(parts["US-277-FRONT"]["fitment"]["status"], "rejected")
        self.assertEqual(parts["P 78 005"]["fitment"]["status"], "rejected")
        self.assertEqual(
            parts["14.A686.10"]["offers"][0]["availability"], "discontinued"
        )
        self.assertIn("brembo-bg5", parts["09.5673.11"]["fitment"]["evidence"])
        self.assertIn("us2200", parts["09.5673.11"]["shared_applications"][0])
        self.assertEqual(self.data["vehicle"]["facts"]["build_date"]["value"], None)

    def test_relations_do_not_invent_verification(self):
        rel = next(r for r in self.data["relationships"] if r["from"] == "26310AC060")
        self.assertEqual(rel["to"], "26310AC06A")
        self.assertEqual(rel["type"], "oem_supersession")
        self.assertEqual(rel["status"], "candidate")
        self.assertTrue(rel["unresolved"])

    def test_manual_and_procedure_coverage(self):
        self.assertEqual(len(self.data["sections"]), 16)
        self.assertEqual(len(self.data["procedures"]), 9)
        self.assertEqual(len(self.data["manuals"]), 373)
        for m in self.data["manuals"]:
            self.assertIn(
                b"%PDF", (ROOT / "public" / m["path"].lstrip("/")).read_bytes()[:1024]
            )
            self.assertTrue(m["applicability"])
        brake = next(g for g in self.data["procedures"] if g["id"] == "brake-pads")
        self.assertNotIn("Rear)", brake["title"])
        self.assertTrue(
            all(not s["label"].startswith("Rear Pad") for s in brake["specs"])
        )
        self.assertEqual(brake["relatedDiagrams"], ["262_02", "262_04"])
        diagrams = {
            d["code"] for section in self.data["sections"] for d in section["diagrams"]
        }
        for g in self.data["procedures"]:
            self.assertTrue(set(g["relatedDiagrams"]) <= diagrams)
            self.assertTrue(g["review_status"])
            self.assertTrue(
                all("status" in s and "conditions" in s for s in g["specs"])
            )

    def test_export_qualification(self):
        for f in [
            ROOT / "public/llms.txt",
            *(ROOT / "public/llms").glob("*.txt"),
            *(ROOT / "public/llms/maintenance").glob("*.txt"),
        ]:
            text = f.read_text()
            self.assertIn(self.data["content_version"], text, str(f))
            self.assertNotIn("shared across all BG5", text)
        for section in self.data["sections"]:
            text = (ROOT / "public/llms" / f"{section['slug']}.txt").read_text()
            self.assertIn("unreviewed", text)
            self.assertIn("applies_for_models", text)
        self.assertEqual(
            json.loads((ROOT / "public/data/maintenance.json").read_text()),
            self.data["procedures"],
        )
        search = json.loads((ROOT / "public/data/sourcing-search.json").read_text())
        self.assertEqual(search["content_version"], self.data["content_version"])
        self.assertEqual(len(search["parts"]), len(self.data["parts"]))
        self.assertEqual(
            {p["id"]: p["fitment"] for p in search["parts"]},
            {p["id"]: p["fitment"] for p in self.data["parts"]},
        )
        csv_path = ROOT.parent / "docs/bg5p-sourcing-records.csv"
        self.assertNotIn(b"\r", csv_path.read_bytes())
        with csv_path.open(newline="") as f:
            csv_rows = list(csv.DictReader(f))
        self.assertEqual(len(csv_rows), len(self.data["parts"]))
        self.assertEqual(
            {r["id"]: r["fitment_status"] for r in csv_rows},
            {p["id"]: p["fitment"]["status"] for p in self.data["parts"]},
        )
        coverage = json.loads((ROOT / "public/data/coverage.json").read_text())
        rows = [
            line
            for line in (ROOT / "public/llms/parts-index.txt").read_text().splitlines()
            if len(line.split(" | ")) == 4 and not line.startswith("OEM_NUMBER")
        ]
        self.assertEqual(len(rows), coverage["indexed_entries"])


if __name__ == "__main__":
    unittest.main()
