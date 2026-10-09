import Fuse, { type IFuseOptions } from "fuse.js";

export interface SearchItem {
  type: "diagram" | "part" | "manual";
  label: string; // display text
  detail?: string; // secondary info (section name, group name, etc.)
  keywords?: string; // hidden bilingual terms for retrieval
  sectionSlug?: string;
  diagramCode?: string; // with dashes for URL
  oemNumber?: string;
  href?: string; // direct URL for manuals
}

const fuseOptions: IFuseOptions<SearchItem> = {
  keys: [
    { name: "label", weight: 0.4 },
    { name: "oemNumber", weight: 0.35 },
    { name: "detail", weight: 0.2 },
    { name: "keywords", weight: 0.2 },
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
  const normalized = query.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const results = [
    ...fuse.search(normalized, { limit: 10 }),
    ...fuse.search(query.trim(), { limit: 10 }),
  ];
  const unique = new Map<string, SearchItem>();
  for (const result of results)
    unique.set(
      result.item.href ||
        `${result.item.sectionSlug}/${result.item.diagramCode}/${result.item.label}`,
      result.item,
    );
  return Array.from(unique.values())
    .sort(
      (a, b) =>
        Number(b.oemNumber === normalized) - Number(a.oemNumber === normalized),
    )
    .slice(0, 10);
}
