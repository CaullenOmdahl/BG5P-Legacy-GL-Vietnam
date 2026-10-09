import { sourcingField } from "@/lib/sourcing-fields";
import type { Metadata } from "next";
import { getSourcing } from "@/lib/sourcing";
import { sourcingCopy } from "@/lib/sourcing-copy";
import { Gauge } from "lucide-react";
import { getCopy, getPageMetadata } from "@/lib/i18n";
import { getServerLocale } from "@/lib/server-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return getPageMetadata(locale, "about");
}

export default async function AboutPage() {
  const locale = await getServerLocale();
  const copy = getCopy(locale).about;
  const data = getSourcing();
  const t = sourcingCopy[locale];

  return (
    <div className="flex flex-col gap-10">
      <section className="bg5-panel rounded p-5">
        <h2 className="text-xl">{t.facts}</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          {Object.entries(data.vehicle.facts).map(([key, f]) => (
            <div key={key}>
              <dt className="text-muted">{sourcingField(key, locale)}</dt>
              <dd>
                {f.value ?? t.unknown} · {f.status}
              </dd>
            </div>
          ))}
        </dl>
        <p>{data.vehicle.suffix_p}</p>
        <p>{t.fitment}</p>
        <p>
          {t.version}: {data.content_version}
        </p>
      </section>
      <section className="bg5-panel-strong rounded-lg p-5 sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-panel text-accent">
            <Gauge className="h-6 w-6" aria-hidden="true" />
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
        <h2 className="mb-4 text-xl font-bold text-foreground sm:text-2xl">
          {copy.chassisTitle}
        </h2>
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted">
                    {copy.code}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted">
                    {copy.meaning}
                  </th>
                </tr>
              </thead>
              <tbody>
                {copy.chassisPlate.map((row) => (
                  <tr
                    key={row.code}
                    className="border-b border-border last:border-0"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono font-medium text-accent">
                      {row.code}
                    </td>
                    <td className="px-4 py-3 text-foreground">{row.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-foreground sm:text-2xl">
          {copy.engineTitle}
        </h2>
        <div className="space-y-3 text-sm leading-relaxed text-foreground">
          {copy.engineParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-foreground sm:text-2xl">
          {copy.historyTitle}
        </h2>
        <div className="space-y-3 text-sm leading-relaxed text-foreground">
          {copy.historyParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-foreground sm:text-2xl">
          {copy.notesTitle}
        </h2>
        <ul className="list-outside list-disc space-y-3 pl-5 text-sm leading-relaxed text-foreground">
          {copy.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>

      <section className="pb-4">
        <h2 className="mb-4 text-xl font-bold text-foreground sm:text-2xl">
          {copy.sourcesTitle}
        </h2>
        <ul className="list-outside list-disc space-y-2 pl-5 text-sm text-muted">
          {data.evidence
            .filter((source) => source.url)
            .map((source) => (
              <li key={source.id}>
                <a className="text-accent underline" href={source.url!}>
                  {source.publisher}: {source.location}
                </a>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
