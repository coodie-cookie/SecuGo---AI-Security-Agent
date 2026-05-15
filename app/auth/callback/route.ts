import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNext(raw: string | null): string {
  if (!raw) return "/dashboard";
  try {
    // Strict allowlist: must be a relative path with only safe characters
    if (/^\/[a-zA-Z0-9/_-]*$/.test(raw)) return raw;
  } catch {}
  return "/dashboard";
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  // Only use demo cookie if Supabase isn't configured at all.
  const supabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (code && supabaseConfigured) {
    const supabase = await createClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        // Clear any stale demo cookie now that we have a real session.
        const res = NextResponse.redirect(`${origin}${next}`);
        res.cookies.set("secugo_demo_session", "", { path: "/", maxAge: 0 });
        return res;
      }
    }
    // If code exchange fails with Supabase configured, redirect back to login.
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  // Demo mode only (no Supabase env vars)
  if (!supabaseConfigured) {
    const res = NextResponse.redirect(`${origin}${next}`);
    res.cookies.set("secugo_demo_session", "1", {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  }

  return NextResponse.redirect(`${origin}/login`);
}
