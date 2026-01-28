require('dotenv').config({ path: '.env.local' });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSessions() {
  // Get recent leads session IDs
  const { data: leads } = await supabase
    .from("leads")
    .select("id, session_id, first_name, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  console.log("=== Checking session attribution for recent leads ===");
  console.log("");

  for (const lead of leads || []) {
    if (!lead.session_id) {
      console.log(lead.first_name + ": No session_id");
      continue;
    }

    const { data: session } = await supabase
      .from("user_sessions")
      .select("gclid, msclkid, utm_source, utm_medium")
      .eq("session_id", lead.session_id)
      .single();

    if (session) {
      console.log(lead.first_name + " (" + lead.created_at.substring(0, 10) + "):");
      console.log("  GCLID: " + (session.gclid || "null"));
      console.log("  MSCLKID: " + (session.msclkid || "null"));
      console.log("  UTM Source: " + (session.utm_source || "null"));
    } else {
      console.log(lead.first_name + ": Session not found");
    }
  }

  console.log("");
  console.log("=== Form submissions with GCLID (via session join) ===");

  // Count form submissions where the session has a gclid
  const { data: leadsWithSessions } = await supabase
    .from("leads")
    .select("session_id")
    .not("session_id", "is", null);

  let gclidFormCount = 0;
  let msclkidFormCount = 0;

  for (const lead of leadsWithSessions || []) {
    const { data: session } = await supabase
      .from("user_sessions")
      .select("gclid, msclkid")
      .eq("session_id", lead.session_id)
      .single();

    if (session && session.gclid) gclidFormCount++;
    if (session && session.msclkid) msclkidFormCount++;
  }

  console.log("Total form leads:", leadsWithSessions?.length || 0);
  console.log("Form leads with GCLID session:", gclidFormCount);
  console.log("Form leads with MSCLKID session:", msclkidFormCount);
}

checkSessions();
