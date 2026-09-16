-- Allow a newly authenticated, approved petrochemical manager to read only
-- the approved organization row matching the email in the auth JWT. This
-- enables the first-login profile bootstrap in the login page without
-- exposing other tenants.
drop policy if exists org_select on public.organizations;

create policy org_select on public.organizations for select using (
  is_super_admin()
  or is_observer()
  or id = current_org_id()
  or (
    status = 'approved'
    and type = 'petrochemical'
    and lower(coalesce(email, '')) = lower(coalesce((auth.jwt() ->> 'email'), ''))
  )
);
