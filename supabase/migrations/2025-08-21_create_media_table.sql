-- Create media table for storing photo references
CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_size integer,
  mime_type text,
  storage_path text, -- Path in Supabase Storage
  public_url text,   -- Public URL if needed
  uploaded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_media_lead_id ON media(lead_id);

-- Enable Row Level Security
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for damage photos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('damage-photos', 'damage-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for media table
-- Allow service role full access
CREATE POLICY "Service role can manage all media" ON media
  FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to view their own media
CREATE POLICY "Users can view their own media" ON media
  FOR SELECT USING (
    lead_id IN (
      SELECT id FROM leads 
      WHERE email = auth.jwt() ->> 'email'
    )
  );