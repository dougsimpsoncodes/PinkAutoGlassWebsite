-- Fix RLS policies for admin_users table to allow service role access

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can read admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Service role can insert admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Service role can update admin users" ON public.admin_users;

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for login API and admin management)
CREATE POLICY "Service role has full access to admin users"
  ON public.admin_users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verify the policies
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'admin_users';
