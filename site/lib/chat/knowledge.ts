import fs from "fs";
import path from "path";
import { localizeManualTitle, localizeTechnicalName } from "@/lib/i18n";
import type { Locale } from "@/lib/locale";

export interface KnowledgeSource {
  id: string;
  title: string;
  path: string;
  score: number;
}

export interface PublicLinkSource {
  id: string;
  title: string;
  url: string;
  score: number;
}

interface KnowledgeChunk {
  id: string;
  title: string;
  path: string;
  text: string;
  searchText: string;
  tokens: Set<string>;
}

interface DiagramRoute {
  code: string;
  name: string;
  sectionSlug: string;
  sectionName: string;
  imagePath: string;
}

interface MaintenanceRoute {
  id: string;
  title: string;
}

interface ManualRoute {
  filename: string;
  url: string;
}

const KNOWLEDGE_DIR = path.join(process.cwd(), "chatbot-knowledge");
const PUBLIC_DIR = path.join(process.cwd(), "public");
const DATA_DIR = path.join(PUBLIC_DIR, "data");
const SUPPORTED_EXTENSIONS = new Set([".md", ".txt", ".csv"]);
const CHUNK_SIZE = 2600;
const CHUNK_OVERLAP = 350;
const MAX_CONTEXT_CHARS = 24000;
const MAX_CHUNKS = 9;
const BASE_URL = "https://bg5.caphedigital.com";
const EXACT_LINK_SCORE = 10000;

const INTERNAL_SOURCE_LINKS: Array<{
  match: RegExp;
  title: string;
  titleVi: string;
  url: string;
}> = [
  {
    match: /no obd diagnostics|diagnostic quick reference/i,
    title: "EJ20 SOHC Diagnostics (no OBD) PDF",
    titleVi: "PDF chẩn đoán EJ20 SOHC (no-OBD)",
    url: `${BASE_URL}/manuals/EJ20E-SOHC-engine/EJ20_SOHC_Diagnostics_no_OBD.pdf`,
  },
  {
    match: /fuel ignition electrical/i,
    title: "EJ20 SOHC Fuel Injection (no OBD) PDF",
    titleVi: "PDF phun xăng EJ20 SOHC (no-OBD)",
    url: `${BASE_URL}/manuals/EJ20E-SOHC-engine/EJ20_SOHC_Fuel_Injection_no_OBD.pdf`,
  },
  {
    match: /fuel ignition electrical|spark|ignition/i,
    title: "EJ20 SOHC Ignition (no OBD) PDF",
    titleVi: "PDF đánh lửa EJ20 SOHC (no-OBD)",
    url: `${BASE_URL}/manuals/EJ20E-SOHC-engine/EJ20_SOHC_Ignition_no_OBD.pdf`,
  },
  {
    match: /mechanical cooling lubrication/i,
    title: "EJ20 SOHC Mechanical PDF",
    titleVi: "PDF cơ khí EJ20 SOHC",
    url: `${BASE_URL}/manuals/EJ20E-SOHC-engine/EJ20_SOHC_Mechanical.pdf`,
  },
  {
    match: /mechanical cooling lubrication|coolant|cooling/i,
    title: "EJ20 Cooling PDF",
    titleVi: "PDF làm mát EJ20",
    url: `${BASE_URL}/manuals/EJ20E-SOHC-engine/EJ20_Cooling.pdf`,
  },
  {
    match: /mechanical cooling lubrication|oil|lubrication/i,
    title: "EJ20 Lubrication PDF",
    titleVi: "PDF bôi trơn EJ20",
    url: `${BASE_URL}/manuals/EJ20E-SOHC-engine/EJ20_Lubrication.pdf`,
  },
  {
    match: /wiring electrical/i,
    title: "Service Manuals",
    titleVi: "Tài liệu kỹ thuật",
    url: `${BASE_URL}/manuals`,
  },
  {
    match: /drivetrain clutch awd|manual transmission/i,
    title: "Manual Transmission and Drivetrain Manuals",
    titleVi: "Tài liệu hộp số sàn và truyền động",
    url: `${BASE_URL}/manuals`,
  },
  {
    match: /suspension brakes steering hvac/i,
    title: "Chassis Service Manuals",
    titleVi: "Tài liệu khung gầm",
    url: `${BASE_URL}/manuals`,
  },
  {
    match: /parts diagram|parts master|parts interchange|consumables|wear|shared engine/i,
    title: "Parts Catalog",
    titleVi: "Catalogue phụ tùng",
    url: `${BASE_URL}/parts`,
  },
  {
    match: /maintenance parts/i,
    title: "Maintenance Guides",
    titleVi: "Hướng dẫn bảo dưỡng",
    url: `${BASE_URL}/maintenance`,
  },
  {
    match: /web deeplink|source map/i,
    title: "BG5P Site Index",
    titleVi: "Chỉ mục website BG5P",
    url: `${BASE_URL}/llms.txt`,
  },
];

