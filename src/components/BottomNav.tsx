import Link from "next/link";
import type { NavItem } from "@/lib/nav";
import { LogoutButton } from "@/components/LogoutButton";

export function BottomNav({ items, currentPath }: { items: NavItem[]; currentPath: string }) {
  return (
    <nav aria-label="ناوبری پنل کاربری" className="fixed bottom-0 inset-x-0 z-40 border-t border-cyan-100 bg-white/95 px-2 py-2 text-xs shadow-[0_-12px_35px_rgba(0,130,170,.12)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-xl items-center justify-around gap-1">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className={item.href === currentPath ? "text-brand-light font-medium" : "text-ink-muted"}>
          {item.label}
        </Link>
      ))}
      <LogoutButton compact={true} />
      </div>
    </nav>
  );
}
