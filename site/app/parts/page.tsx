import Link from "next/link";
import { getSections } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Parts Catalog — BG5P Legacy GL",
  description:
    "262 exploded parts diagrams for the BG5P EJ20E SOHC NA, organized across 16 sections.",
};

export default function PartsPage() {
  const sections = getSections();

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <section className="pt-4 sm:pt-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Parts Catalog
        </h1>
        <p className="mt-2 text-base sm:text-lg text-muted max-w-2xl">
          262 exploded parts diagrams for the BG5P EJ20E SOHC NA
        </p>
      </section>

      {/* Section Grid */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section) => {
            const thumbnail = section.diagrams[0];

            return (
              <Link
                key={section.slug}
                href={`/parts/${section.slug}`}
                className="group rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent"
              >
                {/* Thumbnail */}
                {thumbnail && (
                  <div className="mb-3 overflow-hidden rounded-md bg-white">
                    <img
                      src={thumbnail.imagePath}
                      alt={`${section.name} — ${thumbnail.name}`}
                      width={200}
                      className="w-full max-w-[200px] mx-auto object-contain"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Info */}
                <h2 className="text-base font-semibold text-foreground group-hover:text-accent transition-colors">
                  {section.name}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {section.diagramCount} diagram{section.diagramCount !== 1 && "s"}
                </p>
                <span className="mt-2 inline-block text-sm font-medium text-accent">
                  View diagrams &rarr;
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
