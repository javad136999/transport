"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ADMIN_NAV, withActive } from "@/lib/nav";

export default function SettingsPage() {
  const [gpsInterval, setGpsInterval] = useState(90);
  const [geofenceRadius, setGeofenceRadius] = useState(300);
  const [volumeThreshold, setVolumeThreshold] = useState(5);
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    // TODO: ذخیرهٔ این مقادیر در جدولی مثل system_settings (key/value)
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <AppShell title="تنظیمات سامانه" orgLabel="مدیر سامانه" nav={withActive(ADMIN_NAV, "/dashboard/settings")}>
      <form onSubmit={handleSave} className="max-w-xl panel p-6 space-y-5">
        <div>
          <label className="field-label">فاصلهٔ ثبت GPS در حین حمل (ثانیه)</label>
          <input className="field-input" type="number" value={gpsInterval} onChange={(e) => setGpsInterval(Number(e.target.value))} />
        </div>
        <div>
          <label className="field-label">شعاع پیش‌فرض Geofence مبدأ/مقصد (متر)</label>
          <input className="field-input" type="number" value={geofenceRadius} onChange={(e) => setGeofenceRadius(Number(e.target.value))} />
        </div>
        <div>
          <label className="field-label">آستانهٔ هشدار اختلاف حجم بارگیری/تخلیه (درصد)</label>
          <input className="field-input" type="number" value={volumeThreshold} onChange={(e) => setVolumeThreshold(Number(e.target.value))} />
        </div>
        {saved && <p className="text-status-ok text-sm">تنظیمات ذخیره شد.</p>}
        <button className="btn-primary">ذخیره تنظیمات</button>
      </form>
      <p className="text-xs text-ink-faint mt-4 max-w-xl">
        این مقادیر فعلاً فقط در حافظهٔ مرورگر نگه‌داری می‌شوند. برای پایداری، یک جدول `system_settings(key, value)`
        در Supabase اضافه کنید و این فرم را به آن متصل کنید.
      </p>
    </AppShell>
  );
}
