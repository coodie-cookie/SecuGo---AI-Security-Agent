import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Strict allowlist of safe internal paths after auth callback
const ALLOWED_NEXT_PATHS = [
  "/dashboard",
  "/dashboard/repositories",
  "/dashboard/scans",
  "/dashboard/assistant",
  "/dashboard/settings",
  "/onboarding",
];

function safeNext(raw: string | null): string {
  if (!raw) return "/dashboard";
  // Allow exact matches OR /dashboard/scans/{id}
  if (ALLOWED_NEXT_PATHS.includes(raw)) return raw;
  if (/^\/dashboard\/scans\/[a-zA-Z0-9-]+$/.test(raw)) return raw;
  return "/dashboard";
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (!code) return NextResponse.redirect(`${origin}/login`);

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.redirect(`${origin}/login?error=server_misconfigured`);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  // Always clear any stale demo cookie on successful auth
  const res = NextResponse.redirect(`${origin}${next}`);
  res.cookies.set("secugo_demo_session", "", { path: "/", maxAge: 0 });
  return res;
}
