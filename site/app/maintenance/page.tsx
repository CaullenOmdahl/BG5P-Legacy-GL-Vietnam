import { getMaintenanceCards } from "@/lib/data";
import MaintenanceCard from "@/components/MaintenanceCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maintenance Guides — BG5P Legacy GL",
  description:
    "Quick-reference specs, torque values, and step-by-step procedures for the EJ20E SOHC NA.",
};

export default function MaintenancePage() {
  const cards = getMaintenanceCards();

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <section className="pt-4 sm:pt-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Maintenance Guides
        </h1>
        <p className="mt-2 text-base sm:text-lg text-muted max-w-2xl">
          Quick-reference specs and procedures for the EJ20E SOHC NA
        </p>
      </section>

      {/* Card Grid */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card) => (
            <MaintenanceCard key={card.id} card={card} />
          ))}
        </div>
      </section>
    </div>
  );
}
