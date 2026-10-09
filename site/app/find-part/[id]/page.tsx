import { sourcingField } from "@/lib/sourcing-fields";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSourcing, normalizeNumber } from "@/lib/sourcing";
import { sourcingCopy } from "@/lib/sourcing-copy";
import { getServerLocale } from "@/lib/server-locale";
import { getSections } from "@/lib/data";
import { localizePartText } from "@/lib/i18n";
import SupplierBrief from "@/components/SupplierBrief";
export default async function PartPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = getSourcing();
  const p = data.parts.find((p) => p.id === id);
  if (!p) notFound();
  const locale = await getServerLocale();
  const t = sourcingCopy[locale];
  const rel = data.relationships.filter(
    (r) =>
      normalizeNumber(r.from) === p.normalized_number ||
      normalizeNumber(r.to) === p.normalized_number,
  );
  const evidence = data.evidence.filter(
    (e) =>
      p.fitment.evidence.includes(e.id) ||
      rel.some((r) => r.evidence.includes(e.id)),
  );
  const title =
    locale === "vi" ? p.name_vi || localizePartText(p.name, locale) : p.name;
  const brief = [
    `1997 BG5P GL / General Market LHD / EJ20E / 5MT AWD / rear drums`,
    `${p.number} — ${title}`,
    `${t.status}: ${t[p.fitment.status as "candidate"]}`,
    `${t.quantity}: ${p.quantity.per_car ?? t.unknown} ${p.quantity.order_unit}; ${t.sources}: ${p.quantity.catalog_value ?? t.unknown}`,
    `${t.dimensions}: ${p.dimensions.map((d) => `${sourcingField(d.label, locale)}: ${d.value} ${d.unit}`).join("; ") || t.unknown}`,
    `${t.sources}: ${JSON.stringify(p.constraints)}`,
    `${t.checks}: ${p.fitment.unresolved.join(" ")}`,
    locale === "vi"
      ? "Vui lòng xác nhận mã chính xác, hình dạng/kích thước, số lượng mỗi hộp, tồn kho, giá, vận chuyển/thuế và điều kiện đổi trả."
      : "Please confirm exact SKU, shape/interfaces, units per box, stock, price, destination shipping/tax and returns.",
    `https://bg5.caphedigital.com/find-part/${p.id}`,
    `${t.version}: ${data.content_version}`,
  ].join("\n");
  return (
    <div className="flex flex-col gap-6 pb-8">
      <Link className="text-accent underline" href="/find-part">
        ← {t.find}
      </Link>
      <h1 className="text-3xl font-semibold">
        {p.number} — {title}
      </h1>
      <p className="bg5-panel rounded p-4">
        {t[p.fitment.status as "candidate"]} · 1997 BG5P GL / EJ20E / 5MT AWD ·{" "}
        {t.fitment}
      </p>
      <section>
        <h2 className="text-xl">{t.checks}</h2>
        <ul className="list-disc pl-5">
          {[...p.fitment.exclusions, ...p.fitment.unresolved].map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-xl">{t.sources}</h2>
        <dl>
          {Object.entries(p.constraints).map(([k, v]) => (
            <div key={k}>
              <dt className="text-muted">{sourcingField(k, locale)}</dt>
              <dd>{v || t.unknown}</dd>
            </div>
          ))}
        </dl>
        <p>{p.provenance.original_source_variant}</p>
      </section>
      <section>
        <h2 className="text-xl">{t.quantity}</h2>
        <p>
          {p.quantity.per_car ?? t.unknown} · {p.quantity.order_unit} ·{" "}
          {p.quantity.units_per_pack ?? t.unknown} / pack
        </p>
        <p>{p.quantity.note}</p>
        <p>
          {t.sources}: {p.quantity.catalog_value ?? t.unknown}
        </p>
      </section>
      <section>
        <h2 className="text-xl">{t.dimensions}</h2>
        {p.dimensions.length ? (
          <ul>
            {p.dimensions.map((d) => (
              <li key={d.label}>
                {sourcingField(d.label, locale)}: {d.value} {d.unit} ({d.source}
                )
              </li>
            ))}
          </ul>
        ) : (
          <p>{t.unknown}</p>
        )}
      </section>
      <section>
        <h2 className="text-xl">{t.relations}</h2>
        {rel.length ? (
          rel.map((r) => (
            <p key={r.id}>
              <Link
                className="text-accent underline"
                href={"/find-part?q=" + encodeURIComponent(r.from)}
              >
                {r.from}
              </Link>{" "}
              →{" "}
              <Link
                className="text-accent underline"
                href={"/find-part?q=" + encodeURIComponent(r.to)}
              >
                {r.to}
              </Link>{" "}
              · {sourcingField(r.type, locale)} · {t[r.status as "candidate"]}
              <br />
              {r.conditions}
              <br />
              {r.unresolved.join(" ")}
            </p>
          ))
        ) : (
          <p>{t.unknown}</p>
        )}
        {p.catalog?.replacements && (
          <p>
            {t.review}: {p.catalog.replacements}
          </p>
        )}
        {p.shared_applications.map((x) => (
          <p key={x}>{x}</p>
        ))}
      </section>
      <section>
        <h2 className="text-xl">{t.evidence}</h2>
        {evidence.length ? (
          evidence.map((e) => (
            <article key={e.id} className="bg5-panel my-3 rounded p-4">
              <p>
                {e.publisher} · {e.source_type} · {e.checked_date ?? t.unknown}
              </p>
              {e.url && (
                <a className="text-accent underline" href={e.url}>
                  {e.document_id || e.publisher}
                </a>
              )}
              <p>
                {e.location} · {e.variant}
              </p>
              <p>{e.fact}</p>
              {e.contradictions.map((c) => (
                <p key={c}>{c}</p>
              ))}
            </article>
          ))
        ) : (
          <p>{t.unreviewed}</p>
        )}
      </section>
      <section>
        <h2 className="text-xl">{t.offers}</h2>
        {p.offers.length ? (
          p.offers.map((o) => (
            <p key={o.url}>
              <a href={o.url} className="text-accent underline">
                {o.seller} · {o.manufacturer_sku}
              </a>{" "}
              · {o.availability} · {o.checked_date}
              <br />
              {o.price ?? t.unknown} {o.currency} / {o.order_unit}
              <br />
              {o.disclaimer}
              <br />
              Shipping / tax / returns: {o.shipping ?? t.unknown} /{" "}
              {o.tax ?? t.unknown} / {o.returns ?? t.unknown}
            </p>
          ))
        ) : (
          <p>{t.unknown}</p>
        )}
      </section>
      <section>
        <h2 className="text-xl">{t.diagrams}</h2>
        {getSections().flatMap((s) =>
          s.diagrams
            .filter((d) => d.code.split("_")[0] === p.category)
            .map((d) => (
              <p key={d.code}>
                <Link
                  className="text-accent underline"
                  href={`/parts/${s.slug}/${d.code.replaceAll("_", "-")}`}
                >
                  {d.code} — {d.name}
                </Link>
              </p>
            )),
        )}
        <p>
          Callout: {p.diagram_callout ?? t.unknown}; {t.review}
        </p>
      </section>
      <section>
        <h2 className="text-xl">{t.brief}</h2>
        <SupplierBrief brief={brief} label={t.copy} copied={t.copied} />
      </section>
      <p className="text-xs text-muted">
        {t.version}: {data.content_version} · {data.checked_date}
      </p>
    </div>
  );
}
