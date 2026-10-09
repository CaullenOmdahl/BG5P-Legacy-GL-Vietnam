export interface Evidence {
  id: string;
  publisher: string;
  source_type: string;
  url: string | null;
  document_id: string | null;
  location: string;
  fact: string;
  checked_date: string | null;
  variant: string;
  contradictions: string[];
}
export interface Relationship {
  id: string;
  type: string;
  from: string;
  to: string;
  status: string;
  evidence: string[];
  conditions: string;
  direction: string;
  checked_date: string | null;
  unresolved: string[];
}
export interface SourcingPart {
  id: string;
  number: string;
  normalized_number: string;
  aliases: string[];
  name: string;
  name_vi: string;
  search_terms: string[];
  category: string;
  section: string;
  section_name: string;
  position: string;
  catalog: Record<string, string> | null;
  provenance: Record<string, string>;
  constraints: Record<string, string>;
  quantity: {
    catalog_value: string | null;
    per_car: number | null;
    order_unit: string;
    units_per_pack: number | null;
    note?: string;
  };
  dimensions: { label: string; value: number; unit: string; source: string }[];
  interfaces: string[];
  diagram_callout: string | null;
  fitment: {
    target: string;
    status: string;
    evidence: string[];
    exclusions: string[];
    unresolved: string[];
  };
  shared_applications: string[];
  offers: {
    seller: string;
    manufacturer_sku: string;
    url: string;
    availability: string;
    checked_date: string;
    order_unit: string;
    price: number | null;
    currency: string | null;
    shipping: string | null;
    tax: string | null;
    returns: string | null;
    disclaimer: string;
  }[];
}
export interface SourcingData {
  schema_version: number;
  content_version: string;
  checked_date: string;
  compatibility: string;
  vehicle: {
    id: string;
    facts: Record<
      string,
      { value: string | number | null; source: string; status: string }
    >;
    suffix_p: string;
  };
  parts: SourcingPart[];
  relationships: Relationship[];
  evidence: Evidence[];
  manuals: {
    id: string;
    path: string;
    title: string;
    market: string;
    year: string;
    applicability: string;
    reviewed_pages: number[];
    review_status: string;
    description: string;
  }[];
  coverage: {
    section: string;
    diagrams: number;
    catalog_rows: number;
    reviewed_claims: number;
    confirmed_fits: number;
  }[];
}
