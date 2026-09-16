-- =====================================================================
-- Migration 0004: allow a newly-signed-up auth user to create their
-- own `users` profile row (needed for independent driver self-service
-- registration — §10 of the brief). Without this, RLS blocks the
-- insert since 0002 only defined SELECT/UPDATE policies for `users`.
-- =====================================================================

create policy users_insert_self on users for insert with check (id = auth.uid());
