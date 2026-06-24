#!/usr/bin/env python3
"""Fill missing BG5 parts tables from local EPC CSVs and epc-data pages.

The site renders parts by the 3-digit diagram prefix. This script preserves
existing `parts.json` rows, fills only empty prefixes, and writes any fetched
category CSVs back under `parts-catalog/` for repeatable rebuilds.
"""

import argparse
import atexit
import csv
import html
import json
import re
import subprocess
import sys
import time
import tempfile
from pathlib import Path
from urllib.parse import urljoin, urlparse


BASE_URL = "https://subaru.epc-data.com"
VARIANT_PATH = "/legacy/bg5/141-ej20e"
USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0"

SITE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = SITE_DIR.parent
PARTS_CATALOG_DIR = PROJECT_ROOT / "parts-catalog"
DATA_DIR = SITE_DIR / "public" / "data"
SECTIONS_FILE = DATA_DIR / "sections.json"
PARTS_FILE = DATA_DIR / "parts.json"
PARTS_STATUS_FILE = DATA_DIR / "parts-status.json"
CURL_COOKIE_FILE = tempfile.NamedTemporaryFile(prefix="bg5-epc-cookies-", delete=False)
CURL_COOKIE_FILE.close()
atexit.register(lambda: Path(CURL_COOKIE_FILE.name).unlink(missing_ok=True))

PART_FIELDS = [
    "oem_number",
    "quantity",
    "production_period",
    "applies_for_models",
    "notes",
    "replacements",
    "group_code",
    "group_name",
]

CSV_FIELDS = [
    "section",
    "category_code",
    "category_name",
    "group_code",
    "group_name",
    "oem_number",
    "quantity",
    "production_period",
    "applicable_option",
    "spec_color",
    "trim_code",
    "applies_for_models",
    "notes",
    "replacements",
]

PART_STATUS_REASONS = {
    "not_applicable": "EPC source marks this subgroup as not applicable for the selected BG5 AT complectation.",
    "no_itemized_rows": "EPC source has a category page but no itemized OEM part rows for the selected BG5 AT complectation.",
    "source_unpublished": "Selected BG5 AT EPC source did not publish an itemized category page during local extraction; no OEM rows are available in the local corpus.",
}

SLUG_SECTION_HINTS = {
    "engine-main": ["engine"],
    "engine-auxiliaries": ["engine"],
    "engine-electrical": ["electric", "engine"],
    "manual-transmission": ["trans"],
    "differential-propeller": ["trans"],
    "suspension-axle-brake": ["trans", "electric"],
    "steering": ["trans", "engine"],
    "engine-mounting-cooling": ["engine", "trans", "body"],
    "body-key-bumper": ["body"],
    "door-parts": ["body"],
    "seat-instrument-panel": ["body"],
    "heater-ac": ["body", "electric", "engine"],
    "body-electrical-1": ["electric"],
    "body-electrical-2": ["electric"],
    "outer-accessories": ["body"],
    "inner-accessories": ["body"],
}


def read_json(path: Path):
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def write_json(path: Path, data) -> None:
    with path.open("w", encoding="utf-8") as handle:
        json.dump(data, handle, indent=2, ensure_ascii=False)
        handle.write("\n")


def read_json_or_empty(path: Path):
    if not path.exists():
        return {}
    return read_json(path)


def clean_text(value: str) -> str:
    value = re.sub(r"<br\s*/?>", " ", value, flags=re.IGNORECASE)
    value = re.sub(r"<[^>]+>", "", value)
    value = html.unescape(value)
    value = value.replace("\xa0", " ")
    return re.sub(r"\s+", " ", value).strip()


def clean_markdown_cell(value: str) -> str:
    value = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", value)
    value = value.replace("**", "")
    return clean_text(value)


def safe_dirname(code: str, name: str) -> str:
    safe = re.sub(r"[^\w\-]", "_", name).strip("_")[:60]
    return f"{code}_{safe}"


def safe_cache_code(code: str) -> str:
    safe = re.sub(r"[^A-Za-z0-9_.-]", "_", code).strip("_")
    return safe or "unknown"


def group_cache_path(category_dir: Path, group: dict[str, str]) -> Path:
    return category_dir / f"group_{safe_cache_code(group['code'])}.html"


