import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { TRANSPORT_NAV, withActive } from "@/lib/nav";
import { approvalColor } from "@/lib/utils";

export default async function TransportVehiclesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("users").select("organization_id").eq("id", user?.id).single();

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, plate_normalized, fleet_no, status")
    .eq("transport_company_id", profile?.organization_id);

  return (
    <AppShell title="تانکرهای ما" orgLabel="شرکت حمل" nav={withActive(TRANSPORT_NAV, "/transport/vehicles")}>
      <div className="panel p-4">
        <table className="w-full data-table">
          <thead><tr><th>پلاک</th><th>شماره ناوگان</th><th>وضعیت</th></tr></thead>
          <tbody>
            {(vehicles ?? []).length === 0 && <tr><td colSpan={3} className="text-center py-6 text-ink-faint">تانکری ثبت نکرده‌اید.</td></tr>}
            {(vehicles ?? []).map((v: any) => (
              <tr key={v.id}>
                <td className="font-mono" dir="ltr">{v.plate_normalized}</td>
                <td>{v.fleet_no ?? "—"}</td>
                <td><span className={`text-xs px-2 py-0.5 rounded ${approvalColor(v.status)}`}>{v.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
