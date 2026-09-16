import Link from "next/link";
import type { ReactNode } from "react";
import { Droplets } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-transparent md:flex">
      <aside className="hidden w-64 shrink-0 border-l border-base-border bg-base-panel md:flex md:flex-col md:sticky md:top-0 md:h-screen">
        <div className="border-b border-base-border p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-aqua-eco text-[#02171B] shadow-glow-cyan"><Droplets size={18} /></div>
            <div><div className="text-sm font-bold">مدیریت حمل فاضلاب</div><div className="mt-0.5 text-[10px] text-ink-faint">{orgLabel}</div></div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {nav.map((item) => <Link key={item.href} href={item.href} className={`block rounded-xl px-3 py-2.5 text-sm transition-colors ${item.active ? "bg-brand/15 font-medium text-brand-light shadow-[inset_-2px_0_0_rgba(63,232,245,.8)]" : "text-ink-muted hover:bg-base-panel2 hover:text-ink"}`}>{item.label}</Link>)}
        </nav>
        <div className="border-t border-base-border p-3 text-[10px] leading-5 text-ink-faint">شرکت پیمانکاران تصفیه صنعت<br />سامانه رصد و مدیریت عملیات</div>
      </aside>

      <main className="min-w-0 flex-1 pb-20 md:pb-0">
        <header className="sticky top-0 z-30 flex min-h-14 items-center justify-between border-b border-base-border bg-[#061116e8] px-4 backdrop-blur-xl md:px-6">
          <div><div className="text-[10px] text-cyan-200/55 md:hidden">مدیریت حمل فاضلاب بهداشتی عسلویه</div><h1 className="text-sm font-semibold md:text-base">{title}</h1></div>
          <div className="hidden rounded-full border border-cyan-300/15 bg-cyan-300/5 px-3 py-1 text-[10px] text-cyan-200/70 md:block">رصد عملیاتی</div>
        </header>
        <div className="p-4 md:p-6">{children}</div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-cyan-300/15 bg-[#061116f2] px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-5 gap-1">
          {mobileNav.map((item) => <Link key={item.href} href={item.href} className={`rounded-xl py-2 text-center text-[10px] ${item.active ? "bg-brand/12 text-cyan-200" : "text-ink-faint"}`}><span className="mx-auto mb-1 block h-1 w-1 rounded-full bg-current" />{item.label}</Link>)}
        </div>
      </nav>
    </div>
  );
}
