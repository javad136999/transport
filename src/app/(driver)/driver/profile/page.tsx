"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { DRIVER_BOTTOM_NAV } from "@/lib/nav";

export default function DriverProfilePage() {
  const supabase = createClient();
  const [driver, setDriver] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from("drivers").select("*").eq("user_id", user?.id).single();
      setDriver(data);
    })();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-base pb-24">
      <header className="p-4 border-b border-base-border"><h1 className="text-base font-medium">پروفایل</h1></header>
      <div className="p-4 space-y-3">
        {driver ? (
          <div className="panel p-4 space-y-2 text-sm">
            <Row label="نام" value={`${driver.first_name} ${driver.last_name}`} />
            <Row label="موبایل" value={driver.mobile} />
            <Row label="شماره گواهینامه" value={driver.license_no} />
            <Row label="وضعیت" value={driver.status} />
          </div>
        ) : (
          <p className="text-ink-faint text-sm text-center py-10">در حال بارگذاری اطلاعات...</p>
        )}
        <button className="btn-secondary w-full" onClick={handleLogout}>خروج از حساب</button>
      </div>
      <BottomNav items={DRIVER_BOTTOM_NAV} currentPath="/driver/profile" />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-ink-muted">{label}</span><span>{value}</span></div>;
}
