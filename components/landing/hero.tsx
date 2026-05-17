"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Github, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Particles } from "@/components/effects/particles";
import { GridBackground, RadialGlow } from "@/components/effects/grid-bg";
import { ScanPreview } from "./scan-preview";

export function Hero() {
  return (
    <section className="relative pt-36 pb-24 overflow-hidden">
      <GridBackground />
      <RadialGlow />
      <div className="absolute inset-0 mask-radial">
        <Particles density={50} />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs text-white/70 backdrop-blur-sm"
        >
          <Sparkles className="h-3.5 w-3.5 text-lime-400" />
          Enrolled for the Google hackathon
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: "easeOut" }}
          className="mt-6 text-balance text-5xl md:text-7xl font-semibold tracking-tight leading-[1.02]"
        >
          <span className="text-gradient-subtle">Easy security for your</span>
          <br />
          <span className="text-gradient">apps ready for production.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="mt-6 mx-auto max-w-2xl text-lg text-white/60 leading-relaxed"
        >
          SecuGo scans your repositories for exposed secrets, vulnerabilities,
          and dangerous mistakes — then explains everything in simple language
          with AI-powered guidance.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button asChild size="lg" className="min-w-[180px]">
            <Link href="/login">
              <Github className="h-4 w-4" />
              Connect GitHub
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="min-w-[160px]">
            <Link href="#how">See how it works</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-6 flex items-center justify-center gap-2 text-xs text-white/40"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-lime-400/80" />
          Read-only access · No code leaves your repo · Cancel anytime
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 relative"
        >
          <div className="absolute -inset-x-20 -inset-y-10 bg-radial-fade blur-3xl pointer-events-none" />
          <ScanPreview />
        </motion.div>
      </div>
    </section>
  );
}
