"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchBar from "@/components/SearchBar";

const links = [
  { href: "/parts", label: "Parts" },
  { href: "/maintenance", label: "Maintenance" },
  { href: "/manuals", label: "Manuals" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav className="sticky top-0 z-50 bg-surface border-b border-border">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Logo / Title */}
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground font-semibold tracking-tight shrink-0"
          >
            <span className="text-accent text-lg font-bold">///</span>
            <span className="text-sm sm:text-base">BG5P Service Manual</span>
          </Link>

          {/* Desktop search — between logo and links */}
          <div className="hidden sm:block mx-4 flex-1 max-w-xs">
            <SearchBar />
          </div>

          {/* Desktop links */}
          <div className="hidden sm:flex items-center gap-1 shrink-0">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  isActive(href)
                    ? "bg-accent text-white"
                    : "text-muted hover:text-foreground hover:bg-white/5"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2 text-muted hover:text-foreground"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile search — always visible, outside hamburger menu */}
      <div className="sm:hidden px-4 pb-3 pt-1">
        <SearchBar />
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-border bg-surface">
          <div className="px-4 py-2 space-y-1">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-3 rounded text-sm font-medium transition-colors ${
                  isActive(href)
                    ? "bg-accent text-white"
                    : "text-muted hover:text-foreground hover:bg-white/5"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
