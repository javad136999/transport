-- Allow first-login bootstrap for approved organization requests.
-- Only the row matching the authenticated email is visible before a profile exists.
drop policy if exists org_select on public.organizations;

create policy org_select on public.organizations for select using (
  is_super_admin()
  or is_observer()
  or id = current_org_id()
  or (
    status = 'approved'
    and type in ('petrochemical', 'destination', 'transport_company')
    and lower(coalesce(email, '')) = lower(coalesce((auth.jwt() ->> 'email'), ''))
  )
);
