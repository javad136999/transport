import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { OBSERVER_NAV, withActive } from "@/lib/nav";

export default async function ObserverReportsPage() {
  const supabase = createClient();
  const { data: missions } = await supabase.from("missions").select("status").limit(2000);
  const total = missions?.length ?? 0;
  const completed = missions?.filter((m) => m.status === "completed").length ?? 0;

  return (
    <AppShell title="گزارش‌های منطقه‌ای" orgLabel="ناظر" nav={withActive(OBSERVER_NAV, "/observer/reports")}>
      <div className="grid grid-cols-2 gap-3">
        <div className="panel p-4"><p className="text-ink-muted text-xs mb-2">کل مأموریت‌های منطقه</p><p className="kpi-value">{total}</p></div>
        <div className="panel p-4"><p className="text-ink-muted text-xs mb-2">تکمیل‌شده</p><p className="kpi-value text-status-ok">{completed}</p></div>
      </div>
    </AppShell>
  );
}
