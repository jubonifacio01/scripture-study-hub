/*
# Shared Objectives System

Creates a system for sharing objectives between users with different permission levels.

## New Tables

### `shared_objectives`
Stores shared objectives with their access settings.
- `id` (uuid, primary key)
- `share_code` (text, unique, 8-character share code for URL sharing)
- `name` (text, not null) - Objective name
- `description` (text, nullable) - Objective description
- `owner_name` (text) - Name of the user who shared (since we use localStorage auth)
- `permission_level` (enum: 'read_only', 'allow_copy', 'allow_collaboration')
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### `shared_objective_items`
Stores the texts/items within a shared objective.
- `id` (uuid, primary key)
- `shared_objective_id` (uuid, FK to shared_objectives)
- `title` (text, not null)
- `book` (text)
- `chapter` (integer)
- `verse` (text)
- `text` (text, not null)
- `category` (text)
- `tags` (text array)
- `order_index` (integer) - Order within the objective

## Security
- Enable RLS on both tables.
- Public read access (anyone with share code can view).
- Write access restricted (insert/update/delete allowed for all since we use localStorage auth).

## Notes
1. This is a single-tenant sharing system - no user_id FK required.
2. Share codes are 8-character alphanumeric strings.
3. Permission levels control what importers can do with the shared content.
*/

-- Create enum for permission levels
CREATE TYPE shared_permission_level AS ENUM ('read_only', 'allow_copy', 'allow_collaboration');

-- Create shared_objectives table
CREATE TABLE IF NOT EXISTS shared_objectives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_code text UNIQUE NOT NULL DEFAULT upper(substr(md5(random()::text), 1, 8)),
  name text NOT NULL,
  description text,
  owner_name text NOT NULL DEFAULT 'Anônimo',
  permission_level shared_permission_level NOT NULL DEFAULT 'allow_copy',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create shared_objective_items table
CREATE TABLE IF NOT EXISTS shared_objective_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_objective_id uuid NOT NULL REFERENCES shared_objectives(id) ON DELETE CASCADE,
  title text NOT NULL,
  book text DEFAULT '—',
  chapter integer DEFAULT 0,
  verse text DEFAULT '',
  text text NOT NULL,
  category text DEFAULT 'Compartilhado',
  tags text[] DEFAULT '{}',
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE shared_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_objective_items ENABLE ROW LEVEL SECURITY;

-- Policies for shared_objectives (public read, allow write since localStorage auth)
DROP POLICY IF EXISTS "public_read_shared_objectives" ON shared_objectives;
CREATE POLICY "public_read_shared_objectives" ON shared_objectives FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_shared_objectives" ON shared_objectives;
CREATE POLICY "public_insert_shared_objectives" ON shared_objectives FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_shared_objectives" ON shared_objectives;
CREATE POLICY "public_update_shared_objectives" ON shared_objectives FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_shared_objectives" ON shared_objectives;
CREATE POLICY "public_delete_shared_objectives" ON shared_objectives FOR DELETE
  TO anon, authenticated USING (true);

-- Policies for shared_objective_items (public read, allow write)
DROP POLICY IF EXISTS "public_read_shared_items" ON shared_objective_items;
CREATE POLICY "public_read_shared_items" ON shared_objective_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_shared_items" ON shared_objective_items;
CREATE POLICY "public_insert_shared_items" ON shared_objective_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_shared_items" ON shared_objective_items;
CREATE POLICY "public_update_shared_items" ON shared_objective_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_shared_items" ON shared_objective_items;
CREATE POLICY "public_delete_shared_items" ON shared_objective_items FOR DELETE
  TO anon, authenticated USING (true);

-- Create index for share_code lookups
CREATE INDEX IF NOT EXISTS idx_shared_objectives_share_code ON shared_objectives(share_code);

-- Create index for items lookup by objective
CREATE INDEX IF NOT EXISTS idx_shared_items_objective_id ON shared_objective_items(shared_objective_id);
