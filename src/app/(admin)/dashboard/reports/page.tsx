"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/client";
import { ADMIN_NAV, withActive } from "@/lib/nav";

export default function ReportsPage() {
  const supabase = createClient();
  const [filters, setFilters] = useState({ from: "", to: "", status: "" });
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function runReport(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    let query = supabase.from("missions").select("mission_no, status, risk_level, estimated_volume, scheduled_date");
    if (filters.from) query = query.gte("scheduled_date", filters.from);
    if (filters.to) query = query.lte("scheduled_date", filters.to);
    if (filters.status) query = query.eq("status", filters.status);
    const { data } = await query.order("scheduled_date", { ascending: false }).limit(500);
    setRows(data ?? []);
    setLoading(false);
  }

  function exportCsv() {
    const header = "شماره مأموریت,وضعیت,ریسک,حجم,تاریخ\n";
    const body = rows.map((r) => `${r.mission_no},${r.status},${r.risk_level},${r.estimated_volume ?? ""},${r.scheduled_date ?? ""}`).join("\n");
    const blob = new Blob(["\uFEFF" + header + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mission-report.csv";
    a.click();
  }

  return (
    <AppShell title="گزارش‌ساز پیشرفته" orgLabel="مدیر سامانه" nav={withActive(ADMIN_NAV, "/dashboard/reports")}>
      <form onSubmit={runReport} className="panel p-4 flex flex-wrap gap-3 items-end mb-4">
        <div>
          <label className="field-label">از تاریخ</label>
          <input className="field-input" type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
        </div>
        <div>
          <label className="field-label">تا تاریخ</label>
          <input className="field-input" type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
        </div>
        <div>
          <label className="field-label">وضعیت مأموریت</label>
          <select className="field-input" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">همه</option>
            <option value="completed">تکمیل شده</option>
            <option value="in_transit">در مسیر</option>
            <option value="needs_review">نیازمند بررسی</option>
            <option value="suspicious">مشکوک</option>
          </select>
        </div>
        <button className="btn-primary" disabled={loading}>{loading ? "در حال اجرا..." : "اجرای گزارش"}</button>
        {rows.length > 0 && <button type="button" onClick={exportCsv} className="btn-outline-eco">خروجی CSV</button>}
      </form>

      <div className="panel p-4">
        <table className="w-full data-table">
          <thead>
            <tr><th>شماره مأموریت</th><th>وضعیت</th><th>ریسک</th><th>حجم</th><th>تاریخ</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={5} className="text-center py-6 text-ink-faint">فیلترها را تنظیم و گزارش را اجرا کنید.</td></tr>}
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="font-mono">{r.mission_no}</td>
                <td>{r.status}</td>
                <td>{r.risk_level}</td>
                <td>{r.estimated_volume ?? "—"}</td>
                <td className="font-mono">{r.scheduled_date ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-ink-faint mt-3">خروجی Excel/PDF رسمی (با لوگو و هدر) در نسخهٔ بعدی با ExcelJS/jsPDF افزوده می‌شود؛ فعلاً CSV آماده است.</p>
    </AppShell>
  );
}
