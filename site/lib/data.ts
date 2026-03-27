import fs from 'fs';
import path from 'path';

// Type definitions
export interface Diagram {
  code: string;
  name: string;
  filename: string;
  imagePath: string;
}

export interface Section {
  slug: string;
  name: string;
  folderName: string;
  diagramCount: number;
  diagrams: Diagram[];
}

export interface Part {
  oem_number: string;
  quantity: string;
  production_period: string;
  applies_for_models: string;
  notes: string;
  replacements: string;
  group_code: string;
  group_name: string;
}

export interface MaintenanceCard {
  id: string;
  title: string;
  difficulty: string;
  interval: string;
  specs: { label: string; value: string }[];
  steps: string[];
  relatedPdfs: string[];
  relatedDiagrams: string[];
}

const dataDir = path.join(process.cwd(), 'public', 'data');

export function getSections(): Section[] {
  const raw = fs.readFileSync(path.join(dataDir, 'sections.json'), 'utf-8');
  return JSON.parse(raw);
}

export function getSectionBySlug(slug: string): Section | undefined {
  return getSections().find(s => s.slug === slug);
}

export function getParts(categoryCode: string): Part[] {
  const raw = fs.readFileSync(path.join(dataDir, 'parts.json'), 'utf-8');
  const all = JSON.parse(raw);
  return all[categoryCode] || [];
}

export function getMaintenanceCards(): MaintenanceCard[] {
  const raw = fs.readFileSync(path.join(dataDir, 'maintenance.json'), 'utf-8');
  return JSON.parse(raw);
}

export function getMaintenanceCardById(id: string): MaintenanceCard | undefined {
  return getMaintenanceCards().find(c => c.id === id);
}

export function getDiagramSectionSlug(code: string): string | undefined {
  for (const s of getSections()) {
    if (s.diagrams.some(d => d.code === code)) return s.slug;
  }
  return undefined;
}

export function getMaintenanceCardsByDiagram(diagramCode: string): MaintenanceCard[] {
  return getMaintenanceCards().filter(c => c.relatedDiagrams.includes(diagramCode));
}

export function getPdfTitle(filename: string): string {
  try {
    const titlesPath = path.join(process.cwd(), 'public', 'data', 'manual-titles.json');
    const titles: Record<string, string> = JSON.parse(fs.readFileSync(titlesPath, 'utf-8'));
    if (titles[filename]) return titles[filename];
  } catch {}
  // Fallback for engine PDFs which have descriptive filenames
  let name = filename.replace(/\.pdf$/i, '');
  name = name.replace(/_/g, ' ');
  name = name.replace(/\bno OBD\b/, '(no OBD)');
  return name.trim();
}
