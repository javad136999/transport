import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_NAV, withActive } from "@/lib/nav";
import { riskColor } from "@/lib/utils";

export default async function SuspiciousPage() {
  const supabase = createClient();
  const { data: missions } = await supabase
    .from("missions")
    .select("id, mission_no, status, risk_level, organizations:petrochemical_id(name)")
    .in("status", ["needs_review", "suspicious"])
    .order("updated_at", { ascending: false })
    .limit(100);

  return (
    <AppShell title="موارد مشکوک" orgLabel="مدیر سامانه" nav={withActive(ADMIN_NAV, "/dashboard/suspicious")}>
      <p className="text-xs text-ink-faint mb-4 max-w-2xl">
        این وضعیت‌ها فقط نشان‌دهندهٔ نیاز به بررسی انسانی هستند و به‌خودی‌خود به‌معنی تخلف قانونی قطعی نیستند؛
        تشخیص نهایی برعهدهٔ مرجع صلاحیت‌دار است.
      </p>
      <div className="panel p-4">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>شماره مأموریت</th>
              <th>پتروشیمی</th>
              <th>وضعیت</th>
              <th>سطح ریسک</th>
            </tr>
          </thead>
          <tbody>
            {(missions ?? []).length === 0 && (
              <tr><td colSpan={4} className="text-center py-6 text-ink-faint">موردی برای بررسی وجود ندارد.</td></tr>
            )}
            {(missions ?? []).map((m: any) => (
              <tr key={m.id}>
                <td className="font-mono">{m.mission_no}</td>
                <td>{m.organizations?.name ?? "—"}</td>
                <td className="text-status-warn">{m.status === "suspicious" ? "مشکوک" : "نیازمند بررسی"}</td>
                <td><span className={`text-xs px-2 py-0.5 rounded ${riskColor(m.risk_level)}`}>{m.risk_level}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
