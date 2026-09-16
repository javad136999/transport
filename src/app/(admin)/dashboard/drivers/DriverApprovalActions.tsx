"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function DriverApprovalActions({ driverId }: { driverId: string }) {
  const supabase = createClient();
  const [loading, setLoading] = useState<"approved" | "rejected" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(status: "approved" | "rejected") {
    const message = status === "approved"
      ? "این راننده تأیید و فعال شود؟"
      : "درخواست این راننده رد شود؟";
    if (!window.confirm(message)) return;

    setLoading(status);
    setError(null);

    const { data: driver, error: driverError } = await supabase
      .from("drivers")
      .select("user_id")
      .eq("id", driverId)
      .single();

    if (driverError || !driver) {
      setError("اطلاعات راننده پیدا نشد.");
      setLoading(null);
      return;
    }

    const { error: updateDriverError } = await supabase
      .from("drivers")
      .update({ status })
      .eq("id", driverId);

    if (updateDriverError) {
      setError("تغییر وضعیت راننده ناموفق بود: " + updateDriverError.message);
      setLoading(null);
      return;
    }

    const { error: updateUserError } = await supabase
      .from("users")
      .update({ is_active: status === "approved" })
      .eq("id", driver.user_id);

    if (updateUserError) {
      setError("وضعیت حساب کاربری به‌روزرسانی نشد: " + updateUserError.message);
      setLoading(null);
      return;
    }

    window.location.reload();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => setStatus("approved")}
        disabled={loading !== null}
        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-400/20 disabled:opacity-50"
      >
        <CheckCircle2 size={15} />
        {loading === "approved" ? "در حال تأیید..." : "تأیید و فعال‌سازی"}
      </button>
      <button
        type="button"
        onClick={() => setStatus("rejected")}
        disabled={loading !== null}
        className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/25 bg-red-400/10 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-400/20 disabled:opacity-50"
      >
        <XCircle size={15} />
        {loading === "rejected" ? "در حال رد..." : "رد درخواست"}
      </button>
      {error && <p className="basis-full text-xs text-status-alert">{error}</p>}
    </div>
  );
}
