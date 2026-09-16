import Link from "next/link";
import type { ReactNode } from "react";

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
  return (
    <div className="min-h-screen flex">
      <aside className="w-60 shrink-0 bg-base-panel border-l border-base-border flex flex-col">
        <div className="p-5 border-b border-base-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-brand flex items-center justify-center font-mono text-white text-xs">P</div>
            <span className="text-sm font-medium">{orgLabel}</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded text-sm transition-colors ${
                item.active ? "bg-brand/15 text-brand-light" : "text-ink-muted hover:bg-base-panel2 hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-base-border text-xs text-ink-faint font-mono">
          شرکت پیمانکاران تصفیه صنعت
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="h-14 border-b border-base-border flex items-center px-6 bg-base-panel/50">
          <h1 className="text-sm font-medium">{title}</h1>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
