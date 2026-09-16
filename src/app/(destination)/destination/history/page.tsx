import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { DESTINATION_NAV, withActive } from "@/lib/nav";

export default async function DestinationHistoryPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("users").select("organization_id").eq("id", user?.id).single();
  const { data: dest } = await supabase.from("authorized_destinations").select("id").eq("owner_organization_id", profile?.organization_id);
  const destIds = (dest ?? []).map((d: any) => d.id);

  const { data: missions } = destIds.length
    ? await supabase.from("missions").select("id, mission_no, status").in("destination_id", destIds).eq("status", "destination_confirmed")
    : { data: [] };

  return (
    <AppShell title="سوابق تخلیه" orgLabel="مقصد / تصفیه‌خانه" nav={withActive(DESTINATION_NAV, "/destination/history")}>
      <div className="panel p-4">
        <table className="w-full data-table">
          <thead><tr><th>شماره مأموریت</th><th>وضعیت</th></tr></thead>
          <tbody>
            {(missions ?? []).length === 0 && <tr><td colSpan={2} className="text-center py-6 text-ink-faint">سابقه‌ای ثبت نشده است.</td></tr>}
            {(missions ?? []).map((m: any) => (
              <tr key={m.id}><td className="font-mono">{m.mission_no}</td><td className="text-status-ok">تکمیل شد</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
