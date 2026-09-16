import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { createClient } from "@/lib/supabase/server";
import { OBSERVER_NAV, withActive } from "@/lib/nav";

export default async function ObserverDashboardPage() {
  const supabase = createClient();
  const [{ count: orgCount }, { count: missionsToday }, { count: alerts }] = await Promise.all([
    supabase.from("organizations").select("id", { count: "exact", head: true }).eq("type", "petrochemical"),
    supabase.from("missions").select("id", { count: "exact", head: true }).eq("scheduled_date", new Date().toISOString().slice(0, 10)),
    supabase.from("alerts").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);

  return (
    <AppShell title="داشبورد نظارت منطقه‌ای حمل پساب" orgLabel="ناظر" nav={withActive(OBSERVER_NAV, "/observer/dashboard")}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard label="پتروشیمی‌ها" value={orgCount ?? 0} />
        <StatCard label="مأموریت امروز" value={missionsToday ?? 0} tone="progress" />
        <StatCard label="هشدار فعال" value={alerts ?? 0} tone="warn" />
      </div>
      <p className="text-xs text-ink-faint mt-4">این حساب فقط دسترسی مشاهده (Read Only) دارد.</p>
    </AppShell>
  );
}
