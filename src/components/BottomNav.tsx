import Link from "next/link";
import type { NavItem } from "@/lib/nav";

export function BottomNav({ items, currentPath }: { items: NavItem[]; currentPath: string }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-base-panel border-t border-base-border flex justify-around py-3 text-xs">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className={item.href === currentPath ? "text-brand-light font-medium" : "text-ink-muted"}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
