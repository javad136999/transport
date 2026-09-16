import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { OBSERVER_NAV, withActive } from "@/lib/nav";
import { riskColor } from "@/lib/utils";

export default async function ObserverAlertsPage() {
  const supabase = createClient();
  const { data: alerts } = await supabase
    .from("alerts")
    .select("id, type, severity, status, missions:mission_id(mission_no)")
    .order("created_at", { ascending: false })
    .limit(150);

  return (
    <AppShell title="هشدارهای منطقه" orgLabel="ناظر" nav={withActive(OBSERVER_NAV, "/observer/alerts")}>
      <div className="panel p-4">
        <table className="w-full data-table">
          <thead><tr><th>مأموریت</th><th>نوع</th><th>شدت</th></tr></thead>
          <tbody>
            {(alerts ?? []).length === 0 && <tr><td colSpan={3} className="text-center py-6 text-ink-faint">هشداری وجود ندارد.</td></tr>}
            {(alerts ?? []).map((a: any) => (
              <tr key={a.id}>
                <td className="font-mono">{a.missions?.mission_no ?? "—"}</td>
                <td>{a.type}</td>
                <td><span className={`text-xs px-2 py-0.5 rounded ${riskColor(a.severity)}`}>{a.severity}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
