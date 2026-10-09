import fs from "node:fs";
import path from "node:path";
import type { SourcingData, SourcingPart } from "./sourcing-types";
export const normalizeNumber = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, "");
export function getSourcing(): SourcingData {
  return JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "public/data/sourcing.json"),
      "utf8",
    ),
  );
}
export function findParts(
  data: SourcingData,
  query: string,
  filters: {
    section?: string;
    status?: string;
    position?: string;
    configuration?: string;
  } = {},
): { part: SourcingPart; match: "exact" | "related" | "name" }[] {
  const q = query.trim().toLowerCase();
  const n = normalizeNumber(q);
  const relations = n
    ? data.relationships.filter(
        (r) => normalizeNumber(r.from) === n || normalizeNumber(r.to) === n,
      )
    : [];
  const related = new Set(
    relations.flatMap((r) => [normalizeNumber(r.from), normalizeNumber(r.to)]),
  );
  return data.parts
    .flatMap((part) => {
      if (filters.section && part.section !== filters.section) return [];
      if (filters.status && part.fitment.status !== filters.status) return [];
      // Unknown positions remain visible when a position is selected.
      if (
        filters.position &&
        part.position !== "unknown" &&
        part.position !== filters.position
      )
        return [];
      if (filters.configuration === "source-variants" && !part.catalog)
        return [];
      if (
        filters.configuration === "owner-candidates" &&
        part.fitment.status === "rejected"
      )
        return [];
      const exact =
        !!n &&
        (part.normalized_number === n ||
          part.aliases.some((a) => normalizeNumber(a) === n));
      const relation = related.has(part.normalized_number);
      const words =
        `${part.name} ${part.name_vi} ${part.search_terms.join(" ")} ${part.number} ${part.catalog?.applies_for_models ?? ""} ${part.shared_applications.join(" ")}`.toLowerCase();
      if (q && !exact && !relation && !words.includes(q)) return [];
      return [
        {
          part,
          match: exact
            ? ("exact" as const)
            : relation
              ? ("related" as const)
              : ("name" as const),
        },
      ];
    })
    .sort(
      (a, b) =>
        ["exact", "related", "name"].indexOf(a.match) -
        ["exact", "related", "name"].indexOf(b.match),
    );
}

export const procedureAliases: Record<string, string[]> = {
  "oil-change": ["engine oil", "oil change", "dầu động cơ", "thay dầu máy"],
  "timing-belt": ["timing", "dây cam", "dây đai cam"],
  "coolant-flush": ["coolant", "nước làm mát"],
  "brake-pads": ["brake", "front pads", "pad", "phanh", "má phanh"],
  "spark-plugs": ["spark", "bugi"],
  "air-filter": ["air filter", "air cleaner", "lọc gió"],
  "transmission-fluid": ["transmission", "gearbox oil", "hộp số", "dầu hộp số"],
  clutch: ["clutch", "ly hợp", "côn"],
  "differential-fluid": ["differential", "vi sai"],
};
export const matchesPhrase = (query: string, phrase: string) =>
  ` ${query.toLowerCase().replace(/[^\p{L}\p{N}.-]+/gu, " ")} `.includes(
    ` ${phrase.toLowerCase()} `,
  ) || ` ${query.toLowerCase()} `.includes(` ${phrase.toLowerCase()}s `);

export function resolveSourcingParts(
  data: SourcingData,
  query: string,
): SourcingPart[] {
  const found = new Map<string, SourcingPart>();
  const add = (term: string) => {
    for (const { part } of findParts(data, term)) found.set(part.id, part);
  };
  add(query);
  // Explicit tokens keep relationship lookup directed and nontransitive.
  for (const token of query.match(
    /[A-Za-z0-9][A-Za-z0-9.-]*(?: [0-9]{2} [0-9]{3})?/g,
  ) ?? [])
    if (/\d/.test(token)) add(token);
  for (const term of new Set(data.parts.flatMap((p) => p.search_terms)))
    if (matchesPhrase(query, term)) add(term);
  const brake =
    procedureAliases["brake-pads"].some((term) => matchesPhrase(query, term)) ||
    /rotor|caliper|D722|P.?78.?009/i.test(query);
  if (brake)
    for (const p of data.parts.filter(
      (p) =>
        !p.catalog &&
        [
          "09.5673.11",
          "P 78 009",
          "P 78 004",
          "14.A686.10",
          "US-277-FRONT",
          "P 78 005",
        ].includes(p.number),
    ))
      found.set(p.id, p);
  return [...found.values()]
    .sort((a, b) => Number(!!a.catalog) - Number(!!b.catalog))
    .slice(0, 10);
}
