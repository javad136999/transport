"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { normalizePlate } from "@/lib/utils";
import { BottomNav } from "@/components/BottomNav";
import { PATROL_BOTTOM_NAV } from "@/lib/nav";

type QueryResult = {
  status: "authorized" | "needs_review" | "unauthorized" | "not_registered";
  vehicle?: any;
  activeMission?: any;
};

const STATUS_META: Record<QueryResult["status"], { dot: string; label: string; text: string }> = {
  authorized: { dot: "bg-status-ok", label: "🟢 مجاز", text: "text-status-ok" },
  needs_review: { dot: "bg-status-warn", label: "🟡 نیازمند بررسی", text: "text-status-warn" },
  unauthorized: { dot: "bg-status-alert", label: "🔴 غیرفعال / غیرمجاز در سامانه", text: "text-status-alert" },
  not_registered: { dot: "bg-ink-faint", label: "⚪ ثبت نشده", text: "text-ink-faint" },
};

export default function PlateInquiryPage() {
  const supabase = createClient();
  const [plateInput, setPlateInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);

  async function handleInquiry(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const normalized = normalizePlate(plateInput);

    const { data: vehicle } = await supabase
      .from("vehicles")
      .select("id, plate_normalized, fleet_no, capacity_liters, vehicle_type, status, transport_company_id")
      .eq("plate_normalized", normalized)
      .maybeSingle();

    let status: QueryResult["status"] = "not_registered";
    let activeMission: any = null;

    if (vehicle) {
      if (vehicle.status === "approved") {
        const { data: approvals } = await supabase
          .from("vehicle_approvals")
          .select("status")
          .eq("vehicle_id", vehicle.id)
          .eq("status", "approved")
          .limit(1);
        status = approvals && approvals.length > 0 ? "authorized" : "needs_review";
      } else if (vehicle.status === "pending") {
        status = "needs_review";
      } else {
        status = "unauthorized";
      }

      const { data: mission } = await supabase
        .from("missions")
        .select("mission_no, status, petrochemical_id, loading_site_id, destination_id, driver_id, updated_at")
        .eq("vehicle_id", vehicle.id)
        .not("status", "in", "(completed,cancelled)")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      activeMission = mission ?? null;
    }

    // ثبت لاگ استعلام (patrol_logs) — patrol_user_id واقعی باید از سشن کاربر گرفته شود
    await supabase.from("patrol_logs").insert({
      plate_queried: plateInput,
      plate_normalized: normalized,
      result: status,
    } as any);

    setResult({ status, vehicle, activeMission });
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-base pb-24">
      <header className="p-4 border-b border-base-border">
        <h1 className="text-base font-medium">استعلام تانکر</h1>
      </header>

      <div className="p-4">
        <form onSubmit={handleInquiry} className="panel p-4 space-y-3">
          <label className="field-label">شماره پلاک (فارسی یا انگلیسی)</label>
          <input
            className="field-input text-lg font-mono text-center tracking-widest"
            dir="ltr"
            placeholder="12الف345"
            value={plateInput}
            onChange={(e) => setPlateInput(e.target.value)}
            required
          />
          <button className="btn-driver bg-brand" disabled={loading}>
            {loading ? "در حال استعلام..." : "استعلام"}
          </button>
        </form>

        {result && (
          <div className="panel p-4 mt-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className={`status-dot ${STATUS_META[result.status].dot}`} />
              <span className={`text-sm font-medium ${STATUS_META[result.status].text}`}>
                {STATUS_META[result.status].label}
              </span>
            </div>

            {result.vehicle ? (
              <dl className="text-sm space-y-1.5">
                <Row label="پلاک" value={result.vehicle.plate_normalized} mono />
                <Row label="شماره ناوگان" value={result.vehicle.fleet_no ?? "—"} />
                <Row label="ظرفیت" value={result.vehicle.capacity_liters ? `${result.vehicle.capacity_liters} لیتر` : "—"} />
                <Row label="نوع تانکر" value={result.vehicle.vehicle_type ?? "—"} />
                <Row label="وضعیت ثبت" value={result.vehicle.status} />
              </dl>
            ) : (
              <p className="text-sm text-ink-faint">این پلاک در سامانه ثبت نشده است.</p>
            )}

            <div className="border-t border-base-border pt-3">
              <p className="text-xs text-ink-muted mb-2">مأموریت فعال</p>
              {result.activeMission ? (
                <dl className="text-sm space-y-1.5">
                  <Row label="شماره مأموریت" value={result.activeMission.mission_no} mono />
                  <Row label="وضعیت مأموریت" value={result.activeMission.status} />
                  {/* توجه: بنا به اصل حریم خصوصی (§50) نام راننده و کدملی کامل نمایش داده نمی‌شود */}
                </dl>
              ) : (
                <p className="text-sm text-ink-faint">در حال حاضر مأموریت فعال ثبت‌شده‌ای برای این تانکر وجود ندارد.</p>
              )}
            </div>

            <button
              className="btn-secondary w-full"
              onClick={() => (window.location.href = `/patrol/inquiry/report?plate=${encodeURIComponent(plateInput)}`)}
            >
              ثبت گزارش گشت
            </button>
          </div>
        )}
      </div>

      <BottomNav items={PATROL_BOTTOM_NAV} currentPath="/patrol/inquiry" />
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-muted">{label}</dt>
      <dd className={mono ? "font-mono" : ""}>{value}</dd>
    </div>
  );
}
