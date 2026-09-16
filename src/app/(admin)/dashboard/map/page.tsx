import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_NAV, withActive } from "@/lib/nav";
import { missionStatusColor, MISSION_STATUS_LABEL } from "@/lib/utils";

export default async function LiveMapPage() {
  const supabase = createClient();
  const { data: activeMissions } = await supabase
    .from("missions")
    .select("id, mission_no, status, vehicle_id, vehicles:vehicle_id(plate_normalized)")
    .in("status", ["in_transit", "arrived_destination", "unloading_started"])
    .limit(100);

  const missionIds = (activeMissions ?? []).map((m: any) => m.id);
  let lastPoints: Record<string, any> = {};
  if (missionIds.length > 0) {
    const { data: points } = await supabase
      .from("gps_points")
      .select("mission_id, latitude, longitude, recorded_at")
      .in("mission_id", missionIds)
      .order("recorded_at", { ascending: false });
    for (const p of points ?? []) {
      if (!lastPoints[p.mission_id]) lastPoints[p.mission_id] = p;
    }
  }

  return (
    <AppShell title="نقشهٔ زنده" orgLabel="مدیر سامانه" nav={withActive(ADMIN_NAV, "/dashboard/map")}>
      <div className="panel p-4 mb-4 text-xs text-ink-faint">
        نمایش نقشهٔ تصویری (MapLibre) در نسخهٔ بعدی افزوده می‌شود. تا آن زمان، لیست زیر آخرین موقعیت معتبر هر
        تانکرِ در حال مأموریت را نشان می‌دهد — هرگز موقعیت جعلی یا قدیمی به‌جای لحظه‌ای نمایش داده نمی‌شود.
      </div>
      <div className="panel p-4">
        <table className="w-full data-table">
          <thead>
            <tr><th>شماره مأموریت</th><th>پلاک</th><th>وضعیت</th><th>آخرین موقعیت</th><th>زمان</th></tr>
          </thead>
          <tbody>
            {(activeMissions ?? []).length === 0 && (
              <tr><td colSpan={5} className="text-center py-6 text-ink-faint">مأموریت در حال حرکتی وجود ندارد.</td></tr>
            )}
            {(activeMissions ?? []).map((m: any) => {
              const p = lastPoints[m.id];
              return (
                <tr key={m.id}>
                  <td className="font-mono">{m.mission_no}</td>
                  <td className="font-mono" dir="ltr">{m.vehicles?.plate_normalized ?? "—"}</td>
                  <td><span className={`text-xs px-2 py-0.5 rounded ${missionStatusColor(m.status)}`}>{MISSION_STATUS_LABEL[m.status as keyof typeof MISSION_STATUS_LABEL]}</span></td>
                  <td className="font-mono text-xs">{p ? `${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}` : "بدون GPS"}</td>
                  <td className="font-mono text-xs">{p ? new Date(p.recorded_at).toLocaleTimeString("fa-IR") : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
