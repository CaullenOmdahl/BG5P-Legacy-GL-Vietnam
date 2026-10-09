"""Rendered desktop/mobile acceptance checks against an already-running local preview."""

import json
import os
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.request import urlopen
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BASE = os.environ.get("BG5_PREVIEW_URL", "http://127.0.0.1:3187")
data = json.loads((ROOT / "public/data/sourcing.json").read_text())
paths = ["/", "/about", "/parts", "/manuals", "/maintenance", "/find-part"]
paths += ["/maintenance/" + g["id"] for g in data["procedures"]]
for s in data["sections"]:
    paths.append("/parts/" + s["slug"])
    paths += [
        f"/parts/{s['slug']}/{d['code'].replace('_', '-')}" for d in s["diagrams"]
    ]
paths += ["/find-part/" + p["id"] for p in data["parts"] if not p["catalog"]]


def status(path):
    with urlopen(BASE + path, timeout=30) as r:
        return r.status


with ThreadPoolExecutor(max_workers=4) as pool:
    assert all(x == 200 for x in pool.map(status, paths))
print(f"HTTP 200: {len(paths)} legacy/search/reference routes")
with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path=os.environ.get("BG5_BROWSER", "/opt/google/chrome/chrome"),
        headless=True,
        args=["--no-sandbox"],
    )
    for width in [390, 1440]:
        context = browser.new_context(
            viewport={"width": width, "height": 900},
            permissions=["clipboard-read", "clipboard-write"],
        )
        page = context.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(BASE + "/find-part?q=D722")
        page.get_by_role("link", name="P 78 009 — Brembo front pad D722 7590").click()
        page.get_by_role(
            "heading", name="P 78 009 — Brembo front pad D722 7590", exact=True
        ).wait_for()
        body = page.locator("body").inner_text()
        assert "1996-05" in body and "Build date is unknown" in body
        assert "17 mm" in body and data["content_version"] in body
        page.get_by_role("button", name="Copy supplier brief", exact=True).click()
        page.get_by_role("button", name="Copied", exact=True).wait_for()
        assert "P 78 009" in page.evaluate("navigator.clipboard.readText()")
        assert (
            page.get_by_role("link", name="000004447-1", exact=True)
            .get_attribute("href")
            .startswith("https://www.bremboparts.com/")
        )
        page.evaluate("window.scrollTo(0,0)")
        page.wait_for_timeout(100)
        page.screenshot(path=f"/tmp/bg5-part-{width}.png", full_page=True)
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+1"), (
            f"horizontal overflow {width}"
        )
        page.goto(BASE + "/maintenance/brake-pads")
        body = page.locator("body").inner_text()
        assert "Front Brake Pads and Rear Drum Inspection" in body
        assert "Rear Pad Dimensions" not in body and "265_01" not in body
        # Server-selected Vietnamese locale must retain corrected title and variant evidence.
        page.get_by_role("button", name="Switch to Vietnamese", exact=True).click()
        page.get_by_role(
            "heading",
            name="Má phanh trước và kiểm tra tang trống sau",
            level=1,
            exact=True,
        ).wait_for()
        page.goto(BASE + "/find-part?q=D722")
        assert page.get_by_role("heading", name="Tìm phụ tùng", exact=True).count() == 1
        page.get_by_role("link", name="P 78 009 — Má phanh trước Brembo D722").click()
        page.get_by_role(
            "heading", name="P 78 009 — Má phanh trước Brembo D722", exact=True
        ).wait_for()
        assert "1996-05" in page.locator("body").inner_text()
        page.get_by_role(
            "button", name="Sao chép thông tin nhà cung cấp", exact=True
        ).focus()
        assert page.evaluate("document.activeElement.tagName") == "BUTTON"
        page.keyboard.press("Enter")
        page.get_by_role("button", name="Đã sao chép", exact=True).wait_for()
        assert "P 78 009" in page.evaluate("navigator.clipboard.readText()")
        page.goto(BASE + "/maintenance/brake-pads")
        assert (
            "Má phanh trước và kiểm tra tang trống sau"
            in page.locator("body").inner_text()
        )
        # Vietnamese lookup must retain component identity through supplier copy.
        from urllib.parse import quote

        for term in ["bơm nước", "đèn pha"]:
            page.goto(BASE + "/find-part?q=" + quote(term))
            assert page.locator('a[href^="/find-part/catalog-"]').count() > 0, term
        page.goto(BASE + "/find-part?q=" + quote("lọc gió"))
        for number in ["46053AC090", "46033AC000", "46060AA010"]:
            part = next(p for p in data["parts"] if p["number"] == number)
            assert (
                page.get_by_role(
                    "link", name=number + " — " + part["name_vi"], exact=True
                ).count()
                >= 1
            )
        part = next(p for p in data["parts"] if p["number"] == "46053AC090")
        page.goto(BASE + "/find-part/" + part["id"])
        assert part["name"] in page.locator("h1").inner_text()
        page.get_by_role(
            "button", name="Sao chép thông tin nhà cung cấp", exact=True
        ).click()
        page.get_by_role("button", name="Đã sao chép", exact=True).wait_for()
        assert part["name"] in page.evaluate("navigator.clipboard.readText()")
        page.screenshot(path=f"/tmp/bg5-repair-identity-{width}.png", full_page=True)
        assert not errors, errors
        context.close()
    browser.close()
print(
    "Mobile/desktop English/Vietnamese part → evidence → brief, keyboard, overflow and corrected guide checks passed"
)
