import Link from "next/link";
import {
  BookOpenText,
  CircuitBoard,
  FileText,
  Gauge,
  Sparkles,
  Wrench,
} from "lucide-react";
import Bg5HomeAssistant from "@/components/Bg5HomeAssistant";
import { getCopy } from "@/lib/i18n";
import { getServerLocale } from "@/lib/server-locale";

const sectionIcons = {
  "/parts": CircuitBoard,
  "/maintenance": Wrench,
  "/manuals": BookOpenText,
} as const;

export default async function Page() {
  const locale = await getServerLocale();
  const copy = getCopy(locale).home;

  return (
    <div className="flex flex-col gap-8 pb-10">
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="bg5-panel-strong min-w-0 rounded-lg p-5 sm:p-7">
          <div className="flex min-w-0 flex-col gap-8">
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">
                {copy.eyebrow}
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {copy.title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-muted sm:text-base">
                {copy.description}
              </p>
            </div>

            <div className="grid min-w-0 gap-2 sm:grid-cols-5">
              {copy.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="rounded-md border border-border bg-background/55 px-3 py-3"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                    {spec.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-snug text-foreground">
                    {spec.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Bg5HomeAssistant />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {copy.sections.map((section) => {
          const Icon = sectionIcons[section.href as keyof typeof sectionIcons];
          return (
            <Link
              key={section.href}
              href={section.href}
              className="group bg5-panel rounded-lg p-4 transition-colors hover:border-accent"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-panel text-accent">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted group-hover:text-accent">
                  {copy.open}
                </span>
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-semibold text-foreground">
                  {section.title}
                </h2>
                <p className="mt-1 font-mono text-xs text-accent">
                  {section.value} {section.unit}
                </p>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {section.description}
                </p>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="bg5-panel rounded-lg p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-panel text-amber">
              <Gauge className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                {copy.diagnosticTitle}
              </h2>
              <p className="text-sm text-muted">{copy.diagnosticSubtitle}</p>
            </div>
          </div>
          <ul className="mt-5 flex flex-col gap-3">
            {copy.diagnosticPaths.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-muted">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg5-panel rounded-lg p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-panel text-accent">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                {copy.linksTitle}
              </h2>
              <p className="text-sm text-muted">{copy.linksSubtitle}</p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <a
              href="/llms.txt"
              className="rounded-md border border-border bg-background/55 px-3 py-3 text-sm font-medium text-foreground hover:border-accent hover:text-accent"
            >
              {copy.linkLabels.sitemap}
            </a>
            <Link
              href="/manuals"
              className="rounded-md border border-border bg-background/55 px-3 py-3 text-sm font-medium text-foreground hover:border-accent hover:text-accent"
            >
              {copy.linkLabels.manuals}
            </Link>
            <Link
              href="/parts"
              className="rounded-md border border-border bg-background/55 px-3 py-3 text-sm font-medium text-foreground hover:border-accent hover:text-accent"
            >
              {copy.linkLabels.parts}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
