"use client";

import Link from "next/link";
import { useState } from "react";
import { Droplets, Search, ShieldCheck, Truck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { normalizePlate } from "@/lib/utils";

type QueryResult = {
  status: "authorized" | "needs_review" | "unauthorized" | "not_registered";
  vehicle?: any;
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
    if (vehicle?.status === "approved") {
      const { data: approval } = await supabase
        .from("vehicle_approvals")
        .select("id")
        .eq("vehicle_id", vehicle.id)
        .eq("status", "approved")
        .limit(1)
        .maybeSingle();
      status = approval ? "authorized" : "needs_review";
    } else if (vehicle?.status === "pending") {
      status = "needs_review";
    } else if (vehicle) {
      status = "unauthorized";
    }

    setResult({ status, vehicle });
    setLoading(false);
  }

  return (
    <main className="min-h-[100dvh] bg-base px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-aqua-eco text-white shadow-glow-cyan">
              <Droplets size={22} />
            </div>
            <div>
              <div className="font-extrabold text-white">سامانه مدیریت حمل فاضلاب</div>
              <div className="mt-1 text-xs text-ink-faint">رصد و مدیریت حمل فاضلاب بهداشتی عسلویه</div>
            </div>
          </div>
          <Link href="/login" className="btn-secondary text-sm">ورود به سامانه</Link>
        </header>

        <section className="mb-6 overflow-hidden rounded-3xl border border-cyan-300/15 bg-gradient-to-br from-[#06252d] via-[#071a20] to-[#061116] p-6 shadow-[0_0_50px_rgba(0,194,209,.08)] md:p-10">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-3 py-1.5 text-xs text-brand-light">
              <ShieldCheck size={14} /> سامانه هوشمند و قابل ردیابی
            </div>
            <h1 className="text-2xl font-extrabold leading-10 text-white md:text-4xl">مدیریت هوشمند حمل فاضلاب بهداشتی</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-muted md:text-base">
              مدیریت یکپارچه درخواست حمل، راننده، تانکر، مأموریت، مسیر، بارگیری و تخلیه در زنجیره عملیات فاضلاب بهداشتی عسلویه.
            </p>
          </div>
        </section>

        <section className="panel mx-auto max-w-3xl p-5 md:p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand-light">
              <Search size={19} />
            </div>
            <div>
              <h2 className="font-bold text-white">استعلام تانکر</h2>
              <p className="mt-1 text-xs text-ink-faint">برای بررسی وضعیت یک تانکر، شماره پلاک را وارد کنید.</p>
            </div>
          </div>

          <form onSubmit={handleInquiry} className="flex flex-col gap-3 sm:flex-row">
            <input
              className="field-input min-w-0 flex-1 text-center text-lg font-mono tracking-widest"
              dir="ltr"
              placeholder="12الف345"
              value={plateInput}
              onChange={(e) => setPlateInput(e.target.value)}
              required
            />
            <button className="btn-driver bg-brand sm:w-36" disabled={loading}>
              {loading ? "در حال بررسی..." : "استعلام"}
            </button>
          </form>

          {result && (
            <div className="mt-4 rounded-2xl border border-base-border bg-base-panel2/50 p-4">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${result.status === "authorized" ? "bg-status-ok" : result.status === "needs_review" ? "bg-status-warn" : result.status === "unauthorized" ? "bg-status-alert" : "bg-ink-faint"}`} />
                <span className={`text-sm font-bold ${STATUS_META[result.status].text}`}>{STATUS_META[result.status].label}</span>
              </div>
              {result.vehicle && (
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                  <Info label="پلاک" value={result.vehicle.plate_normalized} mono />
                  <Info label="ناوگان" value={result.vehicle.fleet_no ?? "—"} />
                  <Info label="ظرفیت" value={result.vehicle.capacity_liters ? `${result.vehicle.capacity_liters} لیتر` : "—"} />
                  <Info label="نوع تانکر" value={result.vehicle.vehicle_type ?? "—"} />
                </div>
              )}
            </div>
          )}
        </section>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Feature icon={<Truck size={18} />} title="مدیریت ناوگان" text="کنترل رانندگان و تانکرهای تأییدشده" />
          <Feature icon={<ShieldCheck size={18} />} title="کنترل و نظارت" text="ثبت و پیگیری عملیات به‌صورت قابل ردیابی" />
          <Feature icon={<Droplets size={18} />} title="زنجیره تخلیه" text="مدیریت بارگیری، حمل و تخلیه فاضلاب" />
        </div>
      </div>
    </main>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return <div><div className="text-xs text-ink-faint">{label}</div><div className={`mt-1 font-semibold text-white ${mono ? "font-mono" : ""}`}>{value}</div></div>;
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="panel p-4"><div className="mb-2 flex items-center gap-2 text-brand-light">{icon}<span className="font-semibold text-white">{title}</span></div><p className="text-xs leading-6 text-ink-faint">{text}</p></div>;
}
