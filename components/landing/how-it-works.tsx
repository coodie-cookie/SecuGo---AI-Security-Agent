"use client";

import { motion } from "framer-motion";
import { Github, ScanLine, Wrench } from "lucide-react";
import { SectionHeader } from "./features";

const steps = [
  {
    n: "01",
    icon: Github,
    title: "Connect GitHub",
    body: "One click. Read-only access to the repos you choose. No agents, no installs.",
  },
  {
    n: "02",
    icon: ScanLine,
    title: "Run a scan",
    body: "We sweep for secrets, vulnerable dependencies, dangerous configs, and shaky auth.",
  },
  {
    n: "03",
    icon: Wrench,
    title: "Fix with AI",
    body: "Each issue ships with a plain-English explanation and a copy-pasteable fix.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          eyebrow="How it works"
          title="Three steps from connect to confident."
          subtitle="No DevSecOps experience needed."
        />
        <div className="mt-14 relative">
          <div
            aria-hidden
            className="hidden md:block absolute left-0 right-0 top-12 h-px bg-gradient-to-r from-transparent via-lime-400/30 to-transparent"
          />
          <div className="grid md:grid-cols-3 gap-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/40 font-mono tracking-wider">
                    STEP {s.n}
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center">
                    <s.icon className="h-5 w-5 text-lime-300" />
                  </div>
                </div>
                <div className="mt-6 text-xl font-semibold tracking-tight">
                  {s.title}
                </div>
                <p className="mt-2 text-sm text-white/55 leading-relaxed">
                  {s.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
