import { LandingNavbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { GridBackground, RadialGlow } from "@/components/effects/grid-bg";
import { ShieldCheck, Lock, Eye, Server, Key, RefreshCw } from "lucide-react";

export const metadata = {
  title: "Security — SecuGo",
  description: "How SecuGo keeps your data and repositories secure.",
};

const practices = [
  {
    icon: Lock,
    title: "GitHub OAuth only",
    body: "We never ask for your GitHub password. Authentication is handled entirely through GitHub's official OAuth flow. You can revoke SecuGo's access from your GitHub settings at any time.",
  },
  {
    icon: Eye,
    title: "Read-only repository access",
    body: "SecuGo requests read-only scopes (read:user, user:email, read:org, repo). We fetch file contents to scan them — we never push, write, or modify anything in your repositories.",
  },
  {
    icon: Key,
    title: "Tokens stay server-side",
    body: "Your GitHub access token is never exposed to the browser or sent in request bodies. It is read exclusively from your encrypted Supabase session on the server, keeping it out of logs and client memory.",
  },
  {
    icon: Server,
    title: "Data stored in Supabase",
    body: "Scan results and vulnerability findings are stored in Supabase Postgres with row-level security (RLS). Your data is scoped to your user ID — no other user can query your findings.",
  },
  {
    icon: ShieldCheck,
    title: "IDOR protection",
    body: "Every API endpoint verifies that the requested resource belongs to the authenticated user before returning data. Repository IDs and scan IDs are cross-checked against your user ID server-side.",
  },
  {
    icon: RefreshCw,
    title: "Credentials are never stored",
    body: "SecuGo does not store your GitHub token persistently. Tokens live only in your Supabase session and expire when you sign out. Rotate your GitHub OAuth token at any time by signing out and back in.",
  },
];

export default function SecurityPage() {
  return (
    <>
      <LandingNavbar />
      <main className="relative min-h-screen overflow-x-hidden">
        <GridBackground />
        <RadialGlow />

        <section className="relative pt-36 pb-24 px-4">
          <div className="mx-auto max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#6bf900]/30 bg-[#6bf900]/[0.07] text-[#6bf900] text-xs font-mono tracking-widest uppercase mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6bf900] animate-pulse" />
              Security
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight mb-6">
              We practice what we preach.
            </h1>

            <p className="text-white/60 text-lg leading-relaxed mb-14">
              SecuGo is a security tool — so its own security posture is something we take seriously. Here is exactly how we handle your data, your tokens, and your repositories.
            </p>

            <div className="space-y-4 mb-16">
              {practices.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="flex gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6"
                >
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-[#6bf900]/10 border border-[#6bf900]/20 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-[#6bf900]" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white mb-1">{title}</div>
                    <p className="text-sm text-white/50 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 text-sm text-white/50 leading-relaxed">
              <span className="text-white font-medium">Found a security issue in SecuGo?</span>{" "}
              Please report it responsibly to{" "}
              <a href="mailto:security@secugo.dev" className="text-[#6bf900] hover:underline">
                security@secugo.dev
              </a>
              . We take all reports seriously and will respond within 48 hours.
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
