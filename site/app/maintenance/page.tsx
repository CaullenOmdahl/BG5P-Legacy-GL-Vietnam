import Link from "next/link";
import { getMaintenanceCards } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maintenance Guides — BG5P Legacy GL",
  description:
    "Quick-reference specs, torque values, and step-by-step procedures for the EJ20E SOHC NA.",
};

const difficultyColors: Record<string, string> = {
  Easy: "bg-green-600 text-white",
  Moderate: "bg-amber text-black",
  Advanced: "bg-red-600 text-white",
};

export default function MaintenancePage() {
  const cards = getMaintenanceCards();

  return (
    <div className="flex flex-col gap-8">
      <section className="pt-4 sm:pt-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Maintenance Guides
        </h1>
        <p className="mt-2 text-base sm:text-lg text-muted max-w-2xl">
          Quick-reference specs and procedures for the EJ20E SOHC NA
        </p>
      </section>

      <section>
        <ul className="flex flex-col divide-y divide-border border border-border rounded-lg overflow-hidden">
          {cards.map((card) => {
            const badgeClass =
              difficultyColors[card.difficulty] ?? "bg-muted text-foreground";
            return (
              <li key={card.id}>
                <Link
                  href={`/maintenance/${card.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-4 bg-surface hover:bg-white/5 transition-colors"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-medium text-foreground truncate">
                      {card.title}
                    </span>
                    <span className="text-xs text-muted">{card.interval}</span>
                  </div>
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 text-xs font-semibold ${badgeClass}`}
                  >
                    {card.difficulty}
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
