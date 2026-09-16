// این فایل به‌صورت دستی نوشته شده تا توسعه اولیه سریع‌تر شود.
// پس از اجرای migration ها، برای Type-Safety کامل دستور زیر را اجرا کنید:
//
//   npx supabase gen types typescript --project-id <PROJECT_ID> > src/types/database.ts
//
// و این فایل را جایگزین کنید.

export type UserRole =
  | "super_admin"
  | "petro_manager"
  | "petro_env_officer"
  | "driver"
  | "transport_company"
  | "destination_operator"
  | "env_observer"
  | "gov_environment_observer"
  | "pars_zone_observer"
  | "patrol_manager"
  | "patrol_officer";

export type MissionStatus =
  | "created"
  | "assigned"
  | "driver_accepted"
  | "arrived_origin"
  | "loading_started"
  | "loading_finished"
  | "in_transit"
  | "arrived_destination"
  | "unloading_started"
  | "unloading_finished"
  | "destination_confirmed"
  | "completed"
  | "cancelled"
  | "gps_lost"
  | "incomplete"
  | "needs_review"
  | "suspicious";

export type RiskLevel = "low" | "medium" | "high";
export type ApprovalStatus = "pending" | "approved" | "rejected" | "expired" | "suspended";

export interface Mission {
  id: string;
  mission_no: string;
  petrochemical_id: string;
  waste_type_id: string | null;
  estimated_volume: number | null;
  loading_site_id: string | null;
  destination_id: string | null;
  driver_id: string | null;
  vehicle_id: string | null;
  transport_company_id: string | null;
  status: MissionStatus;
  risk_level: RiskLevel;
  scheduled_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface Driver {
  id: string;
  first_name: string;
  last_name: string;
  mobile: string;
  national_code: string;
  license_no: string;
  license_expiry: string | null;
  status: ApprovalStatus;
}

export interface Vehicle {
  id: string;
  plate_raw: string;
  plate_normalized: string;
  fleet_no: string | null;
  capacity_liters: number | null;
  vehicle_type: string | null;
  status: ApprovalStatus;
}

export interface Organization {
  id: string;
  type: "operator" | "petrochemical" | "transport_company" | "destination" | "government";
  name: string;
  status: "pending" | "approved" | "rejected" | "suspended";
}

// Placeholder `Database` generic used by @supabase/ssr typed clients.
// Replace with the generated type for full column-level safety.
export type Database = any;
