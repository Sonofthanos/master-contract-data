import { createBrowserClient } from "@supabase/ssr";

function cleanSupabaseUrl(url: string | undefined): string {
  if (!url) return "https://placeholder.supabase.co";
  return url.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes("your-project-id") &&
    !key.includes("your-anon-key")
  );
}

export function createClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const url = cleanSupabaseUrl(rawUrl);
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
  return createBrowserClient(url, key);
}
