"""Refresh text/CSV knowledge exports only; existing PDF packs stay untouched."""

import shutil
import json
from build_chatgpt_bg5_pack import (
    ROOT,
    PACK,
    UPLOAD,
    UPLOAD20,
    make_quick_reference,
    make_llm_corpus,
    make_parts_csv,
)
from build_chatgpt_deeplink_sitemap import write_deeplink_sitemap


def main():
    make_quick_reference()
    make_llm_corpus()
    make_parts_csv()
    for name in [
        "07_BG5P_Diagnostic_Quick_Reference.md",
        "08_BG5P_Maintenance_Parts_LLM_Corpus.md",
        "09_BG5P_Parts_Diagram_Index.csv",
    ]:
        shutil.copyfile(UPLOAD / name, UPLOAD20 / name)
    sources = {
        "docs/bg5p-consumables-wear-interchange.md": "12_BG5P_Consumables_Wear_Interchange.md",
        "docs/bg5p-oem-parts-master.csv": "13_BG5P_OEM_Parts_Master.csv",
        "docs/bg5p-shared-engine-interchange-candidates.csv": "14_BG5P_Shared_Engine_Interchange_Candidates.csv",
    }
    for src, name in sources.items():
        shutil.copyfile(ROOT / src, UPLOAD20 / name)
    write_deeplink_sitemap()
    knowledge = ROOT / "site/chatbot-knowledge"
    for p in UPLOAD20.iterdir():
        if p.suffix in {".md", ".csv"}:
            shutil.copyfile(p, knowledge / p.name)
    shutil.copyfile(PACK / "GPT_INSTRUCTIONS.md", knowledge / "GPT_INSTRUCTIONS.md")
    snapshot = json.loads((ROOT / "site/public/data/sourcing.json").read_text())
    manifest_path = knowledge / "manifest.json"
    manifest = json.loads(manifest_path.read_text())
    manifest["content_version"] = snapshot["content_version"]
    manifest["text_refreshed_date"] = snapshot["checked_date"]
    for record in manifest["documents"]:
        record["bytes"] = (knowledge / record["target"]).stat().st_size
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
    print("Refreshed text/CSV knowledge from canonical exports; no PDF generation.")


if __name__ == "__main__":
    main()
