-- Create media table for storing photos and videos for memories and events
CREATE TABLE IF NOT EXISTS media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id TEXT NOT NULL,
  parent_type TEXT NOT NULL CHECK (parent_type IN ('memory', 'event')),
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  name TEXT NOT NULL,
  size INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure media is linked to valid parent
  CONSTRAINT fk_memory FOREIGN KEY (parent_id) REFERENCES memories(id) ON DELETE CASCADE,
  CONSTRAINT fk_event FOREIGN KEY (parent_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_media_parent_id ON media(parent_id);
CREATE INDEX IF NOT EXISTS idx_media_parent_type ON media(parent_type);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at DESC);

-- Enable Row Level Security
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Create policies for media access
-- Users can view media for their own relationship's memories and events
CREATE POLICY "Users can view media"
  ON media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memories 
      WHERE memories.id = media.parent_id 
      AND media.parent_type = 'memory'
    )
    OR EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = media.parent_id 
      AND media.parent_type = 'event'
    )
  );

-- Users can insert media for their own relationship's memories and events
CREATE POLICY "Users can insert media"
  ON media FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM memories 
      WHERE memories.id = media.parent_id 
      AND media.parent_type = 'memory'
    )
    OR EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = media.parent_id 
      AND media.parent_type = 'event'
    )
  );

-- Users can delete media for their own relationship's memories and events
CREATE POLICY "Users can delete media"
  ON media FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM memories 
      WHERE memories.id = media.parent_id 
      AND media.parent_type = 'memory'
    )
    OR EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = media.parent_id 
      AND media.parent_type = 'event'
    )
  );
