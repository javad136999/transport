import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_NAV, withActive } from "@/lib/nav";
import { approvalColor } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  pending: "در انتظار بررسی",
  approved: "تأیید شده",
  rejected: "رد شده",
  expired: "منقضی",
  suspended: "تعلیق شده",
};

export default async function AdminDriversPage() {
  const supabase = createClient();
  const { data: drivers } = await supabase
    .from("drivers")
    .select("id, first_name, last_name, mobile, license_no, license_expiry, status")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <AppShell title="مدیریت رانندگان" orgLabel="مدیر سامانه" nav={withActive(ADMIN_NAV, "/dashboard/drivers")}>
      <div className="panel p-4">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>نام و نام خانوادگی</th>
              <th>موبایل</th>
              <th>شماره گواهینامه</th>
              <th>اعتبار گواهینامه</th>
              <th>وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {(drivers ?? []).length === 0 && (
              <tr><td colSpan={5} className="text-center py-6 text-ink-faint">راننده‌ای ثبت نشده است.</td></tr>
            )}
            {(drivers ?? []).map((d: any) => (
              <tr key={d.id}>
                <td>{d.first_name} {d.last_name}</td>
                <td className="font-mono" dir="ltr">{d.mobile}</td>
                <td className="font-mono">{d.license_no}</td>
                <td className="font-mono">{d.license_expiry ?? "—"}</td>
                <td>
                  <span className={`text-xs px-2 py-0.5 rounded ${approvalColor(d.status)}`}>
                    {STATUS_LABEL[d.status] ?? d.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-ink-faint mt-3">
          توجه: تأیید کلی راننده در این صفحه کافی نیست — هر پتروشیمی باید جداگانه از صفحهٔ «رانندگان مجاز» خودش
          راننده را تأیید کند (جدول driver_approvals).
        </p>
      </div>
    </AppShell>
  );
}
