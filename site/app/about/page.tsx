import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — BG5P Legacy GL",
  description:
    "Vehicle information, chassis plate decoding, engine details, and history of the Vietnamese-market Subaru BG5P Legacy GL.",
};

const vehicleSummary = [
  { label: "Model Code", value: "BG5P" },
  { label: "Generation", value: "2nd-gen Legacy Touring Wagon (1993\u20131998)" },
  { label: "Trim", value: "GL (base)" },
  {
    label: "Engine",
    value: "EJ20E 2.0L Flat-4 SOHC NA \u2014 120 HP / 184 Nm",
  },
  { label: "Transmission", value: "5-speed manual" },
  { label: "Drivetrain", value: "Full-time AWD" },
  { label: "Steering", value: "Left-hand drive" },
  { label: "Market", value: "Vietnam \u2014 General Market LHD export" },
  { label: "Diagnostics", value: "SSM1 protocol \u2014 NO OBD-II" },
];

const chassisPlate = [
  { code: "BG", meaning: "Legacy Touring Wagon (2nd gen)" },
  { code: "5", meaning: "EJ20 engine series" },
  { code: "P", meaning: "General Market variant" },
  { code: "JF1BG5LJ4VG072437", meaning: "Example VIN" },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <section className="pt-4 sm:pt-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          About the BG5P Legacy GL
        </h1>
        <p className="mt-2 text-base sm:text-lg text-muted max-w-2xl">
          Vehicle specifications, chassis decoding, engine details, and the
          history of this rare Vietnamese-market Subaru.
        </p>
      </section>

      {/* Vehicle Summary Card */}
      <section>
        <div className="rounded-lg border border-border bg-surface p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Vehicle Summary
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            {vehicleSummary.map((item) => (
              <div key={item.label} className="flex flex-col">
                <dt className="text-muted">{item.label}</dt>
                <dd className="text-foreground font-medium">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Decoded Chassis Plate */}
      <section>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
          Decoded Chassis Plate
        </h2>
        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-muted font-medium">
                  Code
                </th>
                <th className="text-left px-4 py-3 text-muted font-medium">
                  Meaning
                </th>
              </tr>
            </thead>
            <tbody>
              {chassisPlate.map((row) => (
                <tr key={row.code} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-mono text-accent font-medium">
                    {row.code}
                  </td>
                  <td className="px-4 py-3 text-foreground">{row.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Engine Details */}
      <section>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
          Engine Details
        </h2>
        <div className="space-y-3 text-sm text-foreground leading-relaxed">
          <p>
            The <strong>EJ20E</strong> is a 2.0-liter horizontally opposed
            (&ldquo;flat-four&rdquo;) engine with a single overhead camshaft
            (SOHC) and natural aspiration. It produces approximately{" "}
            <strong>120 HP at ~5,600 rpm</strong> and{" "}
            <strong>184 Nm of torque at ~4,400 rpm</strong>.
          </p>
          <p>
            The fuel system uses single-range electronic multi-point injection
            (EMPI). Critically, this engine is{" "}
            <strong>not OBD-II equipped</strong>. Diagnostics rely on the{" "}
            <strong>SSM1 protocol</strong>, which requires either a dedicated
            SSM1 scan tool or manual CEL code reading by bridging connector pins
            under the dash.
          </p>
        </div>
      </section>

      {/* History */}
      <section>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
          Subaru in Vietnam
        </h2>
        <div className="space-y-3 text-sm text-foreground leading-relaxed">
          <p>
            Approximately a few dozen BG5P wagons were imported to Vietnam
            around 1997. These were General Market left-hand-drive exports, built
            at Subaru&rsquo;s Gunma plant in Japan.
          </p>
          <p>
            The BG5P was never officially sold in Vietnam &mdash; these were
            private imports, likely brought in by individuals or small dealers.
            Very rare today, possibly fewer than a dozen examples survive in the
            country.
          </p>
        </div>
      </section>

      {/* Important Notes */}
      <section>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
          Important Notes
        </h2>
        <ul className="space-y-3 text-sm text-foreground leading-relaxed list-disc list-outside pl-5">
          <li>
            The USDM version of the Legacy used the <strong>EJ22</strong>{" "}
            (2.2L), <strong>not</strong> the EJ20E &mdash; engine procedures
            differ between these two powerplants.
          </li>
          <li>
            There is no OBD-II port on this vehicle. Diagnostics require an
            SSM1-compatible scan tool or manual code reading.
          </li>
          <li>
            The &ldquo;BG5P&rdquo; model code is largely undocumented in public
            databases. The &ldquo;P&rdquo; suffix is believed to denote the
            General Market variant code.
          </li>
          <li>
            BG chassis parts are generally shared across variants, but engine
            parts are <strong>EJ20E-specific</strong>. Always verify part
            numbers against the EJ20E parts catalog.
          </li>
        </ul>
      </section>

      {/* Sources */}
      <section className="pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
          Sources
        </h2>
        <ul className="space-y-2 text-sm text-muted list-disc list-outside pl-5">
          <li>
            Service manuals:{" "}
            <span className="text-foreground">car-inform.com</span>
          </li>
          <li>
            BG chassis FSM:{" "}
            <span className="text-foreground">
              1997 Subaru Legacy USDM Factory Service Manual
            </span>
          </li>
          <li>
            Vehicle info:{" "}
            <span className="text-foreground">
              Vietnamese automotive press (Thanh Nien, CarBiz.vn)
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
