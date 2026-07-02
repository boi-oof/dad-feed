import { createClient } from "@supabase/supabase-js";

// Public client — safe for reading the feed (RLS restricts to SELECT only).
export function getPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Server-only client using the service role key — used exclusively inside
// API routes that already verified the upload-session cookie. Never import
// this from a client component.
export function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export type Post = {
  id: string;
  image_url: string;
  caption: string | null;
  tags: string[];
  created_at: string;
};
