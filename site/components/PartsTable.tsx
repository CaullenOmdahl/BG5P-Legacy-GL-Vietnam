'use client';

import { useState, useMemo } from 'react';
import type { Part } from '@/lib/data';
import { useLocale } from '@/components/LocaleProvider';
import { getCopy, localizePartText } from '@/lib/i18n';

interface PartsTableProps {
  parts: Part[];
  emptyMessage?: string;
}

export default function PartsTable({ parts, emptyMessage }: PartsTableProps) {
  const { locale } = useLocale();
  const text = getCopy(locale).components.partsTable;
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
          {emptyMessage ?? text.empty}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              <th
                className="px-3 py-3 text-left font-semibold text-foreground cursor-pointer hover:text-accent transition-colors select-none"
                onClick={() => setSortAsc((prev) => !prev)}
              >
                {text.oemPartNumber}{' '}
                <span className="text-muted text-xs">
                  {sortAsc ? '\u25B2' : '\u25BC'}
                </span>
              </th>
              <th className="px-3 py-2 text-left font-semibold text-foreground">
                {text.quantity}
              </th>
              <th className="px-3 py-2 text-left font-semibold text-foreground hidden md:table-cell">
                {text.productionPeriod}
              </th>
              <th className="px-3 py-2 text-left font-semibold text-foreground hidden lg:table-cell">
                {text.models}
              </th>
              <th className="px-3 py-2 text-left font-semibold text-foreground hidden md:table-cell">
                {text.notes}
              </th>
              <th className="px-3 py-2 text-left font-semibold text-foreground hidden lg:table-cell">
                {text.replacements}
              </th>
            </tr>
          </thead>
          <tbody>
            {grouped.map((group) => (
              <GroupRows key={group.name} group={group} locale={locale} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GroupRows({
  group,
  locale,
}: {
  group: { name: string; parts: Part[] };
  locale: 'en' | 'vi';
}) {
  return (
    <>
      {group.name && (
        <tr className="border-b border-border">
          <td
            colSpan={6}
            className="px-3 py-2 text-xs font-semibold text-accent uppercase tracking-wide bg-background/50"
          >
            {localizePartText(group.name, locale)}
          </td>
        </tr>
      )}
      {group.parts.map((part, i) => (
        <tr
          key={`${part.oem_number}-${i}`}
          className="border-b border-border transition-colors last:border-b-0 hover:bg-panel"
        >
          <td className="px-3 py-2">
            <span className="part-number text-foreground">{part.oem_number}</span>
          </td>
          <td className="px-3 py-2 text-muted">{part.quantity}</td>
          <td className="px-3 py-2 text-muted hidden md:table-cell">
            {localizePartText(part.production_period, locale) || '\u2014'}
          </td>
          <td className="px-3 py-2 text-muted hidden lg:table-cell">
            {localizePartText(part.applies_for_models, locale) || '\u2014'}
          </td>
          <td className="px-3 py-2 text-muted hidden md:table-cell">
            {localizePartText(part.notes, locale) || '\u2014'}
          </td>
          <td className="px-3 py-2 text-muted hidden lg:table-cell">
            {localizePartText(part.replacements, locale) || '\u2014'}
          </td>
        </tr>
      ))}
    </>
  );
}
