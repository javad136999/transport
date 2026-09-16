"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/client";
import { PETRO_NAV, withActive } from "@/lib/nav";
import { approvalColor } from "@/lib/utils";

export default function PetroDriversPage() {
  const supabase = createClient();
  const [rows, setRows] = useState<any[]>([]);
  const [allDrivers, setAllDrivers] = useState<any[]>([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [orgId, setOrgId] = useState<string | null>(null);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from("users").select("organization_id").eq("id", user?.id).single();
    setOrgId(profile?.organization_id ?? null);

    const { data } = await supabase
      .from("driver_approvals")
      .select("id, status, expires_at, drivers:driver_id(first_name, last_name, mobile, license_no)")
      .eq("petrochemical_id", profile?.organization_id)
      .order("created_at", { ascending: false });
    setRows(data ?? []);

    const { data: drivers } = await supabase.from("drivers").select("id, first_name, last_name, mobile").eq("status", "approved");
    setAllDrivers(drivers ?? []);
  }

  useEffect(() => { load(); }, []);

  async function addApproval() {
    if (!selectedDriver || !orgId) return;
    await supabase.from("driver_approvals").insert({ petrochemical_id: orgId, driver_id: selectedDriver, status: "approved", approved_at: new Date().toISOString() });
    setSelectedDriver("");
    load();
  }

  return (
    <AppShell title="رانندگان مجاز این پتروشیمی" orgLabel="پتروشیمی" nav={withActive(PETRO_NAV, "/petro/drivers")}>
      <div className="panel p-4 flex flex-wrap gap-3 items-end mb-4">
        <div className="min-w-[220px]">
          <label className="field-label">افزودن راننده به لیست مجاز</label>
          <select className="field-input" value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)}>
            <option value="">انتخاب راننده</option>
            {allDrivers.map((d) => (
              <option key={d.id} value={d.id}>{d.first_name} {d.last_name} — {d.mobile}</option>
            ))}
          </select>
        </div>
        <button className="btn-primary" onClick={addApproval} disabled={!selectedDriver}>افزودن</button>
      </div>

      <div className="panel p-4">
        <table className="w-full data-table">
          <thead>
            <tr><th>نام راننده</th><th>موبایل</th><th>شماره گواهینامه</th><th>وضعیت تأیید</th><th>اعتبار تا</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={5} className="text-center py-6 text-ink-faint">راننده مجازی ثبت نشده است.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.drivers?.first_name} {r.drivers?.last_name}</td>
                <td className="font-mono" dir="ltr">{r.drivers?.mobile}</td>
                <td className="font-mono">{r.drivers?.license_no}</td>
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
