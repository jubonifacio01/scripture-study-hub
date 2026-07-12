-- Add multiplayer game-state columns to room_players (additive, non-destructive)
ALTER TABLE room_players
  ADD COLUMN IF NOT EXISTS ready boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS correct integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS time_ms integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS combo integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS done boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS character text,
  ADD COLUMN IF NOT EXISTS avatar text;
