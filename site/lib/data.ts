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
