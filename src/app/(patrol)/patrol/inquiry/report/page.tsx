"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { normalizePlate } from "@/lib/utils";

const DISCREPANCY_OPTIONS = [
  { value: "", label: "بدون مغایرت" },
  { value: "plate_mismatch", label: "پلاک مغایر" },
  { value: "driver_mismatch", label: "راننده مغایر" },
  { value: "no_mission", label: "بدون مأموریت" },
  { value: "different_destination", label: "مقصد متفاوت" },
  { value: "invalid_documents", label: "مدارک نامعتبر" },
  { value: "unregistered_vehicle", label: "تانکر ثبت‌نشده" },
  { value: "other", label: "سایر" },
];

export default function PatrolReportFormPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-base" />}>
      <PatrolReportForm />
    </Suspense>
  );
}

function PatrolReportForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const plate = searchParams.get("plate") ?? "";

  const [location, setLocation] = useState("");
  const [observedStatus, setObservedStatus] = useState("");
  const [discrepancy, setDiscrepancy] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function getLocation(): Promise<{ lat: number | null; lng: number | null }> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve({ lat: null, lng: null });
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve({ lat: null, lng: null }),
        { timeout: 6000 }
      );
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { lat, lng } = await getLocation();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: patrolUser } = await supabase.from("patrol_users").select("id").eq("user_id", user?.id).single();

      if (!patrolUser) {
        setError("حساب کاربری شما به‌عنوان مأمور گشت ثبت نشده است.");
        setSubmitting(false);
        return;
      }

      const reportNo = `INS-${Date.now().toString(36).toUpperCase()}`;
      const { error: insertError } = await supabase.from("inspection_reports").insert({
        report_no: reportNo,
        patrol_user_id: patrolUser.id,
        plate_normalized: normalizePlate(plate),
        query_result: observedStatus || "needs_review",
        location,
        latitude: lat,
        longitude: lng,
        observed_status: observedStatus,
        discrepancy_type: discrepancy || null,
        notes,
      });

      if (insertError) {
        setError("ثبت گزارش ناموفق بود: " + insertError.message);
      } else {
        setDone(true);
      }
    } catch {
      setError("خطای غیرمنتظره رخ داد.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center p-6">
        <div className="panel-glow p-8 text-center max-w-sm">
          <div className="text-4xl mb-3">✅</div>
          <p className="font-medium mb-2">گزارش گشت ثبت شد</p>
          <button className="btn-primary mt-4 w-full" onClick={() => router.push("/patrol/inquiry")}>
            بازگشت به استعلام
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base pb-10">
      <header className="p-4 border-b border-base-border">
        <h1 className="text-base font-medium">ثبت گزارش گشت — پلاک <span dir="ltr" className="font-mono">{plate}</span></h1>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label className="field-label">محل مشاهده</label>
          <input className="field-input" value={location} onChange={(e) => setLocation(e.target.value)} required />
        </div>
        <div>
          <label className="field-label">وضعیت مشاهده‌شده</label>
          <input className="field-input" value={observedStatus} onChange={(e) => setObservedStatus(e.target.value)} placeholder="مثلاً: در حال حرکت، متوقف، در حال تخلیه" />
        </div>
        <div>
          <label className="field-label">نوع مغایرت (در صورت وجود)</label>
          <select className="field-input" value={discrepancy} onChange={(e) => setDiscrepancy(e.target.value)}>
            {DISCREPANCY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">توضیحات</label>
          <textarea className="field-input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        {error && <p className="text-status-alert text-sm">{error}</p>}

        <button className="btn-driver bg-brand" disabled={submitting}>
          {submitting ? "در حال ثبت..." : "ثبت گزارش"}
        </button>
      </form>
    </div>
  );
}
