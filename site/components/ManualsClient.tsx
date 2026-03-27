"use client";

import { useState, useMemo } from "react";

export interface PdfEntry {
  name: string;
  href: string;
  size: string;
  bytes: number;
}

export interface SubSection {
  name: string;
  anchor: string;
  pdfs: PdfEntry[];
}

export interface ChassisSection {
  name: string;
  description: string;
  subsections: SubSection[];
}

function PdfIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-red-400"
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

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
      />
    </svg>
  );
}

interface Props {
  enginePdfs: PdfEntry[];
  chassisSections: ChassisSection[];
  totalCount: number;
}

export default function ManualsClient({
  enginePdfs,
  chassisSections,
  totalCount,
}: Props) {
  const [filter, setFilter] = useState("");
  // Track open state for sections and subsections independently
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [openSubs, setOpenSubs] = useState<Record<string, boolean>>({});

  const q = filter.trim().toLowerCase();

  const filteredEngine = useMemo(
    () => (q ? enginePdfs.filter((p) => p.name.toLowerCase().includes(q)) : enginePdfs),
    [enginePdfs, q]
  );

  const filteredChassis = useMemo(() => {
    if (!q) return chassisSections;
    return chassisSections
      .map((section) => {
        const sectionHit =
          section.name.toLowerCase().includes(q) ||
          section.description.toLowerCase().includes(q);
        const filteredSubs = section.subsections
          .map((sub) => {
            const subHit = sectionHit || sub.name.toLowerCase().includes(q);
            const filteredPdfs = subHit
              ? sub.pdfs
              : sub.pdfs.filter((p) => p.name.toLowerCase().includes(q));
            return { ...sub, pdfs: filteredPdfs };
          })
          .filter((sub) => sub.pdfs.length > 0);
        return { ...section, subsections: filteredSubs };
      })
      .filter((s) => s.subsections.length > 0);
  }, [chassisSections, q]);

  function toggleSection(name: string) {
    setOpenSections((prev) => ({ ...prev, [name]: !prev[name] }));
  }

  function toggleSub(key: string) {
    setOpenSubs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function isSectionOpen(name: string) {
    return q ? true : !!openSections[name];
  }

  function isSubOpen(key: string) {
    return q ? true : !!openSubs[key];
  }

  const noResults =
    q && filteredEngine.length === 0 && filteredChassis.length === 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Filter */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={`Filter ${totalCount} documents…`}
          className="w-full rounded-md border border-border bg-background pl-9 pr-10 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
        />
        {filter && (
          <button
            onClick={() => setFilter("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors text-sm"
            aria-label="Clear filter"
          >
            ✕
          </button>
        )}
      </div>

      {noResults && (
        <p className="text-sm text-muted text-center py-4">
          No documents matching &ldquo;{filter}&rdquo;
        </p>
      )}

      {/* ── EJ20E Engine Manuals ── */}
      {filteredEngine.length > 0 && (
        <section>
          <div className="mb-3">
            <h2 className="text-xl font-semibold text-foreground">
              EJ20E Engine Manuals
            </h2>
            <p className="mt-1 text-sm text-muted">
              {filteredEngine.length} document{filteredEngine.length !== 1 ? "s" : ""}{" "}
              — EJ20 2.0L SOHC NA engine
            </p>
          </div>
          <ul className="flex flex-col divide-y divide-border border border-border rounded-lg overflow-hidden">
            {filteredEngine.map((pdf) => (
              <li key={pdf.href}>
                <a
                  href={pdf.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 px-4 py-3 bg-surface hover:bg-white/5 transition-colors"
                >
                  <PdfIcon />
                  <span className="flex-1 text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                    {pdf.name}
                  </span>
                  <span className="text-xs text-muted whitespace-nowrap">{pdf.size}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── BG Chassis Manuals ── */}
      {filteredChassis.length > 0 && (
        <section>
          <div className="mb-3">
            <h2 className="text-xl font-semibold text-foreground">
              BG Chassis Manuals
            </h2>
            <p className="mt-1 text-sm text-muted">
              {chassisSections.reduce(
                (n, s) =>
                  n + s.subsections.reduce((m, sub) => m + sub.pdfs.length, 0),
                0
              )}{" "}
              documents — body, electrical, mechanical, transmission &amp; wiring
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {filteredChassis.map((section) => {
              const sectionOpen = isSectionOpen(section.name);
              const sectionPdfCount = section.subsections.reduce(
                (n, sub) => n + sub.pdfs.length,
                0
              );

              return (
                <div
                  key={section.name}
                  className="rounded-lg border border-border overflow-hidden"
                >
                  {/* Level 1: section header */}
                  <button
                    onClick={() => toggleSection(section.name)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-surface hover:bg-white/5 transition-colors text-left"
                  >
                    <ChevronIcon open={sectionOpen} />
                    <div className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold text-foreground">
                        {section.name
                          .toLowerCase()
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                      <span className="block text-xs text-muted mt-0.5">
                        {section.description}
                      </span>
                    </div>
                    <span className="text-xs text-muted whitespace-nowrap shrink-0">
                      {sectionPdfCount} docs
                    </span>
                  </button>

                  {/* Level 2: subsections */}
                  {sectionOpen && (
                    <div className="border-t border-border divide-y divide-border">
                      {section.subsections.map((sub) => {
                        const subKey = `${section.name}/${sub.name}`;
                        const subOpen = isSubOpen(subKey);

                        return (
                          <div key={sub.name} id={sub.anchor}>
                            {/* Subsection header */}
                            <button
                              onClick={() => toggleSub(subKey)}
                              className="w-full flex items-center gap-3 pl-8 pr-4 py-2.5 bg-background/40 hover:bg-white/5 transition-colors text-left"
                            >
                              <ChevronIcon open={subOpen} />
                              <span className="flex-1 text-xs font-semibold text-foreground uppercase tracking-wide">
                                {sub.name}
                              </span>
                              <span className="text-xs text-muted whitespace-nowrap shrink-0">
                                {sub.pdfs.length} docs
                              </span>
                            </button>

                            {/* PDF list */}
                            {subOpen && (
                              <ul className="divide-y divide-border/50 border-t border-border/50">
                                {sub.pdfs.map((pdf) => (
                                  <li key={pdf.href}>
                                    <a
                                      href={pdf.href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="group flex items-center gap-3 pl-12 pr-4 py-2.5 hover:bg-white/5 transition-colors"
                                    >
                                      <PdfIcon />
                                      <span className="flex-1 text-sm text-foreground group-hover:text-accent transition-colors">
                                        {pdf.name}
                                      </span>
                                      <span className="text-xs text-muted whitespace-nowrap shrink-0">
                                        {pdf.size}
                                      </span>
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
