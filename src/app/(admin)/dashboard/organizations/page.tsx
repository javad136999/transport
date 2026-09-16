"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ApproveRejectButtons } from "@/components/ApproveRejectButtons";
import { createClient } from "@/lib/supabase/client";
import { ADMIN_NAV, withActive } from "@/lib/nav";

const TYPE_LABEL: Record<string, string> = {
  petrochemical: "پتروشیمی",
  destination: "تصفیه‌خانه / مقصد",
  transport_company: "شرکت حمل",
  operator: "مدیر سامانه",
  government: "سازمان دولتی",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "در انتظار بررسی",
  approved: "تأیید شده",
  rejected: "رد شده",
  suspended: "معلق",
};

export default function OrganizationsPage() {
  const supabase = createClient();
  const [orgs, setOrgs] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "pending">("pending");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    let query = supabase.from("organizations").select("*").order("created_at", { ascending: false });
    if (filter === "pending") query = query.eq("status", "pending");
    const { data } = await query;
    setOrgs(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [filter]);

  return (
    <AppShell title="مدیریت سازمان‌ها (پتروشیمی / مقصد / حمل)" orgLabel="مدیر سامانه" nav={withActive(ADMIN_NAV, "/dashboard/organizations")}>
      <div className="flex gap-2 mb-4 text-sm">
        <button onClick={() => setFilter("pending")} className={`px-3 py-1.5 rounded ${filter === "pending" ? "bg-brand text-[#02171B] font-medium" : "text-ink-muted bg-base-panel2"}`}>
          در انتظار بررسی
        </button>
        <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded ${filter === "all" ? "bg-brand text-[#02171B] font-medium" : "text-ink-muted bg-base-panel2"}`}>
          همه سازمان‌ها
        </button>
      </div>

      <div className="panel p-4">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>نام شرکت</th>
              <th>نوع</th>
              <th>شناسه ملی</th>
              <th>تلفن</th>
              <th>مدیر</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="text-center py-6 text-ink-faint">در حال بارگذاری...</td></tr>
            )}
            {!loading && orgs.length === 0 && (
              <tr><td colSpan={7} className="text-center py-6 text-ink-faint">موردی یافت نشد.</td></tr>
            )}
            {orgs.map((o) => (
              <tr key={o.id}>
                <td>{o.name}</td>
                <td>{TYPE_LABEL[o.type] ?? o.type}</td>
                <td className="font-mono">{o.national_id ?? "—"}</td>
                <td className="font-mono" dir="ltr">{o.phone ?? "—"}</td>
                <td>{o.manager_name ?? "—"}</td>
                <td>
                  <span className={o.status === "approved" ? "text-status-ok" : o.status === "rejected" ? "text-status-alert" : "text-status-warn"}>
                    {STATUS_LABEL[o.status] ?? o.status}
                  </span>
                </td>
                <td>
                  {o.status === "pending" ? (
                    <ApproveRejectButtons table="organizations" id={o.id} onDone={load} />
                  ) : (
                    <span className="text-ink-faint text-xs">—</span>
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
