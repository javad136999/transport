import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { PETRO_NAV, withActive } from "@/lib/nav";

export default async function PetroReportsPage() {
  const supabase = createClient();
  const { data: missions } = await supabase
    .from("missions")
    .select("status, estimated_volume")
    .limit(1000);

  const total = missions?.length ?? 0;
  const completed = missions?.filter((m) => m.status === "completed").length ?? 0;
  const suspicious = missions?.filter((m) => m.status === "suspicious" || m.status === "needs_review").length ?? 0;
  const totalVolume = missions?.reduce((sum, m) => sum + (m.estimated_volume ?? 0), 0) ?? 0;

  return (
    <AppShell title="گزارش عملکرد محیط‌زیستی" orgLabel="پتروشیمی" nav={withActive(PETRO_NAV, "/petro/reports")}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="panel p-4"><p className="text-ink-muted text-xs mb-2">کل مأموریت‌ها</p><p className="kpi-value">{total}</p></div>
        <div className="panel p-4"><p className="text-ink-muted text-xs mb-2">تکمیل‌شده</p><p className="kpi-value text-status-ok">{completed}</p></div>
        <div className="panel p-4"><p className="text-ink-muted text-xs mb-2">مشکوک/نیازمند بررسی</p><p className="kpi-value text-status-warn">{suspicious}</p></div>
        <div className="panel p-4"><p className="text-ink-muted text-xs mb-2">حجم کل تقریبی</p><p className="kpi-value">{totalVolume.toLocaleString("en-US")}</p></div>
      </div>
      <p className="text-xs text-ink-faint mt-4">
        گزارش‌های تفکیکی روزانه/هفتگی/ماهانه/فصلی/سالانه (بند ۴۲ سند) و خروجی PDF رسمی در نسخهٔ بعدی افزوده می‌شود.
      </p>
    </AppShell>
  );
}
