"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { DRIVER_BOTTOM_NAV } from "@/lib/nav";
import { MISSION_STATUS_LABEL, missionStatusColor } from "@/lib/utils";

export default function DriverHistoryPage() {
  const supabase = createClient();
  const [missions, setMissions] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: driver } = await supabase.from("drivers").select("id").eq("user_id", user?.id).single();
      if (!driver) return;
      const { data } = await supabase.from("missions").select("id, mission_no, status").eq("driver_id", driver.id).in("status", ["completed", "cancelled"]).order("updated_at", { ascending: false });
      setMissions(data ?? []);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-base pb-24">
      <header className="p-4 border-b border-base-border"><h1 className="text-base font-medium">سوابق مأموریت‌ها</h1></header>
      <div className="p-4 space-y-3">
        {missions.length === 0 && <p className="text-ink-faint text-center py-16 text-sm">سابقه‌ای ثبت نشده است.</p>}
        {missions.map((m) => (
          <div key={m.id} className="panel p-4 flex items-center justify-between">
            <span className="font-mono text-sm">{m.mission_no}</span>
            <span className={`text-xs px-2 py-0.5 rounded ${missionStatusColor(m.status)}`}>{MISSION_STATUS_LABEL[m.status as keyof typeof MISSION_STATUS_LABEL]}</span>
          </div>
        ))}
      </div>
      <BottomNav items={DRIVER_BOTTOM_NAV} currentPath="/driver/history" />
    </div>
  );
}
