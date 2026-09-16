import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { OBSERVER_NAV, withActive } from "@/lib/nav";

export default async function ObserverOrganizationsPage() {
  const supabase = createClient();
  const { data: orgs } = await supabase.from("organizations").select("id, name, type, status").eq("type", "petrochemical");

  return (
    <AppShell title="پتروشیمی‌های تحت نظارت" orgLabel="ناظر" nav={withActive(OBSERVER_NAV, "/observer/organizations")}>
      <div className="panel p-4">
        <table className="w-full data-table">
          <thead><tr><th>نام</th><th>وضعیت</th></tr></thead>
          <tbody>
            {(orgs ?? []).length === 0 && <tr><td colSpan={2} className="text-center py-6 text-ink-faint">موردی یافت نشد.</td></tr>}
            {(orgs ?? []).map((o: any) => (
              <tr key={o.id}><td>{o.name}</td><td>{o.status}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
