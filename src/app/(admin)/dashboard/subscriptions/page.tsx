import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_NAV, withActive } from "@/lib/nav";

const STATUS_LABEL: Record<string, string> = {
  draft: "پیش‌نویس",
  invoice_generated: "پیش‌فاکتور صادر شد",
  awaiting_payment: "در انتظار پرداخت",
  payment_submitted: "پرداخت ثبت شد",
  under_review: "در حال بررسی",
  approved: "تأیید شد",
  rejected: "رد شد",
  active: "فعال",
  expired: "منقضی",
  cancelled: "لغو شد",
};

export default async function SubscriptionsPage() {
  const supabase = createClient();
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("id, start_date, end_date, final_amount, status, organizations:petrochemical_id(name)")
    .order("created_at", { ascending: false })
    .limit(150);

  return (
    <AppShell title="اشتراک‌های سالانه" orgLabel="مدیر سامانه" nav={withActive(ADMIN_NAV, "/dashboard/subscriptions")}>
      <div className="panel p-4">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>پتروشیمی</th>
              <th>شروع</th>
              <th>پایان</th>
              <th>مبلغ نهایی</th>
              <th>وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {(subs ?? []).length === 0 && (
              <tr><td colSpan={5} className="text-center py-6 text-ink-faint">اشتراکی ثبت نشده است.</td></tr>
            )}
            {(subs ?? []).map((s: any) => (
              <tr key={s.id}>
                <td>{s.organizations?.name ?? "—"}</td>
                <td className="font-mono">{s.start_date ?? "—"}</td>
                <td className="font-mono">{s.end_date ?? "—"}</td>
                <td className="font-mono">{s.final_amount?.toLocaleString?.("en-US") ?? "—"}</td>
                <td className="text-brand-light">{STATUS_LABEL[s.status] ?? s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-ink-faint mt-3">
          صدور پیش‌فاکتور و تعیین قیمت جدید از این صفحه (فرم افزودن اشتراک) در نسخهٔ بعدی افزوده می‌شود.
        </p>
      </div>
    </AppShell>
  );
}
