"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const initialForm = {
  first_name: "",
  last_name: "",
  mobile: "",
  national_code: "",
  license_no: "",
  license_expiry: "",
  email: "",
  password: "",
};

export default function DriverRegisterPage() {
  const supabase = createClient();
  const [form, setForm] = useState(initialForm);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [extraFile, setExtraFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function update<K extends keyof typeof initialForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate(): string | null {
    if (!form.first_name.trim() || !form.last_name.trim()) return "نام و نام خانوادگی را وارد کنید.";
    if (!form.mobile.trim()) return "شماره موبایل را وارد کنید.";
    if (!form.national_code.trim()) return "کد ملی را وارد کنید.";
    if (!form.license_no.trim()) return "شماره گواهینامه را وارد کنید.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "ایمیل معتبر وارد کنید.";
    if (!form.password || form.password.length < 6) return "رمز عبور باید حداقل ۶ کاراکتر باشد.";
    if (!licenseFile) return "تصویر گواهینامه الزامی است.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setSubmitting(true);
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      if (signUpError || !signUpData.user) {
        setError("ساخت حساب کاربری ناموفق بود: " + (signUpError?.message ?? "خطای نامشخص"));
        setSubmitting(false);
        return;
      }
      const userId = signUpData.user.id;

      // حساب راننده تا تأیید مدیر غیرفعال می‌ماند.
      const { error: profileError } = await supabase.from("users").insert({
        id: userId,
        full_name: `${form.first_name.trim()} ${form.last_name.trim()}`,
        phone: form.mobile.trim(),
        national_code: form.national_code.trim(),
        role: "driver",
        is_active: false,
      });
      if (profileError) {
        setError("ثبت پروفایل ناموفق بود: " + profileError.message);
        setSubmitting(false);
        return;
      }

      const { data: driverRow, error: driverError } = await supabase
        .from("drivers")
        .insert({
          user_id: userId,
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          mobile: form.mobile.trim(),
          national_code: form.national_code.trim(),
          license_no: form.license_no.trim(),
          license_expiry: form.license_expiry || null,
          status: "pending",
        })
        .select("id")
        .single();

      if (driverError || !driverRow) {
        setError("ثبت اطلاعات راننده ناموفق بود: " + (driverError?.message ?? "خطای نامشخص"));
        setSubmitting(false);
        return;
      }

      const uploads: { file: File; docType: string }[] = [{ file: licenseFile!, docType: "گواهینامه" }];
      if (extraFile) uploads.push({ file: extraFile, docType: "سایر مدارک" });

      for (const { file, docType } of uploads) {
        const path = `${driverRow.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from("driver-documents").upload(path, file);
        if (uploadError) {
          setError(`آپلود «${docType}» ناموفق بود: ${uploadError.message} — سایر اطلاعات ثبت شد، می‌توانید بعداً از پروفایل خود مدرک را اضافه کنید.`);
          continue;
        }
        await supabase.from("driver_documents").insert({
          driver_id: driverRow.id,
          doc_type: docType,
          file_path: path,
          expiry_date: docType === "گواهینامه" ? form.license_expiry || null : null,
        });
      }

      setDone(true);
    } catch {
      setError("خطای غیرمنتظره‌ای رخ داد. لطفاً دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen grid-backdrop flex items-center justify-center p-6">
        <div className="panel-glow p-8 text-center max-w-md">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-lg font-bold mb-2">درخواست رانندگی ثبت شد</h2>
          <p className="text-ink-muted text-sm leading-7 mb-4">
            اطلاعات و مدارک شما با موفقیت ثبت شد و پرونده در وضعیت <span className="text-status-warn">«در انتظار تأیید مدیر»</span> قرار گرفت.
            تا زمانی که مدیر سامانه پرونده را تأیید نکند، امکان ورود و انجام عملیات رانندگی فعال نخواهد شد.
          </p>
          <Link href="/login" className="btn-outline-eco inline-block">
            بازگشت به صفحه ورود
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid-backdrop relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-24 w-96 h-96 bg-eco/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-lg bg-aqua-eco shadow-glow-cyan flex items-center justify-center font-mono text-[#02171B] text-sm font-bold">P</div>
          <div>
            <p className="text-sm font-medium"><span className="text-gradient font-bold">ثبت‌نام مستقل راننده</span></p>
            <p className="text-xs text-ink-faint">درخواست پس از بررسی مدیر سامانه فعال می‌شود</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="panel-glow p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="نام *" value={form.first_name} onChange={(v) => update("first_name", v)} />
            <Field label="نام خانوادگی *" value={form.last_name} onChange={(v) => update("last_name", v)} />
            <Field label="شماره موبایل *" value={form.mobile} onChange={(v) => update("mobile", v)} dir="ltr" />
            <Field label="کد ملی *" value={form.national_code} onChange={(v) => update("national_code", v)} dir="ltr" />
            <Field label="شماره گواهینامه *" value={form.license_no} onChange={(v) => update("license_no", v)} dir="ltr" />
            <div>
              <label className="field-label">تاریخ اعتبار گواهینامه</label>
              <input className="field-input" type="date" value={form.license_expiry} onChange={(e) => update("license_expiry", e.target.value)} />
            </div>
          </div>

          <div className="border-t border-base-border pt-4 grid md:grid-cols-2 gap-4">
            <Field label="ایمیل (برای ورود) *" value={form.email} onChange={(v) => update("email", v)} dir="ltr" type="email" />
            <Field label="رمز عبور *" value={form.password} onChange={(v) => update("password", v)} dir="ltr" type="password" />
          </div>

          <div className="border-t border-base-border pt-4 space-y-4">
            <div>
              <label className="field-label">تصویر گواهینامه *</label>
              <input className="field-input" type="file" accept="image/*,application/pdf" onChange={(e) => setLicenseFile(e.target.files?.[0] ?? null)} />
            </div>
            <div>
              <label className="field-label">سایر مدارک (اختیاری)</label>
              <input className="field-input" type="file" accept="image/*,application/pdf" onChange={(e) => setExtraFile(e.target.files?.[0] ?? null)} />
            </div>
          </div>

          {error && <p className="text-status-alert text-sm">{error}</p>}
          <button className="btn-primary w-full" disabled={submitting}>{submitting ? "در حال ثبت..." : "ارسال درخواست ثبت‌نام"}</button>
        </form>

        <p className="text-xs text-ink-faint mt-4">شرکت حمل هستید؟ <Link href="/register" className="text-brand-light">ثبت‌نام سازمانی</Link></p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, dir = "rtl", type = "text" }: { label: string; value: string; onChange: (v: string) => void; dir?: "rtl" | "ltr"; type?: string }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input className="field-input" dir={dir} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
