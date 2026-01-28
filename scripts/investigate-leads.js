const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/['"]/g, '').trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY.replace(/['"]/g, '').trim();

const supabase = createClient(url, key);

async function investigate() {
  // Get today's leads
  const { data: leads, error: leadsErr } = await supabase
    .from("leads")
    .select("id, first_name, phone_e164, email, created_at, ad_platform, session_id, zip, gclid, msclkid")
    .gte("created_at", "2026-01-01T00:00:00")
    .order("created_at", { ascending: false });
  
  if (leadsErr) {
    console.error("Leads error:", leadsErr);
    return;
  }
  
  console.log("=== FORM SUBMISSIONS TODAY ===");
  console.log("Found", leads.length, "submissions\n");
  
  for (const lead of leads) {
    console.log("Lead:", lead.first_name, "-", lead.phone_e164);
    console.log("  Submitted:", new Date(lead.created_at).toLocaleString("en-US", {timeZone: "America/Denver"}));
    console.log("  ad_platform:", lead.ad_platform || "(none)");
    console.log("  session_id:", lead.session_id || "(none)");
    console.log("  gclid:", lead.gclid || "(none)");
    console.log("  msclkid:", lead.msclkid || "(none)");
    console.log("");
  }
  
  // Get sessions with click IDs from today
  const { data: sessions, error: sessErr } = await supabase
    .from("user_sessions")
    .select("session_id, started_at, gclid, msclkid, utm_source, utm_medium, landing_page")
    .gte("started_at", "2026-01-01T00:00:00")
    .or("gclid.not.is.null,msclkid.not.is.null")
    .order("started_at", { ascending: false });
  
  if (sessErr) {
    console.error("Sessions error:", sessErr);
    return;
  }
  
  console.log("\n=== SEARCH SESSIONS WITH CLICK IDs (Today) ===");
  console.log("Found", sessions.length, "sessions with gclid or msclkid\n");
  
  for (const sess of sessions) {
    console.log("Session:", sess.session_id);
    console.log("  Started:", new Date(sess.started_at).toLocaleString("en-US", {timeZone: "America/Denver"}));
    console.log("  Platform:", sess.gclid ? "Google (gclid)" : sess.msclkid ? "Microsoft (msclkid)" : "unknown");
    console.log("  Landing:", sess.landing_page || "(none)");
    console.log("");
  }
  
  // Try to match leads to sessions
  console.log("\n=== MATCHING ANALYSIS ===");
  const leadSessionIds = leads.map(l => l.session_id).filter(Boolean);
  const searchSessionIds = sessions.map(s => s.session_id);
  
  console.log("Lead session_ids:", leadSessionIds.length > 0 ? leadSessionIds : "(none captured)");
  console.log("Search session_ids:", searchSessionIds);
  
  // Check for time-based correlation
  console.log("\n=== TIME CORRELATION (within 30 min) ===");
  for (const lead of leads) {
    const leadTime = new Date(lead.created_at).getTime();
    console.log("\nLead:", lead.first_name, "at", new Date(lead.created_at).toLocaleString("en-US", {timeZone: "America/Denver"}));
    
    let foundMatch = false;
    for (const sess of sessions) {
      const sessTime = new Date(sess.started_at).getTime();
      const diffMinutes = (leadTime - sessTime) / 60000;
      
      // Only match if session started BEFORE the lead submission (positive diff)
      if (diffMinutes > 0 && diffMinutes <= 30) {
        const platform = sess.gclid ? "Google" : "Microsoft";
        console.log("  -> LIKELY MATCH:", platform, "session", diffMinutes.toFixed(1), "min before form submit");
        foundMatch = true;
      }
    }
    if (!foundMatch) {
      console.log("  -> No matching search session found");
    }
  }
}

investigate();
