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
import {
  getCopy,
  localizeMaintenanceCard,
  localizeManualTitle,
  localizeSectionName,
  localizeTechnicalName,
} from "@/lib/i18n";
import { getServerLocale } from "@/lib/server-locale";

export function generateStaticParams() {
  return getMaintenanceCards().map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const locale = await getServerLocale();
  const card = getMaintenanceCardById(id);
  if (!card) return {};
  const localized = localizeMaintenanceCard(card, locale);
  return {
    title: `${localized.title} — BG5P Legacy GL`,
    description:
      locale === "vi"
        ? `${localized.interval} — thông số, bước làm và lực siết cho EJ20E SOHC NA.`
        : `${localized.interval} — specs, steps, and torque values for the EJ20E SOHC NA.`,
  };
}

export default async function MaintenanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getServerLocale();
  const rawCard = getMaintenanceCardById(id);
  if (!rawCard) notFound();
  const card = localizeMaintenanceCard(rawCard, locale);
  const copy = getCopy(locale).maintenance;

  const resolvedPdfLinks = rawCard.relatedPdfs.map((pdfPath) => {
    const filename = pdfPath.split("/").pop() ?? pdfPath;
    return { href: pdfPath, name: localizeManualTitle(getPdfTitle(filename), locale) };
  });

  const resolvedDiagramLinks = rawCard.relatedDiagrams.map((code) => {
    const slug = getDiagramSectionSlug(code);
    const sectionData = slug ? getSectionBySlug(slug) : undefined;
    const diagramData = sectionData?.diagrams.find((d) => d.code === code);
    return {
      code,
      href: slug ? `/parts/${slug}/${code.replace(/_/g, "-")}` : "/parts",
      name: diagramData
        ? localizeTechnicalName(diagramData.name, locale)
        : sectionData
          ? localizeSectionName(sectionData.name, locale)
          : code,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
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
          {copy.allGuides}
        </Link>
        <h1 className="bg5-panel-strong rounded-lg p-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {card.title}
        </h1>
      </div>

      <MaintenanceCard
        card={rawCard}
        resolvedPdfLinks={resolvedPdfLinks}
        resolvedDiagramLinks={resolvedDiagramLinks}
      />
    </div>
  );
}
