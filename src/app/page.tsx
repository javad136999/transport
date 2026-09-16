"use client";

import Link from "next/link";
import { useState } from "react";
import { Activity, CheckCircle2, Droplets, Search, ShieldCheck, Truck, Wifi } from "lucide-react";
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
  not_registered: { label: "در سامانه ثبت نشده", text: "text-ink-faint" },
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
    <main className="min-h-[100dvh] bg-[#effcff] text-slate-800">
      <section className="relative isolate min-h-[680px] overflow-hidden border-b border-cyan-200/70">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{ backgroundImage: "url('https://www.sezako.cz/uploads/servicecategory/5/pic/odpady-zumpy-2.png')" }}
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(239,252,255,.97)_0%,rgba(239,252,255,.88)_38%,rgba(224,250,255,.48)_72%,rgba(224,250,255,.20)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(239,252,255,.84)_0%,rgba(231,250,255,.28)_55%,#effcff_100%)]" />

        <div className="mx-auto flex max-w-7xl flex-col px-4 py-5 md:px-8 md:py-7">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/80 bg-white/75 text-cyan-600 shadow-[0_0_35px_rgba(0,191,255,.25)] backdrop-blur-md">
                <Droplets size={24} />
              </div>
              <div>
                <div className="font-black tracking-tight text-slate-800 md:text-lg">سامانه مدیریت حمل فاضلاب</div>
                <div className="mt-1 text-[10px] font-medium text-cyan-700 md:text-xs">رصد هوشمند حمل فاضلاب بهداشتی عسلویه</div>
              </div>
            </div>
            <Link href="/login" className="rounded-xl border border-cyan-300/80 bg-white/85 px-4 py-2.5 text-xs font-bold text-cyan-800 shadow-[0_8px_25px_rgba(0,150,200,.12)] backdrop-blur-md transition hover:border-cyan-500 hover:bg-white">
              ورود به سامانه
            </Link>
          </header>

          <div className="mt-24 max-w-3xl md:mt-28">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300 bg-white/70 px-3 py-1.5 text-xs font-semibold text-cyan-800 shadow-sm backdrop-blur-md">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-500 shadow-[0_0_12px_#00BFFF]" />
              سامانه رصد و کنترل عملیات
            </div>
            <h1 className="text-4xl font-black leading-[1.25] tracking-tight text-slate-900 drop-shadow-sm md:text-6xl">
              حمل فاضلاب،<br />
              <span className="text-cyan-600">قابل رصد و قابل اعتماد</span>
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-8 text-slate-700 md:text-base">
              مدیریت یکپارچه تانکرها، رانندگان و مأموریت‌ها؛ از ثبت و تخصیص مأموریت تا کنترل مسیر و تخلیه در زنجیره حمل فاضلاب بهداشتی.
            </p>

            <div className="mt-7 flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-2 rounded-xl border border-cyan-200 bg-white/75 px-4 py-3 text-slate-700 shadow-sm backdrop-blur-md"><Wifi size={15} className="text-cyan-600" /> رصد عملیاتی</div>
              <div className="flex items-center gap-2 rounded-xl border border-cyan-200 bg-white/75 px-4 py-3 text-slate-700 shadow-sm backdrop-blur-md"><ShieldCheck size={15} className="text-cyan-600" /> کنترل مجوزها</div>
              <div className="flex items-center gap-2 rounded-xl border border-cyan-200 bg-white/75 px-4 py-3 text-slate-700 shadow-sm backdrop-blur-md"><Activity size={15} className="text-cyan-600" /> رهگیری مأموریت</div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-[#effcff] to-transparent" />
      </section>

      <section className="relative z-10 mx-auto -mt-12 max-w-5xl px-4 md:-mt-16 md:px-8">
        <div className="overflow-hidden rounded-3xl border border-cyan-200 bg-white/90 p-5 shadow-[0_20px_80px_rgba(0,150,190,.16),0_0_45px_rgba(0,191,255,.10)] backdrop-blur-2xl md:p-7">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-50 text-cyan-600"><Search size={20} /></div>
              <div>
                <h2 className="font-extrabold text-slate-800 md:text-lg">استعلام پلاک تانکر</h2>
                <p className="mt-1 text-[11px] text-slate-500">بررسی ثبت تانکر و وضعیت مأموریت جاری</p>
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-[10px] text-cyan-700 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" /> استعلام عمومی
            </div>
          </div>

          <form onSubmit={handleInquiry} className="flex flex-col gap-3 sm:flex-row">
            <input
              className="min-w-0 flex-1 rounded-2xl border border-cyan-200 bg-cyan-50/50 px-4 py-4 text-center text-lg font-bold tracking-[.25em] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/30"
              dir="ltr"
              placeholder="12الف345"
              value={plateInput}
              onChange={(e) => setPlateInput(e.target.value)}
              required
            />
            <button className="rounded-2xl bg-gradient-to-l from-cyan-500 to-blue-600 px-8 py-4 text-sm font-extrabold text-white shadow-[0_0_28px_rgba(0,153,255,.25)] transition hover:brightness-110 disabled:opacity-60 sm:min-w-40" disabled={loading}>
              {loading ? "در حال بررسی..." : "استعلام پلاک"}
            </button>
          </form>

          {result && (
            <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${result.status === "authorized" ? "bg-status-ok" : result.status === "needs_review" ? "bg-status-warn" : result.status === "unauthorized" ? "bg-status-alert" : "bg-slate-400"}`} />
                  <span className={`text-sm font-bold ${STATUS_META[result.status].text}`}>{STATUS_META[result.status].label}</span>
                </div>
                {result.vehicle && <span className="font-mono text-sm text-slate-700">{result.vehicle.plate_normalized}</span>}
              </div>

              {result.vehicle && (
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                  <Info label="ناوگان" value={result.vehicle.fleet_no ?? "—"} />
                  <Info label="ظرفیت" value={result.vehicle.capacity_liters ? `${result.vehicle.capacity_liters} لیتر` : "—"} />
                  <Info label="نوع تانکر" value={result.vehicle.vehicle_type ?? "—"} />
                  <Info label="وضعیت مأموریت" value={result.mission ? "در حال مأموریت" : "آزاد"} />
                </div>
              )}

              {result.mission && (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-cyan-200 bg-white/70 px-3 py-2.5 text-xs">
                  <CheckCircle2 size={15} className="text-cyan-600" />
                  <span className="text-slate-600">مأموریت جاری:</span>
                  <strong className="text-slate-800">{result.mission.mission_no ?? "ثبت‌شده"}</strong>
                  <span className="text-cyan-700">{String(result.mission.status ?? "").replaceAll("_", " ")}</span>
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

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-cyan-100 bg-white p-3 shadow-sm"><div className="text-[10px] text-slate-500">{label}</div><div className="mt-1 font-semibold text-slate-800">{value}</div></div>;
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="group rounded-2xl border border-cyan-100 bg-white p-5 shadow-[0_12px_35px_rgba(0,150,190,.08)] transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-[0_15px_40px_rgba(0,150,190,.14)]"><div className="mb-3 flex items-center gap-2 text-cyan-600">{icon}<span className="font-bold text-slate-800">{title}</span></div><p className="text-xs leading-7 text-slate-500">{text}</p></div>;
}
