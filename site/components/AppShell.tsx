"use client";

import { type ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  BookOpenText,
  CircuitBoard,
  FileText,
  Gauge,
  Home,
  Menu,
  PanelLeftClose,
  Settings2,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import { LocaleProvider, useLocale } from "@/components/LocaleProvider";
import Bg5ChatWidget from "@/components/Bg5ChatWidget";
import SearchBar from "@/components/SearchBar";
import { getCopy } from "@/lib/i18n";
import type { Locale } from "@/lib/locale";

const primaryNav = [
  { href: "/", key: "overview", icon: Home },
  { href: "/parts", key: "parts", icon: CircuitBoard },
  { href: "/maintenance", key: "maintenance", icon: Wrench },
  { href: "/manuals", key: "manuals", icon: BookOpenText },
  { href: "/about", key: "about", icon: Gauge },
] as const;

function openChat(prompt?: string) {
  window.dispatchEvent(
    new CustomEvent("bg5:open-chat", {
      detail: {
        prompt,
        mode: "diagnose",
      },
    })
  );
}

function NavLink({
  href,
  label,
  secondary,
  icon: Icon,
  onClick,
}: {
  href: string;
  label: string;
  secondary: string;
  icon: typeof Home;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
        active
          ? "bg-accent text-background"
          : "text-muted hover:bg-panel hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium leading-4">{label}</span>
        <span
          className={`mt-0.5 block truncate text-[11px] leading-4 ${
            active ? "text-background/70" : "text-muted/70 group-hover:text-muted"
          }`}
        >
          {secondary}
        </span>
      </span>
    </Link>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { locale } = useLocale();
  const labels = getCopy(locale).shell;

  return (
    <aside className="flex h-full flex-col bg-surface">
      <div className="border-b border-border px-5 py-5">
        <Link href="/" onClick={onNavigate} className="group block">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md border border-accent/40 bg-accent/12 text-accent">
              <Settings2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">
                BG5P
              </p>
              <p className="truncate text-sm font-semibold text-foreground">
                {labels.serviceReference}
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted/70">
          {labels.reference}
        </p>
        <nav className="flex flex-col gap-1">
          {primaryNav.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={labels.nav[item.key]}
              secondary={labels.navSecondary[item.key]}
              onClick={onNavigate}
            />
          ))}
        </nav>

        <div className="mt-6 rounded-md border border-border bg-background/55 p-3">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-foreground">
            <FileText className="h-4 w-4 text-amber" aria-hidden="true" />
            {labels.publicReferences}
          </div>
          <div className="flex flex-col gap-2">
            {labels.quickRefs.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className="group rounded border border-transparent px-2 py-1.5 transition-colors hover:border-border hover:bg-panel"
              >
                <span className="block text-xs font-medium text-foreground group-hover:text-accent">
                  {item.label}
                </span>
                <span className="mt-0.5 block text-[11px] leading-snug text-muted">
                  {item.meta}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={() => openChat(labels.chatPrompt)}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-3 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-accent-hover"
        >
          <Bot className="h-4 w-4" aria-hidden="true" />
          {labels.askAi}
        </button>
      </div>
    </aside>
  );
}

function AppShellInner({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { locale, setLocale } = useLocale();
  const labels = getCopy(locale).shell;

  return (
    <div className="min-h-screen">
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-border">
        <Sidebar />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/55"
            aria-label={labels.closeNavigation}
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[min(22rem,86vw)] border-r border-border shadow-2xl shadow-black/60">
            <div className="absolute right-3 top-3 z-10">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted hover:text-foreground"
                aria-label={labels.closeNavigation}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 border-b border-border bg-background/88 backdrop-blur-xl">
          <div className="flex min-h-16 flex-wrap items-center gap-3 px-4 py-2 sm:flex-nowrap sm:px-6 sm:py-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-muted hover:text-foreground lg:hidden"
              aria-label={labels.openNavigation}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="hidden min-w-0 items-center gap-2 text-sm text-muted lg:flex">
              <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
              <span className="font-mono text-[11px] uppercase tracking-[0.2em]">
                {labels.topbar}
              </span>
            </div>

            <div className="order-2 min-w-0 basis-full sm:order-none sm:flex-1">
              <SearchBar />
            </div>

            <button
              type="button"
              onClick={() => openChat()}
              className="hidden shrink-0 items-center gap-2 rounded-md border border-accent/40 bg-accent/12 px-3 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-background sm:flex"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {labels.aiButton}
            </button>
            <button
              type="button"
              onClick={() => setLocale(locale === "vi" ? "en" : "vi")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-surface font-mono text-xs font-semibold text-muted transition-colors hover:border-accent hover:text-foreground"
              aria-label={labels.switchLanguage}
            >
              {locale === "vi" ? "VI" : "EN"}
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AppShell({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
}) {
  return (
    <LocaleProvider initialLocale={initialLocale}>
      <AppShellInner>{children}</AppShellInner>
      <Bg5ChatWidget />
    </LocaleProvider>
  );
}
