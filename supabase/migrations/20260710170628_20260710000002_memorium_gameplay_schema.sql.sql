/*
# Memorium — Gameplay & Social Schema

## Overview
Creates the gameplay and social tables for Memorium:
rooms, room_players, matches, answers, achievements, and user_achievements.
These tables support realtime multiplayer sessions, match history,
per-question answer tracking, and the achievement system.

## New Tables

### rooms
Represents a multiplayer game session.
- id (uuid, PK)
- code (text, UNIQUE, not null) — short human-readable room code (e.g. "AB3K7X")
- host_id (uuid, FK → users.id, on delete set null, nullable) — room creator
- status (text, check: 'waiting' | 'playing' | 'finished') — lifecycle state
- selected_objective (uuid, FK → objectives.id, on delete set null, nullable)
- difficulty (text, check: 'facil' | 'medio' | 'dificil', nullable)
- question_count (integer, nullable) — how many questions are in this match
- created_at (timestamptz, auto-managed)

### room_players
Tracks each participant inside a room.
- id (uuid, PK)
- room_id (uuid, FK → rooms.id, on delete cascade)
- player_id (uuid, FK → users.id, on delete set null, nullable) — null for guests
- display_name (text, not null) — name shown during the session
- is_host (boolean, default false)
- connected (boolean, default true) — whether the player is currently connected
- joined_at (timestamptz, auto-managed)
- UNIQUE (room_id, player_id) — a user can only be once per room

### matches
One match per game round played inside a room.
- id (uuid, PK)
- room_id (uuid, FK → rooms.id, on delete cascade)
- started_at (timestamptz, nullable) — set when the host fires "start"
- finished_at (timestamptz, nullable) — set when all players submit

### answers
Individual question answers submitted by players during a match.
- id (uuid, PK)
- match_id (uuid, FK → matches.id, on delete cascade)
- player_id (uuid, FK → users.id, on delete set null, nullable)
- question_id (text, not null) — identifies the question (item ID or index)
- answer (text, not null) — the option the player chose
- correct (boolean, not null) — whether it was correct
- response_time (integer, nullable) — milliseconds to answer
- created_at (timestamptz, auto-managed)

### achievements
Static catalogue of all possible achievements.
- id (uuid, PK)
- name (text, UNIQUE, not null)
- description (text, not null)
- icon (text, nullable) — icon identifier or URL

### user_achievements
Junction table recording which achievements each user has unlocked.
- id (uuid, PK)
- user_id (uuid, FK → users.id, on delete cascade)
- achievement_id (uuid, FK → achievements.id, on delete cascade)
- unlocked_at (timestamptz, auto-managed)
- UNIQUE (user_id, achievement_id) — each achievement unlocked only once

## Indexes
- rooms.code — for fast room lookup by code
- rooms.host_id — for host queries
- rooms.status — for filtering active/finished rooms
- room_players.room_id — for listing participants in a room
- room_players.player_id — for listing rooms a player is in
- matches.room_id — for fetching matches of a room
- answers.match_id — for fetching all answers in a match
- answers.player_id — for per-player answer history
- user_achievements.user_id — for listing a user's achievements

## Security
- RLS is ENABLED on all tables (locked until policies are added).
- NO policies are created in this migration.

## Notes
- This migration is idempotent: all CREATE statements use IF NOT EXISTS.
- host_id and player_id FK columns use ON DELETE SET NULL so that deleting
  a user does not cascade-destroy room/match history — the room and answers
  remain for historical/audit purposes.
*/

-- ─────────────────────────────────────────────
-- Table: rooms
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rooms (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code               text NOT NULL UNIQUE,
  host_id            uuid REFERENCES users(id) ON DELETE SET NULL,
  status             text NOT NULL DEFAULT 'waiting'
                       CHECK (status IN ('waiting', 'playing', 'finished')),
  selected_objective uuid REFERENCES objectives(id) ON DELETE SET NULL,
  difficulty         text CHECK (difficulty IN ('facil', 'medio', 'dificil')),
  question_count     integer CHECK (question_count > 0),
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rooms_code      ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_rooms_host_id   ON rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status    ON rooms(status);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- Table: room_players
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS room_players (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id      uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  player_id    uuid REFERENCES users(id) ON DELETE SET NULL,
  display_name text NOT NULL,
  is_host      boolean NOT NULL DEFAULT false,
  connected    boolean NOT NULL DEFAULT true,
  joined_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (room_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_room_players_room_id   ON room_players(room_id);
CREATE INDEX IF NOT EXISTS idx_room_players_player_id ON room_players(player_id);

ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- Table: matches
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS matches (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id     uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  started_at  timestamptz,
  finished_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_matches_room_id ON matches(room_id);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- Table: answers
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS answers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id      uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id     uuid REFERENCES users(id) ON DELETE SET NULL,
  question_id   text NOT NULL,
  answer        text NOT NULL,
  correct       boolean NOT NULL,
  response_time integer CHECK (response_time >= 0),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_answers_match_id  ON answers(match_id);
CREATE INDEX IF NOT EXISTS idx_answers_player_id ON answers(player_id);

ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- Table: achievements
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS achievements (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL UNIQUE,
  description text NOT NULL,
  icon        text
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- Table: user_achievements
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_achievements (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
