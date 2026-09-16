import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { PETRO_NAV, withActive } from "@/lib/nav";

export default async function PetroDestinationsPage() {
  const supabase = createClient();
  const { data: destinations } = await supabase
    .from("authorized_destinations")
    .select("id, name, address, capacity_liters, is_active")
    .order("created_at", { ascending: false });

  return (
    <AppShell title="مقاصد مجاز تخلیه" orgLabel="پتروشیمی" nav={withActive(PETRO_NAV, "/petro/destinations")}>
      <div className="panel p-4">
        <table className="w-full data-table">
          <thead>
            <tr><th>نام مقصد</th><th>آدرس</th><th>ظرفیت</th><th>وضعیت</th></tr>
          </thead>
          <tbody>
            {(destinations ?? []).length === 0 && (
              <tr><td colSpan={4} className="text-center py-6 text-ink-faint">مقصد مجازی تعریف نشده است.</td></tr>
            )}
            {(destinations ?? []).map((d: any) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>{d.address ?? "—"}</td>
                <td>{d.capacity_liters ? `${d.capacity_liters} لیتر` : "—"}</td>
                <td className={d.is_active ? "text-status-ok" : "text-status-alert"}>{d.is_active ? "فعال" : "غیرفعال"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-ink-faint mt-3">تعریف مقاصد مجاز جدید فقط توسط مدیر سامانه انجام می‌شود (بند ۱۷ سند).</p>
      </div>
    </AppShell>
  );
}
