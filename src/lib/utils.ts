import type { MissionStatus, RiskLevel, ApprovalStatus } from "@/types/database";

/** Normalizes a Persian/English/Arabic-digit plate string into a
 * canonical lowercase ASCII form for consistent search/comparison. */
export function normalizePlate(input: string): string {
  const faDigits = "۰۱۲۳۴۵۶۷۸۹";
  const arDigits = "٠١٢٣٤٥٦٧٨٩";
  let out = input.trim();
  out = out
    .split("")
    .map((ch) => {
      const faIdx = faDigits.indexOf(ch);
      if (faIdx > -1) return String(faIdx);
      const arIdx = arDigits.indexOf(ch);
      if (arIdx > -1) return String(arIdx);
      return ch;
    })
    .join("");
  out = out.replace(/[\s\-_]/g, "");
  return out.toLowerCase();
}

export const MISSION_STATUS_LABEL: Record<MissionStatus, string> = {
  created: "ایجاد شد",
  assigned: "تخصیص داده شد",
  driver_accepted: "راننده پذیرفت",
  arrived_origin: "رسید به مبدأ",
  loading_started: "بارگیری شروع شد",
  loading_finished: "بارگیری پایان یافت",
  in_transit: "در مسیر",
  arrived_destination: "رسید به مقصد",
  unloading_started: "تخلیه شروع شد",
  unloading_finished: "تخلیه پایان یافت",
  destination_confirmed: "مقصد تأیید کرد",
  completed: "تکمیل شد",
  cancelled: "لغو شد",
  gps_lost: "GPS قطع شد",
  incomplete: "ناقص",
  needs_review: "نیازمند بررسی",
  suspicious: "مشکوک",
};

/** semantic color classes matching §70 of the brief:
 * green=مجاز/تکمیل, yellow=نیازمند بررسی, red=هشدار/غیرفعال,
 * blue=در حال انجام, gray=بدون وضعیت */
export function missionStatusColor(status: MissionStatus): string {
  if (status === "completed" || status === "destination_confirmed") return "text-status-ok bg-status-ok/10";
  if (["needs_review", "suspicious"].includes(status)) return "text-status-warn bg-status-warn/10";
  if (["cancelled", "gps_lost", "incomplete"].includes(status)) return "text-status-alert bg-status-alert/10";
  if (status === "created") return "text-ink-muted bg-base-panel2";
  return "text-status-progress bg-status-progress/10"; // in-progress states
}

export function riskColor(risk: RiskLevel): string {
  if (risk === "high") return "text-status-alert bg-status-alert/10";
  if (risk === "medium") return "text-status-warn bg-status-warn/10";
  return "text-status-ok bg-status-ok/10";
}

export function approvalColor(status: ApprovalStatus): string {
  if (status === "approved") return "text-status-ok bg-status-ok/10";
  if (status === "pending") return "text-status-warn bg-status-warn/10";
  return "text-status-alert bg-status-alert/10";
}

export function toPersianDigits(input: string | number): string {
  const faDigits = "۰۱۲۳۴۵۶۷۸۹";
  return String(input).replace(/[0-9]/g, (d) => faDigits[Number(d)]);
}

export function formatVolume(liters: number | null | undefined): string {
  if (liters == null) return "—";
  return `${toPersianDigits(liters.toLocaleString("en-US"))} لیتر`;
}
