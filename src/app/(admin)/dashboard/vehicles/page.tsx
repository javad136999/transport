import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_NAV, withActive } from "@/lib/nav";
import { approvalColor } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  pending: "در انتظار بررسی",
  approved: "تأیید شده",
  rejected: "رد شده",
  expired: "منقضی",
  suspended: "تعلیق",
};

export default async function AdminVehiclesPage() {
  const supabase = createClient();
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, plate_normalized, fleet_no, capacity_liters, vehicle_type, status")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <AppShell title="مدیریت تانکرها" orgLabel="مدیر سامانه" nav={withActive(ADMIN_NAV, "/dashboard/vehicles")}>
      <div className="panel p-4">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>پلاک</th>
              <th>شماره ناوگان</th>
              <th>ظرفیت</th>
              <th>نوع</th>
              <th>وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {(vehicles ?? []).length === 0 && (
              <tr><td colSpan={5} className="text-center py-6 text-ink-faint">تانکری ثبت نشده است.</td></tr>
            )}
            {(vehicles ?? []).map((v: any) => (
              <tr key={v.id}>
                <td className="font-mono" dir="ltr">{v.plate_normalized}</td>
                <td>{v.fleet_no ?? "—"}</td>
                <td>{v.capacity_liters ? `${v.capacity_liters} لیتر` : "—"}</td>
                <td>{v.vehicle_type ?? "—"}</td>
                <td>
                  <span className={`text-xs px-2 py-0.5 rounded ${approvalColor(v.status)}`}>
                    {STATUS_LABEL[v.status] ?? v.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-ink-faint mt-3">
          مشابه رانندگان، تأیید نهایی مجاز بودن هر تانکر برای مأموریت، به تأیید جداگانهٔ هر پتروشیمی نیاز دارد
          (جدول vehicle_approvals).
        </p>
      </div>
    </AppShell>
  );
}
