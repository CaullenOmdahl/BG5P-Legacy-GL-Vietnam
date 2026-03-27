'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import { createSearchIndex, search, type SearchItem } from '@/lib/search';

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
              label: section.name,
              detail: 'Section',
              sectionSlug: section.slug,
              diagramCode: firstDiagram.code.replace(/_/g, '-'),
            });
          }

          // Add each diagram
          for (const diagram of section.diagrams) {
            items.push({
              type: 'diagram',
              label: diagram.name,
              detail: section.name,
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
            const diagramCode = categoryCode.replace(/_/g, '-');

            for (const section of sections) {
              const matchingDiagram = section.diagrams.find(
                (d) => d.code === categoryCode
              );
              if (matchingDiagram) {
                sectionSlug = section.slug;
                break;
              }
            }

            for (const part of parts) {
              if (!part.oem_number) continue;
              items.push({
                type: 'part',
                label: part.oem_number,
                detail: part.group_name || '',
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
              label: m.label,
              detail: m.detail,
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
  }, []);

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
    <div ref={containerRef} className="relative w-full sm:max-w-sm">
      <div className="relative">
        {/* Magnifying glass icon */}
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none"
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
          placeholder="Search diagrams, parts, manuals..."
          className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-1.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
          aria-label="Search diagrams and parts"
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
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto rounded-md border border-border bg-surface shadow-lg"
        >
          {results.length === 0 ? (
            <li className="px-3 py-3 text-sm text-muted text-center">
              No results
            </li>
          ) : (
            results.map((item, index) => (
              <li
                key={`${item.type}-${item.href ?? `${item.sectionSlug}-${item.diagramCode}-${item.oemNumber ?? index}`}`}
                id={`search-result-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer text-sm transition-colors ${
                  index === activeIndex
                    ? 'bg-accent/15 text-foreground'
                    : 'text-foreground hover:bg-white/5'
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
