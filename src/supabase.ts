import { createClient } from "@supabase/supabase-js";

function cleanEnvValue(value: string | undefined, key: string, fallback: string) {
  if (!value) {
    return fallback;
  }

  return value.startsWith(`${key}=`) ? value.slice(key.length + 1) : value;
}

const supabaseUrl =
  cleanEnvValue(
    import.meta.env.VITE_SUPABASE_URL,
    "VITE_SUPABASE_URL",
    "https://xaxmxkwnmqypoxmwrbev.supabase.co",
  );
const supabasePublishableKey =
  cleanEnvValue(
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    "VITE_SUPABASE_PUBLISHABLE_KEY",
    "sb_publishable_ll71DD3kLTsaXA7ks3FgGw_u_hkF1to",
  );

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error("Missing Supabase environment variables.");
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
