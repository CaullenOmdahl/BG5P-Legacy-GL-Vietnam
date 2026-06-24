"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  getEffectiveLocale,
  setSiteLocale,
  type Locale,
} from "@/lib/locale";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    const effective = getEffectiveLocale(initialLocale);
    setLocaleState(effective);
    setSiteLocale(effective);
  }, [initialLocale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale(nextLocale) {
        setLocaleState(nextLocale);
        setSiteLocale(nextLocale);
        startTransition(() => {
          router.refresh();
        });
      },
    }),
    [locale, router, startTransition]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used inside LocaleProvider");
  }
  return context;
}
