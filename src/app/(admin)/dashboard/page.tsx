import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { createClient } from "@/lib/supabase/server";
import { MISSION_STATUS_LABEL, missionStatusColor, riskColor, toPersianDigits } from "@/lib/utils";
import { ADMIN_NAV, withActive } from "@/lib/nav";

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const [
    { count: orgCount },
    { count: activeSubs },
    { count: activeDrivers },
    { count: activeVehicles },
    { count: missionsToday },
    { count: inTransit },
    { count: activeAlerts },
    { data: riskyMissions },
  ] = await Promise.all([
    supabase.from("organizations").select("id", { count: "exact", head: true }).eq("type", "petrochemical"),
    supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("drivers").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("missions").select("id", { count: "exact", head: true }).eq("scheduled_date", new Date().toISOString().slice(0, 10)),
    supabase.from("missions").select("id", { count: "exact", head: true }).eq("status", "in_transit"),
    supabase.from("alerts").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase
      .from("missions")
      .select("id, mission_no, status, risk_level, petrochemical_id")
      .in("risk_level", ["medium", "high"])
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  return (
    <AppShell title="داشبورد مدیریت سامانه" orgLabel="مدیر سامانه" nav={withActive(ADMIN_NAV, "/dashboard")}>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <StatCard label="پتروشیمی‌ها" value={orgCount ?? 0} />
        <StatCard label="اشتراک فعال" value={activeSubs ?? 0} tone="ok" />
        <StatCard label="راننده فعال" value={activeDrivers ?? 0} />
        <StatCard label="تانکر فعال" value={activeVehicles ?? 0} />
        <StatCard label="مأموریت امروز" value={missionsToday ?? 0} tone="progress" />
        <StatCard label="در حال حمل" value={inTransit ?? 0} tone="progress" />
        <StatCard label="هشدار فعال" value={activeAlerts ?? 0} tone="warn" />
      </div>

      <div className="panel p-4">
        <h2 className="text-sm font-medium mb-4">مأموریت‌های پرریسک</h2>
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>شماره مأموریت</th>
              <th>وضعیت</th>
              <th>سطح ریسک</th>
            </tr>
          </thead>
          <tbody>
            {(riskyMissions ?? []).length === 0 && (
              <tr>
                <td colSpan={3} className="text-ink-faint text-center py-6">
                  موردی برای نمایش وجود ندارد.
                </td>
              </tr>
            )}
            {(riskyMissions ?? []).map((m: any) => (
              <tr key={m.id}>
                <td className="font-mono">{m.mission_no}</td>
                <td>
                  <span className={`text-xs px-2 py-0.5 rounded ${missionStatusColor(m.status)}`}>
                    {MISSION_STATUS_LABEL[m.status as keyof typeof MISSION_STATUS_LABEL] ?? m.status}
                  </span>
                </td>
                <td>
                  <span className={`text-xs px-2 py-0.5 rounded ${riskColor(m.risk_level)}`}>
                    {m.risk_level === "high" ? "بالا" : m.risk_level === "medium" ? "متوسط" : "پایین"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
