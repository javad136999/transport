"use client";

import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";
import { usePathname } from "next/navigation";

export default function GlobalNavigation() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  }

  return (
    <div className="fixed left-3 top-3 z-[200] flex items-center gap-2 sm:left-4 sm:top-4">
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
  );
}
