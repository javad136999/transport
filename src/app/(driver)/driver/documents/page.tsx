"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { DRIVER_BOTTOM_NAV } from "@/lib/nav";

export default function DriverDocumentsPage() {
  const supabase = createClient();
  const [docs, setDocs] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: driver } = await supabase.from("drivers").select("id").eq("user_id", user?.id).single();
    if (!driver) return;
    const { data } = await supabase.from("driver_documents").select("id, doc_type, expiry_date, uploaded_at").eq("driver_id", driver.id);
    setDocs(data ?? []);
  }

  useEffect(() => { load(); }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data: driver } = await supabase.from("drivers").select("id").eq("user_id", user?.id).single();
    if (driver) {
      const path = `${driver.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("driver-documents").upload(path, file);
      if (!uploadError) {
        await supabase.from("driver_documents").insert({ driver_id: driver.id, doc_type: "سایر مدارک", file_path: path });
        load();
      }
    }
    setUploading(false);
  }

  return (
    <div className="min-h-screen bg-base pb-24">
      <header className="p-4 border-b border-base-border"><h1 className="text-base font-medium">مدارک من</h1></header>
      <div className="p-4 space-y-3">
        <label className="panel p-4 flex items-center justify-center text-sm text-brand-light cursor-pointer">
          {uploading ? "در حال آپلود..." : "+ افزودن مدرک جدید"}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
        {docs.length === 0 && <p className="text-ink-faint text-center py-10 text-sm">مدرکی آپلود نشده است.</p>}
        {docs.map((d) => (
          <div key={d.id} className="panel p-4 flex justify-between text-sm">
            <span>{d.doc_type}</span>
            <span className="text-ink-faint text-xs">{d.expiry_date ?? "بدون تاریخ انقضا"}</span>
          </div>
        ))}
      </div>
      <BottomNav items={DRIVER_BOTTOM_NAV} currentPath="/driver/documents" />
    </div>
  );
}
