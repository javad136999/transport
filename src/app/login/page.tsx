"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"password" | "otp">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError("ایمیل یا رمز عبور نادرست است.");
    router.refresh();
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);
    if (error) return setError("ارسال کد با خطا مواجه شد. شماره را بررسی کنید.");
    setOtpSent(true);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
    setLoading(false);
    if (error) return setError("کد وارد شده نادرست یا منقضی است.");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Identity panel */}
      <div className="md:w-1/2 grid-backdrop bg-base-panel border-l border-base-border flex flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-brand/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-10 w-72 h-72 bg-eco/20 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-aqua-eco shadow-glow-cyan flex items-center justify-center font-mono text-[#02171B] text-sm font-bold">P</div>
            <span className="text-ink-muted text-sm">شرکت پیمانکاران تصفیه صنعت</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mt-10 max-w-md">
            <span className="text-gradient">سامانه مدیریت و نظارت</span> بر حمل پساب
          </h1>
          <p className="text-ink-muted mt-4 max-w-md leading-7">
            زنجیره دیجیتال قابل رهگیری از درخواست حمل تا بارگیری، جابه‌جایی، تخلیه و تأیید مقصد —
            برای پتروشیمی‌های منطقه ویژه اقتصادی انرژی پارس.
          </p>
        </div>
        <div className="relative hidden md:flex gap-6 font-mono text-xs text-ink-faint">
          <span className="text-brand-light">● GPS TRACKING</span>
          <span className="text-eco-light">● CHAIN OF CUSTODY</span>
          <span>● RLS SECURED</span>
        </div>
      </div>

      {/* Form panel */}
      <div className="md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="flex gap-2 mb-6 text-sm">
            <button
              onClick={() => setMode("password")}
              className={`px-3 py-1.5 rounded ${mode === "password" ? "bg-brand text-white" : "text-ink-muted"}`}
            >
              ایمیل و رمز عبور
            </button>
            <button
              onClick={() => setMode("otp")}
              className={`px-3 py-1.5 rounded ${mode === "otp" ? "bg-brand text-white" : "text-ink-muted"}`}
            >
              موبایل و کد یکبارمصرف
            </button>
          </div>

          {mode === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="field-label">ایمیل سازمانی</label>
                <input className="field-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="field-label">رمز عبور</label>
                <input className="field-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {error && <p className="text-status-alert text-sm">{error}</p>}
              <button className="btn-primary w-full" disabled={loading}>
                {loading ? "در حال ورود..." : "ورود"}
              </button>
            </form>
          )}

          {mode === "otp" && !otpSent && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="field-label">شماره موبایل</label>
                <input className="field-input" dir="ltr" placeholder="09xxxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              {error && <p className="text-status-alert text-sm">{error}</p>}
              <button className="btn-primary w-full" disabled={loading}>
                {loading ? "در حال ارسال..." : "ارسال کد"}
              </button>
            </form>
          )}

          {mode === "otp" && otpSent && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="field-label">کد ارسال‌شده به {phone}</label>
                <input className="field-input" dir="ltr" value={otp} onChange={(e) => setOtp(e.target.value)} required />
              </div>
              {error && <p className="text-status-alert text-sm">{error}</p>}
              <button className="btn-primary w-full" disabled={loading}>
                {loading ? "در حال بررسی..." : "تأیید و ورود"}
              </button>
            </form>
          )}

          <p className="text-ink-faint text-xs mt-6">
            پتروشیمی هنوز عضو سامانه نیست؟{" "}
            <a href="/register" className="text-brand-light">
              ثبت درخواست عضویت
            </a>
          </p>
          <p className="text-ink-faint text-xs mt-2">
            راننده هستید؟{" "}
            <a href="/register/driver" className="text-brand-light">
              ثبت‌نام راننده
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
