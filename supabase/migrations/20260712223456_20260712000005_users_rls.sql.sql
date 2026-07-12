-- RLS Policies: users table (guest/no-auth access)
-- Allows the anon-key frontend to create and read guest user rows.
-- Uses USING(true) for the guest phase — will be tightened to
-- auth.uid() = id when Supabase Auth is added.

DROP POLICY IF EXISTS "guest_select_users" ON users;
CREATE POLICY "guest_select_users" ON users
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "guest_insert_users" ON users;
CREATE POLICY "guest_insert_users" ON users
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "guest_update_users" ON users;
CREATE POLICY "guest_update_users" ON users
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "guest_delete_users" ON users;
CREATE POLICY "guest_delete_users" ON users
  FOR DELETE TO anon, authenticated USING (true);
