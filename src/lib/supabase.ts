import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** true kalau env Supabase belum diisi → web jalan pakai data contoh (mode demo). */
export const isDemo = !url || !key;

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (isDemo) {
    throw new Error(
      "Supabase belum disambungkan. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di Vercel."
    );
  }
  if (!client) client = createClient(url!, key!);
  return client;
}

export const BUCKET = "images";
