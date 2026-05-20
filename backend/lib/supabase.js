const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SECRET_KEY in backend/.env",
  );
}

// Service-role client. NEVER expose this to clients — it bypasses RLS.
// Used by the backend to read oauth_provider_tokens (owner-only RLS) and
// write to github_daily_contributions (no client write policy).
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

module.exports = { supabaseAdmin };
