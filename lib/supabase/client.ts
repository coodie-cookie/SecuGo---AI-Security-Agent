"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    // Allow the demo to run without real credentials.
    // Returning a stub avoids blowing up the UI; auth flows fall back to mock mode.
    return null;
  }
  return createBrowserClient(url, anon);
}
