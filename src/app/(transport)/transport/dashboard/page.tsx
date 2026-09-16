import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { createClient } from "@/lib/supabase/server";
import { TRANSPORT_NAV, withActive } from "@/lib/nav";

export default async function TransportDashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("users").select("organization_id").eq("id", user?.id).single();
  const orgId = profile?.organization_id;

  const [{ count: drivers }, { count: vehicles }, { count: missions }] = await Promise.all([
    supabase.from("drivers").select("id", { count: "exact", head: true }).eq("transport_company_id", orgId),
    supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("transport_company_id", orgId),
    supabase.from("missions").select("id", { count: "exact", head: true }).eq("transport_company_id", orgId),
  ]);

  return (
    <AppShell title="داشبورد شرکت حمل" orgLabel="شرکت حمل" nav={withActive(TRANSPORT_NAV, "/transport/dashboard")}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard label="رانندگان ما" value={drivers ?? 0} />
        <StatCard label="تانکرهای ما" value={vehicles ?? 0} />
        <StatCard label="مأموریت‌های تخصیص‌یافته" value={missions ?? 0} tone="progress" />
      </div>
    </AppShell>
  );
}
