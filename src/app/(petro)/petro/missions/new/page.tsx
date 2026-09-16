"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/AppShell";
import { PETRO_NAV, withActive } from "@/lib/nav";

type Option = { id: string; label: string };

export default function NewMissionPage() {
  const supabase = createClient();
  const [wasteTypes, setWasteTypes] = useState<Option[]>([]);
  const [loadingSites, setLoadingSites] = useState<Option[]>([]);
  const [destinations, setDestinations] = useState<Option[]>([]);
  const [approvedDrivers, setApprovedDrivers] = useState<Option[]>([]);
  const [approvedVehicles, setApprovedVehicles] = useState<Option[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({
    waste_type_id: "",
    estimated_volume: "",
    loading_site_id: "",
    destination_id: "",
    driver_id: "",
    vehicle_id: "",
    scheduled_date: "",
    notes: "",
  });

  useEffect(() => {
    (async () => {
      const { data: wt } = await supabase.from("waste_types").select("id, name").eq("is_active", true);
      setWasteTypes((wt ?? []).map((w: any) => ({ id: w.id, label: w.name })));

      const { data: sites } = await supabase.from("loading_sites").select("id, name");
      setLoadingSites((sites ?? []).map((s: any) => ({ id: s.id, label: s.name })));

      const { data: dests } = await supabase.from("authorized_destinations").select("id, name").eq("is_active", true);
      setDestinations((dests ?? []).map((d: any) => ({ id: d.id, label: d.name })));

      // فقط رانندگانی که برای همین پتروشیمی تأیید معتبر دارند
      const { data: drvApprovals } = await supabase
        .from("driver_approvals")
        .select("driver_id, status, drivers(first_name, last_name)")
        .eq("status", "approved");
      setApprovedDrivers(
        (drvApprovals ?? []).map((a: any) => ({
          id: a.driver_id,
          label: `${a.drivers?.first_name ?? ""} ${a.drivers?.last_name ?? ""}`.trim(),
        }))
      );

      // فقط تانکرهایی که برای همین پتروشیمی تأیید معتبر دارند
      const { data: vhcApprovals } = await supabase
        .from("vehicle_approvals")
        .select("vehicle_id, status, vehicles(plate_normalized, fleet_no)")
        .eq("status", "approved");
      setApprovedVehicles(
        (vhcApprovals ?? []).map((a: any) => ({
          id: a.vehicle_id,
          label: `${a.vehicles?.plate_normalized ?? ""} ${a.vehicles?.fleet_no ? `(${a.vehicles.fleet_no})` : ""}`,
        }))
      );
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: profile } = await supabase.from("users").select("organization_id").eq("id", user?.id).single();

    const mission_no = `M-${Date.now().toString(36).toUpperCase()}`;

    const { error } = await supabase.from("missions").insert({
      mission_no,
      petrochemical_id: profile?.organization_id,
      waste_type_id: form.waste_type_id || null,
      estimated_volume: form.estimated_volume ? Number(form.estimated_volume) : null,
      loading_site_id: form.loading_site_id || null,
      destination_id: form.destination_id || null,
      driver_id: form.driver_id || null,
      vehicle_id: form.vehicle_id || null,
      scheduled_date: form.scheduled_date || null,
      notes: form.notes || null,
      status: form.driver_id && form.vehicle_id ? "assigned" : "created",
      created_by: user?.id,
    });

    setSubmitting(false);
    if (error) {
      setMessage({ type: "error", text: "ثبت مأموریت ناموفق بود: " + error.message });
    } else {
      setMessage({ type: "ok", text: `مأموریت با شماره ${mission_no} ثبت شد.` });
      setForm({
        waste_type_id: "",
        estimated_volume: "",
        loading_site_id: "",
        destination_id: "",
        driver_id: "",
        vehicle_id: "",
        scheduled_date: "",
        notes: "",
      });
    }
  }

  return (
    <AppShell title="ایجاد مأموریت حمل پساب" orgLabel="پتروشیمی" nav={withActive(PETRO_NAV, "/petro/missions/new")}>
      <form onSubmit={handleSubmit} className="max-w-2xl panel p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">نوع پساب</label>
            <select
              className="field-input"
              value={form.waste_type_id}
              onChange={(e) => setForm({ ...form, waste_type_id: e.target.value })}
              required
            >
              <option value="">انتخاب کنید</option>
              {wasteTypes.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">حجم تقریبی (لیتر)</label>
            <input
              className="field-input"
              type="number"
              value={form.estimated_volume}
              onChange={(e) => setForm({ ...form, estimated_volume: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">مبدأ بارگیری</label>
            <select
              className="field-input"
              value={form.loading_site_id}
              onChange={(e) => setForm({ ...form, loading_site_id: e.target.value })}
              required
            >
              <option value="">انتخاب کنید</option>
              {loadingSites.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">مقصد مجاز</label>
            <select
              className="field-input"
              value={form.destination_id}
              onChange={(e) => setForm({ ...form, destination_id: e.target.value })}
              required
            >
              <option value="">انتخاب کنید</option>
              {destinations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">راننده (فقط رانندگان تأییدشده برای این پتروشیمی)</label>
            <select className="field-input" value={form.driver_id} onChange={(e) => setForm({ ...form, driver_id: e.target.value })}>
              <option value="">بعداً تخصیص داده شود</option>
              {approvedDrivers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            {approvedDrivers.length === 0 && (
              <p className="text-xs text-status-warn mt-1">هیچ راننده تأییدشده‌ای برای این پتروشیمی ثبت نشده است.</p>
            )}
          </div>
          <div>
            <label className="field-label">تانکر (فقط تانکرهای تأییدشده برای این پتروشیمی)</label>
            <select className="field-input" value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}>
              <option value="">بعداً تخصیص داده شود</option>
              {approvedVehicles.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            {approvedVehicles.length === 0 && (
              <p className="text-xs text-status-warn mt-1">هیچ تانکر تأییدشده‌ای برای این پتروشیمی ثبت نشده است.</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">تاریخ مأموریت</label>
            <input
              className="field-input"
              type="date"
              value={form.scheduled_date}
              onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="field-label">توضیحات</label>
          <textarea
            className="field-input"
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        {message && (
          <p className={message.type === "ok" ? "text-status-ok text-sm" : "text-status-alert text-sm"}>{message.text}</p>
        )}

        <button className="btn-primary" disabled={submitting}>
          {submitting ? "در حال ثبت..." : "ثبت مأموریت"}
        </button>
      </form>
    </AppShell>
  );
}
