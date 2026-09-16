import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { OBSERVER_NAV, withActive } from "@/lib/nav";
import { MISSION_STATUS_LABEL, missionStatusColor } from "@/lib/utils";

export default async function ObserverMissionsPage() {
  const supabase = createClient();
  const { data: missions } = await supabase
    .from("missions")
    .select("id, mission_no, status, organizations:petrochemical_id(name)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <AppShell title="مأموریت‌های منطقه" orgLabel="ناظر" nav={withActive(OBSERVER_NAV, "/observer/missions")}>
      <div className="panel p-4">
        <table className="w-full data-table">
          <thead><tr><th>شماره</th><th>پتروشیمی</th><th>وضعیت</th></tr></thead>
          <tbody>
            {(missions ?? []).length === 0 && <tr><td colSpan={3} className="text-center py-6 text-ink-faint">موردی یافت نشد.</td></tr>}
            {(missions ?? []).map((m: any) => (
              <tr key={m.id}>
                <td className="font-mono">{m.mission_no}</td>
                <td>{m.organizations?.name ?? "—"}</td>
                <td><span className={`text-xs px-2 py-0.5 rounded ${missionStatusColor(m.status)}`}>{MISSION_STATUS_LABEL[m.status as keyof typeof MISSION_STATUS_LABEL]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
