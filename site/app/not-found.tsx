import Link from "next/link";
import { getCopy } from "@/lib/i18n";
import { getServerLocale } from "@/lib/server-locale";

export default async function NotFound() {
  const locale = await getServerLocale();
  const copy = getCopy(locale).notFound;

  return (
    <section className="bg5-panel-strong rounded-lg p-5 sm:p-7">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
        {copy.eyebrow}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
        {copy.title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
        {copy.description}
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/"
          className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-background transition-colors hover:bg-accent-hover"
        >
          {copy.home}
        </Link>
        <Link
          href="/manuals"
          className="rounded-md border border-border px-3 py-2 text-sm font-semibold text-muted transition-colors hover:border-accent hover:text-foreground"
        >
          {copy.manuals}
        </Link>
        <Link
          href="/parts"
          className="rounded-md border border-border px-3 py-2 text-sm font-semibold text-muted transition-colors hover:border-accent hover:text-foreground"
        >
          {copy.parts}
        </Link>
      </div>
    </section>
  );
}