def cookie_file_has_cookies() -> bool:
    try:
        return Path(CURL_COOKIE_FILE.name).stat().st_size > 0
    except OSError:
        return False


def fetch(url: str, delay: float, retries: int, referer: str | None = None) -> str | None:
    for attempt in range(retries):
        if delay > 0:
            time.sleep(delay)
        command = [
            "curl",
            "-fsSL",
            "--max-time",
            "45",
            "--connect-timeout",
            "15",
            "--cookie-jar",
            CURL_COOKIE_FILE.name,
            "--cookie",
            CURL_COOKIE_FILE.name,
            "-A",
            USER_AGENT,
            "-H",
            "Accept: text/html,application/xhtml+xml",
            "-H",
            "Accept-Language: en-US,en;q=0.9",
        ]
        if referer:
            command.extend(["-H", f"Referer: {referer}"])
        command.append(url)
        result = subprocess.run(command, capture_output=True)
        if result.returncode == 0:
            return result.stdout.decode("utf-8", errors="replace")

        stderr = result.stderr.decode("utf-8", errors="replace").strip()
        if "429" in stderr and attempt < retries - 1:
            wait = max(30.0, delay * 6) * (attempt + 1)
            print(f"    429 from {url}; waiting {wait:.0f}s")
            time.sleep(wait)
            continue
        if attempt < retries - 1:
            wait = max(10.0, delay * 3)
            print(f"    curl failed for {url}: {stderr}; retrying in {wait:.0f}s")
            time.sleep(wait)
            continue
        print(f"    curl failed for {url}: {stderr or f'exit {result.returncode}'}")
        return None
    return None


def jina_urls(url: str) -> list[str]:
    parsed = urlparse(url)
    origin = f"{parsed.netloc}{parsed.path}"
    if parsed.query:
        origin += f"?{parsed.query}"
    nested = f"https://r.jina.ai/http://r.jina.ai/http://{origin}"
    direct_http = f"https://r.jina.ai/http://{origin}"
    return [nested, direct_http]


def looks_blocked(content: str) -> bool:
    blocked_markers = ["429 Too Many Requests", "Target URL returned error 429"]
    return any(marker in content for marker in blocked_markers)


def category_status_from_content(category_html: str) -> str | None:
    if "This subgroup is not applicable for current complectation" in category_html:
        return "not_applicable"
    if re.search(r"\|\s*Applies for models\s*\|", category_html) or re.search(
        r"<table[^>]*>\s*<tr[^>]*>\s*<th[^>]*>\s*Applies for models",
        category_html,
        re.IGNORECASE | re.DOTALL,
    ):
        return "no_itemized_rows"
    return None


def write_category_status(category_code: str, status: str, source: str) -> None:
    statuses = read_json_or_empty(PARTS_STATUS_FILE)
    statuses[category_code] = {
        "status": status,
        "source": source,
        "detail": PART_STATUS_REASONS[status],
    }
    write_json(PARTS_STATUS_FILE, dict(sorted(statuses.items())))


def fetch_jina_markdown(url: str, delay: float, retries: int) -> str | None:
    for jina_url in jina_urls(url):
        print(f"    Trying Jina mirror {jina_url}")
        content = fetch(jina_url, delay, retries)
        if content and not looks_blocked(content):
            return content
    return None


def fetch_content(url: str, delay: float, retries: int, referer: str | None = None) -> str | None:
    content = fetch(url, delay, retries, referer=referer)
    if content and not looks_blocked(content):
        return content
    return fetch_jina_markdown(url, delay, retries)


def discover_groups(category_html: str) -> list[dict[str, str]]:
    pattern = re.compile(
        r"<b>([\w*]+)</b>\s*-\s*<a[^>]+href=\"([^\"]+)\"[^>]*>([^<]+)</a>",
        re.IGNORECASE,
    )
    seen = set()
    groups = []
    for code, path, name in pattern.findall(category_html):
        if code in seen:
            continue
        seen.add(code)
        groups.append(
            {
                "code": clean_text(code),
                "name": clean_text(name),
                "url": urljoin(BASE_URL, path),
            }
        )
    markdown_pattern = re.compile(
        r"\*\*([\w*]+)\*\*\s*-\s*\[([^\]]+)\]\((https?://[^)]+|/[^)]+)\)",
        re.IGNORECASE,
    )
    for code, name, path in markdown_pattern.findall(category_html):
        code = clean_text(code)
        if code in seen:
            continue
        seen.add(code)
        groups.append(
            {
                "code": code,
                "name": clean_markdown_cell(name),
                "url": urljoin(BASE_URL, path),
            }
        )
    return groups


