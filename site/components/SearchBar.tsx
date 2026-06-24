'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import { createSearchIndex, search, type SearchItem } from '@/lib/search';
import { useLocale } from '@/components/LocaleProvider';
import {
  getCopy,
  localizeManualTitle,
  localizePartText,
  localizeSectionName,
  localizeTechnicalName,
} from '@/lib/i18n';

interface Section {
  slug: string;
  name: string;
  diagrams: {
    code: string;
    name: string;
  }[];
}

interface PartEntry {
  oem_number: string;
  group_name: string;
}

export default function SearchBar() {
  const router = useRouter();
  const { locale } = useLocale();
  const text = getCopy(locale).components.search;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const fuseRef = useRef<Fuse<SearchItem> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build the search index on mount
  useEffect(() => {
    async function buildIndex() {
      const items: SearchItem[] = [];

      try {
        const sectionsRes = await fetch('/data/sections.json');
        const sections: Section[] = await sectionsRes.json();

        for (const section of sections) {
          // Add section itself as a searchable item (link to first diagram)
          if (section.diagrams.length > 0) {
            const firstDiagram = section.diagrams[0];
            items.push({
              type: 'diagram',
              label: localizeSectionName(section.name, locale),
              detail: text.section,
              keywords: `${section.name} ${localizeSectionName(section.name, locale)} ${firstDiagram.code}`,
              sectionSlug: section.slug,
              diagramCode: firstDiagram.code.replace(/_/g, '-'),
            });
          }

          // Add each diagram
          for (const diagram of section.diagrams) {
            const localizedDiagramName = localizeTechnicalName(diagram.name, locale);
            const localizedSectionName = localizeSectionName(section.name, locale);
            items.push({
              type: 'diagram',
              label: localizedDiagramName,
              detail: localizedSectionName,
              keywords: `${diagram.name} ${localizedDiagramName} ${section.name} ${localizedSectionName} ${diagram.code}`,
              sectionSlug: section.slug,
              diagramCode: diagram.code.replace(/_/g, '-'),
            });
          }
        }

        // Load parts if available
        const partsRes = await fetch('/data/parts.json');
        const partsData: Record<string, PartEntry[]> = await partsRes.json();

        if (partsData && typeof partsData === 'object') {
          for (const [categoryCode, parts] of Object.entries(partsData)) {
            if (!Array.isArray(parts)) continue;

            let sectionSlug = '';
            let diagramCode = categoryCode.replace(/_/g, '-');

            // Find matching section and diagram for this category
            for (const section of sections) {
              const matchingDiagram = section.diagrams.find(
                (d) => d.code === categoryCode || d.code.startsWith(categoryCode + '_')
              );
              if (matchingDiagram) {
                sectionSlug = section.slug;
                // If the category code doesn't have a suffix, use the first matching full diagram code
                if (categoryCode.length === 3) {
                  diagramCode = matchingDiagram.code.replace(/_/g, '-');
                }
                break;
              }
            }

            // Skip if we couldn't find a section (to avoid broken links)
            if (!sectionSlug) continue;

            // Add the category code itself as a searchable item
            if (categoryCode.length === 3) {
              const categoryName = parts[0]?.group_name || text.category;
              const localizedCategoryName = localizePartText(categoryName, locale);
              items.push({
                type: 'diagram',
                label: `${categoryCode} - ${localizedCategoryName}`,
                detail: text.category,
                keywords: `${categoryCode} ${categoryName} ${localizedCategoryName}`,
                sectionSlug,
                diagramCode,
              });
            }

            for (const part of parts) {
              if (!part.oem_number) continue;
              items.push({
                type: 'part',
                label: part.oem_number,
                detail: localizePartText(part.group_name, locale),
                keywords: `${part.oem_number} ${part.group_name || ''} ${localizePartText(part.group_name, locale)}`,
                sectionSlug,
                diagramCode,
                oemNumber: part.oem_number,
              });
            }
          }
        }

        // Load manuals index
        const manualsRes = await fetch('/api/manuals');
        if (manualsRes.ok) {
          const manuals: { label: string; detail: string; href: string; isPdf: boolean }[] =
            await manualsRes.json();
          for (const m of manuals) {
            items.push({
              type: 'manual',
              label: localizeManualTitle(m.label, locale),
              detail: localizeTechnicalName(m.detail, locale),
              keywords: `${m.label} ${m.detail} ${localizeManualTitle(m.label, locale)}`,
              href: m.href,
            });
          }
        }
      } catch {
        // Data files may not exist yet; silently fail
      }

      fuseRef.current = createSearchIndex(items);
    }

    buildIndex();
  }, [locale, text.category, text.section]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    setActiveIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim() || value.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      if (fuseRef.current) {
        const hits = search(fuseRef.current, value);
        setResults(hits);
        setIsOpen(true);
      }
    }, 300);
  }, []);

  function navigateToResult(item: SearchItem) {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    if (item.type === 'manual' && item.href) {
      if (item.href.toLowerCase().endsWith('.pdf')) {
        window.open(item.href, '_blank', 'noopener,noreferrer');
      } else {
        router.push(item.href);
      }
    } else {
      router.push(`/parts/${item.sectionSlug}/${item.diagramCode}`);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || results.length === 0) {
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < results.length) {
          navigateToResult(results[activeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        {/* Magnifying glass icon */}
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
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
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={text.placeholder}
          className="h-11 w-full rounded-md border border-border bg-surface/85 pl-10 pr-3 text-sm text-foreground shadow-inner shadow-black/10 transition-colors placeholder:text-muted/70 focus:border-accent focus:outline-none"
          aria-label={text.aria}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          role="combobox"
          aria-controls="search-results"
          aria-activedescendant={
            activeIndex >= 0 ? `search-result-${activeIndex}` : undefined
          }
        />
      </div>

      {/* Results dropdown */}
      {isOpen && (
        <ul
          id="search-results"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-md border border-border bg-panel shadow-2xl shadow-black/40"
        >
          {results.length === 0 ? (
            <li className="px-3 py-3 text-sm text-muted text-center">
              {text.noResults}
            </li>
          ) : (
            results.map((item, index) => (
              <li
                key={`${item.type}-${item.href ?? `${item.sectionSlug}-${item.diagramCode}-${item.oemNumber ?? index}`}`}
                id={`search-result-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                className={`flex cursor-pointer items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                  index === activeIndex
                    ? 'bg-accent/15 text-foreground'
                    : 'text-foreground hover:bg-surface'
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  navigateToResult(item);
                }}
                onMouseEnter={() => setActiveIndex(index)}
              >
                {/* Icon */}
                {item.type === 'manual' ? (
                  <svg
                    className="h-4 w-4 shrink-0 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                ) : item.type === 'diagram' ? (
                  <svg
                    className="h-4 w-4 shrink-0 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-4 w-4 shrink-0 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.42 15.17l-5.384-3.844M15.75 21H8.25A2.25 2.25 0 016 18.75V5.25A2.25 2.25 0 018.25 3h7.5A2.25 2.25 0 0118 5.25v13.5A2.25 2.25 0 0115.75 21zM12 9.75h.008v.008H12V9.75z"
                    />
                  </svg>
                )}

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {item.oemNumber ? (
                      <span className="part-number text-accent">
                        {item.oemNumber}
                      </span>
                    ) : (
                      <span className="truncate font-medium">{item.label}</span>
                    )}
                  </div>
                  {item.detail && (
                    <p className="truncate text-xs text-muted mt-0.5">
                      {item.oemNumber ? item.detail : item.detail}
                    </p>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
