"use client";

import Link from "next/link";
import { useState } from "react";
import { Droplets, LayoutDashboard, LogOut, UserCircle, X } from "lucide-react";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "@/components/LogoutButton";

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
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="min-h-[100dvh] bg-transparent md:flex">
      <aside className="hidden w-64 shrink-0 border-l border-cyan-100 bg-white/95 shadow-[0_0_35px_rgba(0,150,190,.08)] backdrop-blur-xl md:sticky md:top-0 md:flex md:h-screen md:flex-col">
        <div className="border-b border-cyan-100 p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-glow-cyan">
              <Droplets size={20} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-extrabold tracking-tight text-slate-800">مدیریت حمل فاضلاب</div>
              <div className="mt-1 truncate text-[10px] text-cyan-700">{orgLabel}</div>
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
                  ? "border-cyan-300 bg-cyan-50 font-bold text-cyan-800 shadow-[inset_-3px_0_0_#00BFFF,0_0_22px_rgba(0,191,255,.08)]"
                  : "border-transparent text-slate-700 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-800"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-cyan-100 p-4 text-[10px] leading-6 text-slate-500">
          <span className="text-cyan-500">●</span> رصد و مدیریت عملیات<br />
          شرکت پیمانکاران تصفیه صنعت
        </div>
      </aside>

      <main className="min-w-0 flex-1 pb-24 md:pb-0">
        <header className="sticky top-0 z-40 flex min-h-16 items-center justify-between border-b border-cyan-100 bg-white/90 px-3 shadow-[0_8px_30px_rgba(0,130,170,.10)] backdrop-blur-2xl sm:px-4 md:px-6">
          <div className="relative flex items-center">
            <button
              type="button"
              aria-label="پروفایل کاربر"
              onClick={() => setProfileOpen((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50 text-cyan-700 transition hover:border-cyan-400 hover:bg-cyan-100"
            >
              <UserCircle size={23} />
            </button>

            {profileOpen && (
              <div className="absolute left-0 top-12 w-56 overflow-hidden rounded-2xl border border-cyan-100 bg-white p-2 shadow-[0_20px_60px_rgba(0,100,140,.18)] backdrop-blur-2xl">
                <div className="mb-2 flex items-center justify-between border-b border-cyan-50 px-3 py-2">
                  <div>
                    <div className="text-xs font-bold text-slate-800">پروفایل کاربر</div>
                    <div className="mt-1 text-[10px] text-slate-500">{orgLabel}</div>
                  </div>
                  <button type="button" onClick={() => setProfileOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={15} /></button>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-right text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  <LogOut size={16} /> {loggingOut ? "در حال خروج..." : "خروج از حساب کاربری"}
                </button>
              </div>
            )}
          </div>

          <div className="min-w-0 text-right">
            <div className="mb-0.5 flex items-center justify-end gap-1.5 text-[10px] text-cyan-600 md:hidden">
              <LayoutDashboard size={11} /> سامانه هوشمند حمل پساب
            </div>
            <h1 className="truncate text-sm font-bold text-slate-800 md:text-base">{title}</h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-[10px] text-cyan-700 md:flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-500 shadow-[0_0_10px_#00BFFF]" />
              رصد عملیاتی آنلاین
            </div>
            <LogoutButton compact={true} />
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1440px] p-3 sm:p-4 md:p-6">{children}</div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-cyan-100 bg-white/95 px-2 pt-2 shadow-[0_-12px_35px_rgba(0,130,170,.12)] backdrop-blur-2xl pb-[max(8px,env(safe-area-inset-bottom))] md:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-5 gap-1">
          {mobileNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative min-w-0 rounded-xl px-1 py-2.5 text-center text-[10px] transition-all ${
                item.active ? "bg-cyan-50 font-bold text-cyan-700" : "text-slate-500"
              }`}
            >
              <span className={`mx-auto mb-1 block h-1.5 w-1.5 rounded-full ${item.active ? "bg-cyan-500 shadow-[0_0_9px_#00BFFF]" : "bg-slate-300"}`} />
              <span className="block truncate">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
