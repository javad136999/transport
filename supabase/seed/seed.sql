-- =====================================================================
-- Seed data for local/staging testing only.
-- Safe to delete before production launch (see README §Seed Data).
-- =====================================================================

insert into waste_types (name) values
  ('پساب صنعتی'), ('پساب بهداشتی'), ('پساب روغنی'), ('پساب هیدروکربنی'), ('سایر')
on conflict do nothing;

insert into organizations (type, name, status, national_id, phone) values
  ('operator', 'شرکت پیمانکاران تصفیه صنعت', 'approved', '10100000001', '077310000'),
  ('petrochemical', 'پتروشیمی نمونه یک', 'approved', '10100000010', '077310010'),
  ('petrochemical', 'پتروشیمی نمونه دو', 'approved', '10100000011', '077310011'),
  ('transport_company', 'شرکت حمل نمونه', 'approved', '10100000020', '077310020'),
  ('destination', 'تصفیه‌خانه مرکزی عسلویه', 'approved', '10100000030', '077310030');

do $$
declare
  petro1 uuid;
  dest_org uuid;
begin
  select id into petro1 from organizations where name = 'پتروشیمی نمونه یک' limit 1;
  select id into dest_org from organizations where name = 'تصفیه‌خانه مرکزی عسلویه' limit 1;

  insert into loading_sites (petrochemical_id, name, address, latitude, longitude, radius_m)
  values (petro1, 'سایت بارگیری اصلی', 'عسلویه - منطقه ویژه پارس', 27.4833, 52.5833, 300);

  insert into authorized_destinations (name, owner_organization_id, address, latitude, longitude, radius_m, is_active)
  values ('تصفیه‌خانه مرکزی عسلویه', dest_org, 'عسلویه', 27.4700, 52.6100, 300, true);
end $$;
