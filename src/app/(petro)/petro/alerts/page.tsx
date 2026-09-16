import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { PETRO_NAV, withActive } from "@/lib/nav";
import { riskColor } from "@/lib/utils";

export default async function PetroAlertsPage() {
  const supabase = createClient();
  const { data: alerts } = await supabase
    .from("alerts")
    .select("id, type, status, severity, created_at, missions:mission_id(mission_no)")
    .order("created_at", { ascending: false })
    .limit(150);

  return (
    <AppShell title="هشدارهای مأموریت‌های ما" orgLabel="پتروشیمی" nav={withActive(PETRO_NAV, "/petro/alerts")}>
      <div className="panel p-4">
        <table className="w-full data-table">
          <thead>
            <tr><th>مأموریت</th><th>نوع</th><th>شدت</th><th>وضعیت</th></tr>
          </thead>
          <tbody>
            {(alerts ?? []).length === 0 && (
              <tr><td colSpan={4} className="text-center py-6 text-ink-faint">هشداری ثبت نشده است.</td></tr>
            )}
            {(alerts ?? []).map((a: any) => (
              <tr key={a.id}>
                <td className="font-mono">{a.missions?.mission_no ?? "—"}</td>
                <td>{a.type}</td>
                <td><span className={`text-xs px-2 py-0.5 rounded ${riskColor(a.severity)}`}>{a.severity}</span></td>
                <td className="text-ink-muted">{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
