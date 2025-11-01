-- Create admin user for Pink Auto Glass analytics dashboard
-- Password: PinkGlass2025!
-- Email: admin@pinkautoglass.com

INSERT INTO public.admin_users (email, password_hash, full_name, is_active)
VALUES (
  'admin@pinkautoglass.com',
  '$2b$10$C8yuIZa0i/yCZX3luDSh/.rDhGnV/03c426eoo80VY5Q/3/F13o3S',
  'Admin User',
  true
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- Verify the user was created
SELECT id, email, full_name, is_active, created_at FROM public.admin_users WHERE email = 'admin@pinkautoglass.com';
