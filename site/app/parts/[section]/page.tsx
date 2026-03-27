import Link from "next/link";
import { notFound } from "next/navigation";
import { getSectionBySlug, getSections } from "@/lib/data";
import type { Metadata } from "next";

export function generateStaticParams() {
  const sections = getSections();
  return sections.map((s) => ({ section: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section } = await params;
  const data = getSectionBySlug(section);
  if (!data) return {};
  return {
    title: `${data.name} — Parts Catalog — BG5P Legacy GL`,
    description: `${data.diagramCount} exploded parts diagrams for ${data.name} on the BG5P EJ20E SOHC NA.`,
  };
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const data = getSectionBySlug(section);

  if (!data) notFound();

  return (
    <div className="flex flex-col gap-8">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-2 text-sm text-muted pt-4 sm:pt-8">
        <Link href="/parts" className="hover:text-accent transition-colors">
          Parts
        </Link>
        <span>&gt;</span>
        <span className="text-foreground">{data.name}</span>
      </nav>

      {/* Header */}
      <section>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          {data.name}
        </h1>
        <p className="mt-2 text-base sm:text-lg text-muted">
          {data.diagramCount} diagram{data.diagramCount !== 1 && "s"}
        </p>
      </section>

      {/* Diagram Grid */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {data.diagrams.map((diagram) => {
            const urlCode = diagram.code.replace(/_/g, "-");
            return (
              <Link
                key={diagram.code}
                href={`/parts/${section}/${urlCode}`}
                className="group rounded-lg border border-border bg-surface p-3 transition-colors hover:border-accent"
              >
                {/* Thumbnail */}
                <div className="mb-3 overflow-hidden rounded-md bg-white">
                  <img
                    src={diagram.imagePath}
                    alt={`${diagram.code} — ${diagram.name}`}
                    className="w-full object-contain"
                    loading="lazy"
                  />
                </div>

                {/* Info */}
                <p className="text-sm font-mono font-semibold text-accent">
                  {diagram.code}
                </p>
                <p className="mt-1 text-sm text-foreground group-hover:text-accent transition-colors leading-snug">
                  {diagram.name}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