let chunkCache: KnowledgeChunk[] | null = null;
let instructionCache: string | null = null;
let diagramRouteCache: DiagramRoute[] | null = null;
let maintenanceRouteCache: MaintenanceRoute[] | null = null;
let manualRouteCache: ManualRoute[] | null = null;
let partsRouteCache: Map<string, DiagramRoute> | null = null;

function walkFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
      continue;
    }
    if (!entry.isFile()) continue;
    if (!SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue;
    files.push(fullPath);
  }
  return files.sort((a, b) => a.localeCompare(b));
}

function readableTitle(filePath: string): string {
  const base = path.basename(filePath);
  return base
    .replace(/\.txt$/i, "")
    .replace(/\.md$/i, "")
    .replace(/\.csv$/i, "")
    .replace(/_/g, " ")
    .trim();
}

function tokenize(text: string): string[] {
  const matches = text
    .toLowerCase()
    .match(/[a-z0-9][a-z0-9.-]{1,}/g);
  if (!matches) return [];
  return Array.from(new Set(matches.filter((token) => token.length >= 2)));
}

function compactText(text: string): string {
  return text
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

function splitByMarkdownSections(text: string): string[] {
  const sections = text.split(/\n(?=#{1,3}\s+)/g);
  return sections.length > 1 ? sections : [text];
}

function splitCsv(text: string): string[] {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length <= 1) return [text];
  const header = lines[0];
  const chunks: string[] = [];
  for (let i = 1; i < lines.length; i += 42) {
    chunks.push([header, ...lines.slice(i, i + 42)].join("\n"));
  }
  return chunks;
}

function splitLongText(text: string): string[] {
  if (text.length <= CHUNK_SIZE) return [text];

  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const targetEnd = Math.min(text.length, start + CHUNK_SIZE);
    const nextBreak = text.lastIndexOf("\n\n", targetEnd);
    const end = nextBreak > start + 1200 ? nextBreak : targetEnd;
    chunks.push(text.slice(start, end).trim());
    if (end === text.length) break;
    start = Math.max(0, end - CHUNK_OVERLAP);
  }
  return chunks.filter(Boolean);
}

function buildChunksForFile(filePath: string): KnowledgeChunk[] {
  const relativePath = path.relative(KNOWLEDGE_DIR, filePath);
  const title = readableTitle(filePath);
  const raw = compactText(fs.readFileSync(filePath, "utf-8"));
  if (!raw) return [];

  const roughSections =
    path.extname(filePath).toLowerCase() === ".csv"
      ? splitCsv(raw)
      : splitByMarkdownSections(raw);

  const chunks: KnowledgeChunk[] = [];
  for (const section of roughSections) {
    for (const text of splitLongText(section)) {
      const id = `${relativePath}#${chunks.length + 1}`;
      const searchText = `${title}\n${text}`.toLowerCase();
      chunks.push({
        id,
        title,
        path: relativePath,
        text,
        searchText,
        tokens: new Set(tokenize(searchText)),
      });
    }
  }
  return chunks;
}

function loadChunks(): KnowledgeChunk[] {
  if (chunkCache) return chunkCache;

  const files = walkFiles(KNOWLEDGE_DIR).filter(
    (file) => path.basename(file) !== "manifest.json"
  );
  chunkCache = files.flatMap(buildChunksForFile);
  return chunkCache;
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function normalizeLookupText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function normalizePartNumber(part: string): string {
  return part.replace(/[^a-z0-9]/gi, "").toUpperCase();
}

function publicUrl(publicPath: string): string {
  const normalizedPath = publicPath.replace(/\\/g, "/").replace(/^\/+/, "");
  return `${BASE_URL}/${normalizedPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;
}

function loadDiagramRoutes(): DiagramRoute[] {
  if (diagramRouteCache) return diagramRouteCache;

  const sections = readJsonFile<
    Array<{
      slug: string;
      name: string;
      diagrams: Array<{ code: string; name: string; imagePath: string }>;
    }>
  >(path.join(DATA_DIR, "sections.json"), []);

  diagramRouteCache = sections.flatMap((section) =>
    section.diagrams.map((diagram) => ({
      code: diagram.code,
      name: diagram.name,
      sectionSlug: section.slug,
      sectionName: section.name,
      imagePath: diagram.imagePath,
    }))
  );

  return diagramRouteCache;
}

function loadMaintenanceRoutes(): MaintenanceRoute[] {
  if (maintenanceRouteCache) return maintenanceRouteCache;

  maintenanceRouteCache = readJsonFile<MaintenanceRoute[]>(
    path.join(DATA_DIR, "maintenance.json"),
    []
  );

  return maintenanceRouteCache;
}

function walkPublicFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkPublicFiles(fullPath));
      continue;
    }
    if (entry.isFile()) files.push(fullPath);
  }
  return files;
}

function loadManualRoutes(): ManualRoute[] {
  if (manualRouteCache) return manualRouteCache;

  const manualDir = path.join(PUBLIC_DIR, "manuals");
  manualRouteCache = walkPublicFiles(manualDir)
    .filter((filePath) => path.extname(filePath).toLowerCase() === ".pdf")
    .map((filePath) => {
      const relativePublicPath = path.relative(PUBLIC_DIR, filePath);
      return {
        filename: path.basename(filePath),
        url: publicUrl(relativePublicPath),
      };
    });

  return manualRouteCache;
}

function loadPartsRoutes(): Map<string, DiagramRoute> {
  if (partsRouteCache) return partsRouteCache;

  const partsByCategory = readJsonFile<Record<string, Array<{ oem_number?: string }>>>(
    path.join(DATA_DIR, "parts.json"),
    {}
  );
  const diagramsByCategory = new Map<string, DiagramRoute>();
  for (const diagram of loadDiagramRoutes()) {
    const category = diagram.code.split("_")[0];
    if (!diagramsByCategory.has(category)) diagramsByCategory.set(category, diagram);
  }

  partsRouteCache = new Map<string, DiagramRoute>();
  for (const [category, parts] of Object.entries(partsByCategory)) {
    const diagram = diagramsByCategory.get(category);
    if (!diagram) continue;
    for (const part of parts) {
      const partNumber = part.oem_number ? normalizePartNumber(part.oem_number) : "";
      if (partNumber && !partsRouteCache.has(partNumber)) {
        partsRouteCache.set(partNumber, diagram);
      }
    }
  }

  return partsRouteCache;
}

export function exactDiagramCode(query: string): string | null {
  const match = query.match(/(?:^|[^\d])(\d{3})[-_](\d{2})(?!\d)/i);
  if (!match) return null;

  const code = `${match[1]}_${match[2]}`;
  return loadDiagramRoutes().some((diagram) => diagram.code === code) ? code : null;
}

export function exactMaintenanceId(query: string): string | null {
  const normalizedQuery = normalizeLookupText(query);
  if (!normalizedQuery) return null;

  const routes = loadMaintenanceRoutes()
    .map((route) => ({
      ...route,
      normalizedId: normalizeLookupText(route.id),
      normalizedTitle: normalizeLookupText(route.title),
    }))
    .sort((a, b) => b.normalizedTitle.length - a.normalizedTitle.length);

  const paddedQuery = `-${normalizedQuery}-`;
  for (const route of routes) {
    if (
      paddedQuery.includes(`-${route.normalizedId}-`) ||
      paddedQuery.includes(`-${route.normalizedTitle}-`)
    ) {
      return route.id;
    }
  }

  return null;
}

export function loadChatInstructions(): string {
  if (instructionCache !== null) return instructionCache;

  const filePath = path.join(KNOWLEDGE_DIR, "GPT_INSTRUCTIONS.md");
  const instructions = fs.existsSync(filePath)
    ? fs.readFileSync(filePath, "utf-8").trim()
    : "";
  instructionCache = instructions;
  return instructions;
}

function scoreChunk(chunk: KnowledgeChunk, queryTokens: string[], query: string): number {
  if (queryTokens.length === 0) return 0;

  let score = 0;
  for (const token of queryTokens) {
    if (chunk.tokens.has(token)) score += token.length > 4 ? 3 : 1.5;
    if (chunk.title.toLowerCase().includes(token)) score += 2;
  }

  if (query.length >= 6 && chunk.searchText.includes(query)) score += 12;

  const partNumberMatches = query.match(/\b\d{5}[a-z0-9-]*\b/gi) ?? [];
  for (const part of partNumberMatches) {
    if (chunk.searchText.includes(part.toLowerCase())) score += 18;
  }

  const dtcMatch = query.match(/\b(?:dtc|code|flash(?:\s+code)?)\s*#?\s*(\d{2})\b/i);
  if (dtcMatch) {
    const code = dtcMatch[1];
    if (chunk.searchText.includes(`| ${code} |`)) score += 90;
    if (chunk.searchText.includes(`dtc ${code}`)) score += 90;
    if (chunk.searchText.includes(`code ${code}`)) score += 70;
    if (chunk.searchText.includes(`flash code ${code}`)) score += 70;
  }

  return score;
}

function extractPublicUrls(text: string): string[] {
  const matches = text.match(/https:\/\/bg5\.caphedigital\.com\/[^\s`|)]+/g) ?? [];
  return Array.from(new Set(matches.map((url) => url.replace(/[.,;]+$/, ""))));
}

