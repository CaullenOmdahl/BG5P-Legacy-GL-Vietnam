import Link from "next/link";

const specs = [
  { label: "Engine", value: "EJ20E 2.0L Flat-4 SOHC NA" },
  { label: "Power", value: "120 HP / 184 Nm" },
  { label: "Transmission", value: "5-speed manual, full-time AWD" },
  { label: "Market", value: "Vietnam (General Market LHD export)" },
  { label: "Chassis Code", value: "BG5P" },
  { label: "Year Range", value: "1994\u20131998" },
  { label: "Diagnostics", value: "SSM1 (no OBD-II)" },
];

const sections = [
  {
    title: "Parts Catalog",
    href: "/parts",
    description: "262 exploded diagrams across 16 sections",
  },
  {
    title: "Maintenance Guides",
    href: "/maintenance",
    description: "Specs, torque values, and procedures",
  },
  {
    title: "Service Manuals",
    href: "/manuals",
    description: "363 factory PDF manuals",
  },
];

export default function Page() {
  return (
    <div className="flex flex-col gap-10">
      {/* Hero */}
      <section className="pt-8 sm:pt-14">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          BG5P Legacy GL
        </h1>
        <p className="mt-2 text-base sm:text-lg text-muted max-w-xl">
          Service Reference for the Vietnamese-Market Subaru Legacy Touring
          Wagon
        </p>
      </section>

      {/* Vehicle Specs Card */}
      <section>
        <div className="rounded-lg border border-border bg-surface p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Vehicle Specifications
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            {specs.map((spec) => (
              <div key={spec.label} className="flex flex-col">
                <dt className="text-muted">{spec.label}</dt>
                <dd className="text-foreground font-medium">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA Cards */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-lg border border-border bg-surface p-5 transition-colors hover:border-accent"
            >
              <h3 className="text-base font-semibold text-foreground group-hover:text-accent">
                {section.title}
              </h3>
              <p className="mt-1 text-sm text-muted">{section.description}</p>
              <span className="mt-3 inline-block text-sm font-medium text-accent">
                Browse &rarr;
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
