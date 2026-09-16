"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MISSION_STATUS_LABEL, missionStatusColor } from "@/lib/utils";
import type { Mission, MissionStatus } from "@/types/database";
import { BottomNav } from "@/components/BottomNav";
import { DRIVER_BOTTOM_NAV } from "@/lib/nav";

// نگاشت وضعیت فعلی مأموریت -> دکمه اقدام بعدی که راننده باید بزند
const NEXT_ACTION: Partial<Record<MissionStatus, { label: string; next: MissionStatus }>> = {
  assigned: { label: "پذیرش مأموریت", next: "driver_accepted" },
  driver_accepted: { label: "رسیدم به مبدأ", next: "arrived_origin" },
  arrived_origin: { label: "شروع بارگیری", next: "loading_started" },
  loading_started: { label: "پایان بارگیری", next: "loading_finished" },
  loading_finished: { label: "شروع حمل", next: "in_transit" },
  in_transit: { label: "رسیدم به مقصد", next: "arrived_destination" },
  arrived_destination: { label: "شروع تخلیه", next: "unloading_started" },
  unloading_started: { label: "پایان تخلیه", next: "unloading_finished" },
};

export default function DriverHomePage() {
  const supabase = createClient();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [gpsStatus, setGpsStatus] = useState<"ok" | "lost" | "unknown">("unknown");
  const [pendingSync, setPendingSync] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    load();
    // GPS heartbeat every 90 ثانیه برای مأموریت‌های در حال انجام
    const interval = setInterval(captureGpsForActiveMission, 90_000);
    return () => clearInterval(interval);
  }, []);

  async function load() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: driver } = await supabase.from("drivers").select("id").eq("user_id", user?.id).single();
    if (!driver) return;
    const { data } = await supabase
      .from("missions")
      .select("*")
      .eq("driver_id", driver.id)
      .not("status", "in", "(completed,cancelled)")
      .order("created_at", { ascending: false });
    setMissions((data as Mission[]) ?? []);
  }

  function getLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error("no geolocation"));
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000 });
    });
  }

  async function captureGpsForActiveMission() {
    const active = missions.find((m) => m.status === "in_transit");
    if (!active) return;
    try {
      const pos = await getLocation();
      setGpsStatus("ok");
      const { error } = await supabase.from("gps_points").insert({
        mission_id: active.id,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy_m: pos.coords.accuracy,
        speed_kmh: pos.coords.speed ? pos.coords.speed * 3.6 : null,
        recorded_at: new Date().toISOString(),
      });
      if (error) queueOffline("gps_point", { mission_id: active.id, ...pos.coords });
    } catch {
      setGpsStatus("lost");
    }
  }

  function queueOffline(kind: string, payload: any) {
    const key = "offline_queue";
    const existing = JSON.parse(localStorage.getItem(key) ?? "[]");
    existing.push({ kind, payload, ts: Date.now() });
    localStorage.setItem(key, JSON.stringify(existing));
    setPendingSync(existing.length);
  }

  async function advanceMission(mission: Mission, next: MissionStatus) {
    setBusy(mission.id);
    let lat: number | null = null;
    let lng: number | null = null;
    try {
      const pos = await getLocation();
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
      setGpsStatus("ok");
    } catch {
      setGpsStatus("lost");
    }

    const { error } = await supabase.from("missions").update({ status: next }).eq("id", mission.id);
    await supabase.from("mission_assignments").insert({ mission_id: mission.id, status: next, note: lat ? `GPS: ${lat},${lng}` : "GPS نامعتبر" });

    if (error) {
      queueOffline("status_update", { mission_id: mission.id, status: next });
    }
    setBusy(null);
    load();
  }

  return (
    <div className="min-h-screen bg-base pb-24">
      <header className="p-4 flex items-center justify-between border-b border-base-border">
        <h1 className="text-base font-medium">مأموریت‌های من</h1>
        <span
          className={`text-xs font-mono px-2 py-1 rounded ${
            gpsStatus === "ok" ? "bg-status-ok/15 text-status-ok" : gpsStatus === "lost" ? "bg-status-alert/15 text-status-alert" : "bg-base-panel2 text-ink-muted"
          }`}
        >
          GPS: {gpsStatus === "ok" ? "فعال" : gpsStatus === "lost" ? "قطع" : "نامشخص"}
        </span>
      </header>

      {pendingSync > 0 && (
        <div className="bg-status-warn/10 text-status-warn text-xs text-center py-2">
          {pendingSync} مورد در انتظار همگام‌سازی با سرور — پس از اتصال اینترنت ارسال می‌شود.
        </div>
      )}

      <div className="p-4 space-y-4">
        {missions.length === 0 && (
          <p className="text-ink-faint text-center py-16 text-sm">مأموریت فعالی برای شما ثبت نشده است.</p>
        )}

        {missions.map((m) => {
          const action = NEXT_ACTION[m.status];
          return (
            <div key={m.id} className="panel p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-sm">{m.mission_no}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${missionStatusColor(m.status)}`}>
                  {MISSION_STATUS_LABEL[m.status]}
                </span>
              </div>
              <p className="text-xs text-ink-muted mb-4">
                حجم تقریبی: {m.estimated_volume ?? "—"} لیتر
                {m.scheduled_date ? ` · تاریخ: ${m.scheduled_date}` : ""}
              </p>
              {action && (
                <button
                  className="btn-driver bg-brand disabled:opacity-50"
                  disabled={busy === m.id}
                  onClick={() => advanceMission(m, action.next)}
                >
                  {busy === m.id ? "در حال ثبت..." : action.label}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <BottomNav items={DRIVER_BOTTOM_NAV} currentPath="/driver" />
    </div>
  );
}
