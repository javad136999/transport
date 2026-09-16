import { toPersianDigits } from "@/lib/utils";

export function StatCard({
  label,
  value,
  unit,
  tone = "default",
}: {
  label: string;
  value: number | string;
  unit?: string;
  tone?: "default" | "ok" | "warn" | "alert" | "progress";
}) {
  const toneClass = {
    default: "text-ink",
    ok: "text-status-ok",
    warn: "text-status-warn",
    alert: "text-status-alert",
    progress: "text-status-progress",
  }[tone];

  return (
    <div className="panel p-4">
      <p className="text-ink-muted text-xs mb-2">{label}</p>
      <p className={`kpi-value ${toneClass}`}>
        {typeof value === "number" ? toPersianDigits(value) : value}
        {unit && <span className="text-xs text-ink-muted mr-1 font-vazir">{unit}</span>}
      </p>
    </div>
  );
}