def extract_linked_direct_parts(category_html: str) -> list[dict[str, str]]:
    rows = []
    pattern = re.compile(
        r"q=([A-Z0-9]+)[^>]*>\s*<strong>([^<]+?)\s*\(([^)]+)\)</strong>",
        re.IGNORECASE,
    )
    for oem_number, _label, detail in pattern.findall(category_html):
        if " - " in detail:
            group_code, group_name = detail.split(" - ", 1)
        else:
            group_code, group_name = oem_number, detail
        rows.append(
            {
                "oem_number": clean_text(oem_number),
                "quantity": "",
                "production_period": "",
                "applies_for_models": "",
                "notes": "",
                "replacements": "",
                "group_code": clean_text(group_code),
                "group_name": clean_text(group_name),
            }
        )
    markdown_pattern = re.compile(
        r"\[?\*\*([A-Z0-9]+)\s*\(([^)]+)\)\*\*\]?\([^)]*q=\1[^)]*\)",
        re.IGNORECASE,
    )
    for oem_number, detail in markdown_pattern.findall(category_html):
        if " - " in detail:
            group_code, group_name = detail.split(" - ", 1)
        else:
            group_code, group_name = oem_number, detail
        rows.append(
            {
                "oem_number": clean_text(oem_number),
                "quantity": "",
                "production_period": "",
                "applies_for_models": "",
                "notes": "",
                "replacements": "",
                "group_code": clean_text(group_code),
                "group_name": clean_text(group_name),
            }
        )
    return rows


def extract_parts_from_group(group_html: str, group: dict[str, str]) -> list[dict[str, str]]:
    table_match = re.search(
        r"<table[^>]*parts-in-stock-widget_parts-table[^>]*>(.*?)</table>",
        group_html,
        re.DOTALL | re.IGNORECASE,
    )
    if not table_match:
        return extract_parts_from_group_markdown(group_html, group)

    table_html = table_match.group(1)
    row_pattern = re.compile(
        r"<tr[^>]*class=\"parts-in-stock-widget_part-row\"[^>]*>(.*?)</tr>",
        re.DOTALL | re.IGNORECASE,
    )

    rows = []
    for row_match in row_pattern.finditer(table_html):
        row_html = row_match.group(1)
        oem_match = re.search(
            r"parts-in-stock-widget_part-oem[^>]*>([^<]+)",
            row_html,
            re.IGNORECASE,
        )
        oem_number = clean_text(oem_match.group(1)) if oem_match else ""
        if not oem_number:
            continue

        cells = re.findall(r"<td[^>]*>(.*?)</td>", row_html, re.DOTALL | re.IGNORECASE)
        values = [clean_text(cell) for cell in cells]

        rows.append(
            {
                "oem_number": oem_number,
                "quantity": values[1] if len(values) > 1 else "",
                "production_period": values[2] if len(values) > 2 else "",
                "applies_for_models": values[6] if len(values) > 6 else "",
                "notes": values[7] if len(values) > 7 else "",
                "replacements": values[8] if len(values) > 8 else "",
                "group_code": group["code"],
                "group_name": group["name"],
            }
        )
    return rows


def split_markdown_row(line: str) -> list[str]:
    return [clean_markdown_cell(cell) for cell in line.strip().strip("|").split("|")]


