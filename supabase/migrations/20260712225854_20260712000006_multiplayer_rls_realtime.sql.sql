-- RLS Policies for multiplayer tables (guest/no-auth access)
-- Allows the anon-key frontend to manage rooms, players, matches, and answers.

-- rooms
DROP POLICY IF EXISTS "guest_select_rooms" ON rooms;
CREATE POLICY "guest_select_rooms" ON rooms
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "guest_insert_rooms" ON rooms;
CREATE POLICY "guest_insert_rooms" ON rooms
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "guest_update_rooms" ON rooms;
CREATE POLICY "guest_update_rooms" ON rooms
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "guest_delete_rooms" ON rooms;
CREATE POLICY "guest_delete_rooms" ON rooms
  FOR DELETE TO anon, authenticated USING (true);

-- room_players
DROP POLICY IF EXISTS "guest_select_room_players" ON room_players;
CREATE POLICY "guest_select_room_players" ON room_players
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "guest_insert_room_players" ON room_players;
CREATE POLICY "guest_insert_room_players" ON room_players
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "guest_update_room_players" ON room_players;
CREATE POLICY "guest_update_room_players" ON room_players
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "guest_delete_room_players" ON room_players;
CREATE POLICY "guest_delete_room_players" ON room_players
  FOR DELETE TO anon, authenticated USING (true);

-- matches
DROP POLICY IF EXISTS "guest_select_matches" ON matches;
CREATE POLICY "guest_select_matches" ON matches
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "guest_insert_matches" ON matches;
CREATE POLICY "guest_insert_matches" ON matches
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "guest_update_matches" ON matches;
CREATE POLICY "guest_update_matches" ON matches
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "guest_delete_matches" ON matches;
CREATE POLICY "guest_delete_matches" ON matches
  FOR DELETE TO anon, authenticated USING (true);

-- answers
DROP POLICY IF EXISTS "guest_select_answers" ON answers;
CREATE POLICY "guest_select_answers" ON answers
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "guest_insert_answers" ON answers;
CREATE POLICY "guest_insert_answers" ON answers
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "guest_update_answers" ON answers;
CREATE POLICY "guest_update_answers" ON answers
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "guest_delete_answers" ON answers;
CREATE POLICY "guest_delete_answers" ON answers
  FOR DELETE TO anon, authenticated USING (true);

-- Enable Realtime for multiplayer tables
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE room_players;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE answers;
