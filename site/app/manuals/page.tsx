import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import ManualsClient, {
  type PdfEntry,
  type ChassisSection,
} from "@/components/ManualsClient";
import { BookOpenText } from "lucide-react";
import { getCopy, getPageMetadata, SITE_COPY } from "@/lib/i18n";
import { getServerLocale } from "@/lib/server-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return getPageMetadata(locale, "manuals");
}

const MANUALS_DIR = path.join(process.cwd(), "public", "manuals");
const TITLES_FILE = path.join(process.cwd(), "public", "data", "manual-titles.json");

function loadTitles(): Record<string, string> {
  try {
    return JSON.parse(fs.readFileSync(TITLES_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function formatBytes(bytes: number): string {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1_024) return `${(bytes / 1_024).toFixed(0)} KB`;
  return `${bytes} B`;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/, "");
}

const titles = loadTitles();

function humanizeName(filename: string): string {
  // Use extracted PDF title if available
  if (titles[filename]) return titles[filename];

  let name = filename.replace(/\.pdf$/i, "");
  name = name.replace(/_/g, " ");
  name = name.replace(/\bno OBD\b/, "(no OBD)");
  return name.trim();
}

function isZipBackedArchive(filePath: string): boolean {
  try {
    const fd = fs.openSync(filePath, "r");
    try {
      const signature = Buffer.alloc(4);
      fs.readSync(fd, signature, 0, 4, 0);
      return signature[0] === 0x50 && signature[1] === 0x4b;
    } finally {
      fs.closeSync(fd);
    }
  } catch {
    return false;
  }
}

function readPdfs(dirPath: string, urlPrefix: string): PdfEntry[] {
  if (!fs.existsSync(dirPath)) return [];

  const entries: PdfEntry[] = [];

  for (const dirent of fs
    .readdirSync(dirPath, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))) {
    const entryPath = path.join(dirPath, dirent.name);
    const entryUrl = `${urlPrefix}/${encodeURIComponent(dirent.name)}`;

    if (dirent.isDirectory()) {
      entries.push(...readPdfs(entryPath, entryUrl));
      continue;
    }

    if (!dirent.isFile() || !dirent.name.toLowerCase().endsWith(".pdf")) {
      continue;
    }

    if (isZipBackedArchive(entryPath)) {
      continue;
    }

    const stats = fs.statSync(entryPath);
    entries.push({
      name: humanizeName(dirent.name),
      href: entryUrl,
      size: formatBytes(stats.size),
      bytes: stats.size,
    });
  }

  return entries.sort((a, b) => a.name.localeCompare(b.name));
}

function loadEnginePdfs(): PdfEntry[] {
  return readPdfs(
    path.join(MANUALS_DIR, "EJ20E-SOHC-engine"),
    "/manuals/EJ20E-SOHC-engine"
  );
}

function loadChassisSections(): ChassisSection[] {
  const chassisDir = path.join(MANUALS_DIR, "BG-chassis");
  if (!fs.existsSync(chassisDir)) return [];

  return fs
    .readdirSync(chassisDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()
    .map((sectionName) => {
      const sectionPath = path.join(chassisDir, sectionName);
      const subsections = fs
        .readdirSync(sectionPath, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .sort()
        .map((subName) => {
          const subPath = path.join(sectionPath, subName);
          const urlPrefix = `/manuals/BG-chassis/${encodeURIComponent(sectionName)}/${encodeURIComponent(subName)}`;
          return {
            name: subName,
            anchor: `${slugify(sectionName)}-${slugify(subName)}`,
            pdfs: readPdfs(subPath, urlPrefix),
          };
        });

      return {
        name: sectionName,
        description:
          SITE_COPY.en.manuals.sectionDescriptions[
            sectionName as keyof typeof SITE_COPY.en.manuals.sectionDescriptions
          ] ?? "",
        subsections,
      };
    });
}

export default async function ManualsPage() {
  const locale = await getServerLocale();
  const copy = getCopy(locale).manuals;
  const enginePdfs = loadEnginePdfs();
  const chassisSections = loadChassisSections();
  const totalCount =
    enginePdfs.length +
    chassisSections.reduce(
      (n, s) => n + s.subsections.reduce((m, sub) => m + sub.pdfs.length, 0),
      0
    );

  return (
    <div className="flex flex-col gap-8">
      <section className="bg5-panel-strong rounded-lg p-5 sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-panel text-accent">
            <BookOpenText className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
              {copy.eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {copy.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">
              {totalCount} {copy.description}
            </p>
          </div>
        </div>
      </section>

      <ManualsClient
        enginePdfs={enginePdfs}
        chassisSections={chassisSections}
        totalCount={totalCount}
      />
    </div>
  );
}