def extract_parts_from_group_markdown(group_markdown: str, group: dict[str, str]) -> list[dict[str, str]]:
    lines = group_markdown.splitlines()
    rows = []
    for index, line in enumerate(lines):
        if not line.startswith("|") or "OEM part number" not in line:
            continue
        data_lines = lines[index + 2 :]
        for row_line in data_lines:
            if not row_line.startswith("|"):
                break
            values = split_markdown_row(row_line)
            if len(values) < 2:
                continue
            oem_number = values[0]
            if not oem_number or oem_number.lower() == "oem part number":
                continue
            rows.append(
                {
                    "oem_number": oem_number,
                    "quantity": values[1] if len(values) > 1 else "",
                    "production_period": values[2] if len(values) > 2 else "",
                    "applies_for_models": values[6] if len(values) > 6 else "",
                    "notes": values[7] if len(values) > 7 else "",
                    "replacements": values[8] if len(values) > 8 else "",
                    "group_code": group["code"],
                    "group_name": group["name"],
                }
            )
        break
    return rows


def category_name_from_html(category_html: str, code: str) -> str:
    title_match = re.search(rf"<h1>\s*{re.escape(code)}\s*-\s*(.*?)\s+for\s+", category_html, re.IGNORECASE)
    if title_match:
        return clean_text(title_match.group(1))
    markdown_title = re.search(rf"Title:\s*{re.escape(code)}\s*-\s*(.*?)\s+for\s+", category_html, re.IGNORECASE)
    if markdown_title:
        return clean_text(markdown_title.group(1))
    markdown_heading = re.search(rf"\b{re.escape(code)}\s*-\s*([^\n\r]+)", category_html, re.IGNORECASE)
    if markdown_heading:
        return clean_text(markdown_heading.group(1))
    return code


def load_local_csv_rows(category_code: str) -> list[dict[str, str]]:
    rows = []
    for csv_path in sorted(PARTS_CATALOG_DIR.rglob("parts.csv")):
        with csv_path.open("r", encoding="utf-8") as handle:
            reader = csv.DictReader(handle)
            for row in reader:
                if row.get("category_code", "").strip() != category_code:
                    continue
                rows.append({field: row.get(field, "") for field in PART_FIELDS})
    return rows


def dedupe_rows(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    seen = set()
    deduped = []
    for row in rows:
        normalized = {field: clean_text(str(row.get(field, ""))) for field in PART_FIELDS}
        if not normalized["oem_number"]:
            continue
        key = tuple(normalized[field] for field in PART_FIELDS)
        if key in seen:
            continue
        seen.add(key)
        deduped.append(normalized)
    return deduped


def write_category_csv(epc_section: str, category_code: str, category_name: str, rows: list[dict[str, str]]) -> None:
    category_dir = PARTS_CATALOG_DIR / epc_section / safe_dirname(category_code, category_name)
    category_dir.mkdir(parents=True, exist_ok=True)
    csv_path = category_dir / "parts.csv"
    with csv_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=CSV_FIELDS)
        writer.writeheader()
        for row in rows:
            writer.writerow(
                {
                    "section": epc_section,
                    "category_code": category_code,
                    "category_name": category_name,
                    "group_code": row.get("group_code", ""),
                    "group_name": row.get("group_name", ""),
                    "oem_number": row.get("oem_number", ""),
                    "quantity": row.get("quantity", ""),
                    "production_period": row.get("production_period", ""),
                    "applicable_option": "",
                    "spec_color": "",
                    "trim_code": "",
                    "applies_for_models": row.get("applies_for_models", ""),
                    "notes": row.get("notes", ""),
                    "replacements": row.get("replacements", ""),
                }
            )


