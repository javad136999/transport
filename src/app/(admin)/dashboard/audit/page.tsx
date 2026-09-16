import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_NAV, withActive } from "@/lib/nav";

export default async function AuditLogPage() {
  const supabase = createClient();
  const { data: logs } = await supabase
    .from("audit_logs")
    .select("id, operation, resource_type, resource_id, created_at, users:user_id(full_name)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <AppShell title="Audit Log" orgLabel="مدیر سامانه" nav={withActive(ADMIN_NAV, "/dashboard/audit")}>
      <div className="panel p-4">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>زمان</th>
              <th>کاربر</th>
              <th>عملیات</th>
              <th>نوع منبع</th>
              <th>شناسه منبع</th>
            </tr>
          </thead>
          <tbody>
            {(logs ?? []).length === 0 && (
              <tr><td colSpan={5} className="text-center py-6 text-ink-faint">رخدادی ثبت نشده است.</td></tr>
            )}
            {(logs ?? []).map((l: any) => (
              <tr key={l.id}>
                <td className="font-mono text-xs">{new Date(l.created_at).toLocaleString("fa-IR")}</td>
                <td>{l.users?.full_name ?? "سیستم"}</td>
                <td>{l.operation}</td>
                <td className="font-mono text-xs">{l.resource_type ?? "—"}</td>
                <td className="font-mono text-xs">{l.resource_id ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
