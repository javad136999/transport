-- =====================================================================
-- سامانه مدیریت و نظارت بر حمل پساب
-- Migration 0001: Core schema
-- Run in Supabase SQL editor, or via `supabase db push`
-- =====================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- ENUM TYPES
-- ---------------------------------------------------------------------
create type user_role as enum (
  'super_admin',
  'petro_manager',
  'petro_env_officer',
  'driver',
  'transport_company',
  'destination_operator',
  'env_observer',
  'gov_environment_observer',
  'pars_zone_observer',
  'patrol_manager',
  'patrol_officer'
);

create type org_type as enum ('operator', 'petrochemical', 'transport_company', 'destination', 'government');
create type org_status as enum ('pending', 'approved', 'rejected', 'suspended');

create type approval_status as enum ('pending', 'approved', 'rejected', 'expired', 'suspended');

create type subscription_status as enum (
  'draft', 'invoice_generated', 'awaiting_payment', 'payment_submitted',
  'under_review', 'approved', 'rejected', 'active', 'expired', 'cancelled'
);

create type payment_method as enum ('online', 'bank_transfer', 'manual');
create type payment_status as enum ('pending', 'under_review', 'approved', 'rejected');

create type mission_status as enum (
  'created', 'assigned', 'driver_accepted', 'arrived_origin',
  'loading_started', 'loading_finished', 'in_transit', 'arrived_destination',
  'unloading_started', 'unloading_finished', 'destination_confirmed', 'completed',
  'cancelled', 'gps_lost', 'incomplete', 'needs_review', 'suspicious'
);

create type alert_type as enum (
  'gps_lost', 'route_deviation', 'unauthorized_area', 'unauthorized_destination',
  'abnormal_stop', 'volume_mismatch', 'missing_loading_photo', 'missing_unloading_photo',
  'delayed_unloading', 'expired_driver_document', 'expired_vehicle_document',
  'incomplete_mission', 'suspicious_mission'
);

create type alert_status as enum ('new', 'in_review', 'reviewed', 'confirmed', 'dismissed');
create type risk_level as enum ('low', 'medium', 'high');

