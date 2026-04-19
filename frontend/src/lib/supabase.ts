import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
const supabaseKey = supabaseAnonKey || supabasePublishableKey;

/** True when real Supabase credentials are set (auth and profiles will work). */
export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseKey,
);

/**
 * Placeholder URL/key so the app can load without .env. Real auth requires
 * VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY).
 */
const url = supabaseUrl || "https://placeholder.supabase.co";
const key = supabaseKey || "sb_publishable_placeholder_not_valid";

if (import.meta.env.DEV && !isSupabaseConfigured) {
  console.warn(
    "[Tierd] Supabase env vars missing. UI will load; copy .env.example â†’ .env and add VITE_SUPABASE_URL plus VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY) to enable login/signup.",
  );
}

export const supabase = createClient(url, key);

