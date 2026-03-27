import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSections, getSectionBySlug, getParts } from '@/lib/data';
import type { Metadata } from 'next';
import DiagramViewer from '@/components/DiagramViewer';
import PartsTable from '@/components/PartsTable';

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
  const diagramCode = diagram.replace(/-/g, '_');
  const sectionData = getSectionBySlug(section);
  if (!sectionData) return {};

  const diagramData = sectionData.diagrams.find((d) => d.code === diagramCode);
  if (!diagramData) return {};

  return {
    title: `${diagramData.code} ${diagramData.name} — ${sectionData.name} — BG5P Legacy GL`,
    description: `Exploded parts diagram for ${diagramData.name} (${diagramData.code}) in ${sectionData.name} section of the BG5P EJ20E SOHC NA.`,
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
  const diagramCode = diagram.replace(/-/g, '_');

  const sectionData = getSectionBySlug(section);
  if (!sectionData) notFound();

  const diagramData = sectionData.diagrams.find((d) => d.code === diagramCode);
  if (!diagramData) notFound();

  // Parts lookup — use the 3-digit category code
  const categoryCode = diagramCode.split('_')[0];
  const parts = getParts(categoryCode);

  // Previous / Next diagram navigation
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
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-2 text-sm text-muted pt-4 sm:pt-8">
        <Link href="/parts" className="hover:text-accent transition-colors">
          Parts
        </Link>
        <span>&gt;</span>
        <Link
          href={`/parts/${section}`}
          className="hover:text-accent transition-colors"
        >
          {sectionData.name}
        </Link>
        <span>&gt;</span>
        <span className="text-foreground">
          {diagramData.code} / {diagramData.name}
        </span>
      </nav>

      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {diagramData.name}
        </h1>
        <p className="mt-1 text-sm text-muted font-mono">{diagramData.code}</p>
      </div>

      {/* Previous / Next navigation */}
      <div className="flex items-center justify-between">
        {prevDiagram ? (
          <Link
            href={`/parts/${section}/${prevDiagram.code.replace(/_/g, '-')}`}
            className="text-sm text-accent hover:text-accent-hover transition-colors"
          >
            &larr; {prevDiagram.code} {prevDiagram.name}
          </Link>
        ) : (
          <span />
        )}
        {nextDiagram ? (
          <Link
            href={`/parts/${section}/${nextDiagram.code.replace(/_/g, '-')}`}
            className="text-sm text-accent hover:text-accent-hover transition-colors"
          >
            {nextDiagram.code} {nextDiagram.name} &rarr;
          </Link>
        ) : (
          <span />
        )}
      </div>

      {/* Split layout: diagram + parts table */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Diagram viewer — 60% on desktop */}
        <div className="w-full lg:w-[60%] lg:flex-shrink-0">
          <DiagramViewer
            imagePath={diagramData.imagePath}
            alt={`${diagramData.code} — ${diagramData.name}`}
          />
        </div>

        {/* Parts table — 40% on desktop */}
        <div className="w-full lg:w-[40%] lg:min-w-0">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Parts List
          </h2>
          <PartsTable parts={parts} />
        </div>
      </div>

      {/* Bottom navigation (repeated for convenience) */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        {prevDiagram ? (
          <Link
            href={`/parts/${section}/${prevDiagram.code.replace(/_/g, '-')}`}
            className="text-sm text-accent hover:text-accent-hover transition-colors"
          >
            &larr; Previous
          </Link>
        ) : (
          <span />
        )}
        <Link
          href={`/parts/${section}`}
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          Back to {sectionData.name}
        </Link>
        {nextDiagram ? (
          <Link
            href={`/parts/${section}/${nextDiagram.code.replace(/_/g, '-')}`}
            className="text-sm text-accent hover:text-accent-hover transition-colors"
          >
            Next &rarr;
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
