-- =====================================================================
-- Migration 0002: Row Level Security
-- Every tenant-scoped table is locked down here. Super admin bypasses
-- via the `is_super_admin()` check. Petrochemical users only see rows
-- tied to their own organization_id. Observers get read-only access.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER so they can read `users` regardless
-- of the calling row's RLS state)
-- ---------------------------------------------------------------------
create or replace function current_user_role() returns user_role as $$
  select role from users where id = auth.uid();
$$ language sql stable security definer;

create or replace function current_org_id() returns uuid as $$
  select organization_id from users where id = auth.uid();
$$ language sql stable security definer;

create or replace function is_super_admin() returns boolean as $$
  select current_user_role() = 'super_admin';
$$ language sql stable security definer;

create or replace function is_observer() returns boolean as $$
  select current_user_role() in (
    'env_observer','gov_environment_observer','pars_zone_observer','patrol_manager','patrol_officer'
  );
$$ language sql stable security definer;

create or replace function is_patrol() returns boolean as $$
  select current_user_role() in ('patrol_manager','patrol_officer');
$$ language sql stable security definer;

-- ---------------------------------------------------------------------
-- Enable RLS everywhere
-- ---------------------------------------------------------------------
alter table organizations enable row level security;
alter table users enable row level security;
alter table organization_users enable row level security;
alter table drivers enable row level security;
alter table driver_documents enable row level security;
alter table driver_approvals enable row level security;
alter table vehicles enable row level security;
alter table vehicle_documents enable row level security;
alter table vehicle_approvals enable row level security;
alter table waste_types enable row level security;
alter table loading_sites enable row level security;
alter table authorized_destinations enable row level security;
alter table missions enable row level security;
alter table mission_assignments enable row level security;
alter table loading_records enable row level security;
alter table unloading_records enable row level security;
alter table gps_tracks enable row level security;
alter table gps_points enable row level security;
alter table photos enable row level security;
alter table alerts enable row level security;
alter table violations enable row level security;
alter table risk_scores enable row level security;
alter table subscriptions enable row level security;
alter table invoices enable row level security;
alter table payments enable row level security;
alter table notifications enable row level security;
alter table audit_logs enable row level security;
alter table patrol_users enable row level security;
alter table inspection_reports enable row level security;
alter table inspection_photos enable row level security;
alter table patrol_logs enable row level security;
alter table observer_access enable row level security;

-- ---------------------------------------------------------------------
-- ORGANIZATIONS
-- ---------------------------------------------------------------------
create policy org_select on organizations for select using (
  is_super_admin() or is_observer() or id = current_org_id()
);
create policy org_insert_public on organizations for insert with check (true); -- self-registration
create policy org_update_admin on organizations for update using (is_super_admin());

-- ---------------------------------------------------------------------
-- USERS
-- ---------------------------------------------------------------------
create policy users_select on users for select using (
  is_super_admin() or id = auth.uid() or organization_id = current_org_id()
);
create policy users_update_self on users for update using (id = auth.uid() or is_super_admin());

create policy org_users_select on organization_users for select using (
  is_super_admin() or organization_id = current_org_id()
);

-- ---------------------------------------------------------------------
-- DRIVERS / VEHICLES (global registry, approvals are tenant-scoped)
-- ---------------------------------------------------------------------
create policy drivers_select on drivers for select using (
  is_super_admin() or is_observer()
  or transport_company_id = current_org_id()
  or user_id = auth.uid()
  or exists (
    select 1 from driver_approvals da
    where da.driver_id = drivers.id and da.petrochemical_id = current_org_id()
  )
);
create policy drivers_insert on drivers for insert with check (
  is_super_admin() or current_user_role() in ('transport_company','driver')
);
create policy drivers_update on drivers for update using (
  is_super_admin() or transport_company_id = current_org_id() or user_id = auth.uid()
);

create policy driver_docs_select on driver_documents for select using (
  is_super_admin() or exists (
    select 1 from drivers d where d.id = driver_documents.driver_id
      and (d.transport_company_id = current_org_id() or d.user_id = auth.uid())
  )
);
create policy driver_docs_write on driver_documents for insert with check (
  is_super_admin() or exists (
    select 1 from drivers d where d.id = driver_documents.driver_id
      and (d.transport_company_id = current_org_id() or d.user_id = auth.uid())
  )
);

create policy driver_approvals_select on driver_approvals for select using (
  is_super_admin() or is_observer() or petrochemical_id = current_org_id()
  or exists (select 1 from drivers d where d.id = driver_approvals.driver_id and d.user_id = auth.uid())
);
create policy driver_approvals_write on driver_approvals for insert with check (
  is_super_admin() or petrochemical_id = current_org_id()
);
create policy driver_approvals_update on driver_approvals for update using (
  is_super_admin() or petrochemical_id = current_org_id()
);

