import Link from "next/link";
import { getSourcing, findParts } from "@/lib/sourcing";
import { sourcingCopy } from "@/lib/sourcing-copy";
import { getServerLocale } from "@/lib/server-locale";
import { localizeSectionName, localizePartText } from "@/lib/i18n";
export default async function FindPart({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const data = getSourcing();
  const locale = await getServerLocale();
  const t = sourcingCopy[locale];
  const params = await searchParams;
  const value = (k: string) =>
    typeof params[k] === "string" ? (params[k] as string) : "";
  const results = findParts(data, value("q"), {
    section: value("section"),
    status: value("status"),
    position: value("position"),
    configuration: value("configuration"),
  });
  const page = Math.max(
    1,
    Math.min(
      Math.ceil(results.length / 50) || 1,
      Math.floor(Number(value("page"))) || 1,
    ),
  );
  const pageUrl = (p: number) => {
    const q = new URLSearchParams();
    for (const key of ["q", "section", "status", "position", "configuration"])
      if (value(key)) q.set(key, value(key));
    q.set("page", String(p));
    return "/find-part?" + q.toString();
  };
  return (
    <div className="flex flex-col gap-6 pb-8">
      <h1 className="text-3xl font-semibold">{t.find}</h1>
      <p>{t.description}</p>
      <p className="bg5-panel rounded p-4">
        1997 BG5P GL · General Market LHD · EJ20E · 5MT AWD ·{" "}
        {locale === "vi"
          ? "Phanh trước nguyên bản; phanh sau tang trống. Tháng sản xuất / ABS / catalyst chưa biết."
          : "Factory front brakes; rear drums. Build month / ABS / catalyst unknown."}
      </p>
      <form
        className="bg5-panel grid gap-4 rounded p-4 sm:grid-cols-2"
        action="/find-part"
      >
        <label>
          {t.query}
          <input
            name="q"
            defaultValue={value("q")}
            className="mt-1 block w-full rounded border border-border bg-background p-2"
          />
        </label>
        <label>
          {t.system}
          <select
            name="section"
            defaultValue={value("section")}
            className="mt-1 block w-full bg-background p-2"
          >
            <option value="">{t.all}</option>
            {data.coverage.map((s) => (
              <option key={s.section} value={s.section}>
                {localizeSectionName(
                  data.parts.find((p) => p.section === s.section)
                    ?.section_name ?? s.section,
                  locale,
                )}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t.status}
          <select
            name="status"
            defaultValue={value("status")}
            className="mt-1 block w-full bg-background p-2"
          >
            <option value="">{t.all}</option>
            {(
              [
                "unreviewed",
                "candidate",
                "confirmed",
                "conflicting",
                "rejected",
              ] as const
            ).map((s) => (
              <option key={s} value={s}>
                {t[s]}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t.position}
          <select
            name="position"
            defaultValue={value("position")}
            className="mt-1 block w-full bg-background p-2"
          >
            <option value="">{t.all}</option>
            <option value="front">{t.front}</option>
            <option value="rear">{t.rear}</option>
          </select>
        </label>
        <label>
          {t.configuration}
          <select
            name="configuration"
            defaultValue={value("configuration")}
            className="mt-1 block w-full bg-background p-2"
          >
            <option value="">{t.all}</option>
            <option value="owner-candidates">{t.owner}</option>
            <option value="source-variants">{t.variants}</option>
          </select>
        </label>
        <button
          className="rounded bg-accent px-4 py-2 text-background"
          type="submit"
        >
          {t.find}
        </button>
      </form>
      <p>
        {results.length} · {page} / {Math.ceil(results.length / 50) || 1} ·{" "}
        {t.version}: {data.content_version}
      </p>
      <ul className="flex flex-col gap-3">
        {results.slice((page - 1) * 50, page * 50).map(({ part: p, match }) => (
          <li key={p.id} className="bg5-panel rounded p-4">
            <Link className="text-accent underline" href={"/find-part/" + p.id}>
              {p.number} —{" "}
              {locale === "vi"
                ? p.name_vi || localizePartText(p.name, locale)
                : p.name}
            </Link>
            <p>
              {t[match]} · {t[p.fitment.status as "candidate"]} ·{" "}
              {localizeSectionName(p.section_name, locale)}
            </p>
            <p className="text-sm text-muted">
              {p.catalog?.applies_for_models || t.unknown} ·{" "}
              {p.catalog?.production_period || t.unknown}
            </p>
          </li>
        ))}
      </ul>
      <nav className="flex gap-5">
        {page > 1 && <Link href={pageUrl(page - 1)}>← {page - 1}</Link>}
        {page * 50 < results.length && (
          <Link href={pageUrl(page + 1)}>{page + 1} →</Link>
        )}
      </nav>
      <details className="bg5-panel rounded p-4">
        <summary>{t.coverage}</summary>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>{t.system}</th>
                <th>{t.total}</th>
                <th>{t.reviewed}</th>
                <th>{t.fits}</th>
              </tr>
            </thead>
            <tbody>
              {data.coverage.map((s) => (
                <tr key={s.section}>
                  <td>{s.section}</td>
                  <td>{s.catalog_rows}</td>
                  <td>{s.reviewed_claims}</td>
                  <td>{s.confirmed_fits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