-- ---------------------------------------------------------------------
-- ORGANIZATIONS  (multi-tenant root)
-- ---------------------------------------------------------------------
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  type org_type not null,
  name text not null,
  national_id text,
  registration_no text,
  economic_code text,
  address text,
  phone text,
  email text,
  manager_name text,
  env_officer_name text,
  env_officer_contact text,
  status org_status not null default 'pending',
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ---------------------------------------------------------------------
-- USERS  (profile row linked to auth.users)
-- ---------------------------------------------------------------------
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  national_code text,
  role user_role not null,
  organization_id uuid references organizations(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table organization_users (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role user_role not null,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

-- ---------------------------------------------------------------------
-- DRIVERS
-- ---------------------------------------------------------------------
create table drivers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  transport_company_id uuid references organizations(id),
  first_name text not null,
  last_name text not null,
  mobile text not null,
  national_code text not null,
  license_no text not null,
  license_expiry date,
  status approval_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table driver_documents (
  id uuid primary key default uuid_generate_v4(),
  driver_id uuid not null references drivers(id) on delete cascade,
  doc_type text not null,
  file_path text not null,
  expiry_date date,
  uploaded_at timestamptz not null default now()
);

create table driver_approvals (
  id uuid primary key default uuid_generate_v4(),
  petrochemical_id uuid not null references organizations(id),
  driver_id uuid not null references drivers(id),
  status approval_status not null default 'pending',
  approved_at timestamptz,
  expires_at timestamptz,
  approved_by uuid references users(id),
  notes text,
  created_at timestamptz not null default now(),
  unique (petrochemical_id, driver_id)
);

-- ---------------------------------------------------------------------
-- VEHICLES (tankers)
-- ---------------------------------------------------------------------
create table vehicles (
  id uuid primary key default uuid_generate_v4(),
  plate_raw text not null,
  plate_normalized text not null,
  fleet_no text,
  capacity_liters numeric,
  vehicle_type text,
  owner_name text,
  transport_company_id uuid references organizations(id),
  chassis_no text,
  status approval_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_vehicles_plate_norm on vehicles (plate_normalized);

create table vehicle_documents (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  doc_type text not null,
  file_path text not null,
  expiry_date date,
  uploaded_at timestamptz not null default now()
);

create table vehicle_approvals (
  id uuid primary key default uuid_generate_v4(),
  petrochemical_id uuid not null references organizations(id),
  vehicle_id uuid not null references vehicles(id),
  status approval_status not null default 'pending',
  approved_at timestamptz,
  expires_at timestamptz,
  approved_by uuid references users(id),
  notes text,
  created_at timestamptz not null default now(),
  unique (petrochemical_id, vehicle_id)
);

-- ---------------------------------------------------------------------
-- REFERENCE DATA
-- ---------------------------------------------------------------------
create table waste_types (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table loading_sites (
  id uuid primary key default uuid_generate_v4(),
  petrochemical_id uuid not null references organizations(id),
  name text not null,
  address text,
  latitude double precision not null,
  longitude double precision not null,
  radius_m integer not null default 200,
  status org_status not null default 'approved',
  created_at timestamptz not null default now()
);

create table authorized_destinations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner_organization_id uuid references organizations(id),
  address text,
  latitude double precision not null,
  longitude double precision not null,
  radius_m integer not null default 200,
  accepted_waste_types uuid[] default '{}',
  capacity_liters numeric,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- MISSIONS  (the core operational chain)
-- ---------------------------------------------------------------------
create table missions (
  id uuid primary key default uuid_generate_v4(),
  mission_no text not null unique,
  petrochemical_id uuid not null references organizations(id),
  waste_type_id uuid references waste_types(id),
  estimated_volume numeric,
  loading_site_id uuid references loading_sites(id),
  destination_id uuid references authorized_destinations(id),
  driver_id uuid references drivers(id),
  vehicle_id uuid references vehicles(id),
  transport_company_id uuid references organizations(id),
  status mission_status not null default 'created',
  risk_level risk_level not null default 'low',
  scheduled_date date,
  notes text,
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_missions_petro on missions (petrochemical_id);
create index idx_missions_status on missions (status);
create index idx_missions_vehicle on missions (vehicle_id);

create table mission_assignments (
  id uuid primary key default uuid_generate_v4(),
  mission_id uuid not null references missions(id) on delete cascade,
  status mission_status not null,
  changed_by uuid references users(id),
  changed_at timestamptz not null default now(),
  note text
);

create table loading_records (
  id uuid primary key default uuid_generate_v4(),
  mission_id uuid not null references missions(id) on delete cascade,
  arrived_at timestamptz,
  arrival_distance_m numeric,
  started_at timestamptz,
  finished_at timestamptz,
  volume_loaded numeric,
  recorded_by uuid references users(id)
);

create table unloading_records (
  id uuid primary key default uuid_generate_v4(),
  mission_id uuid not null references missions(id) on delete cascade,
  arrived_at timestamptz,
  arrival_distance_m numeric,
  started_at timestamptz,
  finished_at timestamptz,
  volume_unloaded numeric,
  volume_diff_percent numeric,
  confirmed_by_operator uuid references users(id),
  confirmed_at timestamptz,
  operator_notes text
);

create table gps_tracks (
  id uuid primary key default uuid_generate_v4(),
  mission_id uuid not null references missions(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  gps_lost_count integer not null default 0
);

create table gps_points (
  id bigint generated always as identity primary key,
  mission_id uuid not null references missions(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  recorded_at timestamptz not null,
  accuracy_m numeric,
  speed_kmh numeric
);
create index idx_gps_points_mission_time on gps_points (mission_id, recorded_at desc);

create table photos (
  id uuid primary key default uuid_generate_v4(),
  mission_id uuid references missions(id) on delete cascade,
  category text not null, -- loading | unloading | inspection
  file_path text not null,
  latitude double precision,
  longitude double precision,
  taken_at timestamptz not null default now(),
  uploaded_by uuid references users(id)
);

-- ---------------------------------------------------------------------
-- ALERTS / RISK
-- ---------------------------------------------------------------------
create table alerts (
  id uuid primary key default uuid_generate_v4(),
  mission_id uuid references missions(id) on delete cascade,
  type alert_type not null,
  status alert_status not null default 'new',
  severity risk_level not null default 'medium',
  description text,
  reviewed_by uuid references users(id),
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now()
);
create index idx_alerts_mission on alerts (mission_id);
create index idx_alerts_status on alerts (status);

create table violations (
  id uuid primary key default uuid_generate_v4(),
  mission_id uuid references missions(id),
  alert_id uuid references alerts(id),
  reported_by uuid references users(id),
  description text,
  status text not null default 'reported',
  created_at timestamptz not null default now()
);

create table risk_scores (
  id uuid primary key default uuid_generate_v4(),
  mission_id uuid not null references missions(id) on delete cascade,
  score integer not null default 0,
  level risk_level not null default 'low',
  factors jsonb not null default '[]',
  computed_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- BILLING: subscriptions / invoices / payments
-- ---------------------------------------------------------------------
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  petrochemical_id uuid not null references organizations(id),
  start_date date,
  end_date date,
  base_amount numeric not null default 0,
  discount_amount numeric not null default 0,
  tax_amount numeric not null default 0,
  final_amount numeric not null default 0,
  status subscription_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table invoices (
  id uuid primary key default uuid_generate_v4(),
  invoice_no text not null unique,
  subscription_id uuid not null references subscriptions(id) on delete cascade,
  petrochemical_id uuid not null references organizations(id),
  issue_date date not null default current_date,
  valid_until date,
  base_amount numeric not null,
  discount_amount numeric not null default 0,
  tax_amount numeric not null default 0,
  final_amount numeric not null,
  is_official_invoice boolean not null default false,
  created_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  method payment_method not null,
  amount numeric not null,
  receipt_file_path text,
  tracking_no text,
  status payment_status not null default 'pending',
  reviewed_by uuid references users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- TRANSPORT COMPANIES (view over organizations of type transport_company)
-- ---------------------------------------------------------------------
-- transport companies reuse `organizations` (type = 'transport_company')

-- ---------------------------------------------------------------------
-- NOTIFICATIONS / AUDIT
-- ---------------------------------------------------------------------
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table audit_logs (
  id bigint generated always as identity primary key,
  user_id uuid references users(id),
  organization_id uuid references organizations(id),
  operation text not null,
  resource_type text,
  resource_id text,
  old_value jsonb,
  new_value jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);
create index idx_audit_created on audit_logs (created_at desc);

-- ---------------------------------------------------------------------
-- PATROL / INSPECTION (Pars Special Zone)
-- ---------------------------------------------------------------------
create table patrol_users (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id),
  badge_no text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table inspection_reports (
  id uuid primary key default uuid_generate_v4(),
  report_no text not null unique,
  patrol_user_id uuid not null references patrol_users(id),
  plate_normalized text not null,
  vehicle_id uuid references vehicles(id),
  mission_id uuid references missions(id),
  query_result text not null, -- authorized | needs_review | unauthorized | not_registered
  location text,
  latitude double precision,
  longitude double precision,
  observed_status text,
  discrepancy_type text,
  notes text,
  created_at timestamptz not null default now()
);

create table inspection_photos (
  id uuid primary key default uuid_generate_v4(),
  inspection_report_id uuid not null references inspection_reports(id) on delete cascade,
  file_path text not null,
  taken_at timestamptz not null default now()
);

create table patrol_logs (
  id uuid primary key default uuid_generate_v4(),
  patrol_user_id uuid not null references patrol_users(id),
  plate_queried text not null,
  plate_normalized text not null,
  result text not null,
  queried_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- OBSERVER ACCESS (read-only government accounts scoping)
-- ---------------------------------------------------------------------
create table observer_access (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  organization_id uuid references organizations(id), -- null = whole region
  granted_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare t text;
begin
  for t in select unnest(array[
    'organizations','users','drivers','vehicles','missions','subscriptions'
  ]) loop
    execute format('create trigger trg_set_updated_at before update on %I for each row execute function set_updated_at();', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- Plate normalization helper (Persian/English digits -> canonical ascii)
-- ---------------------------------------------------------------------
create or replace function normalize_plate(input text) returns text as $$
declare
  result text := input;
begin
  result := translate(result, '۰۱۲۳۴۵۶۷۸۹', '0123456789');
  result := translate(result, '٠١٢٣٤٥٦٧٨٩', '0123456789');
  result := regexp_replace(result, '[\s\-_]', '', 'g');
  result := lower(result);
  return result;
end;
$$ language plpgsql immutable;
