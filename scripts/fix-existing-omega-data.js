#!/usr/bin/env node
/**
 * One-time cleanup of known bad records identified in session 2026-03-04.
 * Safe to re-run — uses invoice_number as key.
 *
 * Usage: node scripts/fix-existing-omega-data.js
 */
require('dotenv').config({ path: '.env.local', quiet: true });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const VEHICLE_FIXES = [
  { invoice_number: '10229', vehicle_make: 'Ford',  vehicle_model: 'Escape' },
  { invoice_number: '10159', vehicle_make: 'Honda', vehicle_model: 'CR-V' },
];

// Remove "#2" suffix from customer_name for Cameron Mishotte
const NAME_SUFFIX_FIX = { invoice_number: '10096', customer_name_suffix_to_remove: ' #2' };

async function main() {
  console.log('Running one-time omega data fixes...\n');

  // Vehicle fixes
  for (const fix of VEHICLE_FIXES) {
    const { error } = await supabase
      .from('omega_installs')
      .update({ vehicle_make: fix.vehicle_make, vehicle_model: fix.vehicle_model, updated_at: new Date().toISOString() })
      .eq('invoice_number', fix.invoice_number);

    if (error) {
      console.error(`  ❌ #${fix.invoice_number}: ${error.message}`);
    } else {
      console.log(`  ✅ #${fix.invoice_number}: set to ${fix.vehicle_make} ${fix.vehicle_model}`);
    }
  }

  // Remove #2 suffix from Cameron Mishotte
  const { data: camRow } = await supabase
    .from('omega_installs')
    .select('invoice_number, customer_name')
    .eq('invoice_number', NAME_SUFFIX_FIX.invoice_number)
    .single();

  if (camRow?.customer_name?.endsWith(NAME_SUFFIX_FIX.customer_name_suffix_to_remove)) {
    const cleaned = camRow.customer_name.replace(/ #2$/, '').trim();
    const { error } = await supabase
      .from('omega_installs')
      .update({ customer_name: cleaned, updated_at: new Date().toISOString() })
      .eq('invoice_number', NAME_SUFFIX_FIX.invoice_number);

    if (error) {
      console.error(`  ❌ #${NAME_SUFFIX_FIX.invoice_number} name fix: ${error.message}`);
    } else {
      console.log(`  ✅ #${NAME_SUFFIX_FIX.invoice_number}: "${camRow.customer_name}" → "${cleaned}"`);
    }
  } else {
    console.log(`  ⏭  #${NAME_SUFFIX_FIX.invoice_number}: already clean or not found`);
  }

  // Delete test lead
  const testLeadId = 'e1f1f3c6-dfac-413c-b782-7aed518b37d4';
  const { error: delErr } = await supabase
    .from('leads')
    .delete()
    .eq('id', testLeadId);

  if (delErr) {
    console.error(`  ❌ test lead delete: ${delErr.message}`);
  } else {
    console.log(`  ✅ test lead ${testLeadId} deleted`);
  }

  console.log('\nDone.');
}

main().catch(console.error);
