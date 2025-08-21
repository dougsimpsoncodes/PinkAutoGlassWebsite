-- Create lead_activities table for tracking all interactions
CREATE TABLE IF NOT EXISTS lead_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  activity_type text NOT NULL, -- 'email_sent', 'sms_sent', 'call_made', 'status_changed', etc.
  description text,
  metadata jsonb, -- Store any additional data
  created_at timestamptz DEFAULT now(),
  created_by text -- Email or system identifier
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_created_at ON lead_activities(created_at DESC);

-- Enable Row Level Security
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service role can manage all activities" ON lead_activities
  FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to view activities for their leads
CREATE POLICY "Users can view activities for their leads" ON lead_activities
  FOR SELECT USING (
    lead_id IN (
      SELECT id FROM leads 
      WHERE email = auth.jwt() ->> 'email'
    )
  );