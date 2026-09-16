"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/client";
import { DESTINATION_NAV, withActive } from "@/lib/nav";

export default function UnloadingConfirmPage() {
  const supabase = createClient();
  const [missions, setMissions] = useState<any[]>([]);
  const [volumes, setVolumes] = useState<Record<string, string>>({});

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from("users").select("organization_id").eq("id", user?.id).single();
    const { data: dest } = await supabase.from("authorized_destinations").select("id").eq("owner_organization_id", profile?.organization_id);
    const destIds = (dest ?? []).map((d: any) => d.id);
    if (destIds.length === 0) return setMissions([]);
    const { data } = await supabase.from("missions").select("id, mission_no, estimated_volume").in("destination_id", destIds).eq("status", "unloading_finished");
    setMissions(data ?? []);
  }

  useEffect(() => { load(); }, []);

  async function confirm(missionId: string) {
    const volume = Number(volumes[missionId] ?? 0);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("unloading_records").insert({ mission_id: missionId, volume_unloaded: volume, confirmed_by_operator: user?.id, confirmed_at: new Date().toISOString() });
    await supabase.from("missions").update({ status: "destination_confirmed" }).eq("id", missionId);
    load();
  }

  return (
    <AppShell title="تأیید تخلیه" orgLabel="مقصد / تصفیه‌خانه" nav={withActive(DESTINATION_NAV, "/destination/unloading")}>
      <div className="panel p-4">
        <table className="w-full data-table">
          <thead><tr><th>شماره مأموریت</th><th>حجم تقریبی اعلامی</th><th>حجم واقعی دریافتی</th><th>عملیات</th></tr></thead>
          <tbody>
            {missions.length === 0 && <tr><td colSpan={4} className="text-center py-6 text-ink-faint">تخلیه‌ای در انتظار تأیید نیست.</td></tr>}
            {missions.map((m) => (
              <tr key={m.id}>
                <td className="font-mono">{m.mission_no}</td>
                <td>{m.estimated_volume ?? "—"}</td>
                <td>
                  <input className="field-input w-32" type="number" value={volumes[m.id] ?? ""} onChange={(e) => setVolumes({ ...volumes, [m.id]: e.target.value })} />
                </td>
                <td><button className="btn-primary" onClick={() => confirm(m.id)}>تأیید تخلیه</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
