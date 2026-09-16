import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_NAV, withActive } from "@/lib/nav";
import { MISSION_STATUS_LABEL, missionStatusColor, riskColor } from "@/lib/utils";

export default async function AdminMissionsPage() {
  const supabase = createClient();
  const { data: missions } = await supabase
    .from("missions")
    .select("id, mission_no, status, risk_level, estimated_volume, scheduled_date, organizations:petrochemical_id(name)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <AppShell title="همه مأموریت‌ها" orgLabel="مدیر سامانه" nav={withActive(ADMIN_NAV, "/dashboard/missions")}>
      <div className="panel p-4">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>شماره مأموریت</th>
              <th>پتروشیمی</th>
              <th>حجم</th>
              <th>تاریخ</th>
              <th>وضعیت</th>
              <th>ریسک</th>
            </tr>
          </thead>
          <tbody>
            {(missions ?? []).length === 0 && (
              <tr><td colSpan={6} className="text-center py-6 text-ink-faint">هیچ مأموریتی ثبت نشده است.</td></tr>
            )}
            {(missions ?? []).map((m: any) => (
              <tr key={m.id}>
                <td className="font-mono">{m.mission_no}</td>
                <td>{m.organizations?.name ?? "—"}</td>
                <td>{m.estimated_volume ?? "—"}</td>
                <td className="font-mono">{m.scheduled_date ?? "—"}</td>
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
