import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { createClient } from "@/lib/supabase/server";
import { DESTINATION_NAV, withActive } from "@/lib/nav";

export default async function DestinationDashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("users").select("organization_id").eq("id", user?.id).single();

  const { data: dest } = await supabase.from("authorized_destinations").select("id").eq("owner_organization_id", profile?.organization_id);
  const destIds = (dest ?? []).map((d: any) => d.id);

  let inbound = 0;
  let unloadingDone = 0;
  if (destIds.length > 0) {
    const { count: c1 } = await supabase.from("missions").select("id", { count: "exact", head: true }).in("destination_id", destIds).eq("status", "arrived_destination");
    const { count: c2 } = await supabase.from("missions").select("id", { count: "exact", head: true }).in("destination_id", destIds).eq("status", "destination_confirmed");
    inbound = c1 ?? 0;
    unloadingDone = c2 ?? 0;
  }

  return (
    <AppShell title="داشبورد تصفیه‌خانه" orgLabel="مقصد / تصفیه‌خانه" nav={withActive(DESTINATION_NAV, "/destination/dashboard")}>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="در انتظار تخلیه" value={inbound} tone="progress" />
        <StatCard label="تخلیهٔ تأییدشده" value={unloadingDone} tone="ok" />
      </div>
    </AppShell>
  );
}
