"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { localeCookieName, supportedLocales, type Locale } from "@/lib/locales";

const localeLabels: Record<Locale, string> = {
  en: "English",
  am: "አማርኛ",
};

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type LanguageToggleProps = {
  locale: Locale;
  size?: "default" | "sm";
};

export default function LanguageToggle({ locale, size = "default" }: LanguageToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const wrapperClass =
    size === "sm"
      ? "inline-flex items-center rounded-full border border-zinc-200 bg-white p-0.5 text-[10px] font-semibold shadow-sm"
      : "inline-flex items-center rounded-full border border-zinc-200 bg-white p-1 text-xs font-semibold shadow-sm";

  const buttonBaseClass = size === "sm" ? "rounded-full px-2 py-1 transition" : "rounded-full px-3 py-1.5 transition";

  const updateLocale = (nextLocale: Locale) => {
    if (nextLocale === locale || isPending) {
      return;
    }

    document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className={wrapperClass}>
      {supportedLocales.map((supportedLocale) => {
        const isActive = supportedLocale === locale;

        return (
          <button
            key={supportedLocale}
            type="button"
            onClick={() => updateLocale(supportedLocale)}
            className={[
              buttonBaseClass,
              isActive ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
            ].join(" ")}
            aria-pressed={isActive}
            disabled={isPending && !isActive}
          >
            {localeLabels[supportedLocale]}
          </button>
        );
      })}
    </div>
  );
}