import { AppShell } from "@/components/AppShell";
import { LiveOperationsMap, type LiveMissionPoint } from "@/components/LiveOperationsMap";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_NAV, withActive } from "@/lib/nav";
import { missionStatusColor, MISSION_STATUS_LABEL, riskColor } from "@/lib/utils";

export default async function LiveMapPage() {
  const supabase = createClient();
  const { data: activeMissions } = await supabase
    .from("missions")
    .select("id, mission_no, status, risk_level, vehicle_id, vehicles:vehicle_id(plate_normalized)")
    .in("status", ["in_transit", "arrived_destination", "unloading_started"])
    .order("updated_at", { ascending: false })
    .limit(100);

  const missionIds = (activeMissions ?? []).map((m: any) => m.id);
  let lastPoints: Record<string, any> = {};
  if (missionIds.length > 0) {
    const { data: points } = await supabase
      .from("gps_points")
      .select("mission_id, latitude, longitude, recorded_at")
      .in("mission_id", missionIds)
      .order("recorded_at", { ascending: false });
    for (const p of points ?? []) if (!lastPoints[p.mission_id]) lastPoints[p.mission_id] = p;
  }

  const mapPoints: LiveMissionPoint[] = (activeMissions ?? [])
    .map((m: any) => {
      const p = lastPoints[m.id];
      if (!p) return null;
      return {
        id: m.id,
        missionNo: m.mission_no,
        plate: m.vehicles?.plate_normalized ?? "—",
        status: m.status,
        risk: m.risk_level,
        latitude: p.latitude,
        longitude: p.longitude,
        recordedAt: p.recorded_at,
      };
    })
    .filter(Boolean) as LiveMissionPoint[];

  const inTransitCount = (activeMissions ?? []).filter((m: any) => m.status === "in_transit").length;
  const unloadingCount = (activeMissions ?? []).filter((m: any) => m.status === "unloading_started").length;
  const highRiskCount = (activeMissions ?? []).filter((m: any) => m.risk_level === "high").length;

  return (
    <AppShell title="مرکز رصد زنده ناوگان" orgLabel="مدیر سامانه" nav={withActive(ADMIN_NAV, "/dashboard/map")}>
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="panel-glow p-4"><div className="text-xs text-ink-faint">مأموریت‌های فعال</div><div className="kpi-value mt-2">{(activeMissions ?? []).length.toLocaleString("fa-IR")}</div></div>
        <div className="panel p-4"><div className="text-xs text-ink-faint">در حال حمل</div><div className="kpi-value mt-2">{inTransitCount.toLocaleString("fa-IR")}</div></div>
        <div className="panel p-4"><div className="text-xs text-ink-faint">در حال تخلیه</div><div className="kpi-value mt-2">{unloadingCount.toLocaleString("fa-IR")}</div></div>
        <div className="panel p-4"><div className="text-xs text-ink-faint">ریسک بالا / نیازمند بررسی</div><div className="kpi-value mt-2">{highRiskCount.toLocaleString("fa-IR")}</div></div>
      </div>

      <LiveOperationsMap points={mapPoints} />

      <div className="panel mt-5 overflow-hidden">
        <div className="flex items-center justify-between border-b border-base-border p-4">
          <div><h2 className="font-semibold">وضعیت لحظه‌ای مأموریت‌ها</h2><p className="mt-1 text-xs text-ink-faint">آخرین نقطه GPS معتبر هر تانکر؛ بدون ساختن موقعیت جعلی در صورت قطع GPS.</p></div>
          <span className="rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-xs text-brand-light">{mapPoints.length.toLocaleString("fa-IR")} روی نقشه</span>
        </div>
        <div className="mobile-scroll-table overflow-x-auto">
          <table className="w-full data-table">
            <thead><tr><th>مأموریت</th><th>پلاک</th><th>وضعیت</th><th>ریسک</th><th>آخرین GPS</th><th>زمان</th></tr></thead>
            <tbody>
              {(activeMissions ?? []).length === 0 && <tr><td colSpan={6} className="py-8 text-center text-ink-faint">در حال حاضر مأموریت فعالی وجود ندارد.</td></tr>}
              {(activeMissions ?? []).map((m: any) => {
                const p = lastPoints[m.id];
                return <tr key={m.id}>
                  <td className="font-mono">{m.mission_no}</td>
                  <td className="font-mono" dir="ltr">{m.vehicles?.plate_normalized ?? "—"}</td>
                  <td><span className={`rounded px-2 py-0.5 text-xs ${missionStatusColor(m.status)}`}>{MISSION_STATUS_LABEL[m.status as keyof typeof MISSION_STATUS_LABEL] ?? m.status}</span></td>
                  <td><span className={`rounded px-2 py-0.5 text-xs ${riskColor(m.risk_level)}`}>{m.risk_level === "high" ? "بالا" : m.risk_level === "medium" ? "متوسط" : "پایین"}</span></td>
                  <td className="font-mono text-xs">{p ? `${p.latitude.toFixed(5)}, ${p.longitude.toFixed(5)}` : "بدون GPS"}</td>
                  <td className="font-mono text-xs">{p ? new Date(p.recorded_at).toLocaleTimeString("fa-IR") : "—"}</td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
