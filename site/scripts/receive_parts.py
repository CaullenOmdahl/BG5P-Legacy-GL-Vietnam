#!/usr/bin/env python3
"""Tiny HTTP server that receives parts JSON via POST and writes to parts.json."""

import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path

OUTPUT = Path(__file__).resolve().parent.parent / "public" / "data" / "parts.json"


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        data = json.loads(body)

        # Clean: remove vehicle-info rows (oem_number == "SUBARU" or similar non-part rows)
        cleaned = {}
        total = 0
        for cat_code, parts in data.items():
            real_parts = [
                p for p in parts
                if p.get("oem_number", "")
                and p["oem_number"] not in ("SUBARU",)
                and len(p["oem_number"]) >= 8
            ]
            if real_parts:
                cleaned[cat_code] = real_parts
                total += len(real_parts)

        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        with open(OUTPUT, "w", encoding="utf-8") as f:
            json.dump(cleaned, f, indent=2, ensure_ascii=False)
            f.write("\n")

        msg = f"Wrote {total} parts across {len(cleaned)} categories to {OUTPUT}"
        print(msg)
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(msg.encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()


if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", 9876), Handler)
    print(f"Listening on :9876, will write to {OUTPUT}")
    # Handle OPTIONS preflight + POST (2 requests), then exit
    server.handle_request()
    server.handle_request()
    print("Done.")
