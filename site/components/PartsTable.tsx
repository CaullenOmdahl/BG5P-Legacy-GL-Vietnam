'use client';

import { useState, useMemo } from 'react';
import type { Part } from '@/lib/data';

interface PartsTableProps {
  parts: Part[];
}

export default function PartsTable({ parts }: PartsTableProps) {
  const [sortAsc, setSortAsc] = useState(true);

  // Group parts by group_name, then sort within groups
  const grouped = useMemo(() => {
    const sorted = [...parts].sort((a, b) => {
      const cmp = a.oem_number.localeCompare(b.oem_number);
      return sortAsc ? cmp : -cmp;
    });

    const groups: { name: string; parts: Part[] }[] = [];
    const map = new Map<string, Part[]>();

    for (const part of sorted) {
      const key = part.group_name || '';
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(part);
    }

    for (const [name, groupParts] of map) {
      groups.push({ name, parts: groupParts });
    }

    return groups;
  }, [parts, sortAsc]);

  if (parts.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6 text-center">
        <p className="text-muted text-sm">
          Parts data not yet available — extraction in progress
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              <th
                className="px-3 py-3 text-left font-semibold text-foreground cursor-pointer hover:text-accent transition-colors select-none"
                onClick={() => setSortAsc((prev) => !prev)}
              >
                OEM Part Number{' '}
                <span className="text-muted text-xs">
                  {sortAsc ? '\u25B2' : '\u25BC'}
                </span>
              </th>
              <th className="px-3 py-2 text-left font-semibold text-foreground">
                Qty
              </th>
              <th className="px-3 py-2 text-left font-semibold text-foreground hidden md:table-cell">
                Production Period
              </th>
              <th className="px-3 py-2 text-left font-semibold text-foreground hidden lg:table-cell">
                Models
              </th>
              <th className="px-3 py-2 text-left font-semibold text-foreground hidden md:table-cell">
                Notes
              </th>
              <th className="px-3 py-2 text-left font-semibold text-foreground hidden lg:table-cell">
                Replacements
              </th>
            </tr>
          </thead>
          <tbody>
            {grouped.map((group) => (
              <GroupRows key={group.name} group={group} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GroupRows({ group }: { group: { name: string; parts: Part[] } }) {
  return (
    <>
      {group.name && (
        <tr className="border-b border-border">
          <td
            colSpan={6}
            className="px-3 py-2 text-xs font-semibold text-accent uppercase tracking-wide bg-background/50"
          >
            {group.name}
          </td>
        </tr>
      )}
      {group.parts.map((part, i) => (
        <tr
          key={`${part.oem_number}-${i}`}
          className="border-b border-border last:border-b-0 hover:bg-white/[0.02] transition-colors"
        >
          <td className="px-3 py-2">
            <span className="part-number text-foreground">{part.oem_number}</span>
          </td>
          <td className="px-3 py-2 text-muted">{part.quantity}</td>
          <td className="px-3 py-2 text-muted hidden md:table-cell">
            {part.production_period || '\u2014'}
          </td>
          <td className="px-3 py-2 text-muted hidden lg:table-cell">
            {part.applies_for_models || '\u2014'}
          </td>
          <td className="px-3 py-2 text-muted hidden md:table-cell">
            {part.notes || '\u2014'}
          </td>
          <td className="px-3 py-2 text-muted hidden lg:table-cell">
            {part.replacements || '\u2014'}
          </td>
        </tr>
      ))}
    </>
  );
}
