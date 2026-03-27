import fs from "fs";
import path from "path";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Service Manuals — BG5P Legacy GL",
  description:
    "363 factory service manual PDFs for the BG5P Legacy GL — EJ20E engine and BG chassis documentation.",
};

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PdfEntry {
  /** Human-readable display name */
  name: string;
  /** URL path served from public/ */
  href: string;
  /** Formatted file size (e.g. "1.2 MB" or "42 KB") */
  size: string;
  /** Raw byte count for sorting */
  bytes: number;
}

interface SubSection {
  name: string;
  pdfs: PdfEntry[];
}

interface ChassisSection {
  name: string;
  subsections: SubSection[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const MANUALS_DIR = path.join(process.cwd(), "public", "manuals");

function formatBytes(bytes: number): string {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1_024) return `${(bytes / 1_024).toFixed(0)} KB`;
  return `${bytes} B`;
}

/**
 * Transform a PDF filename into a human-readable label.
 * - Strips known Subaru document code prefixes (e.g. "MSA5TCD97L")
 * - Strips ".pdf"
 * - Replaces underscores with spaces
 * - Cleans up "no OBD" / "SOHC" formatting
 */
function humanizeName(filename: string): string {
  let name = filename.replace(/\.pdf$/i, "");

  // Strip Subaru MSA-style document codes (e.g. MSA5TCD97L3767)
  name = name.replace(/^MSA\w+/i, "").trim();

  // If nothing is left after stripping the prefix, use the original code
  if (!name) {
    return filename.replace(/\.pdf$/i, "");
  }

  // Replace underscores with spaces
  name = name.replace(/_/g, " ");

  // Clean up "no OBD" → "(no OBD)"
  name = name.replace(/\bno OBD\b/, "(no OBD)");

  return name.trim();
}

/** Read all PDFs from a single directory (non-recursive). */
function readPdfs(dirPath: string, urlPrefix: string): PdfEntry[] {
  if (!fs.existsSync(dirPath)) return [];

  return fs
    .readdirSync(dirPath)
    .filter((f) => f.toLowerCase().endsWith(".pdf"))
    .map((filename) => {
      const filePath = path.join(dirPath, filename);
      const stats = fs.statSync(filePath);
      return {
        name: humanizeName(filename),
        href: `${urlPrefix}/${encodeURIComponent(filename)}`,
        size: formatBytes(stats.size),
        bytes: stats.size,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/* ------------------------------------------------------------------ */
/*  Data loaders (run at build time)                                   */
/* ------------------------------------------------------------------ */

function loadEnginePdfs(): PdfEntry[] {
  const dir = path.join(MANUALS_DIR, "EJ20E-SOHC-engine");
  return readPdfs(dir, "/manuals/EJ20E-SOHC-engine");
}

function loadChassisSections(): ChassisSection[] {
  const chassisDir = path.join(MANUALS_DIR, "BG-chassis");
  if (!fs.existsSync(chassisDir)) return [];

  const topLevelDirs = fs
    .readdirSync(chassisDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  return topLevelDirs.map((sectionName) => {
    const sectionPath = path.join(chassisDir, sectionName);
    const subDirs = fs
      .readdirSync(sectionPath, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();

    const subsections: SubSection[] = subDirs.map((subName) => {
      const subPath = path.join(sectionPath, subName);
      const urlPrefix = `/manuals/BG-chassis/${encodeURIComponent(sectionName)}/${encodeURIComponent(subName)}`;
      return {
        name: subName,
        pdfs: readPdfs(subPath, urlPrefix),
      };
    });

    return {
      name: sectionName,
      subsections,
    };
  });
}

/* ------------------------------------------------------------------ */
/*  SVG icon                                                           */
/* ------------------------------------------------------------------ */

function PdfIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0 text-red-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M10 12h4" />
      <path d="M10 16h4" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function ManualsPage() {
  const enginePdfs = loadEnginePdfs();
  const chassisSections = loadChassisSections();

  const totalChassis = chassisSections.reduce(
    (sum, s) => sum + s.subsections.reduce((ss, sub) => ss + sub.pdfs.length, 0),
    0,
  );
  const totalCount = enginePdfs.length + totalChassis;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <section className="pt-4 sm:pt-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Service Manuals
        </h1>
        <p className="mt-2 text-base sm:text-lg text-muted max-w-2xl">
          Factory service manual PDFs &mdash; {totalCount} documents
        </p>
        <p className="mt-3 text-sm text-muted max-w-2xl leading-relaxed">
          Two sources: <strong className="text-foreground font-medium">EJ20E engine-specific</strong>{" "}
          manuals covering the SOHC 2.0L flat-four, and{" "}
          <strong className="text-foreground font-medium">BG chassis</strong> manuals shared across
          all BG-platform Legacy models (body, electrical, mechanical, transmission, and wiring).
        </p>
      </section>

      {/* ── EJ20E Engine Manuals ── */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground">EJ20E Engine Manuals</h2>
          <p className="mt-1 text-sm text-muted">
            {enginePdfs.length} documents &mdash; EJ20 2.0L SOHC NA engine
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {enginePdfs.map((pdf) => (
            <a
              key={pdf.href}
              href={pdf.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 transition-colors hover:border-accent"
            >
              <PdfIcon />
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-foreground group-hover:text-accent transition-colors truncate">
                  {pdf.name}
                </span>
              </span>
              <span className="text-xs text-muted whitespace-nowrap">{pdf.size}</span>
            </a>
          ))}
        </div>
      </section>

      {/* ── BG Chassis Manuals ── */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground">BG Chassis Manuals</h2>
          <p className="mt-1 text-sm text-muted">
            {totalChassis} documents &mdash; body, electrical, mechanical, transmission &amp; wiring
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {chassisSections.map((section) => (
            <div key={section.name}>
              {/* Section header */}
              <h3 className="text-lg font-semibold text-foreground mb-3 capitalize">
                {section.name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
              </h3>

              <div className="flex flex-col gap-4">
                {section.subsections.map((sub) => (
                  <div key={sub.name}>
                    {/* Subsection header */}
                    <h4 className="text-sm font-medium text-muted mb-2 uppercase tracking-wide">
                      {sub.name} ({sub.pdfs.length})
                    </h4>

                    {/* PDF grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                      {sub.pdfs.map((pdf) => (
                        <a
                          key={pdf.href}
                          href={pdf.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2.5 rounded-md border border-border bg-surface px-3 py-2 transition-colors hover:border-accent"
                        >
                          <PdfIcon />
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-medium text-foreground group-hover:text-accent transition-colors truncate font-mono">
                              {pdf.name}
                            </span>
                          </span>
                          <span className="text-xs text-muted whitespace-nowrap">{pdf.size}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