function localizePublicTitle(title: string, locale: Locale): string {
  if (locale === "en") return title;
  if (title.includes(".pdf") || /\bPDF\b/i.test(title)) return localizeManualTitle(title, locale);
  return localizeTechnicalName(title, locale);
}

function titleForPublicUrl(chunk: KnowledgeChunk, url: string, locale: Locale): string {
  const line = chunk.text
    .split(/\r?\n/)
    .find((candidate) => candidate.includes(url));

  if (!line) return localizePublicTitle(readableUrlTitle(url), locale);

  const cells = line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim())
    .filter(Boolean);

  const title = cells.find((cell) => !cell.startsWith("http") && !/^-+$/.test(cell));
  return title
    ? localizePublicTitle(title.replace(/`/g, ""), locale)
    : localizePublicTitle(readableUrlTitle(url), locale);
}

function readableUrlTitle(url: string): string {
  const last = decodeURIComponent(url.split("/").filter(Boolean).at(-1) ?? url);
  return last.replace(/\.(pdf|txt|gif)$/i, "").replace(/[-_]/g, " ").trim() || url;
}

function exactManualFilename(query: string): ManualRoute | null {
  const normalizedQuery = query.toLowerCase();
  return (
    loadManualRoutes().find((manual) => {
      const filename = manual.filename.toLowerCase();
      const stem = filename.replace(/\.pdf$/i, "");
      return normalizedQuery.includes(filename) || normalizedQuery.includes(stem);
    }) ?? null
  );
}

function exactPartNumbers(query: string): string[] {
  const matches = query.match(/\b\d{5}[a-z0-9-]*\b/gi) ?? [];
  return Array.from(new Set(matches.map(normalizePartNumber).filter(Boolean)));
}

function routeForDiagramCode(code: string): DiagramRoute | null {
  return loadDiagramRoutes().find((diagram) => diagram.code === code) ?? null;
}

function specificLink(
  id: string,
  title: string,
  url: string,
  scoreOffset: number,
  locale: Locale
): PublicLinkSource {
  return {
    id,
    title: localizePublicTitle(title, locale),
    url,
    score: EXACT_LINK_SCORE - scoreOffset,
  };
}

function prioritizeSpecificPublicLinks(query: string, locale: Locale): PublicLinkSource[] {
  const links: PublicLinkSource[] = [];

  const diagramCode = exactDiagramCode(query);
  const diagram = diagramCode ? routeForDiagramCode(diagramCode) : null;
  if (diagram) {
    links.push(
      specificLink(
        `exact-diagram:${diagram.code}:page`,
        `${diagram.code} ${diagram.name}`,
        `${BASE_URL}/parts/${diagram.sectionSlug}/${diagram.code.replace(/_/g, "-")}`,
        links.length,
        locale
      )
    );
    links.push(
      specificLink(
        `exact-diagram:${diagram.code}:image`,
        `${diagram.code} diagram image`,
        publicUrl(diagram.imagePath),
        links.length,
        locale
      )
    );
  }

  const maintenanceId = exactMaintenanceId(query);
  const maintenance = maintenanceId
    ? loadMaintenanceRoutes().find((route) => route.id === maintenanceId)
    : null;
  if (maintenance) {
    links.push(
      specificLink(
        `exact-maintenance:${maintenance.id}:page`,
        maintenance.title,
        `${BASE_URL}/maintenance/${maintenance.id}`,
        links.length,
        locale
      )
    );
    links.push(
      specificLink(
        `exact-maintenance:${maintenance.id}:llms`,
        `${maintenance.title} LLM reference`,
        `${BASE_URL}/llms/maintenance/${maintenance.id}.txt`,
        links.length,
        locale
      )
    );
  }

  const manual = exactManualFilename(query);
  if (manual) {
    links.push(
      specificLink(
        `exact-manual:${manual.filename}`,
        manual.filename,
        manual.url,
        links.length,
        locale
      )
    );
  }

  const partsRoutes = loadPartsRoutes();
  for (const partNumber of exactPartNumbers(query)) {
    const partDiagram = partsRoutes.get(partNumber);
    if (!partDiagram) continue;
    links.push(
      specificLink(
        `exact-part:${partNumber}:diagram`,
        `${partNumber} diagram`,
        `${BASE_URL}/parts/${partDiagram.sectionSlug}/${partDiagram.code.replace(/_/g, "-")}`,
        links.length,
        locale
      )
    );
    links.push(
      specificLink(
        `exact-part:${partNumber}:section`,
        `${partDiagram.sectionName} parts`,
        `${BASE_URL}/parts/${partDiagram.sectionSlug}`,
        links.length,
        locale
      )
    );
  }

  const uniqueLinks = new Map<string, PublicLinkSource>();
  for (const link of links) {
    if (!uniqueLinks.has(link.url)) uniqueLinks.set(link.url, link);
  }

  return Array.from(uniqueLinks.values());
}

function publicLinksForInternalSource(source: KnowledgeSource, locale: Locale): PublicLinkSource[] {
  const haystack = `${source.title}\n${source.path}`.toLowerCase();
  return INTERNAL_SOURCE_LINKS
    .filter((candidate) => candidate.match.test(haystack))
    .map((candidate) => ({
      id: `${source.id}:${candidate.url}`,
      title: locale === "vi" ? candidate.titleVi : candidate.title,
      url: candidate.url,
      score: source.score,
    }));
}

export function retrievePublicLinks(
  query: string,
  internalSources: KnowledgeSource[],
  locale: Locale = "en"
): PublicLinkSource[] {
  const normalizedQuery = query.trim().toLowerCase();
  const queryTokens = tokenize(normalizedQuery);
  const links = new Map<string, PublicLinkSource>();

  for (const link of prioritizeSpecificPublicLinks(query, locale)) {
    links.set(link.url, link);
  }

  for (const source of internalSources) {
    for (const link of publicLinksForInternalSource(source, locale)) {
      const existing = links.get(link.url);
      if (!existing || link.score > existing.score) links.set(link.url, link);
    }
  }

  const sitemapLinks = loadChunks()
    .filter(
      (chunk) =>
        chunk.path === "11_BG5P_Web_Deeplink_Sitemap.md" ||
        chunk.path === "00_BG5P_Diagnostic_Expert_Source_Map.md"
    )
    .map((chunk) => ({ chunk, score: scoreChunk(chunk, queryTokens, normalizedQuery) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  for (const { chunk, score } of sitemapLinks) {
    for (const url of extractPublicUrls(chunk.text).slice(0, 4)) {
      const existing = links.get(url);
      if (!existing || score > existing.score) {
        links.set(url, {
          id: `${chunk.id}:${url}`,
          title: titleForPublicUrl(chunk, url, locale),
          url,
          score,
        });
      }
    }
  }

  return Array.from(links.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

export function retrieveKnowledge(query: string): {
  context: string;
  sources: KnowledgeSource[];
} {
  const normalizedQuery = query.trim().toLowerCase();
  const queryTokens = tokenize(normalizedQuery);

  const ranked = loadChunks()
    .map((chunk) => ({ chunk, score: scoreChunk(chunk, queryTokens, normalizedQuery) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_CHUNKS);

  let usedChars = 0;
  const contextParts: string[] = [];
  const sourceMap = new Map<string, KnowledgeSource>();

  for (const { chunk, score } of ranked) {
    const block = `INTERNAL CONTEXT TITLE: ${chunk.title}\nINTERNAL PATH (do not cite to users): ${chunk.path}\n${chunk.text}`;
    if (usedChars + block.length > MAX_CONTEXT_CHARS && contextParts.length > 0) {
      continue;
    }
    usedChars += block.length;
    contextParts.push(block);

    const key = `${chunk.title}|${chunk.path}`;
    const existing = sourceMap.get(key);
    if (!existing || score > existing.score) {
      sourceMap.set(key, {
        id: chunk.id,
        title: chunk.title,
        path: chunk.path,
        score,
      });
    }
  }

  return {
    context: contextParts.join("\n\n---\n\n"),
    sources: Array.from(sourceMap.values()).sort((a, b) => b.score - a.score),
  };
}
