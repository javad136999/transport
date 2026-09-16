"use client";

import Link from "next/link";
import { useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, Droplets, Search, ShieldCheck, Truck, Wifi } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { normalizePlate } from "@/lib/utils";

type QueryResult = {
  status: "authorized" | "needs_review" | "unauthorized" | "not_registered";
  vehicle?: any;
  mission?: any;
};

const STATUS_META: Record<QueryResult["status"], { label: string; text: string }> = {
  authorized: { label: "مجاز و تأییدشده", text: "text-status-ok" },
  needs_review: { label: "نیازمند بررسی", text: "text-status-warn" },
  unauthorized: { label: "غیرفعال / غیرمجاز", text: "text-status-alert" },
  not_registered: { label: "در سامانه ثبت نشده", text: "text-status-alert" },
};

export default function HomePage() {
  const supabase = createClient();
  const [plateInput, setPlateInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);

  async function handleInquiry(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const normalized = normalizePlate(plateInput);
    const { data: vehicle } = await supabase
      .from("vehicles")
      .select("id, plate_normalized, fleet_no, capacity_liters, vehicle_type, status")
      .eq("plate_normalized", normalized)
      .maybeSingle();

    let status: QueryResult["status"] = "not_registered";
    let mission: any = null;

    if (vehicle?.status === "approved") {
      const { data: approval } = await supabase
        .from("vehicle_approvals")
        .select("id")
        .eq("vehicle_id", vehicle.id)
        .eq("status", "approved")
        .limit(1)
        .maybeSingle();
      status = approval ? "authorized" : "needs_review";

      if (approval) {
        const { data: activeMission } = await supabase
          .from("missions")
          .select("id, mission_no, status, scheduled_date")
          .eq("vehicle_id", vehicle.id)
          .in("status", ["assigned", "in_progress", "loading", "unloading"])
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        mission = activeMission;
      }
    } else if (vehicle?.status === "pending") {
      status = "needs_review";
    } else if (vehicle) {
      status = "unauthorized";
    }

    setResult({ status, vehicle, mission });
    setLoading(false);
  }

  return (
    <main className="min-h-[100dvh] bg-[#020b18] text-slate-100">
      <section className="relative isolate min-h-[680px] overflow-hidden border-b border-cyan-400/20">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{ backgroundImage: "url('https://www.sezako.cz/uploads/servicecategory/5/pic/odpady-zumpy-2.png')" }}
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(2,11,24,.96)_0%,rgba(2,18,34,.86)_36%,rgba(0,70,105,.58)_68%,rgba(0,16,30,.72)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(2,11,24,.74)_0%,rgba(2,22,38,.28)_48%,#020b18_100%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-40 grid-backdrop" />

        <div className="mx-auto flex max-w-7xl flex-col px-4 py-5 md:px-8 md:py-7">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/60 bg-[#031a2c]/80 text-cyan-200 shadow-[0_0_35px_rgba(0,191,255,.35)] backdrop-blur-md">
                <Droplets size={24} />
              </div>
              <div>
                <div className="font-black tracking-tight text-white md:text-lg">سامانه مدیریت حمل فاضلاب</div>
                <div className="mt-1 text-[10px] font-semibold text-cyan-200 md:text-xs">رصد هوشمند حمل فاضلاب بهداشتی عسلویه</div>
              </div>
            </div>
            <Link href="/login" className="rounded-xl border border-cyan-300/45 bg-[#061b2f]/85 px-4 py-2.5 text-xs font-bold text-white shadow-[0_8px_25px_rgba(0,150,200,.2)] backdrop-blur-md transition hover:border-cyan-300 hover:bg-cyan-400/10 hover:shadow-glow-cyan">
              ورود به سامانه
            </Link>
          </header>

          <div className="mt-24 max-w-3xl md:mt-28">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-[#061b2f]/75 px-3 py-1.5 text-xs font-bold text-cyan-50 shadow-sm backdrop-blur-md">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_12px_#00BFFF]" />
              سامانه رصد و کنترل عملیات
            </div>
            <h1 className="text-4xl font-black leading-[1.25] tracking-tight text-white drop-shadow-sm md:text-6xl">
              حمل فاضلاب،<br />
              <span className="text-cyan-300 [text-shadow:0_0_22px_rgba(0,191,255,.35)]">قابل رصد و قابل اعتماد</span>
            </h1>
            <p className="mt-6 max-w-2xl text-sm font-medium leading-8 text-slate-200 md:text-base">
              مدیریت یکپارچه تانکرها، رانندگان و مأموریت‌ها؛ از ثبت و تخصیص مأموریت تا کنترل مسیر و تخلیه در زنجیره حمل فاضلاب بهداشتی.
            </p>

            <div className="mt-7 flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-[#061b2f]/75 px-4 py-3 font-semibold text-slate-100 shadow-sm backdrop-blur-md"><Wifi size={15} className="text-cyan-300" /> رصد عملیاتی</div>
              <div className="flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-[#061b2f]/75 px-4 py-3 font-semibold text-slate-100 shadow-sm backdrop-blur-md"><ShieldCheck size={15} className="text-cyan-300" /> کنترل مجوزها</div>
              <div className="flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-[#061b2f]/75 px-4 py-3 font-semibold text-slate-100 shadow-sm backdrop-blur-md"><Activity size={15} className="text-cyan-300" /> رهگیری مأموریت</div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-[#020b18] to-transparent" />
      </section>

      <section className="relative z-10 mx-auto -mt-12 max-w-5xl px-4 md:-mt-16 md:px-8">
        <div className="overflow-hidden rounded-3xl border border-cyan-300/25 bg-[#071a2e]/95 p-5 shadow-[0_20px_80px_rgba(0,0,0,.5),0_0_45px_rgba(0,191,255,.12)] backdrop-blur-2xl md:p-7">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-300"><Search size={20} /></div>
              <div>
                <h2 className="font-extrabold text-white md:text-lg">استعلام پلاک تانکر</h2>
                <p className="mt-1 text-[11px] font-medium text-slate-400">بررسی ثبت تانکر و وضعیت مأموریت جاری</p>
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/5 px-3 py-1.5 text-[10px] font-bold text-cyan-200 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" /> استعلام عمومی
            </div>
          </div>

          <form onSubmit={handleInquiry} className="flex flex-col gap-3 sm:flex-row">
            <input
              className="min-w-0 flex-1 rounded-2xl border border-cyan-300/20 bg-[#041526] px-4 py-4 text-center text-lg font-bold tracking-[.25em] text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
              dir="ltr"
              placeholder="12الف345"
              value={plateInput}
              onChange={(e) => setPlateInput(e.target.value)}
              required
            />
            <button className="rounded-2xl bg-gradient-to-l from-cyan-400 to-blue-600 px-8 py-4 text-sm font-extrabold text-white shadow-[0_0_28px_rgba(0,153,255,.3)] transition hover:brightness-110 disabled:opacity-60 sm:min-w-40" disabled={loading}>
              {loading ? "در حال بررسی..." : "استعلام پلاک"}
            </button>
          </form>

          {result && (
            <div className={`mt-5 rounded-2xl border p-4 ${result.status === "unauthorized" || result.status === "not_registered" ? "border-red-400/35 bg-red-500/10" : "border-cyan-300/15 bg-cyan-400/5"}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {(result.status === "unauthorized" || result.status === "not_registered") && <AlertTriangle size={17} className="text-status-alert" />}
                  <span className={`h-2.5 w-2.5 rounded-full ${result.status === "authorized" ? "bg-status-ok" : result.status === "needs_review" ? "bg-status-warn" : "bg-status-alert"}`} />
                  <span className={`text-sm font-bold ${STATUS_META[result.status].text}`}>{STATUS_META[result.status].label}</span>
                </div>
                {result.vehicle && <span className="font-mono text-sm font-bold text-slate-100">{result.vehicle.plate_normalized}</span>}
              </div>

              {result.vehicle && (
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                  <Info label="ناوگان" value={result.vehicle.fleet_no ?? "—"} />
                  <Info label="ظرفیت" value={result.vehicle.capacity_liters ? `${result.vehicle.capacity_liters} لیتر` : "—"} />
                  <Info label="نوع تانکر" value={result.vehicle.vehicle_type ?? "—"} />
                  <Info label="وضعیت مأموریت" value={result.mission ? "در حال مأموریت" : "آزاد"} critical={!!result.mission} />
                </div>
              )}

              {result.mission && (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-xs">
                  <AlertTriangle size={15} className="text-status-alert" />
                  <span className="font-semibold text-red-300">مأموریت فعال:</span>
                  <strong className="text-white">{result.mission.mission_no ?? "ثبت‌شده"}</strong>
                  <span className="font-bold text-red-300">{String(result.mission.status ?? "").replaceAll("_", " ")}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
        <div className="grid gap-4 md:grid-cols-3">
          <Feature icon={<Truck size={19} />} title="مدیریت ناوگان" text="ثبت و کنترل تانکرها، ظرفیت، مجوزها و وضعیت ناوگان در یک سامانه یکپارچه." />
          <Feature icon={<Activity size={19} />} title="رصد مأموریت" text="تخصیص مأموریت و مشاهده وضعیت عملیات حمل از شروع تا تخلیه." />
          <Feature icon={<ShieldCheck size={19} />} title="کنترل و نظارت" text="ثبت سوابق، کنترل دسترسی و ایجاد زنجیره قابل پیگیری برای عملیات." />
        </div>
      </section>
    </main>
  );
}

function Info({ label, value, critical = false }: { label: string; value: string; critical?: boolean }) {
  return <div className={`rounded-xl border p-3 shadow-sm ${critical ? "border-red-400/30 bg-red-500/10" : "border-cyan-300/15 bg-[#0a2137]"}`}><div className="text-[10px] font-medium text-slate-400">{label}</div><div className={`mt-1 font-bold ${critical ? "text-red-300" : "text-white"}`}>{value}</div></div>;
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="group rounded-2xl border border-cyan-300/15 bg-[#071a2e]/90 p-5 shadow-[0_12px_35px_rgba(0,0,0,.3)] transition hover:-translate-y-0.5 hover:border-cyan-300/35 hover:shadow-[0_15px_40px_rgba(0,150,255,.12)]"><div className="mb-3 flex items-center gap-2 text-cyan-300">{icon}<span className="font-bold text-white">{title}</span></div><p className="text-xs font-medium leading-7 text-slate-400">{text}</p></div>;
}
