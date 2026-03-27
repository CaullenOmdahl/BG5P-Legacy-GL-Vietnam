import Link from "next/link";

const specs = [
  { label: "Chassis", value: "BG5P" },
  { label: "Engine", value: "EJ20E 2.0L Flat-4 SOHC NA" },
  { label: "Power", value: "120 HP / 184 Nm" },
  { label: "Transmission", value: "5-speed manual, full-time AWD" },
  { label: "Years", value: "1994–1998" },
  { label: "Market", value: "Vietnam (General Market LHD export)" },
  { label: "Diagnostics", value: "SSM1 (no OBD-II)" },
];

const sections = [
  {
    index: "01",
    title: "Parts Catalog",
    href: "/parts",
    description: "262 exploded diagrams across 16 sections with OEM part numbers",
  },
  {
    index: "02",
    title: "Maintenance Guides",
    href: "/maintenance",
    description: "Specs, torque values, and step-by-step service procedures",
  },
  {
    index: "03",
    title: "Service Manuals",
    href: "/manuals",
    description: "363 factory PDFs — EJ20E engine and full BG chassis",
  },
];

export default function Page() {
  return (
    <div className="flex flex-col gap-12">
      {/* Hero */}
      <section className="pt-10 sm:pt-16">
        <p className="font-mono text-xs text-accent uppercase tracking-widest mb-4 opacity-80">
          Chassis BG5P · EJ20E SOHC · Vietnam Market · 1994–1998
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
          Legacy GL
          <span className="block text-muted font-normal text-2xl sm:text-3xl mt-1">
            Service Reference
          </span>
        </h1>
        <p className="mt-4 text-sm sm:text-base text-muted max-w-lg leading-relaxed">
          Parts diagrams, factory manuals, and maintenance procedures for the
          Vietnamese-market Subaru Legacy Touring Wagon.
        </p>
      </section>

      {/* Vehicle Specs */}
      <section>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-3">
          Vehicle Specifications
        </p>
        <div className="rounded-lg border border-border overflow-hidden">
          {specs.map((spec, i) => (
            <div
              key={spec.label}
              className={`flex items-baseline gap-4 px-4 py-2.5 text-sm ${
                i % 2 === 0 ? "bg-surface" : "bg-background/60"
              }`}
            >
              <dt className="text-muted w-28 shrink-0">{spec.label}</dt>
              <dd className="text-foreground font-medium font-mono text-xs sm:text-sm">
                {spec.value}
              </dd>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Cards */}
      <section>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-3">
          Reference Material
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group relative rounded-lg border border-border bg-surface p-5 transition-all duration-200 hover:border-accent hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(58,126,245,0.12)]"
            >
              <span className="font-mono text-[10px] text-muted/60 mb-3 block">
                {section.index}
              </span>
              <h3 className="text-base font-semibold text-foreground group-hover:text-accent transition-colors">
                {section.title}
              </h3>
              <p className="mt-1.5 text-xs text-muted leading-relaxed">
                {section.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-accent">
                Browse
                <svg className="h-3 w-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
