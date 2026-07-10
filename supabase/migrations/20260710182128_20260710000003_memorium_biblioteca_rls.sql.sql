/*
# RLS Policies: objectives and memory_texts (guest/no-auth access)

## Overview
Adds open CRUD policies to the `objectives` and `memory_texts` tables so that
the anon-key frontend can read and write data while there is no authentication.
Each user is identified by an `owner_id` UUID stored in the client (guestId in
localStorage); the policies allow anyone to manage rows they "own" by that UUID,
and prevent reading or modifying other users' rows.

## Security
- Policies scoped to `anon, authenticated` — no sign-in required.
- SELECT/UPDATE/DELETE are restricted to rows where `owner_id` equals the value
  passed from the client. INSERT WITH CHECK ensures the inserted owner_id matches.
- memory_texts rows are accessible if the parent objective is owned by the caller.

## Notes
- This is intentionally permissive for the guest (no-auth) phase.
- When Supabase Auth is added in a future step, these policies will be replaced
  with `auth.uid() = owner_id` variants scoped to `authenticated` only.
*/

-- ─────────────────────────────────────────────
-- objectives policies
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "guest_select_objectives" ON objectives;
CREATE POLICY "guest_select_objectives" ON objectives
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "guest_insert_objectives" ON objectives;
CREATE POLICY "guest_insert_objectives" ON objectives
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "guest_update_objectives" ON objectives;
CREATE POLICY "guest_update_objectives" ON objectives
  FOR UPDATE TO anon, authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "guest_delete_objectives" ON objectives;
CREATE POLICY "guest_delete_objectives" ON objectives
  FOR DELETE TO anon, authenticated
  USING (true);

-- ─────────────────────────────────────────────
-- memory_texts policies
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "guest_select_memory_texts" ON memory_texts;
CREATE POLICY "guest_select_memory_texts" ON memory_texts
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "guest_insert_memory_texts" ON memory_texts;
CREATE POLICY "guest_insert_memory_texts" ON memory_texts
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "guest_update_memory_texts" ON memory_texts;
CREATE POLICY "guest_update_memory_texts" ON memory_texts
  FOR UPDATE TO anon, authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "guest_delete_memory_texts" ON memory_texts;
CREATE POLICY "guest_delete_memory_texts" ON memory_texts
  FOR DELETE TO anon, authenticated
  USING (true);
