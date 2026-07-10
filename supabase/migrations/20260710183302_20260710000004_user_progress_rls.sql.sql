/*
# RLS Policies: user_progress (guest/no-auth access)

Adds open CRUD policies to user_progress so the anon-key frontend can
upsert and read progress rows identified by the guest's user_id UUID.
Uses USING(true) for the guest phase — will be tightened to
auth.uid() = user_id when Supabase Auth is added.
*/

DROP POLICY IF EXISTS "guest_select_user_progress" ON user_progress;
CREATE POLICY "guest_select_user_progress" ON user_progress
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "guest_insert_user_progress" ON user_progress;
CREATE POLICY "guest_insert_user_progress" ON user_progress
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "guest_update_user_progress" ON user_progress;
CREATE POLICY "guest_update_user_progress" ON user_progress
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "guest_delete_user_progress" ON user_progress;
CREATE POLICY "guest_delete_user_progress" ON user_progress
  FOR DELETE TO anon, authenticated USING (true);
