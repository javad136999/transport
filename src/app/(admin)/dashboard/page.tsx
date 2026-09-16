import Link from "next/link";
import { Activity, AlertTriangle, ArrowLeft, Droplets, Map, ShieldCheck, Truck, Users, Factory } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { createClient } from "@/lib/supabase/server";
import { MISSION_STATUS_LABEL, missionStatusColor, riskColor } from "@/lib/utils";
import { ADMIN_NAV, withActive } from "@/lib/nav";

export default async function AdminDashboardPage() {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [
    { count: orgCount },
    { count: activeSubs },
    { count: activeDrivers },
    { count: activeVehicles },
    { count: missionsToday },
    { count: inTransit },
    { count: unloading },
    { count: activeAlerts },
    { count: completedToday },
    { data: riskyMissions },
  ] = await Promise.all([
    supabase.from("organizations").select("id", { count: "exact", head: true }).eq("type", "petrochemical"),
    supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("drivers").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("missions").select("id", { count: "exact", head: true }).eq("scheduled_date", today),
    supabase.from("missions").select("id", { count: "exact", head: true }).eq("status", "in_transit"),
    supabase.from("missions").select("id", { count: "exact", head: true }).eq("status", "unloading_started"),
    supabase.from("alerts").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("missions").select("id", { count: "exact", head: true }).eq("scheduled_date", today).eq("status", "completed"),
    supabase.from("missions").select("id, mission_no, status, risk_level, petrochemical_id").in("risk_level", ["medium", "high"]).order("created_at", { ascending: false }).limit(8),
  ]);

  const activeTotal = (inTransit ?? 0) + (unloading ?? 0);

  return (
    <AppShell title="مرکز عملیات مدیریت حمل فاضلاب بهداشتی" orgLabel="مدیر سامانه" nav={withActive(ADMIN_NAV, "/dashboard")}>
      <section className="mb-6 overflow-hidden rounded-2xl border border-cyan-300/15 bg-gradient-to-br from-[#06252d] via-[#071a20] to-[#061116] p-5 shadow-[0_0_50px_rgba(0,194,209,.08)] md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-cyan-200/70"><span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" /> سامانه رصد و مدیریت حمل فاضلاب بهداشتی عسلویه</div>
            <h2 className="text-xl font-extrabold tracking-tight md:text-2xl">تصویر لحظه‌ای عملیات</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">از ثبت درخواست پتروشیمی تا تخصیص تانکر، حرکت، کنترل مسیر، ورود به مقصد، تخلیه و تأیید نهایی؛ همه‌چیز در یک زنجیره قابل ردیابی.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/map" className="btn-primary inline-flex items-center gap-2"><Map size={16} /> نقشه زنده</Link>
            <Link href="/dashboard/missions" className="btn-secondary inline-flex items-center gap-2"><Activity size={16} /> مأموریت‌ها</Link>
          </div>
        </div>
      </section>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label="پتروشیمی‌ها" value={orgCount ?? 0} />
        <StatCard label="مأموریت امروز" value={missionsToday ?? 0} tone="progress" />
        <StatCard label="در حال عملیات" value={activeTotal} tone="progress" />
        <StatCard label="تخلیه در حال انجام" value={unloading ?? 0} tone="progress" />
        <StatCard label="هشدار جدید" value={activeAlerts ?? 0} tone="warn" />
        <StatCard label="تانکر تأییدشده" value={activeVehicles ?? 0} />
        <StatCard label="راننده تأییدشده" value={activeDrivers ?? 0} />
        <StatCard label="تکمیل امروز" value={completedToday ?? 0} tone="ok" />
        <StatCard label="اشتراک فعال" value={activeSubs ?? 0} tone="ok" />
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["رصد ناوگان", "موقعیت و وضعیت تانکرهای فعال", "/dashboard/map", Truck],
          ["مرکز هشدار", "بررسی GPS، مسیر و تأخیرها", "/dashboard/alerts", AlertTriangle],
          ["پتروشیمی‌ها", "مدیریت مراکز ارسال فاضلاب", "/dashboard/organizations", Factory],
          ["گزارش‌ساز", "گزارش عملیاتی و مستندات", "/dashboard/reports", Droplets],
        ].map(([title, text, href, Icon]: any) => (
          <Link key={href} href={href} className="panel group p-4 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-glow-cyan">
            <div className="mb-3 flex items-center justify-between"><span className="rounded-xl bg-brand/10 p-2.5 text-brand-light"><Icon size={19} /></span><ArrowLeft size={16} className="text-ink-faint transition-transform group-hover:-translate-x-1" /></div>
            <div className="font-semibold">{title}</div><div className="mt-1 text-xs text-ink-faint">{text}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-base-border p-4"><div><h2 className="font-semibold">مأموریت‌های نیازمند توجه</h2><p className="mt-1 text-xs text-ink-faint">سطح ریسک فقط برای اولویت‌بندی بررسی انسانی است.</p></div><ShieldCheck size={18} className="text-cyan-300" /></div>
          <div className="mobile-scroll-table overflow-x-auto">
            <table className="w-full data-table"><thead><tr><th>شماره مأموریت</th><th>وضعیت</th><th>ریسک</th></tr></thead><tbody>
              {(riskyMissions ?? []).length === 0 && <tr><td colSpan={3} className="py-8 text-center text-ink-faint">موردی برای نمایش وجود ندارد.</td></tr>}
              {(riskyMissions ?? []).map((m: any) => <tr key={m.id}><td className="font-mono">{m.mission_no}</td><td><span className={`rounded px-2 py-0.5 text-xs ${missionStatusColor(m.status)}`}>{MISSION_STATUS_LABEL[m.status as keyof typeof MISSION_STATUS_LABEL] ?? m.status}</span></td><td><span className={`rounded px-2 py-0.5 text-xs ${riskColor(m.risk_level)}`}>{m.risk_level === "high" ? "بالا" : "متوسط"}</span></td></tr>)}
            </tbody></table>
          </div>
        </div>

        <div className="panel p-4">
          <div className="mb-4 flex items-center gap-2"><Users size={18} className="text-cyan-300" /><h2 className="font-semibold">کنترل زنجیره عملیات</h2></div>
          <div className="space-y-3 text-sm">
            {["درخواست حمل از پتروشیمی", "تأیید راننده و تانکر", "بارگیری و ثبت حجم", "رصد GPS و مسیر", "ورود به تصفیه‌خانه", "ثبت تخلیه و حجم واقعی", "تأیید نهایی و آرشیو"].map((step, i) => <div key={step} className="flex items-center gap-3 rounded-xl border border-base-border bg-base-panel2/40 p-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand/10 font-mono text-xs text-brand-light">{(i + 1).toLocaleString("fa-IR")}</span><span>{step}</span></div>)}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
