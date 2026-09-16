-- =====================================================================
-- Migration 0003: Private storage buckets
-- All buckets are private; access is via signed URLs generated
-- server-side (see src/lib/storage.ts).
-- =====================================================================

insert into storage.buckets (id, name, public)
values
  ('driver-documents', 'driver-documents', false),
  ('vehicle-documents', 'vehicle-documents', false),
  ('mission-photos', 'mission-photos', false),
  ('inspection-photos', 'inspection-photos', false),
  ('payment-receipts', 'payment-receipts', false),
  ('company-documents', 'company-documents', false)
on conflict (id) do nothing;

-- Authenticated users may upload into any of these buckets; read access
-- is granted only via server-issued signed URLs (service role), so no
-- broad SELECT policy is created on storage.objects here.
create policy "authenticated can upload" on storage.objects
  for insert to authenticated
  with check (bucket_id in (
    'driver-documents','vehicle-documents','mission-photos',
    'inspection-photos','payment-receipts','company-documents'
  ));
