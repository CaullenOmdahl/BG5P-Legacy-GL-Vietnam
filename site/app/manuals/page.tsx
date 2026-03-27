import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import ManualsClient, {
  type PdfEntry,
  type ChassisSection,
} from "@/components/ManualsClient";

export const metadata: Metadata = {
  title: "Service Manuals — BG5P Legacy GL",
  description:
    "363 factory service manual PDFs for the BG5P Legacy GL — EJ20E engine and BG chassis documentation.",
};

const MANUALS_DIR = path.join(process.cwd(), "public", "manuals");
const TITLES_FILE = path.join(process.cwd(), "public", "data", "manual-titles.json");

function loadTitles(): Record<string, string> {
  try {
    return JSON.parse(fs.readFileSync(TITLES_FILE, "utf-8"));
  } catch {
    return {};
  }
}

const SECTION_DESCRIPTIONS: Record<string, string> = {
  "BODY SECTION":
    "Body panels, exterior trim, doors & windows, seats, interior, airbags",
  "ELECTRICAL SECTION":
    "Lighting, instrument cluster, HVAC controls, power accessories",
  "ENGINE - UNIVERSAL":
    "Engine mechanical, fuel system, exhaust, engine mounts, clutch",
  "MECHANICAL COMPONENTS SECTION":
    "Brakes, suspension, steering, wheels & axles, A/C system",
  TRANSMISSION:
    "Manual & automatic transmission, front/rear/center differentials",
  "WIRING DIAGRAM SECTION":
    "Full electrical wiring diagrams and circuit schematics",
};

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

function readPdfs(dirPath: string, urlPrefix: string): PdfEntry[] {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath)
    .filter((f) => f.toLowerCase().endsWith(".pdf"))
    .map((filename) => {
      const stats = fs.statSync(path.join(dirPath, filename));
      return {
        name: humanizeName(filename),
        href: `${urlPrefix}/${encodeURIComponent(filename)}`,
        size: formatBytes(stats.size),
        bytes: stats.size,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
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
        description: SECTION_DESCRIPTIONS[sectionName] ?? "",
        subsections,
      };
    });
}

export default function ManualsPage() {
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
      {/* Header */}
      <section className="pt-4 sm:pt-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Service Manuals
        </h1>
        <p className="mt-2 text-base sm:text-lg text-muted max-w-2xl">
          Factory service manual PDFs &mdash; {totalCount} documents
        </p>
        <p className="mt-3 text-sm text-muted max-w-2xl leading-relaxed">
          Two sources:{" "}
          <strong className="text-foreground font-medium">
            EJ20E engine-specific
          </strong>{" "}
          manuals covering the SOHC 2.0L flat-four, and{" "}
          <strong className="text-foreground font-medium">BG chassis</strong>{" "}
          manuals covering all BG-platform Legacy models (body, electrical,
          mechanical, transmission, and wiring). Chassis documents are factory
          Subaru reference PDFs identified by their MSA document code.
        </p>
      </section>

      <ManualsClient
        enginePdfs={enginePdfs}
        chassisSections={chassisSections}
        totalCount={totalCount}
      />
    </div>
  );
}
