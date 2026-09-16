"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  const pathname = usePathname();
  const router = useRouter();
  const mobileNav = nav.slice(0, 5);

  // Navigation buttons are intentionally contextual: main navigation pages stay clean,
  // while deeper/detail/form pages get a compact back + home control in the header.
  const currentNav = nav.find((item) => item.href === pathname);
  const parentNav = nav
    .filter((item) => item.href !== pathname && pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
  const showContextNav = !currentNav && !!parentNav;
  const homeHref = nav[0]?.href ?? "/";

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(parentNav?.href ?? homeHref);
  };

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
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-brand/10 bg-[#020812e8] px-3 shadow-[0_8px_30px_rgba(0,0,0,.18)] backdrop-blur-2xl sm:px-4 md:px-6">
          <div className="min-w-0">
            <div className="mb-0.5 flex items-center gap-1.5 text-[10px] text-brand-light/55 md:hidden">
              <LayoutDashboard size={11} /> سامانه هوشمند حمل پساب
            </div>
            <h1 className="truncate text-sm font-bold text-white md:text-base">{title}</h1>
          </div>

          {showContextNav && (
            <div className="flex shrink-0 items-center gap-1.5 mr-3" aria-label="ناوبری صفحه">
              <button
                type="button"
                onClick={handleBack}
                aria-label="بازگشت"
                title="بازگشت"
                className="grid h-9 w-9 place-items-center rounded-xl border border-base-border bg-base-panel2/80 text-ink-muted transition hover:border-brand/30 hover:bg-brand/10 hover:text-brand-light active:scale-95"
              >
                <ArrowRight size={17} />
              </button>
              <Link
                href={homeHref}
                aria-label="خانه"
                title="خانه"
                className="grid h-9 w-9 place-items-center rounded-xl border border-brand/20 bg-brand/5 text-brand-light transition hover:bg-brand/10 active:scale-95"
              >
                <Home size={17} />
              </Link>
            </div>
          )}

          <div className="hidden items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-3 py-1.5 text-[10px] text-brand-light/80 md:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand shadow-[0_0_10px_#00BFFF]" />
            رصد عملیاتی آنلاین
          </div>
        </header>

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
