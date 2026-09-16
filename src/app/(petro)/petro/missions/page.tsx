import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { PETRO_NAV, withActive } from "@/lib/nav";
import { MISSION_STATUS_LABEL, missionStatusColor, riskColor } from "@/lib/utils";

export default async function PetroMissionsPage() {
  const supabase = createClient();
  const { data: missions } = await supabase
    .from("missions")
    .select("id, mission_no, status, risk_level, estimated_volume, scheduled_date")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <AppShell title="مأموریت‌های حمل پساب" orgLabel="پتروشیمی" nav={withActive(PETRO_NAV, "/petro/missions")}>
      <div className="panel p-4">
        <table className="w-full data-table">
          <thead>
            <tr><th>شماره مأموریت</th><th>حجم</th><th>تاریخ</th><th>وضعیت</th><th>ریسک</th></tr>
          </thead>
          <tbody>
            {(missions ?? []).length === 0 && (
              <tr><td colSpan={5} className="text-center py-6 text-ink-faint">هنوز مأموریتی ثبت نکرده‌اید.</td></tr>
            )}
            {(missions ?? []).map((m: any) => (
              <tr key={m.id}>
                <td className="font-mono">{m.mission_no}</td>
                <td>{m.estimated_volume ?? "—"}</td>
                <td className="font-mono">{m.scheduled_date ?? "—"}</td>
                <td><span className={`text-xs px-2 py-0.5 rounded ${missionStatusColor(m.status)}`}>{MISSION_STATUS_LABEL[m.status as keyof typeof MISSION_STATUS_LABEL]}</span></td>
                <td><span className={`text-xs px-2 py-0.5 rounded ${riskColor(m.risk_level)}`}>{m.risk_level}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
