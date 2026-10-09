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
        `${part.name} ${part.name_vi} ${part.number} ${part.catalog?.applies_for_models ?? ""} ${part.shared_applications.join(" ")}`.toLowerCase();
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
