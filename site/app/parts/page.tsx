import Link from "next/link";
import { getSections } from "@/lib/data";
import type { Metadata } from "next";
import { CircuitBoard } from "lucide-react";
import {
  diagramCount,
  getCopy,
  getPageMetadata,
  localizeSectionName,
  localizeTechnicalName,
} from "@/lib/i18n";
import { getServerLocale } from "@/lib/server-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return getPageMetadata(locale, "parts");
}

export default async function PartsPage() {
  const locale = await getServerLocale();
  const copy = getCopy(locale).parts;
  const sections = getSections();

  return (
    <div className="flex flex-col gap-8">
      <section className="bg5-panel-strong rounded-lg p-5 sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-panel text-accent">
            <CircuitBoard className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
              {copy.eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {copy.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">
              {copy.description}
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section) => {
            const thumbnail = section.diagrams[0];
            const sectionName = localizeSectionName(section.name, locale);
            const thumbnailName = thumbnail
              ? localizeTechnicalName(thumbnail.name, locale)
              : "";

            return (
              <Link
                key={section.slug}
                href={`/parts/${section.slug}`}
                className="group bg5-panel rounded-lg p-4 transition-colors hover:border-accent"
              >
                {thumbnail && (
                  <div className="mb-4 aspect-[4/3] overflow-hidden rounded-md border border-border bg-white">
                    <img
                      src={thumbnail.imagePath}
                      alt={`${sectionName} ${copy.diagramAltSeparator} ${thumbnailName}`}
                      width={200}
                      className="mx-auto h-full w-full max-w-[240px] object-contain p-2"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-foreground transition-colors group-hover:text-accent">
                      {sectionName}
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      {diagramCount(locale, section.diagramCount)}
                    </p>
                  </div>
                  <span className="rounded border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted group-hover:border-accent group-hover:text-accent">
                    {copy.open}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
