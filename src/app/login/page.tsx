"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const SAVED_LOGIN_KEY = "waste-login-email";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"password" | "otp" | "activate">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(true);
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const savedEmail = window.localStorage.getItem(SAVED_LOGIN_KEY);
      if (savedEmail) setEmail(savedEmail);
    } catch {
      // localStorage may be unavailable in private/restricted browser modes.
    }
  }, []);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });

    if (error) {
      setLoading(false);
      setError(
        error.message.toLowerCase().includes("email not confirmed")
          ? "ایمیل این حساب هنوز تأیید نشده است."
          : "ایمیل یا رمز عبور نادرست است."
      );
      return;
    }

    if (!data.session) {
      setLoading(false);
      setError("ورود انجام نشد؛ نشست کاربری ایجاد نشد. دوباره تلاش کنید.");
      return;
    }

    let { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role, is_active, organization_id")
      .eq("id", data.user.id)
      .maybeSingle();

    // اگر حساب ایمیل در Auth ساخته شده ولی پروفایل سامانه هنوز ساخته نشده،
    // در صورت وجود سازمان تأییدشده با همان ایمیل، پروفایل مدیر پتروشیمی را خودکار می‌سازیم.
    if (!profile && !profileError) {
      const { data: organization, error: organizationError } = await supabase
        .from("organizations")
        .select("id, name, type, status, manager_name, email")
        .ilike("email", normalizedEmail)
        .eq("type", "petrochemical")
        .maybeSingle();

      if (!organizationError && organization) {
        if (organization.status !== "approved") {
          await supabase.auth.signOut();
          setLoading(false);
          setError("سازمان پتروشیمی هنوز توسط مدیر سامانه تأیید نشده است.");
          return;
        }

          const { data: createdProfile, error: createProfileError } = await supabase
          .from("users")
            .insert({
              id: data.user.id,
              full_name: organization.manager_name ?? organization.name,
              role: "petro_manager",
            organization_id: organization.id,
            is_active: true,
          })
          .select("role, is_active, organization_id")
          .single();

        if (createProfileError) {
          await supabase.auth.signOut();
          setLoading(false);
          setError("حساب ایمیل ساخته شده، اما پروفایل پتروشیمی ایجاد نشد. وضعیت عضویت سازمان را بررسی کنید.");
          return;
        }

        profile = createdProfile;
      }
    }

    if (profileError) {
      await supabase.auth.signOut();
      setLoading(false);
      setError("بررسی وضعیت حساب انجام نشد. لطفاً دوباره تلاش کنید.");
      return;
    }

    if (!profile) {
      await supabase.auth.signOut();
      setLoading(false);
      setError("برای این ایمیل حساب سازمانی در سامانه پیدا نشد. ابتدا عضویت سازمان را ثبت و تأیید کنید.");
      return;
    }

    if (profile.role === "driver" && profile.is_active !== true) {
      await supabase.auth.signOut();
      setLoading(false);
      setError("درخواست رانندگی شما هنوز توسط مدیر تأیید نشده است. پس از تأیید مدیر، ورود شما فعال می‌شود.");
      return;
    }

    if (profile.is_active === false) {
      await supabase.auth.signOut();
      setLoading(false);
      setError("این حساب در حال حاضر غیرفعال است. با مدیر سامانه تماس بگیرید.");
      return;
    }

    try {
      if (rememberLogin) window.localStorage.setItem(SAVED_LOGIN_KEY, normalizedEmail);
      else window.localStorage.removeItem(SAVED_LOGIN_KEY);
    } catch {
      // Ignore storage errors; Supabase session remains active.
    }

    setLoading(false);
    router.replace("/");
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
    const { data, error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
    if (error) {
      setLoading(false);
      return setError("کد وارد شده نادرست یا منقضی است.");
    }

    if (data.user) {
      const { data: profile } = await supabase.from("users").select("role, is_active").eq("id", data.user.id).maybeSingle();
      if (profile?.role === "driver" && profile.is_active !== true) {
        await supabase.auth.signOut();
        setLoading(false);
        return setError("درخواست رانندگی شما هنوز توسط مدیر تأیید نشده است.");
      }
    }

    setLoading(false);
    router.replace("/");
    router.refresh();
  }

  async function handleActivate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();
    const { data, error: signUpError } = await supabase.auth.signUp({ email: normalizedEmail, password });
    if (signUpError) {
      setLoading(false);
      setError(signUpError.message.toLowerCase().includes("already registered") ? "این ایمیل قبلاً فعال شده است؛ از گزینه ورود استفاده کنید." : "فعال‌سازی حساب انجام نشد. ایمیل و رمز عبور را بررسی کنید.");
      return;
    }
    if (!data.session || !data.user) {
      setLoading(false);
      setError("حساب ایجاد شد. ایمیل تأیید را باز کنید و سپس وارد شوید.");
      return;
    }
    const { data: organization } = await supabase
      .from("organizations")
      .select("id, name, manager_name, status")
      .ilike("email", normalizedEmail)
      .eq("type", "petrochemical")
      .maybeSingle();
    if (!organization || organization.status !== "approved") {
      await supabase.auth.signOut();
      setLoading(false);
      setError("برای این ایمیل، پتروشیمی تأییدشده‌ای پیدا نشد.");
      return;
    }
    const { error: profileError } = await supabase.from("users").insert({
      id: data.user.id,
      full_name: organization.manager_name ?? organization.name,
      role: "petro_manager",
      organization_id: organization.id,
      is_active: true,
    });
    if (profileError) {
      await supabase.auth.signOut();
      setLoading(false);
      setError("حساب ساخته شد، اما پروفایل سازمانی ایجاد نشد. دوباره تلاش کنید.");
      return;
    }
    setLoading(false);
    router.replace("/petro/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="md:w-1/2 grid-backdrop border-l border-cyan-400/15 flex flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-300 to-blue-600 shadow-glow-cyan flex items-center justify-center font-mono text-white text-sm font-bold">P</div>
            <span className="text-slate-300 text-sm">شرکت پیمانکاران تصفیه صنعت</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mt-10 max-w-md"><span className="text-gradient">سامانه مدیریت و نظارت</span> بر حمل پساب</h1>
          <p className="text-slate-400 mt-4 max-w-md leading-7">زنجیره دیجیتال قابل رهگیری از درخواست حمل تا بارگیری، جابه‌جایی، تخلیه و تأیید مقصد — برای پتروشیمی‌های منطقه ویژه اقتصادی انرژی پارس.</p>
        </div>
        <div className="relative hidden md:flex gap-6 font-mono text-xs text-slate-500"><span className="text-cyan-300">● GPS TRACKING</span><span className="text-emerald-300">● CHAIN OF CUSTODY</span><span>● RLS SECURED</span></div>
      </div>

      <div className="md:w-1/2 flex items-center justify-center p-8 bg-[#020b18]/60">
        <div className="w-full max-w-sm panel-glow p-6 md:p-7">
          <div className="flex gap-2 mb-6 text-sm">
            <button type="button" onClick={() => setMode("password")} className={`px-3 py-1.5 rounded ${mode === "password" ? "bg-gradient-to-l from-cyan-400 to-blue-600 text-white" : "text-slate-400"}`}>ورود</button>
            <button type="button" onClick={() => setMode("otp")} className={`px-3 py-1.5 rounded ${mode === "otp" ? "bg-gradient-to-l from-cyan-400 to-blue-600 text-white" : "text-slate-400"}`}>کد یکبارمصرف</button>
            <button type="button" onClick={() => setMode("activate")} className={`px-3 py-1.5 rounded ${mode === "activate" ? "bg-gradient-to-l from-cyan-400 to-blue-600 text-white" : "text-slate-400"}`}>فعال‌سازی سازمان</button>
          </div>

          {mode === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-4" autoComplete="on">
              <div>
                <label className="field-label">ایمیل سازمانی</label>
                <input className="field-input" type="email" inputMode="email" autoComplete="username" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="field-label">رمز عبور</label>
                <div className="flex items-center gap-2">
                  <input className="field-input flex-1" type={showPassword ? "text" : "password"} autoComplete="current-password" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"} title={showPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"} className="shrink-0 grid h-11 w-11 place-items-center rounded-lg border border-cyan-400/20 bg-[#0b2238] text-cyan-200 transition hover:border-cyan-300/50 hover:bg-cyan-400/10 hover:text-white">
                    {showPassword ? <Eye size={19} /> : <EyeOff size={19} />}
                  </button>
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-400 select-none">
                <input type="checkbox" checked={rememberLogin} onChange={(e) => setRememberLogin(e.target.checked)} className="h-4 w-4 accent-cyan-400" />
                اطلاعات ورود من را به خاطر بسپار
              </label>
              {error && <p className="text-status-alert text-sm leading-6">{error}</p>}
              <button className="btn-primary w-full" disabled={loading}>{loading ? "در حال ورود..." : "ورود"}</button>
            </form>
          )}

          {mode === "activate" && (
            <form onSubmit={handleActivate} className="space-y-4">
              <p className="rounded-xl border border-cyan-100 bg-cyan-50 p-3 text-xs leading-6 text-slate-600">برای سازمانی که درخواستش تأیید شده، با ایمیل ثبت‌شده یک رمز تعیین کنید.</p>
              <div><label className="field-label">ایمیل ثبت‌شده سازمان</label><input className="field-input" type="email" inputMode="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              <div><label className="field-label">رمز عبور جدید</label><input className="field-input" type="password" autoComplete="new-password" dir="ltr" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
              {error && <p className="text-status-alert text-sm leading-6">{error}</p>}
              <button className="btn-primary w-full" disabled={loading}>{loading ? "در حال فعال‌سازی..." : "فعال‌سازی حساب پتروشیمی"}</button>
            </form>
          )}

          {mode === "otp" && !otpSent && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div><label className="field-label">شماره موبایل</label><input className="field-input" dir="ltr" placeholder="09xxxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} required /></div>
              {error && <p className="text-status-alert text-sm">{error}</p>}
              <button className="btn-primary w-full" disabled={loading}>{loading ? "در حال ارسال..." : "ارسال کد"}</button>
            </form>
          )}

          {mode === "otp" && otpSent && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div><label className="field-label">کد ارسال‌شده به {phone}</label><input className="field-input" dir="ltr" value={otp} onChange={(e) => setOtp(e.target.value)} required /></div>
              {error && <p className="text-status-alert text-sm">{error}</p>}
              <button className="btn-primary w-full" disabled={loading}>{loading ? "در حال بررسی..." : "تأیید و ورود"}</button>
            </form>
          )}

          <p className="text-slate-500 text-xs mt-6">پتروشیمی هنوز عضو سامانه نیست؟ <a href="/register" className="text-cyan-300">ثبت درخواست عضویت</a></p>
          <p className="text-slate-500 text-xs mt-2">راننده هستید؟ <a href="/register/driver" className="text-cyan-300">ثبت‌نام راننده</a></p>
        </div>
      </div>
    </div>
  );
}
