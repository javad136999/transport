import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { TRANSPORT_NAV, withActive } from "@/lib/nav";
import { approvalColor } from "@/lib/utils";

export default async function TransportDriversPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("users").select("organization_id").eq("id", user?.id).single();

  const { data: drivers } = await supabase
    .from("drivers")
    .select("id, first_name, last_name, mobile, license_no, status")
    .eq("transport_company_id", profile?.organization_id);

  return (
    <AppShell title="رانندگان ما" orgLabel="شرکت حمل" nav={withActive(TRANSPORT_NAV, "/transport/drivers")}>
      <div className="panel p-4">
        <table className="w-full data-table">
          <thead><tr><th>نام</th><th>موبایل</th><th>گواهینامه</th><th>وضعیت</th></tr></thead>
          <tbody>
            {(drivers ?? []).length === 0 && <tr><td colSpan={4} className="text-center py-6 text-ink-faint">راننده‌ای ثبت نکرده‌اید.</td></tr>}
            {(drivers ?? []).map((d: any) => (
              <tr key={d.id}>
                <td>{d.first_name} {d.last_name}</td>
                <td className="font-mono" dir="ltr">{d.mobile}</td>
                <td className="font-mono">{d.license_no}</td>
                <td><span className={`text-xs px-2 py-0.5 rounded ${approvalColor(d.status)}`}>{d.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
