"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { PATROL_BOTTOM_NAV } from "@/lib/nav";

export default function PatrolReportsPage() {
  const supabase = createClient();
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: patrolUser } = await supabase.from("patrol_users").select("id").eq("user_id", user?.id).single();
      if (!patrolUser) return;
      const { data } = await supabase.from("inspection_reports").select("id, report_no, plate_normalized, query_result, created_at").eq("patrol_user_id", patrolUser.id).order("created_at", { ascending: false });
      setReports(data ?? []);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-base pb-24">
      <header className="p-4 border-b border-base-border"><h1 className="text-base font-medium">گزارش‌های من</h1></header>
      <div className="p-4 space-y-3">
        {reports.length === 0 && <p className="text-ink-faint text-center py-16 text-sm">گزارشی ثبت نکرده‌اید.</p>}
        {reports.map((r) => (
          <div key={r.id} className="panel p-4 flex justify-between text-sm">
            <div>
              <p className="font-mono">{r.report_no}</p>
              <p className="text-ink-faint text-xs" dir="ltr">{r.plate_normalized}</p>
            </div>
            <span className="text-ink-muted text-xs">{r.query_result}</span>
          </div>
        ))}
      </div>
      <BottomNav items={PATROL_BOTTOM_NAV} currentPath="/patrol/reports" />
    </div>
  );
}
