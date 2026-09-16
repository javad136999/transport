import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_NAV, withActive } from "@/lib/nav";
import { approvalColor } from "@/lib/utils";
import { DriverApprovalActions } from "./DriverApprovalActions";

const STATUS_LABEL: Record<string, string> = {
  pending: "در انتظار تأیید مدیر",
  approved: "تأیید شده",
  rejected: "رد شده",
  expired: "منقضی",
  suspended: "تعلیق شده",
};

export default async function AdminDriversPage() {
  const supabase = createClient();
  const { data: drivers } = await supabase
    .from("drivers")
    .select("id, user_id, first_name, last_name, mobile, license_no, license_expiry, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const pendingCount = (drivers ?? []).filter((d: any) => d.status === "pending").length;

  return (
    <AppShell title="مدیریت رانندگان" orgLabel="مدیر سامانه" nav={withActive(ADMIN_NAV, "/dashboard/drivers")}>
      <section className="mb-5 rounded-2xl border border-cyan-300/15 bg-gradient-to-br from-[#06252d] via-[#071a20] to-[#061116] p-5 shadow-[0_0_40px_rgba(0,194,209,.07)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-extrabold">درخواست‌های ثبت‌نام رانندگان</h2>
            <p className="mt-1 text-sm text-ink-muted">هر راننده ابتدا در وضعیت انتظار قرار می‌گیرد و فقط پس از تأیید مدیر فعال می‌شود.</p>
          </div>
          <div className="rounded-xl border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm text-amber-200">
            درخواست در انتظار: <strong>{pendingCount.toLocaleString("fa-IR")}</strong>
          </div>
        </div>
      </section>

      <div className="panel overflow-hidden">
        <div className="mobile-scroll-table overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>نام و نام خانوادگی</th>
                <th>موبایل</th>
                <th>شماره گواهینامه</th>
                <th>اعتبار گواهینامه</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {(drivers ?? []).length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-ink-faint">راننده‌ای ثبت نشده است.</td></tr>
              )}
              {(drivers ?? []).map((d: any) => (
                <tr key={d.id}>
                  <td className="font-semibold">{d.first_name} {d.last_name}</td>
                  <td className="font-mono" dir="ltr">{d.mobile}</td>
                  <td className="font-mono">{d.license_no}</td>
                  <td className="font-mono">{d.license_expiry ?? "—"}</td>
                  <td>
                    <span className={`text-xs px-2 py-0.5 rounded ${approvalColor(d.status)}`}>
                      {STATUS_LABEL[d.status] ?? d.status}
                    </span>
                  </td>
                  <td>
                    {d.status === "pending" ? <DriverApprovalActions driverId={d.id} /> : <span className="text-xs text-ink-faint">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-base-border p-4 text-xs leading-6 text-ink-faint">
          تأیید این صفحه، وضعیت اصلی راننده را فعال می‌کند. بعد از تأیید، حساب کاربری راننده نیز فعال می‌شود و می‌تواند وارد سامانه شود.
        </p>
      </div>
    </AppShell>
  );
}