def fetch_category(
    category_code: str,
    section_slug: str,
    delay: float,
    retries: int,
) -> tuple[str, str, list[dict[str, str]]] | None:
    candidates = SLUG_SECTION_HINTS.get(section_slug, ["engine", "body", "trans", "electric"])
    candidates = list(dict.fromkeys(candidates))

    for epc_section in candidates:
        category_url = f"{BASE_URL}{VARIANT_PATH}/{epc_section}/{category_code}/"
        print(f"  Trying {category_code} from {epc_section}")
        cached_pages = sorted((PARTS_CATALOG_DIR / epc_section).glob(f"{category_code}_*/page.html"))
        if cached_pages:
            category_html = cached_pages[0].read_text(encoding="utf-8", errors="replace")
            print(f"    Using cached category page {cached_pages[0]}")
        else:
            category_html = fetch_content(category_url, delay, retries)
            if not category_html:
                continue
        if f"{category_code} -" not in category_html:
            continue

        category_name = category_name_from_html(category_html, category_code)
        category_dir = PARTS_CATALOG_DIR / epc_section / safe_dirname(category_code, category_name)
        category_dir.mkdir(parents=True, exist_ok=True)
        (category_dir / "page.html").write_text(category_html, encoding="utf-8")
        if not cookie_file_has_cookies():
            fetch(category_url, delay, retries)

        rows = extract_linked_direct_parts(category_html)
        groups = discover_groups(category_html)
        print(f"    {category_name}: {len(groups)} group page(s), {len(rows)} direct row(s)")
        group_failures = []
        for group in groups:
            cache_path = group_cache_path(category_dir, group)
            if cache_path.exists():
                group_html = cache_path.read_text(encoding="utf-8", errors="replace")
                print(f"      {group['code']}: using cached group page {cache_path.name}")
            else:
                group_html = fetch_content(group["url"], delay, retries, referer=category_url)
                if group_html:
                    cache_path.write_text(group_html, encoding="utf-8")
            if not group_html:
                group_failures.append(group["code"])
                print(f"      {group['code']}: group page unavailable")
                continue
            group_rows = extract_parts_from_group(group_html, group)
            rows.extend(group_rows)
            print(f"      {group['code']}: {len(group_rows)} row(s)")

        rows = dedupe_rows(rows)
        if group_failures:
            print(
                f"    Deferred {category_code}; missing {len(group_failures)} group page(s): "
                + ", ".join(group_failures)
            )
            continue
        if rows:
            write_category_csv(epc_section, category_code, category_name, rows)
            return epc_section, category_name, rows
        status = category_status_from_content(category_html)
        if status:
            write_category_status(category_code, status, category_url)
            return epc_section, category_name, []
        print(f"    No rows extracted for {category_code} from {epc_section}")

    return None


def missing_categories(sections, parts) -> dict[str, tuple[str, str]]:
    missing = {}
    for section in sections:
        for diagram in section.get("diagrams", []):
            category_code = diagram["code"].split("_", 1)[0]
            if parts.get(category_code):
                continue
            missing.setdefault(category_code, (section["slug"], diagram["name"]))
    return dict(sorted(missing.items()))


def main() -> int:
    parser = argparse.ArgumentParser(description="Fill empty diagram parts lists")
    parser.add_argument("--delay", type=float, default=8.0, help="Delay before each HTTP request")
    parser.add_argument("--retries", type=int, default=4, help="HTTP retries per URL")
    parser.add_argument("--codes", nargs="*", help="Only fill these category codes")
    parser.add_argument("--local-only", action="store_true", help="Use local CSVs only")
    args = parser.parse_args()

    sections = read_json(SECTIONS_FILE)
    parts = read_json(PARTS_FILE)
    statuses = read_json_or_empty(PARTS_STATUS_FILE)
    missing = missing_categories(sections, parts)
    missing = {code: value for code, value in missing.items() if code not in statuses}
    if args.codes:
        requested = {code.zfill(3) for code in args.codes}
        missing = {code: value for code, value in missing.items() if code in requested}

    if not missing:
        print("No missing parts categories.")
        return 0

    print(f"Filling {len(missing)} missing category code(s).")
    failures = []
    for category_code, (section_slug, diagram_name) in missing.items():
        print(f"\n{category_code} {diagram_name} ({section_slug})")
        local_rows = dedupe_rows(load_local_csv_rows(category_code))
        if local_rows:
            parts[category_code] = local_rows
            print(f"  Loaded {len(local_rows)} row(s) from local CSV")
            continue

        if args.local_only:
            failures.append(category_code)
            print("  Missing local CSV rows")
            continue

        result = fetch_category(category_code, section_slug, args.delay, args.retries)
        if not result:
            failures.append(category_code)
            print(f"  FAILED {category_code}")
            continue

        _epc_section, _category_name, rows = result
        parts[category_code] = rows
        write_json(PARTS_FILE, parts)
        print(f"  Added {len(rows)} row(s)")

    write_json(PARTS_FILE, parts)
    if failures:
        print("\nStill missing: " + ", ".join(failures))
        return 1

    print(f"\nUpdated {PARTS_FILE}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
