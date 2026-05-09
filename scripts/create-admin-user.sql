-- Create admin user for Pink Auto Glass analytics dashboard
-- Generate a fresh bcrypt hash outside the repo before running:
--   node -e "require('bcryptjs').hash(process.env.ADMIN_PASSWORD, 10).then(console.log)"

INSERT INTO public.admin_users (email, password_hash, full_name, is_active)
VALUES (
  'admin@pinkautoglass.com',
  'replace-with-fresh-bcrypt-hash',
  'Admin User',
  true
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- Verify the user was created
SELECT id, email, full_name, is_active, created_at FROM public.admin_users WHERE email = 'admin@pinkautoglass.com';
