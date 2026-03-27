import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MANUALS_DIR = path.join(process.cwd(), "public", "manuals");
const TITLES_FILE = path.join(process.cwd(), "public", "data", "manual-titles.json");

let _titles: Record<string, string> | null = null;
function getTitles(): Record<string, string> {
  if (!_titles) {
    try {
      _titles = JSON.parse(fs.readFileSync(TITLES_FILE, "utf-8"));
    } catch {
      _titles = {};
    }
  }
  return _titles!;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/, "");
}

function humanizeName(filename: string): string {
  const titles = getTitles();
  if (titles[filename]) return titles[filename];
  let name = filename.replace(/\.pdf$/i, "");
  name = name.replace(/_/g, " ");
  name = name.replace(/\bno OBD\b/, "(no OBD)");
  return name.trim();
}

export interface ManualEntry {
  label: string;
  detail: string;
  href: string;
  isPdf: boolean;
}

export async function GET() {
  const entries: ManualEntry[] = [];

  // Engine PDFs — index each individually (they have descriptive names)
  const engineDir = path.join(MANUALS_DIR, "EJ20E-SOHC-engine");
  if (fs.existsSync(engineDir)) {
    for (const filename of fs
      .readdirSync(engineDir)
      .filter((f) => f.toLowerCase().endsWith(".pdf"))
      .sort()) {
      entries.push({
        label: humanizeName(filename),
        detail: "EJ20E Engine Manual",
        href: `/manuals/EJ20E-SOHC-engine/${encodeURIComponent(filename)}`,
        isPdf: true,
      });
    }
  }

  // Chassis — one entry per subsection (PDF names are opaque MSA codes)
  const chassisDir = path.join(MANUALS_DIR, "BG-chassis");
  if (fs.existsSync(chassisDir)) {
    for (const sectionName of fs
      .readdirSync(chassisDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort()) {
      const sectionPath = path.join(chassisDir, sectionName);
      for (const subName of fs
        .readdirSync(sectionPath, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .sort()) {
        const anchor = `${slugify(sectionName)}-${slugify(subName)}`;
        // Index each PDF individually now that we have real titles
        const subPath = path.join(chassisDir, sectionName, subName);
        const pdfFiles = fs
          .readdirSync(subPath)
          .filter((f) => f.toLowerCase().endsWith(".pdf"))
          .sort();
        for (const filename of pdfFiles) {
          entries.push({
            label: humanizeName(filename),
            detail: `${subName} — ${sectionName}`,
            href: `/manuals/BG-chassis/${encodeURIComponent(sectionName)}/${encodeURIComponent(subName)}/${encodeURIComponent(filename)}`,
            isPdf: true,
          });
        }
        // Also add a subsection entry for browsing
        entries.push({
          label: subName,
          detail: `BG Chassis — ${sectionName}`,
          href: `/manuals#${anchor}`,
          isPdf: false,
        });
      }
    }
  }

  return NextResponse.json(entries);
}
