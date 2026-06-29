import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSections, getSectionBySlug, getParts, getPartsStatus, getMaintenanceCardsByDiagram } from '@/lib/data';
import type { Metadata } from 'next';
import DiagramViewer from '@/components/DiagramViewer';
import PartsTable from '@/components/PartsTable';
import {
  getCopy,
  localizeMaintenanceCard,
  localizeSectionName,
  localizeTechnicalName,
} from '@/lib/i18n';
import { getServerLocale } from '@/lib/server-locale';

// ---------------------------------------------------------------------------
// Static params — generate all section/diagram combinations
// ---------------------------------------------------------------------------
export function generateStaticParams() {
  const sections = getSections();
  const params: { section: string; diagram: string }[] = [];

  for (const section of sections) {
    for (const d of section.diagrams) {
      params.push({
        section: section.slug,
        diagram: d.code.replace(/_/g, '-'),
      });
    }
  }

  return params;
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------
export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string; diagram: string }>;
}): Promise<Metadata> {
  const { section, diagram } = await params;
  const locale = await getServerLocale();
  const diagramCode = diagram.replace(/-/g, '_');
  const sectionData = getSectionBySlug(section);
  if (!sectionData) return {};

  const diagramData = sectionData.diagrams.find((d) => d.code === diagramCode);
  if (!diagramData) return {};
  const sectionName = localizeSectionName(sectionData.name, locale);
  const diagramName = localizeTechnicalName(diagramData.name, locale);

  return {
    title: `${diagramData.code} ${diagramName} — ${sectionName} — BG5P Legacy GL`,
    description:
      locale === "vi"
        ? `Sơ đồ phụ tùng dạng nổ cho ${diagramName} (${diagramData.code}) trong nhóm ${sectionName} của BG5P EJ20E SOHC NA.`
        : `Exploded parts diagram for ${diagramName} (${diagramData.code}) in ${sectionName} section of the BG5P EJ20E SOHC NA.`,
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function DiagramPage({
  params,
}: {
  params: Promise<{ section: string; diagram: string }>;
}) {
  const { section, diagram } = await params;
  const locale = await getServerLocale();
  const copy = getCopy(locale).parts;
  const diagramCode = diagram.replace(/-/g, '_');

  const sectionData = getSectionBySlug(section);
  if (!sectionData) notFound();

  const diagramData = sectionData.diagrams.find((d) => d.code === diagramCode);
  if (!diagramData) notFound();
  const sectionName = localizeSectionName(sectionData.name, locale);
  const diagramName = localizeTechnicalName(diagramData.name, locale);

  // Parts lookup — use the 3-digit category code
  const categoryCode = diagramCode.split('_')[0];
  const parts = getParts(categoryCode);
  const partsStatus = getPartsStatus(categoryCode);
  const partsTableCopy = getCopy(locale).components.partsTable;
  const partsEmptyMessage =
    partsStatus?.status === 'not_applicable'
      ? partsTableCopy.notApplicable
      : partsStatus?.status === 'no_itemized_rows'
        ? partsTableCopy.noItemizedRows
        : partsStatus?.status === 'source_unpublished'
          ? partsTableCopy.sourceUnpublished
          : partsTableCopy.empty;

  // Maintenance guides that reference this diagram
  const relatedMaintenance = getMaintenanceCardsByDiagram(diagramCode);

  const diagramIndex = sectionData.diagrams.findIndex(
    (d) => d.code === diagramCode
  );
  const prevDiagram =
    diagramIndex > 0 ? sectionData.diagrams[diagramIndex - 1] : null;
  const nextDiagram =
    diagramIndex < sectionData.diagrams.length - 1
      ? sectionData.diagrams[diagramIndex + 1]
      : null;

  return (
    <div className="flex flex-col gap-6 pb-8">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <Link href="/parts" className="hover:text-accent transition-colors">
          {copy.crumb}
        </Link>
        <span>&gt;</span>
        <Link
          href={`/parts/${section}`}
          className="hover:text-accent transition-colors"
        >
          {sectionName}
        </Link>
        <span>&gt;</span>
        <span className="text-foreground">
          {diagramData.code} / {diagramName}
        </span>
      </nav>

      <div className="bg5-panel-strong rounded-lg p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
          {sectionName}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {diagramName}
        </h1>
        <p className="mt-1 font-mono text-sm text-muted">{diagramData.code}</p>
      </div>

      {/* Related maintenance guides */}
      {relatedMaintenance.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">{copy.relatedMaintenance}</span>
          {relatedMaintenance.map((card) => (
            <Link
              key={card.id}
              href={`/maintenance/${card.id}`}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-0.5 text-xs font-medium text-accent transition-colors hover:border-accent"
            >
              {localizeMaintenanceCard(card, locale).title} &rarr;
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        {prevDiagram ? (
          <Link
            href={`/parts/${section}/${prevDiagram.code.replace(/_/g, '-')}`}
            className="text-sm text-accent hover:text-accent-hover transition-colors min-w-0 truncate"
          >
            &larr; <span className="hidden sm:inline">{prevDiagram.code} {localizeTechnicalName(prevDiagram.name, locale)}</span><span className="sm:hidden">{copy.previousShort}</span>
          </Link>
        ) : (
          <span />
        )}
        {nextDiagram ? (
          <Link
            href={`/parts/${section}/${nextDiagram.code.replace(/_/g, '-')}`}
            className="text-sm text-accent hover:text-accent-hover transition-colors min-w-0 truncate text-right"
          >
            <span className="hidden sm:inline">{nextDiagram.code} {localizeTechnicalName(nextDiagram.name, locale)}</span><span className="sm:hidden">{copy.nextShort}</span> &rarr;
          </Link>
        ) : (
          <span />
        )}
      </div>

      {/* Diagram — full width */}
      <DiagramViewer
        imagePath={diagramData.imagePath}
        alt={`${diagramData.code} ${copy.diagramAltSeparator} ${diagramName}`}
      />

      {/* Parts table — below diagram */}
      <div className="bg5-panel rounded-lg p-4">
        <h2 className="text-lg font-semibold text-foreground mb-3">
          {copy.partsList}
        </h2>
        <PartsTable parts={parts} emptyMessage={partsEmptyMessage} />
      </div>

      {/* Bottom navigation (repeated for convenience) */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        {prevDiagram ? (
          <Link
            href={`/parts/${section}/${prevDiagram.code.replace(/_/g, '-')}`}
            className="text-sm text-accent hover:text-accent-hover transition-colors"
          >
            &larr; {copy.previous}
          </Link>
        ) : (
          <span />
        )}
        <Link
          href={`/parts/${section}`}
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          {copy.backTo} {sectionName}
        </Link>
        {nextDiagram ? (
          <Link
            href={`/parts/${section}/${nextDiagram.code.replace(/_/g, '-')}`}
            className="text-sm text-accent hover:text-accent-hover transition-colors"
          >
            {copy.next} &rarr;
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
