import Link from "next/link";
import type { Metadata } from "next";
import { Wrench } from "lucide-react";
import { getMaintenanceCards } from "@/lib/data";
import {
  getCopy,
  getPageMetadata,
  localizeDifficulty,
  localizeMaintenanceCard,
} from "@/lib/i18n";
import { getServerLocale } from "@/lib/server-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return getPageMetadata(locale, "maintenance");
}

const difficultyColors: Record<string, string> = {
  Easy: "bg-green-600 text-white",
  Moderate: "bg-amber text-black",
  Advanced: "bg-red-600 text-white",
};

export default async function MaintenancePage() {
  const locale = await getServerLocale();
  const copy = getCopy(locale).maintenance;
  const cards = getMaintenanceCards();

  return (
    <div className="flex flex-col gap-8">
      <section className="bg5-panel-strong rounded-lg p-5 sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-panel text-accent">
            <Wrench className="h-6 w-6" aria-hidden="true" />
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
        <ul className="overflow-hidden rounded-lg border border-border bg-surface">
          {cards.map((rawCard) => {
            const card = localizeMaintenanceCard(rawCard, locale);
            const badgeClass =
              difficultyColors[rawCard.difficulty] ?? "bg-muted text-foreground";
            return (
              <li key={card.id}>
                <Link
                  href={`/maintenance/${card.id}`}
                  className="flex items-center justify-between gap-4 border-b border-border px-4 py-4 transition-colors last:border-b-0 hover:bg-panel"
                >
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium text-foreground">
                      {card.title}
                    </span>
                    <span className="text-xs text-muted">{card.interval}</span>
                  </div>
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 text-xs font-semibold ${badgeClass}`}
                  >
                    {localizeDifficulty(rawCard.difficulty, locale)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