create policy vehicles_select on vehicles for select using (
  is_super_admin() or is_observer() or is_patrol()
  or transport_company_id = current_org_id()
  or exists (
    select 1 from vehicle_approvals va
    where va.vehicle_id = vehicles.id and va.petrochemical_id = current_org_id()
  )
);
create policy vehicles_insert on vehicles for insert with check (
  is_super_admin() or current_user_role() = 'transport_company'
);
create policy vehicles_update on vehicles for update using (
  is_super_admin() or transport_company_id = current_org_id()
);

create policy vehicle_docs_select on vehicle_documents for select using (
  is_super_admin() or exists (
    select 1 from vehicles v where v.id = vehicle_documents.vehicle_id
      and v.transport_company_id = current_org_id()
  )
);

create policy vehicle_approvals_select on vehicle_approvals for select using (
  is_super_admin() or is_observer() or is_patrol() or petrochemical_id = current_org_id()
);
create policy vehicle_approvals_write on vehicle_approvals for insert with check (
  is_super_admin() or petrochemical_id = current_org_id()
);
create policy vehicle_approvals_update on vehicle_approvals for update using (
  is_super_admin() or petrochemical_id = current_org_id()
);

-- ---------------------------------------------------------------------
-- REFERENCE DATA
-- ---------------------------------------------------------------------
create policy waste_types_select on waste_types for select using (true);
create policy waste_types_write on waste_types for all using (is_super_admin());

create policy loading_sites_select on loading_sites for select using (
  is_super_admin() or is_observer() or petrochemical_id = current_org_id()
);
create policy loading_sites_write on loading_sites for all using (
  is_super_admin() or petrochemical_id = current_org_id()
);

create policy destinations_select on authorized_destinations for select using (true);
create policy destinations_write on authorized_destinations for all using (is_super_admin());

-- ---------------------------------------------------------------------
-- MISSIONS  (the heart of tenant isolation)
-- ---------------------------------------------------------------------
create policy missions_select on missions for select using (
  is_super_admin() or is_observer()
  or petrochemical_id = current_org_id()
  or transport_company_id = current_org_id()
  or exists (select 1 from drivers d where d.id = missions.driver_id and d.user_id = auth.uid())
  or exists (
      select 1 from authorized_destinations dest
      where dest.id = missions.destination_id and dest.owner_organization_id = current_org_id()
  )
);
create policy missions_insert on missions for insert with check (
  is_super_admin() or (current_user_role() in ('petro_manager','petro_env_officer') and petrochemical_id = current_org_id())
);
create policy missions_update on missions for update using (
  is_super_admin()
  or petrochemical_id = current_org_id()
  or exists (select 1 from drivers d where d.id = missions.driver_id and d.user_id = auth.uid())
  or exists (
      select 1 from authorized_destinations dest
      where dest.id = missions.destination_id and dest.owner_organization_id = current_org_id()
  )
);

create policy mission_assignments_select on mission_assignments for select using (
  is_super_admin() or is_observer() or exists (
    select 1 from missions m where m.id = mission_assignments.mission_id
    and (m.petrochemical_id = current_org_id() or m.transport_company_id = current_org_id())
  )
);
create policy mission_assignments_insert on mission_assignments for insert with check (auth.uid() is not null);

-- loading/unloading/gps/photos: visible to same audience as the parent mission
create policy loading_records_select on loading_records for select using (
  is_super_admin() or is_observer() or exists (
    select 1 from missions m where m.id = loading_records.mission_id
    and (m.petrochemical_id = current_org_id() or m.transport_company_id = current_org_id()
         or exists (select 1 from drivers d where d.id = m.driver_id and d.user_id = auth.uid()))
  )
);
create policy loading_records_write on loading_records for insert with check (auth.uid() is not null);
create policy loading_records_update on loading_records for update using (auth.uid() is not null);

create policy unloading_records_select on unloading_records for select using (
  is_super_admin() or is_observer() or exists (
    select 1 from missions m where m.id = unloading_records.mission_id
    and (m.petrochemical_id = current_org_id() or m.transport_company_id = current_org_id()
         or exists (select 1 from authorized_destinations dest where dest.id = m.destination_id and dest.owner_organization_id = current_org_id())
         or exists (select 1 from drivers d where d.id = m.driver_id and d.user_id = auth.uid()))
  )
);
create policy unloading_records_write on unloading_records for insert with check (auth.uid() is not null);
create policy unloading_records_update on unloading_records for update using (auth.uid() is not null);

create policy gps_tracks_select on gps_tracks for select using (
  is_super_admin() or is_observer() or exists (
    select 1 from missions m where m.id = gps_tracks.mission_id
    and (m.petrochemical_id = current_org_id() or m.transport_company_id = current_org_id())
  )
);
create policy gps_tracks_write on gps_tracks for insert with check (auth.uid() is not null);

