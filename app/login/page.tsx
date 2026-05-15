"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Github, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { GridBackground, RadialGlow } from "@/components/effects/grid-bg";
import { Particles } from "@/components/effects/particles";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  // Validate next to prevent open redirect — only allow relative paths
  const rawNext = params.get("next") || "/dashboard";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";
  const [loading, setLoading] = useState<"default" | "switch" | null>(null);

  const signInWithGitHub = async (forceNew = false) => {
    setLoading(forceNew ? "switch" : "default");
    const supabase = createClient();

    if (supabase) {
      // Sign out first when switching accounts so no stale session interferes
      if (forceNew) await supabase.auth.signOut();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          scopes: "read:user user:email read:org repo",
          // Pass empty login param — GitHub interprets this as "show the login screen"
          queryParams: forceNew ? { prompt: "login" } : {},
        },
      });
      if (error) {
        console.error(error);
        setLoading(null);
      }
      return;
    }

    // No fallback — Supabase OAuth is required in production
    setLoading(null);
  };

  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center px-4">
      <GridBackground />
      <RadialGlow />
      <div className="absolute inset-0 mask-radial">
        <Particles density={40} />
      </div>

      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-sm text-white/55 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="relative rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]">
          <div
            aria-hidden
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 0%, rgba(107,249,0,0.08), transparent 70%)",
            }}
          />
          <div className="relative">
            <div className="flex justify-center">
              <Logo size="md" showText={false} />
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-center text-balance">
              <span className="text-gradient-subtle">Welcome to SecuGo</span>
            </h1>
            <p className="mt-2 text-center text-sm text-white/55">
              Sign in with GitHub to scan your repositories.
            </p>

            <div className="mt-7 space-y-3">
              <Button
                size="lg"
                onClick={() => signInWithGitHub(false)}
                disabled={!!loading}
                className="w-full"
              >
                {loading === "default" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Github className="h-4 w-4" />
                )}
                {loading === "default" ? "Connecting..." : "Continue with GitHub"}
              </Button>

              <button
                onClick={() => signInWithGitHub(true)}
                disabled={!!loading}
                className="w-full inline-flex items-center justify-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors py-1 disabled:opacity-50"
              >
                {loading === "switch" ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Github className="h-3 w-3" />
                )}
                Use a different GitHub account
              </button>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-white/40">
              <ShieldCheck className="h-3.5 w-3.5 text-lime-400" />
              Read-only access to repos you choose. Revoke anytime.
            </div>

            <p className="mt-7 text-center text-[11px] text-white/35 leading-relaxed">
              By continuing, you agree to SecuGo's{" "}
              <Link href="#" className="text-white/55 hover:text-white">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-white/55 hover:text-white">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-white/35">
          New here?{" "}
          <Link href="/onboarding" className="text-white/65 hover:text-white">
            Take the 60-second tour
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
