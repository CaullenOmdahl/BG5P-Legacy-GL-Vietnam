export type Locale = "en" | "vi";

export const SITE_LOCALE_STORAGE_KEY = "bg5-site-locale-v1";
export const SITE_LOCALE_COOKIE_KEY = "bg5_site_locale";
export const SITE_LOCALE_EVENT = "bg5:locale-change";

export function normalizeLocale(value: string | null | undefined): Locale | null {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized.startsWith("vi")) return "vi";
  if (normalized.startsWith("en")) return "en";
  return null;
}

export function detectBrowserLocale(fallback: Locale = "en"): Locale {
  if (typeof navigator === "undefined") return fallback;
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const language of languages) {
    const locale = normalizeLocale(language);
    if (locale) return locale;
  }
  return fallback;
}

export function readStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  try {
    return normalizeLocale(window.localStorage.getItem(SITE_LOCALE_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function readCookieLocale(): Locale | null {
  if (typeof document === "undefined") return null;
  const prefix = `${SITE_LOCALE_COOKIE_KEY}=`;
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  return normalizeLocale(match?.slice(prefix.length));
}

export function readDocumentLocale(): Locale | null {
  if (typeof document === "undefined") return null;
  return normalizeLocale(document.documentElement.lang);
}

export function getEffectiveLocale(fallback: Locale = "en"): Locale {
  return readStoredLocale() ?? readCookieLocale() ?? detectBrowserLocale(fallback) ?? readDocumentLocale() ?? fallback;
}

export function setSiteLocale(locale: Locale) {
  if (typeof document !== "undefined") {
    document.documentElement.lang = locale;
    document.cookie = `${SITE_LOCALE_COOKIE_KEY}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(SITE_LOCALE_STORAGE_KEY, locale);
    } catch {
      // Locale persistence is optional.
    }

    window.dispatchEvent(
      new CustomEvent<{ locale: Locale }>(SITE_LOCALE_EVENT, {
        detail: { locale },
      })
    );
  }
}
