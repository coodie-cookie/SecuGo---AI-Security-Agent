"use client";

import { motion } from "framer-motion";
import {
  KeyRound,
  ShieldAlert,
  Sparkles,
  Github,
  GaugeCircle,
  MessageSquareCode,
} from "lucide-react";

const features = [
  {
    icon: KeyRound,
    title: "Secret detection that just works",
    body: "Find exposed API keys, tokens, and credentials before they hit production — across every file and every commit.",
  },
  {
    icon: ShieldAlert,
    title: "Vulnerability scanning, simplified",
    body: "Detects insecure auth flows, dangerous dependencies, leaky CORS configs, and the classic mistakes AI tools love to ship.",
  },
  {
    icon: Sparkles,
    title: "AI explanations in plain English",
    body: "Stop Googling CVEs. Every issue comes with a calm, beginner-friendly explanation and a copy-pasteable fix.",
  },
  {
    icon: Github,
    title: "One-click GitHub connect",
    body: "Sign in with GitHub, pick a repo, and you're scanning in seconds. No agents, no install scripts.",
  },
  {
    icon: GaugeCircle,
    title: "Security score, at a glance",
    body: "See where each repo stands — and what's improving over time — without staring at a dashboard.",
  },
  {
    icon: MessageSquareCode,
    title: "Chat with your codebase",
    body: "Ask the assistant anything — \"is my Stripe webhook safe?\" — and get answers grounded in your actual code.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          eyebrow="What it does"
          title="Security that finally feels human."
          subtitle="SecuGo handles the boring, dangerous parts so you can keep shipping."
        />

        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-lime-400/20 hover:bg-white/[0.035] transition-all"
            >
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-lime-400/[0.04] to-transparent pointer-events-none" />
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center group-hover:bg-lime-400/10 group-hover:border-lime-400/30 transition-colors">
                  <f.icon className="h-5 w-5 text-white/70 group-hover:text-lime-300 transition-colors" />
                </div>
                <div className="mt-5 text-base font-medium tracking-tight">
                  {f.title}
                </div>
                <div className="mt-2 text-sm text-white/55 leading-relaxed">
                  {f.body}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center">
      {eyebrow && (
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-lime-300/90 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
          {eyebrow}
        </div>
      )}
      <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight text-balance">
        <span className="text-gradient-subtle">{title}</span>
      </h2>
      {subtitle && (
        <p className="mt-4 mx-auto max-w-2xl text-base text-white/55">
          {subtitle}
        </p>
      )}
    </div>
  );
}
