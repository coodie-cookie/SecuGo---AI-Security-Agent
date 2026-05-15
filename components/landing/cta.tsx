"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-5xl px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-12 md:p-16 text-center"
        >
          <div
            aria-hidden
            className="absolute inset-0 grid-bg mask-radial pointer-events-none"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(50% 80% at 50% 100%, rgba(107,249,0,0.18), transparent 70%)",
            }}
          />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/70 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-400 animate-pulse" />
              Free during public beta
            </div>
            <h2 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight text-balance">
              <span className="text-gradient-subtle">Ship fast.</span>{" "}
              <span className="text-gradient">Ship safe.</span>
            </h2>
            <p className="mt-5 mx-auto max-w-xl text-base text-white/60">
              Connect a repo in 30 seconds. See your security posture in two
              minutes. Sleep tonight.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="xl" className="min-w-[220px]">
                <Link href="/login">
                  <Github className="h-4 w-4" />
                  Connect GitHub
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="secondary">
                <Link href="/onboarding">Take the tour</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
