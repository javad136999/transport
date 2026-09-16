"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type OrgType = "petrochemical" | "destination" | "transport_company";

const ROLE_OPTIONS: {
  type: OrgType;
  title: string;
  subtitle: string;
  icon: string;
}[] = [
  {
    type: "petrochemical",
    title: "پتروشیمی",
    subtitle: "تولیدکننده پساب — درخواست حمل ثبت می‌کند",
    icon: "🏭",
  },
  {
    type: "destination",
    title: "تصفیه‌خانه / مقصد",
    subtitle: "گیرندهٔ پساب — تخلیه را تأیید می‌کند",
    icon: "💧",
  },
  {
    type: "transport_company",
    title: "شرکت حمل و ناوگان",
    subtitle: "ارسال‌کننده — راننده و تانکر معرفی می‌کند",
    icon: "🚛",
  },
];

const initialForm = {
  name: "",
  national_id: "",
  registration_no: "",
  economic_code: "",
  address: "",
  phone: "",
  email: "",
  manager_name: "",
  env_officer_name: "",
  env_officer_contact: "",
};

export default function RegisterPage() {
  const supabase = createClient();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [orgType, setOrgType] = useState<OrgType | null>(null);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof initialForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validateStep1(): string | null {
    if (!form.name.trim()) return "نام شرکت را وارد کنید.";
    if (!form.national_id.trim()) return "شناسه ملی را وارد کنید.";
    if (!form.phone.trim()) return "شماره تماس را وارد کنید.";
    if (!form.manager_name.trim()) return "نام مدیر را وارد کنید.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "ایمیل معتبر نیست.";
    return null;
  }

  async function handleSubmit() {
    setError(null);
    const validationError = validateStep1();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!orgType) {
      setError("نوع سازمان مشخص نشده است.");
      return;
    }

    setSubmitting(true);
    try {
      const { error: insertError } = await supabase.from("organizations").insert({
        type: orgType,
        name: form.name.trim(),
        national_id: form.national_id.trim(),
        registration_no: form.registration_no.trim() || null,
        economic_code: form.economic_code.trim() || null,
        address: form.address.trim() || null,
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        manager_name: form.manager_name.trim(),
        env_officer_name: form.env_officer_name.trim() || null,
        env_officer_contact: form.env_officer_contact.trim() || null,
        status: "pending",
      });

      if (insertError) {
        setError("ثبت درخواست ناموفق بود: " + insertError.message);
        return;
      }
      setStep(2);
    } catch (e) {
      setError("خطای غیرمنتظره در ارتباط با سرور رخ داد. لطفاً دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  }

  const roleMeta = ROLE_OPTIONS.find((r) => r.type === orgType);

  return (
    <div className="min-h-screen grid-backdrop relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-24 w-96 h-96 bg-eco/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-lg bg-aqua-eco shadow-glow-cyan flex items-center justify-center font-mono text-[#02171B] text-sm font-bold">
            P
          </div>
          <div>
            <p className="text-sm font-medium">
              <span className="text-gradient font-bold">سامانه مدیریت و نظارت</span> بر حمل پساب
            </p>
            <p className="text-xs text-ink-faint">شرکت پیمانکاران تصفیه صنعت</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8 text-xs text-ink-muted">
          <StepDot active={step >= 0} label="نوع سازمان" />
          <div className="flex-1 h-px bg-base-border" />
          <StepDot active={step >= 1} label="اطلاعات شرکت" />
          <div className="flex-1 h-px bg-base-border" />
          <StepDot active={step >= 2} label="تکمیل ثبت‌نام" />
        </div>

        {step === 0 && (
          <div>
            <h1 className="text-xl font-bold mb-1">درخواست عضویت در سامانه</h1>
            <p className="text-ink-muted text-sm mb-6">نوع فعالیت سازمان خود را انتخاب کنید:</p>
            <div className="grid md:grid-cols-3 gap-4">
              {ROLE_OPTIONS.map((r) => (
                <button
                  key={r.type}
                  type="button"
                  onClick={() => {
                    setOrgType(r.type);
                    setStep(1);
                  }}
                  className={`role-card ${orgType === r.type ? "active" : ""}`}
                >
                  <div className="text-3xl mb-3">{r.icon}</div>
                  <h3 className="font-bold mb-1">{r.title}</h3>
                  <p className="text-xs text-ink-muted leading-6">{r.subtitle}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-ink-faint mt-6">
              قبلاً ثبت‌نام کرده‌اید؟{" "}
              <Link href="/login" className="text-brand-light">
                ورود به سامانه
              </Link>
            </p>
            <p className="text-xs text-ink-faint mt-2">
              راننده هستید و می‌خواهید مستقل ثبت‌نام کنید؟{" "}
              <Link href="/register/driver" className="text-brand-light">
                ثبت‌نام راننده
              </Link>
            </p>
          </div>
        )}

        {step === 1 && roleMeta && (
          <div className="panel-glow p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-bold">اطلاعات {roleMeta.title}</h2>
                <p className="text-xs text-ink-muted">{roleMeta.subtitle}</p>
              </div>
              <button className="text-xs text-brand-light" onClick={() => setStep(0)}>
                ← تغییر نوع سازمان
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Field label="نام شرکت *" value={form.name} onChange={(v) => update("name", v)} />
              <Field label="شناسه ملی *" value={form.national_id} onChange={(v) => update("national_id", v)} dir="ltr" />
              <Field label="شماره ثبت" value={form.registration_no} onChange={(v) => update("registration_no", v)} dir="ltr" />
              <Field label="کد اقتصادی" value={form.economic_code} onChange={(v) => update("economic_code", v)} dir="ltr" />
              <Field label="تلفن *" value={form.phone} onChange={(v) => update("phone", v)} dir="ltr" />
              <Field label="ایمیل" value={form.email} onChange={(v) => update("email", v)} dir="ltr" type="email" />
              <Field label="نام مدیر *" value={form.manager_name} onChange={(v) => update("manager_name", v)} />
              <Field
                label="نام مسئول محیط‌زیست"
                value={form.env_officer_name}
                onChange={(v) => update("env_officer_name", v)}
              />
              <Field
                label="تماس مسئول محیط‌زیست"
                value={form.env_officer_contact}
                onChange={(v) => update("env_officer_contact", v)}
                dir="ltr"
              />
              <div className="md:col-span-2">
                <label className="field-label">آدرس</label>
                <textarea
                  className="field-input"
                  rows={2}
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                />
              </div>
            </div>

            {error && <p className="text-status-alert text-sm mt-4">{error}</p>}

            <div className="flex gap-3 mt-6">
              <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "در حال ثبت..." : "ثبت درخواست عضویت"}
              </button>
              <button className="btn-secondary" onClick={() => setStep(0)} disabled={submitting}>
                بازگشت
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="panel-glow p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-lg font-bold mb-2">درخواست شما ثبت شد</h2>
            <p className="text-ink-muted text-sm max-w-md mx-auto leading-7 mb-4">
              درخواست عضویت <strong>{form.name}</strong> با وضعیت{" "}
              <span className="text-status-warn">«در انتظار بررسی»</span> ثبت شد. پس از بررسی و تأیید توسط مدیر
              سامانه (شرکت پیمانکاران تصفیه صنعت)، از طریق شماره تماس یا ایمیل ثبت‌شده به شما اطلاع‌رسانی و لینک
              فعال‌سازی حساب ارسال می‌شود.
            </p>
            <Link href="/login" className="btn-outline-eco inline-block">
              بازگشت به صفحه ورود
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StepDot({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <span className={`w-2 h-2 rounded-full ${active ? "bg-brand shadow-glow-cyan" : "bg-base-border"}`} />
      <span className={active ? "text-ink" : ""}>{label}</span>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  dir = "rtl",
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  dir?: "rtl" | "ltr";
  type?: string;
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input className="field-input" dir={dir} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
