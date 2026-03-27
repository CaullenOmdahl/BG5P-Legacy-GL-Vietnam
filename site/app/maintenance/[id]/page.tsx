import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getMaintenanceCards,
  getMaintenanceCardById,
  getDiagramSectionSlug,
  getSectionBySlug,
  getPdfTitle,
} from "@/lib/data";
import MaintenanceCard from "@/components/MaintenanceCard";
import type { Metadata } from "next";

export function generateStaticParams() {
  return getMaintenanceCards().map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const card = getMaintenanceCardById(id);
  if (!card) return {};
  return {
    title: `${card.title} — BG5P Legacy GL`,
    description: `${card.interval} — specs, steps, and torque values for the EJ20E SOHC NA.`,
  };
}

export default async function MaintenanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const card = getMaintenanceCardById(id);
  if (!card) notFound();

  const resolvedPdfLinks = card.relatedPdfs.map((pdfPath) => {
    const filename = pdfPath.split("/").pop() ?? pdfPath;
    return { href: pdfPath, name: getPdfTitle(filename) };
  });

  const resolvedDiagramLinks = card.relatedDiagrams.map((code) => {
    const slug = getDiagramSectionSlug(code);
    const sectionData = slug ? getSectionBySlug(slug) : undefined;
    const diagramData = sectionData?.diagrams.find((d) => d.code === code);
    return {
      code,
      href: slug ? `/parts/${slug}/${code.replace(/_/g, "-")}` : "/parts",
      name: diagramData?.name ?? code,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="pt-4 sm:pt-8 flex flex-col gap-3">
        <Link
          href="/maintenance"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          All maintenance guides
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          {card.title}
        </h1>
      </div>

      <MaintenanceCard
        card={card}
        resolvedPdfLinks={resolvedPdfLinks}
        resolvedDiagramLinks={resolvedDiagramLinks}
      />
    </div>
  );
}
