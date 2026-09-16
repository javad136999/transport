"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { PATROL_BOTTOM_NAV } from "@/lib/nav";

export default function PatrolProfilePage() {
  const supabase = createClient();
  const [name, setName] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from("users").select("full_name").eq("id", user?.id).single();
      setName(data?.full_name ?? "");
    })();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-base pb-24">
      <header className="p-4 border-b border-base-border"><h1 className="text-base font-medium">پروفایل مأمور گشت</h1></header>
      <div className="p-4 space-y-3">
        <div className="panel p-4 text-sm">{name || "در حال بارگذاری..."}</div>
        <button className="btn-secondary w-full" onClick={handleLogout}>خروج از حساب</button>
      </div>
      <BottomNav items={PATROL_BOTTOM_NAV} currentPath="/patrol/profile" />
    </div>
  );
}
