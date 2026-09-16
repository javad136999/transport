"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/client";
import { ADMIN_NAV, withActive } from "@/lib/nav";
import { riskColor } from "@/lib/utils";

const ALERT_TYPE_LABEL: Record<string, string> = {
  gps_lost: "GPS قطع شد",
  route_deviation: "انحراف مسیر",
  unauthorized_area: "محدوده غیرمجاز",
  unauthorized_destination: "مقصد غیرمجاز",
  abnormal_stop: "توقف غیرعادی",
  volume_mismatch: "اختلاف حجم",
  missing_loading_photo: "نبود عکس بارگیری",
  missing_unloading_photo: "نبود عکس تخلیه",
  delayed_unloading: "تأخیر در تخلیه",
  expired_driver_document: "انقضای مدرک راننده",
  expired_vehicle_document: "انقضای مدرک تانکر",
  incomplete_mission: "مأموریت ناقص",
  suspicious_mission: "مأموریت مشکوک",
};

const STATUS_LABEL: Record<string, string> = {
  new: "جدید",
  in_review: "در حال بررسی",
  reviewed: "بررسی شد",
  confirmed: "مشکل تأیید شد",
  dismissed: "رد شد",
};

export default function AdminAlertsPage() {
  const supabase = createClient();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("alerts")
      .select("id, type, status, severity, description, created_at, missions:mission_id(mission_no)")
      .order("created_at", { ascending: false })
      .limit(150);
    setAlerts(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    await supabase.from("alerts").update({ status }).eq("id", id);
    load();
  }

  return (
    <AppShell title="مرکز هشدارها" orgLabel="مدیر سامانه" nav={withActive(ADMIN_NAV, "/dashboard/alerts")}>
      <div className="panel p-4">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>مأموریت</th>
              <th>نوع هشدار</th>
              <th>شدت</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="text-center py-6 text-ink-faint">در حال بارگذاری...</td></tr>}
            {!loading && alerts.length === 0 && (
              <tr><td colSpan={5} className="text-center py-6 text-ink-faint">هشداری ثبت نشده است.</td></tr>
            )}
            {alerts.map((a) => (
              <tr key={a.id}>
                <td className="font-mono">{a.missions?.mission_no ?? "—"}</td>
                <td>{ALERT_TYPE_LABEL[a.type] ?? a.type}</td>
                <td><span className={`text-xs px-2 py-0.5 rounded ${riskColor(a.severity)}`}>{a.severity}</span></td>
                <td className="text-ink-muted">{STATUS_LABEL[a.status] ?? a.status}</td>
                <td className="flex gap-1.5">
                  {a.status !== "reviewed" && (
                    <button className="text-xs text-brand-light" onClick={() => updateStatus(a.id, "reviewed")}>بررسی شد</button>
                  )}
                  {a.status !== "dismissed" && (
                    <button className="text-xs text-ink-faint" onClick={() => updateStatus(a.id, "dismissed")}>رد</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
