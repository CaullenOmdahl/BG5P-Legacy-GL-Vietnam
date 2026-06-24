import { cookies, headers } from "next/headers";
import {
  normalizeLocale,
  SITE_LOCALE_COOKIE_KEY,
  type Locale,
} from "@/lib/locale";

function localeFromAcceptLanguage(value: string | null): Locale | null {
  if (!value) return null;

  const candidates = value
    .split(",")
    .map((part) => {
      const [tag, qValue] = part.trim().split(";q=");
      const q = qValue ? Number.parseFloat(qValue) : 1;
      return { locale: normalizeLocale(tag), q: Number.isFinite(q) ? q : 0 };
    })
    .filter((item): item is { locale: Locale; q: number } => Boolean(item.locale))
    .sort((a, b) => b.q - a.q);

  return candidates[0]?.locale ?? null;
}

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const stored = normalizeLocale(cookieStore.get(SITE_LOCALE_COOKIE_KEY)?.value);
  if (stored) return stored;

  const headerStore = await headers();
  return localeFromAcceptLanguage(headerStore.get("accept-language")) ?? "en";
}
