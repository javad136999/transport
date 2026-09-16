"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/client";
import { PETRO_NAV, withActive } from "@/lib/nav";
import { approvalColor } from "@/lib/utils";

export default function PetroVehiclesPage() {
  const supabase = createClient();
  const [rows, setRows] = useState<any[]>([]);
  const [allVehicles, setAllVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [orgId, setOrgId] = useState<string | null>(null);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from("users").select("organization_id").eq("id", user?.id).single();
    setOrgId(profile?.organization_id ?? null);

    const { data } = await supabase
      .from("vehicle_approvals")
      .select("id, status, expires_at, vehicles:vehicle_id(plate_normalized, fleet_no, capacity_liters)")
      .eq("petrochemical_id", profile?.organization_id)
      .order("created_at", { ascending: false });
    setRows(data ?? []);

    const { data: vehicles } = await supabase.from("vehicles").select("id, plate_normalized, fleet_no").eq("status", "approved");
    setAllVehicles(vehicles ?? []);
  }

  useEffect(() => { load(); }, []);

  async function addApproval() {
    if (!selectedVehicle || !orgId) return;
    await supabase.from("vehicle_approvals").insert({ petrochemical_id: orgId, vehicle_id: selectedVehicle, status: "approved", approved_at: new Date().toISOString() });
    setSelectedVehicle("");
    load();
  }

  return (
    <AppShell title="تانکرهای مجاز این پتروشیمی" orgLabel="پتروشیمی" nav={withActive(PETRO_NAV, "/petro/vehicles")}>
      <div className="panel p-4 flex flex-wrap gap-3 items-end mb-4">
        <div className="min-w-[220px]">
          <label className="field-label">افزودن تانکر به لیست مجاز</label>
          <select className="field-input" value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)}>
            <option value="">انتخاب تانکر</option>
            {allVehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.plate_normalized} {v.fleet_no ? `(${v.fleet_no})` : ""}</option>
            ))}
          </select>
        </div>
        <button className="btn-primary" onClick={addApproval} disabled={!selectedVehicle}>افزودن</button>
      </div>

      <div className="panel p-4">
        <table className="w-full data-table">
          <thead>
            <tr><th>پلاک</th><th>شماره ناوگان</th><th>ظرفیت</th><th>وضعیت تأیید</th><th>اعتبار تا</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={5} className="text-center py-6 text-ink-faint">تانکر مجازی ثبت نشده است.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="font-mono" dir="ltr">{r.vehicles?.plate_normalized}</td>
                <td>{r.vehicles?.fleet_no ?? "—"}</td>
                <td>{r.vehicles?.capacity_liters ? `${r.vehicles.capacity_liters} لیتر` : "—"}</td>
                <td><span className={`text-xs px-2 py-0.5 rounded ${approvalColor(r.status)}`}>{r.status}</span></td>
                <td className="font-mono">{r.expires_at ? new Date(r.expires_at).toLocaleDateString("fa-IR") : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
