"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import LanguageToggle from "@/components/language-toggle";
import SignOutButton from "@/components/dashboard/SignOutButton";
import type { Locale } from "@/lib/locales";

type MobileDashboardMenuProps = {
  locale: Locale;
  role?: string | null;
  signOutLabel: string;
  nav: {
    dashboard: string;
    customers: string;
    products: string;
    orders: string;
    newOrder: string;
  };
};

export default function MobileDashboardMenu({ locale, role, signOutLabel, nav }: MobileDashboardMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target;

      if (target instanceof Node && menuRef.current?.contains(target)) {
        return;
      }

      setIsOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer, true);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative lg:hidden">
      {isOpen ? (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 cursor-default bg-transparent"
          onPointerDown={closeMenu}
        />
      ) : null}

      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="relative z-50 flex cursor-pointer list-none items-center gap-2 rounded-full border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-100"
      >
        <span className="text-base leading-none" aria-hidden="true">
          {isOpen ? "\u00d7" : "\u2630"}
        </span>
        <span>Menu</span>
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 flex w-64 flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-3 shadow-xl">
          <Link href="/dashboard" onClick={closeMenu} className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900">
            {nav.dashboard}
          </Link>
          <Link href="/customers" onClick={closeMenu} className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900">
            {nav.customers}
          </Link>
          <Link href="/products" onClick={closeMenu} className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900">
            {nav.products}
          </Link>
          <Link href="/orders" onClick={closeMenu} className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900">
            {nav.orders}
          </Link>
          <Link href="/orders/new" onClick={closeMenu} className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700">
            {nav.newOrder}
          </Link>
          <div className="border-t border-zinc-200 pt-2">
            <div className="mb-2 flex items-center justify-between gap-2">
              <LanguageToggle locale={locale} />
              <span className="text-right text-xs uppercase tracking-[0.16em] text-zinc-500">{role}</span>
            </div>
            <SignOutButton label={signOutLabel} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
