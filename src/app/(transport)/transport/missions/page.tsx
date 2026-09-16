import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { TRANSPORT_NAV, withActive } from "@/lib/nav";
import { MISSION_STATUS_LABEL, missionStatusColor } from "@/lib/utils";

export default async function TransportMissionsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("users").select("organization_id").eq("id", user?.id).single();

  const { data: missions } = await supabase
    .from("missions")
    .select("id, mission_no, status, scheduled_date")
    .eq("transport_company_id", profile?.organization_id)
    .order("created_at", { ascending: false });

  return (
    <AppShell title="مأموریت‌های تخصیص‌یافته" orgLabel="شرکت حمل" nav={withActive(TRANSPORT_NAV, "/transport/missions")}>
      <div className="panel p-4">
        <table className="w-full data-table">
          <thead><tr><th>شماره مأموریت</th><th>تاریخ</th><th>وضعیت</th></tr></thead>
          <tbody>
            {(missions ?? []).length === 0 && <tr><td colSpan={3} className="text-center py-6 text-ink-faint">مأموریتی تخصیص نیافته است.</td></tr>}
            {(missions ?? []).map((m: any) => (
              <tr key={m.id}>
                <td className="font-mono">{m.mission_no}</td>
                <td className="font-mono">{m.scheduled_date ?? "—"}</td>
                <td><span className={`text-xs px-2 py-0.5 rounded ${missionStatusColor(m.status)}`}>{MISSION_STATUS_LABEL[m.status as keyof typeof MISSION_STATUS_LABEL]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
