import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_NAV, withActive } from "@/lib/nav";

const ROLE_LABEL: Record<string, string> = {
  super_admin: "مدیر سامانه",
  petro_manager: "مدیر پتروشیمی",
  petro_env_officer: "کارشناس محیط‌زیست پتروشیمی",
  driver: "راننده",
  transport_company: "شرکت حمل",
  destination_operator: "اپراتور مقصد",
  env_observer: "ناظر محیط‌زیست",
  gov_environment_observer: "سازمان حفاظت محیط‌زیست",
  pars_zone_observer: "منطقه ویژه پارس",
  patrol_manager: "مدیر گشت",
  patrol_officer: "مأمور گشت",
};

export default async function UsersPage() {
  const supabase = createClient();
  const { data: users } = await supabase
    .from("users")
    .select("id, full_name, phone, role, is_active, organizations:organization_id(name)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <AppShell title="مدیریت کاربران" orgLabel="مدیر سامانه" nav={withActive(ADMIN_NAV, "/dashboard/users")}>
      <div className="panel p-4">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>نام</th>
              <th>موبایل</th>
              <th>نقش</th>
              <th>سازمان</th>
              <th>وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).length === 0 && (
              <tr><td colSpan={5} className="text-center py-6 text-ink-faint">کاربری یافت نشد.</td></tr>
            )}
            {(users ?? []).map((u: any) => (
              <tr key={u.id}>
                <td>{u.full_name}</td>
                <td className="font-mono" dir="ltr">{u.phone ?? "—"}</td>
                <td>{ROLE_LABEL[u.role] ?? u.role}</td>
                <td>{u.organizations?.name ?? "—"}</td>
                <td className={u.is_active ? "text-status-ok" : "text-status-alert"}>{u.is_active ? "فعال" : "غیرفعال"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
