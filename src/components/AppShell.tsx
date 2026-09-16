"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Droplets, Home, LayoutDashboard } from "lucide-react";

export function AppShell({
  title,
  orgLabel,
  nav,
  children,
}: {
  title: string;
  orgLabel: string;
  nav: { label: string; href: string; active?: boolean }[];
  children: ReactNode;
}) {
  const mobileNav = nav.slice(0, 5);

  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  }

  return (
    <div className="min-h-[100dvh] bg-transparent md:flex">
      <aside className="hidden w-64 shrink-0 border-l border-base-border/80 bg-[#04101ee8] shadow-2xl backdrop-blur-xl md:sticky md:top-0 md:flex md:h-screen md:flex-col">
        <div className="border-b border-base-border/80 p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-aqua-eco text-white shadow-glow-cyan">
              <Droplets size={20} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-extrabold tracking-tight text-white">مدیریت حمل فاضلاب</div>
              <div className="mt-1 truncate text-[10px] text-brand-light/65">{orgLabel}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-xl border px-3 py-3 text-sm transition-all ${
                item.active
                  ? "border-brand/25 bg-brand/10 font-bold text-brand-light shadow-[inset_-3px_0_0_#00BFFF,0_0_22px_rgba(0,191,255,.08)]"
                  : "border-transparent text-ink-muted hover:border-base-border hover:bg-base-panel2 hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-base-border/80 p-4 text-[10px] leading-6 text-ink-faint">
          <span className="text-brand-light/70">●</span> رصد و مدیریت عملیات<br />
          شرکت پیمانکاران تصفیه صنعت
        </div>
      </aside>

      <main className="min-w-0 flex-1 pb-24 md:pb-0">
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-brand/10 bg-[#020812e8] px-4 pl-28 shadow-[0_8px_30px_rgba(0,0,0,.18)] backdrop-blur-2xl md:px-6 md:pl-32">
          <div className="min-w-0">
            <div className="mb-0.5 flex items-center gap-1.5 text-[10px] text-brand-light/55 md:hidden">
              <LayoutDashboard size={11} /> سامانه هوشمند حمل پساب
            </div>
            <h1 className="truncate text-sm font-bold text-white md:text-base">{title}</h1>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-3 py-1.5 text-[10px] text-brand-light/80 md:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand shadow-[0_0_10px_#00BFFF]" />
            رصد عملیاتی آنلاین
          </div>
        </header>

        <div className="fixed left-3 top-3 z-[100] flex items-center gap-2 sm:left-4 sm:top-4">
          <button
            type="button"
            onClick={goBack}
            aria-label="بازگشت به مرحله قبل"
            title="بازگشت"
            className="flex h-10 items-center gap-1.5 rounded-xl border border-brand/25 bg-[#03101bf2] px-3 text-xs font-bold text-brand-light shadow-[0_0_20px_rgba(0,191,255,.12)] backdrop-blur-xl transition hover:border-brand/50 hover:bg-brand/10 active:scale-95"
          >
            <ArrowRight size={17} />
            <span className="hidden sm:inline">بازگشت</span>
          </button>
          <Link
            href="/"
            aria-label="صفحه اصلی"
            title="صفحه اصلی"
            className="grid h-10 w-10 place-items-center rounded-xl border border-brand/25 bg-[#03101bf2] text-brand-light shadow-[0_0_20px_rgba(0,191,255,.12)] backdrop-blur-xl transition hover:border-brand/50 hover:bg-brand/10 active:scale-95"
          >
            <Home size={18} />
          </Link>
        </div>

        <div className="mx-auto w-full max-w-[1440px] p-3 sm:p-4 md:p-6">{children}</div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand/20 bg-[#020A15f5] px-2 pt-2 shadow-[0_-12px_35px_rgba(0,0,0,.3)] backdrop-blur-2xl pb-[max(8px,env(safe-area-inset-bottom))] md:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-5 gap-1">
          {mobileNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative min-w-0 rounded-xl px-1 py-2.5 text-center text-[10px] transition-all ${
                item.active ? "bg-brand/10 font-bold text-brand-light" : "text-ink-faint"
              }`}
            >
              <span className={`mx-auto mb-1 block h-1.5 w-1.5 rounded-full ${item.active ? "bg-brand shadow-[0_0_9px_#00BFFF]" : "bg-current/60"}`} />
              <span className="block truncate">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