create policy gps_points_select on gps_points for select using (
  is_super_admin() or is_observer() or is_patrol() or exists (
    select 1 from missions m where m.id = gps_points.mission_id
    and (m.petrochemical_id = current_org_id() or m.transport_company_id = current_org_id())
  )
);
create policy gps_points_write on gps_points for insert with check (
  exists (select 1 from missions m join drivers d on d.id = m.driver_id
          where m.id = gps_points.mission_id and d.user_id = auth.uid())
);

create policy photos_select on photos for select using (
  is_super_admin() or is_observer() or exists (
    select 1 from missions m where m.id = photos.mission_id
    and (m.petrochemical_id = current_org_id() or m.transport_company_id = current_org_id())
  )
);
create policy photos_write on photos for insert with check (auth.uid() is not null);

-- ---------------------------------------------------------------------
-- ALERTS / RISK
-- ---------------------------------------------------------------------
create policy alerts_select on alerts for select using (
  is_super_admin() or is_observer() or exists (
    select 1 from missions m where m.id = alerts.mission_id
    and (m.petrochemical_id = current_org_id() or m.transport_company_id = current_org_id())
  )
);
create policy alerts_write on alerts for all using (is_super_admin());

create policy violations_select on violations for select using (is_super_admin() or is_observer());
create policy risk_scores_select on risk_scores for select using (
  is_super_admin() or is_observer() or exists (
    select 1 from missions m where m.id = risk_scores.mission_id and m.petrochemical_id = current_org_id()
  )
);

-- ---------------------------------------------------------------------
-- BILLING
-- ---------------------------------------------------------------------
create policy subscriptions_select on subscriptions for select using (
  is_super_admin() or petrochemical_id = current_org_id()
);
create policy subscriptions_write on subscriptions for all using (is_super_admin());

create policy invoices_select on invoices for select using (
  is_super_admin() or petrochemical_id = current_org_id()
);
create policy invoices_write on invoices for all using (is_super_admin());

create policy payments_select on payments for select using (
  is_super_admin() or exists (
    select 1 from invoices i where i.id = payments.invoice_id and i.petrochemical_id = current_org_id()
  )
);
create policy payments_insert on payments for insert with check (
  exists (select 1 from invoices i where i.id = payments.invoice_id and i.petrochemical_id = current_org_id())
);
create policy payments_update on payments for update using (is_super_admin());

-- ---------------------------------------------------------------------
-- NOTIFICATIONS / AUDIT
-- ---------------------------------------------------------------------
create policy notifications_select on notifications for select using (user_id = auth.uid() or is_super_admin());
create policy notifications_update on notifications for update using (user_id = auth.uid());

create policy audit_select on audit_logs for select using (is_super_admin());
create policy audit_insert on audit_logs for insert with check (auth.uid() is not null);

-- ---------------------------------------------------------------------
-- PATROL
-- ---------------------------------------------------------------------
create policy patrol_users_select on patrol_users for select using (
  is_super_admin() or user_id = auth.uid() or current_user_role() = 'patrol_manager'
);

create policy inspection_reports_select on inspection_reports for select using (
  is_super_admin() or is_observer()
  or exists (select 1 from patrol_users pu where pu.id = inspection_reports.patrol_user_id and pu.user_id = auth.uid())
);
create policy inspection_reports_insert on inspection_reports for insert with check (
  exists (select 1 from patrol_users pu where pu.id = inspection_reports.patrol_user_id and pu.user_id = auth.uid())
);

create policy inspection_photos_select on inspection_photos for select using (
  is_super_admin() or is_observer() or exists (
    select 1 from inspection_reports r join patrol_users pu on pu.id = r.patrol_user_id
    where r.id = inspection_photos.inspection_report_id and pu.user_id = auth.uid()
  )
);
create policy inspection_photos_insert on inspection_photos for insert with check (auth.uid() is not null);

create policy patrol_logs_select on patrol_logs for select using (
  is_super_admin() or current_user_role() = 'patrol_manager'
  or exists (select 1 from patrol_users pu where pu.id = patrol_logs.patrol_user_id and pu.user_id = auth.uid())
);
create policy patrol_logs_insert on patrol_logs for insert with check (
  exists (select 1 from patrol_users pu where pu.id = patrol_logs.patrol_user_id and pu.user_id = auth.uid())
);

-- ---------------------------------------------------------------------
-- OBSERVER ACCESS
-- ---------------------------------------------------------------------
create policy observer_access_select on observer_access for select using (
  is_super_admin() or user_id = auth.uid()
);
create policy observer_access_write on observer_access for all using (is_super_admin());

-- ---------------------------------------------------------------------
-- Storage bucket policies are configured separately in Supabase Studio
-- (private buckets + signed URLs) — see README §Storage.
-- ---------------------------------------------------------------------
