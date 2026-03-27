import Fuse, { type IFuseOptions } from 'fuse.js';

export interface SearchItem {
  type: 'diagram' | 'part' | 'manual';
  label: string;        // display text
  detail?: string;      // secondary info (section name, group name, etc.)
  sectionSlug?: string;
  diagramCode?: string; // with dashes for URL
  oemNumber?: string;
  href?: string;        // direct URL for manuals
}

const fuseOptions: IFuseOptions<SearchItem> = {
  keys: [
    { name: 'label', weight: 0.4 },
    { name: 'oemNumber', weight: 0.35 },
    { name: 'detail', weight: 0.25 },
  ],
  threshold: 0.35,
  includeScore: true,
  minMatchCharLength: 2,
};

export function createSearchIndex(items: SearchItem[]): Fuse<SearchItem> {
  return new Fuse(items, fuseOptions);
}

export function search(fuse: Fuse<SearchItem>, query: string): SearchItem[] {
  if (!query || query.trim().length < 2) return [];
  const results = fuse.search(query.trim(), { limit: 10 });
  return results.map((r) => r.item);
}
