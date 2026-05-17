import Link from "next/link";
import { LandingNavbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { GridBackground, RadialGlow } from "@/components/effects/grid-bg";
import { Shield, Zap, Eye, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About — SecuGo",
  description: "SecuGo is an AI-powered security scanner built for modern developers who ship fast.",
};

export default function AboutPage() {
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
              About SecuGo
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight mb-6">
              Security tooling built for how developers actually work.
            </h1>

            <p className="text-white/60 text-lg leading-relaxed mb-6">
              SecuGo was born out of a simple frustration: modern developers move fast, ship to production daily, and increasingly rely on AI coding tools — but the security tooling available to them was built for enterprise teams with dedicated security engineers.
            </p>

            <p className="text-white/60 text-lg leading-relaxed mb-14">
              We built SecuGo to close that gap. Connect your GitHub, scan any repository in seconds, and get plain-English explanations of every issue — powered by Google Gemini — along with a ready-to-paste fix prompt you can hand straight to your AI coding assistant.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 mb-16">
              {[
                {
                  icon: Zap,
                  title: "Built for speed",
                  body: "Scans run in seconds using a hybrid engine — deterministic regex patterns plus Gemini AI deep analysis on high-risk files.",
                },
                {
                  icon: Eye,
                  title: "Read-only by design",
                  body: "SecuGo never writes to your repository. All findings are read-only. You stay in full control of every change you make.",
                },
                {
                  icon: Shield,
                  title: "No false trust",
                  body: "We use allowlists, IDOR checks, and server-side token handling so the tool itself is hardened — we practice what we preach.",
                },
              ].map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5"
                >
                  <div className="h-9 w-9 rounded-xl bg-[#6bf900]/10 border border-[#6bf900]/20 flex items-center justify-center mb-4">
                    <Icon className="h-4 w-4 text-[#6bf900]" />
                  </div>
                  <div className="text-sm font-medium text-white mb-1">{title}</div>
                  <p className="text-xs text-white/50 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 text-center">
              <h2 className="text-xl font-semibold text-white mb-2">Start scanning for free</h2>
              <p className="text-white/50 text-sm mb-6">
                No credit card. No setup. Just connect your GitHub and scan any repository in under a minute.
              </p>
              <Button asChild size="lg">
                <Link href="/login">
                  <Github className="h-4 w-4" />
                  Connect GitHub
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
