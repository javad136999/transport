"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ApproveRejectButtons } from "@/components/ApproveRejectButtons";
import { createClient } from "@/lib/supabase/client";
import { ADMIN_NAV, withActive } from "@/lib/nav";

const STATUS_LABEL: Record<string, string> = {
  pending: "در انتظار بررسی",
  under_review: "در حال بررسی",
  approved: "تأیید شده",
  rejected: "رد شده",
};

export default function PaymentsPage() {
  const supabase = createClient();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("payments")
      .select("id, method, amount, tracking_no, status, created_at, invoices:invoice_id(invoice_no)")
      .order("created_at", { ascending: false })
      .limit(150);
    setPayments(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <AppShell title="پرداخت‌ها" orgLabel="مدیر سامانه" nav={withActive(ADMIN_NAV, "/dashboard/payments")}>
      <div className="panel p-4">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>شماره فاکتور</th>
              <th>روش پرداخت</th>
              <th>مبلغ</th>
              <th>شماره پیگیری</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="text-center py-6 text-ink-faint">در حال بارگذاری...</td></tr>}
            {!loading && payments.length === 0 && (
              <tr><td colSpan={6} className="text-center py-6 text-ink-faint">پرداختی ثبت نشده است.</td></tr>
            )}
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="font-mono">{p.invoices?.invoice_no ?? "—"}</td>
                <td>{p.method === "manual" ? "ثبت دستی" : p.method === "bank_transfer" ? "کارت به کارت" : "آنلاین"}</td>
                <td className="font-mono">{p.amount?.toLocaleString?.("en-US")}</td>
                <td className="font-mono" dir="ltr">{p.tracking_no ?? "—"}</td>
                <td className="text-status-warn">{STATUS_LABEL[p.status] ?? p.status}</td>
                <td>
                  {p.status === "pending" || p.status === "under_review" ? (
                    <ApproveRejectButtons table="payments" id={p.id} onDone={load} />
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
