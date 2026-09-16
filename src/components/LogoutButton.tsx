"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await createClient().auth.signOut();
    window.location.assign("/login");
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      aria-label="خروج از حساب کاربری"
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 text-xs font-bold text-rose-600 transition hover:border-rose-300 hover:bg-rose-100 active:scale-[.97] disabled:opacity-60 ${compact ? "h-10 w-10 px-0" : "px-3 py-2.5"}`}
    >
      <LogOut size={16} />
      {!compact && <span>{loading ? "در حال خروج..." : "خروج"}</span>}
    </button>
  );
}
