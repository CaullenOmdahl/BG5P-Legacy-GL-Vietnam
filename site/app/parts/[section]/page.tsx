import Link from "next/link";
import { notFound } from "next/navigation";
import { getSectionBySlug, getSections } from "@/lib/data";
import type { Metadata } from "next";
import {
  diagramCount,
  getCopy,
  localizeSectionName,
  localizeTechnicalName,
} from "@/lib/i18n";
import { getServerLocale } from "@/lib/server-locale";

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
  const locale = await getServerLocale();
  const copy = getCopy(locale).parts;
  const data = getSectionBySlug(section);
  if (!data) return {};
  const sectionName = localizeSectionName(data.name, locale);
  return {
    title: `${sectionName} — ${copy.title} — BG5P Legacy GL`,
    description:
      locale === "vi"
        ? `${data.diagramCount} sơ đồ phụ tùng dạng nổ cho ${sectionName} trên BG5P EJ20E SOHC NA.`
        : `${data.diagramCount} exploded parts diagrams for ${sectionName} on the BG5P EJ20E SOHC NA.`,
  };
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const locale = await getServerLocale();
  const copy = getCopy(locale).parts;
  const data = getSectionBySlug(section);

  if (!data) notFound();
  const sectionName = localizeSectionName(data.name, locale);

  return (
    <div className="flex flex-col gap-8">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <Link href="/parts" className="hover:text-accent transition-colors">
          {copy.crumb}
        </Link>
        <span>&gt;</span>
        <span className="text-foreground">{sectionName}</span>
      </nav>

      <section className="bg5-panel-strong rounded-lg p-5 sm:p-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {sectionName}
        </h1>
        <p className="mt-2 text-sm text-muted sm:text-base">
          {diagramCount(locale, data.diagramCount)}
        </p>
      </section>

      {/* Diagram Grid */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {data.diagrams.map((diagram) => {
            const urlCode = diagram.code.replace(/_/g, "-");
            const diagramName = localizeTechnicalName(diagram.name, locale);
            return (
              <Link
                key={diagram.code}
                href={`/parts/${section}/${urlCode}`}
                className="group bg5-panel rounded-lg p-3 transition-colors hover:border-accent"
              >
                <div className="mb-3 aspect-[4/3] overflow-hidden rounded-md border border-border bg-white">
                  <img
                    src={diagram.imagePath}
                    alt={`${diagram.code} ${copy.diagramAltSeparator} ${diagramName}`}
                    className="h-full w-full object-contain p-2"
                    loading="lazy"
                  />
                </div>

                {/* Info */}
                <p className="text-sm font-mono font-semibold text-accent">
                  {diagram.code}
                </p>
                <p className="mt-1 text-sm text-foreground group-hover:text-accent transition-colors leading-snug">
                  {diagramName}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
