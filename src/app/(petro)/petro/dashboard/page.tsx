import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { createClient } from "@/lib/supabase/server";
import { PETRO_NAV, withActive } from "@/lib/nav";

export default async function PetroDashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("users").select("organization_id").eq("id", user?.id).single();
  const orgId = profile?.organization_id;

  const [{ count: totalMissions }, { count: inTransit }, { count: completed }, { count: alerts }] = await Promise.all([
    supabase.from("missions").select("id", { count: "exact", head: true }).eq("petrochemical_id", orgId),
    supabase.from("missions").select("id", { count: "exact", head: true }).eq("petrochemical_id", orgId).eq("status", "in_transit"),
    supabase.from("missions").select("id", { count: "exact", head: true }).eq("petrochemical_id", orgId).eq("status", "completed"),
    supabase.from("driver_approvals").select("id", { count: "exact", head: true }).eq("petrochemical_id", orgId).eq("status", "approved"),
  ]);

  return (
    <AppShell title="داشبورد پتروشیمی" orgLabel="پتروشیمی" nav={withActive(PETRO_NAV, "/petro/dashboard")}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="کل مأموریت‌ها" value={totalMissions ?? 0} />
        <StatCard label="در حال حمل" value={inTransit ?? 0} tone="progress" />
        <StatCard label="تکمیل‌شده" value={completed ?? 0} tone="ok" />
        <StatCard label="رانندگان تأییدشده" value={alerts ?? 0} />
      </div>
      <div className="panel p-6 mt-6">
        <p className="text-sm text-ink-muted">
          برای ثبت مأموریت جدید حمل پساب، از منوی سمت راست گزینهٔ «مأموریت جدید» را انتخاب کنید.
        </p>
      </div>
    </AppShell>
  );
}
