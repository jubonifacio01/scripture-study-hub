/*
# Memorium — Core Domain Schema

## Overview
Creates the core domain tables for the Memorium application:
users, objectives, memory_texts, objective_shares, and user_progress.
This migration prepares the full structure for future RLS policies
and Supabase Auth integration.

## New Tables

### users
Stores user profile information. `id` mirrors `auth.users.id` so it can be
joined when Auth is enabled. For now it is a standalone UUID.
- id (uuid, PK)
- display_name (text, not null)
- avatar (text, nullable) — avatar URL or identifier string
- selected_character (text, nullable) — character key chosen by the user
- created_at, updated_at (timestamptz, auto-managed)

### objectives
A study objective owned by a user; the top-level container for memory texts.
- id (uuid, PK)
- owner_id (uuid, FK → users.id, on delete cascade)
- title (text, not null)
- description (text, nullable)
- is_public (boolean, default false) — whether other users can discover it
- created_at, updated_at (timestamptz, auto-managed)

### memory_texts
Individual memory verses / texts belonging to an objective.
- id (uuid, PK)
- objective_id (uuid, FK → objectives.id, on delete cascade)
- reference (text, not null) — e.g. "João 3:16"
- text (text, not null) — full passage text
- order_index (integer, default 0) — display order within the objective
- created_at (timestamptz, auto-managed)

### objective_shares
Tracks sharing of objectives between users (the future collaboration layer).
- id (uuid, PK)
- objective_id (uuid, FK → objectives.id, on delete cascade)
- shared_with (uuid, FK → users.id, on delete cascade) — recipient user
- permission (text, check constraint: 'read_only' | 'allow_copy' | 'allow_collaboration')
- created_at (timestamptz, auto-managed)
- UNIQUE (objective_id, shared_with) — no duplicate shares

### user_progress
Aggregated study progress per user per objective.
- id (uuid, PK)
- user_id (uuid, FK → users.id, on delete cascade)
- objective_id (uuid, FK → objectives.id, on delete cascade)
- xp (integer, default 0)
- accuracy (numeric(5,2), default 0.00) — percentage 0–100
- total_answers (integer, default 0)
- correct_answers (integer, default 0)
- current_streak (integer, default 0)
- updated_at (timestamptz, auto-managed)
- UNIQUE (user_id, objective_id) — one progress row per user/objective pair

## Indexes
- objectives.owner_id — for listing a user's objectives
- objectives.is_public — for public discovery queries
- memory_texts.objective_id + order_index — for ordered item fetching
- objective_shares.shared_with — for listing what was shared with a user
- user_progress.user_id, user_progress.objective_id — for progress lookups

## Security
- RLS is ENABLED on all tables (tables are locked until policies are added).
- NO policies are created in this migration — they will be added when Auth is
  integrated in a future step.

## Notes
- updated_at is maintained via a shared trigger function (created here).
- This migration is idempotent: all CREATE statements use IF NOT EXISTS.
*/

-- ─────────────────────────────────────────────
-- Helper: auto-update updated_at on row change
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────
-- Table: users
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name     text NOT NULL,
  avatar           text,
  selected_character text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- Table: objectives
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS objectives (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       text NOT NULL,
  description text,
  is_public   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_objectives_updated_at ON objectives;
CREATE TRIGGER trg_objectives_updated_at
  BEFORE UPDATE ON objectives
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_objectives_owner_id ON objectives(owner_id);
CREATE INDEX IF NOT EXISTS idx_objectives_is_public ON objectives(is_public) WHERE is_public = true;

ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- Table: memory_texts
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS memory_texts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id uuid NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
  reference    text NOT NULL,
  text         text NOT NULL,
  order_index  integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_memory_texts_objective_order
  ON memory_texts(objective_id, order_index);

ALTER TABLE memory_texts ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- Table: objective_shares
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS objective_shares (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id uuid NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
  shared_with  uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission   text NOT NULL DEFAULT 'allow_copy'
                 CHECK (permission IN ('read_only', 'allow_copy', 'allow_collaboration')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (objective_id, shared_with)
);

CREATE INDEX IF NOT EXISTS idx_objective_shares_shared_with
  ON objective_shares(shared_with);

ALTER TABLE objective_shares ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- Table: user_progress
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_progress (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  objective_id    uuid NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
  xp              integer NOT NULL DEFAULT 0 CHECK (xp >= 0),
  accuracy        numeric(5,2) NOT NULL DEFAULT 0.00
                    CHECK (accuracy >= 0 AND accuracy <= 100),
  total_answers   integer NOT NULL DEFAULT 0 CHECK (total_answers >= 0),
  correct_answers integer NOT NULL DEFAULT 0 CHECK (correct_answers >= 0),
  current_streak  integer NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, objective_id)
);

DROP TRIGGER IF EXISTS trg_user_progress_updated_at ON user_progress;
CREATE TRIGGER trg_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id    ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_objective_id ON user_progress(objective_id);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
