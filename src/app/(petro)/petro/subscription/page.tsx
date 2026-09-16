import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { PETRO_NAV, withActive } from "@/lib/nav";

const STATUS_LABEL: Record<string, string> = {
  draft: "پیش‌نویس",
  invoice_generated: "پیش‌فاکتور صادر شد",
  awaiting_payment: "در انتظار پرداخت",
  payment_submitted: "پرداخت ثبت شد — در انتظار تأیید",
  under_review: "در حال بررسی مدیر سامانه",
  approved: "تأیید شد",
  rejected: "رد شد",
  active: "فعال",
  expired: "منقضی",
  cancelled: "لغو شد",
};

export default async function PetroSubscriptionPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("users").select("organization_id").eq("id", user?.id).single();

  const { data: subs } = await supabase
    .from("subscriptions")
    .select("id, start_date, end_date, final_amount, status")
    .eq("petrochemical_id", profile?.organization_id)
    .order("created_at", { ascending: false });

  const active = subs?.find((s) => s.status === "active");

  return (
    <AppShell title="اشتراک سامانه" orgLabel="پتروشیمی" nav={withActive(PETRO_NAV, "/petro/subscription")}>
      {active ? (
        <div className="panel-glow p-6 mb-6 max-w-lg">
          <p className="text-status-ok text-sm mb-2">✅ اشتراک فعال</p>
          <p className="text-sm text-ink-muted">از {active.start_date} تا {active.end_date}</p>
        </div>
      ) : (
        <div className="panel p-6 mb-6 max-w-lg">
          <p className="text-status-warn text-sm">اشتراک فعالی برای این پتروشیمی ثبت نشده است.</p>
          <p className="text-xs text-ink-faint mt-2">برای خرید اشتراک سالانهٔ جدید با مدیر سامانه (شرکت پیمانکاران تصفیه صنعت) تماس بگیرید.</p>
        </div>
      )}

      <div className="panel p-4">
        <table className="w-full data-table">
          <thead><tr><th>شروع</th><th>پایان</th><th>مبلغ نهایی</th><th>وضعیت</th></tr></thead>
          <tbody>
            {(subs ?? []).length === 0 && <tr><td colSpan={4} className="text-center py-6 text-ink-faint">تاریخچه‌ای وجود ندارد.</td></tr>}
            {(subs ?? []).map((s: any) => (
              <tr key={s.id}>
                <td className="font-mono">{s.start_date ?? "—"}</td>
                <td className="font-mono">{s.end_date ?? "—"}</td>
                <td className="font-mono">{s.final_amount?.toLocaleString?.("en-US") ?? "—"}</td>
                <td className="text-brand-light">{STATUS_LABEL[s.status] ?? s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
