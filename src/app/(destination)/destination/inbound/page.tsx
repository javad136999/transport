import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { DESTINATION_NAV, withActive } from "@/lib/nav";

export default async function DestinationInboundPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("users").select("organization_id").eq("id", user?.id).single();
  const { data: dest } = await supabase.from("authorized_destinations").select("id").eq("owner_organization_id", profile?.organization_id);
  const destIds = (dest ?? []).map((d: any) => d.id);

  const { data: missions } = destIds.length
    ? await supabase.from("missions").select("id, mission_no, status, estimated_volume").in("destination_id", destIds).in("status", ["in_transit", "arrived_destination"])
    : { data: [] };

  return (
    <AppShell title="مأموریت‌های ورودی" orgLabel="مقصد / تصفیه‌خانه" nav={withActive(DESTINATION_NAV, "/destination/inbound")}>
      <div className="panel p-4">
        <table className="w-full data-table">
          <thead><tr><th>شماره مأموریت</th><th>حجم تقریبی</th><th>وضعیت</th></tr></thead>
          <tbody>
            {(missions ?? []).length === 0 && <tr><td colSpan={3} className="text-center py-6 text-ink-faint">مأموریت در راهی وجود ندارد.</td></tr>}
            {(missions ?? []).map((m: any) => (
              <tr key={m.id}><td className="font-mono">{m.mission_no}</td><td>{m.estimated_volume ?? "—"}</td><td>{m.status}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
