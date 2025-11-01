#!/usr/bin/env node

/**
 * Script to create an admin user for the analytics dashboard
 * Usage: node scripts/create-admin-user.js <email> <password> "<full_name>"
 */

const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

async function createAdminUser() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error('Usage: node scripts/create-admin-user.js <email> <password> "<full_name>"');
    console.error('Example: node scripts/create-admin-user.js admin@pinkautoglass.com PinkGlass2025! "Admin User"');
    process.exit(1);
  }

  const [email, password, fullName] = args;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Error: Supabase environment variables not set');
    console.error('Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  try {
    console.log('Creating admin user via Supabase API...');

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('Password hashed...');

    // Upsert admin user (insert or update if exists)
    const { data, error } = await supabase
      .from('admin_users')
      .upsert({
        email: email,
        password_hash: passwordHash,
        full_name: fullName,
        is_active: true,
      }, {
        onConflict: 'email'
      })
      .select();

    if (error) {
      console.error('Error creating admin user:', error.message);
      console.error('Details:', error);
      process.exit(1);
    }

    console.log('✅ Admin user created/updated successfully!');
    console.log('\nAdmin Login Credentials:');
    console.log('========================');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Full Name: ${fullName}`);
    console.log('\nYou can now login at: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createAdminUser();
