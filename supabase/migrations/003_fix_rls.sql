-- ============================================================
-- Fix RLS: allow all operations for authenticated users
-- This is a private 2-person app so open policies are fine
-- ============================================================

-- MEMORIES
DROP POLICY IF EXISTS "Authenticated users can view all memories" ON memories;
DROP POLICY IF EXISTS "Users can insert own memories" ON memories;
DROP POLICY IF EXISTS "Users can update own memories" ON memories;
DROP POLICY IF EXISTS "Users can delete own memories" ON memories;
CREATE POLICY "Allow all for authenticated" ON memories FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- EVENTS
DROP POLICY IF EXISTS "Authenticated users can view all events" ON events;
DROP POLICY IF EXISTS "Users can insert own events" ON events;
DROP POLICY IF EXISTS "Users can update own events" ON events;
DROP POLICY IF EXISTS "Users can delete own events" ON events;
CREATE POLICY "Allow all for authenticated" ON events FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- NOTES
DROP POLICY IF EXISTS "Users can view notes they sent or received" ON notes;
DROP POLICY IF EXISTS "Users can insert notes as sender" ON notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete their own sent notes" ON notes;
CREATE POLICY "Allow all for authenticated" ON notes FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- MEDIA
DROP POLICY IF EXISTS "Authenticated users can view all media" ON media;
DROP POLICY IF EXISTS "Users can insert own media" ON media;
DROP POLICY IF EXISTS "Users can delete own media" ON media;
CREATE POLICY "Allow all for authenticated" ON media FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- PROFILES
DROP POLICY IF EXISTS "Users can view any profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Allow all for authenticated" ON profiles FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- MEMORY REACTIONS
DROP POLICY IF EXISTS "Authenticated users can view all reactions" ON memory_reactions;
DROP POLICY IF EXISTS "Users can manage their own reactions" ON memory_reactions;
CREATE POLICY "Allow all for authenticated" ON memory_reactions FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
