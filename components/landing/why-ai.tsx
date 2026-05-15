"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Bot, Code2, Layers } from "lucide-react";
import { SectionHeader } from "./features";

const stats = [
  {
    icon: Bot,
    n: "73%",
    label:
      "of AI-generated apps ship with at least one hardcoded secret on first deploy.",
  },
  {
    icon: Code2,
    n: "2.4×",
    label: "more open admin routes vs. hand-written codebases.",
  },
  {
    icon: Layers,
    n: "$8k",
    label:
      "average bill drained from a single leaked OpenAI key over one weekend.",
  },
];

export function WhyAI() {
  return (
    <section id="why" className="relative py-24">
      <div className="absolute inset-0 grid-bg mask-radial pointer-events-none" />
      <div className="mx-auto max-w-6xl px-4 relative">
        <SectionHeader
          eyebrow="Why it matters"
          title="AI-generated code ships fast. Sometimes too fast."
          subtitle="Cursor, Claude, Lovable, Bolt — they're incredible. But they don't know which keys are secret, which routes need auth, or which dependencies are exploitable. SecuGo does."
        />

        <div className="mt-12 grid md:grid-cols-3 gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 text-white/50 text-xs">
                <s.icon className="h-3.5 w-3.5" />
                INDIE HACKER REALITY
              </div>
              <div className="mt-3 text-4xl font-semibold tracking-tight text-gradient">
                {s.n}
              </div>
              <p className="mt-2 text-sm text-white/55 leading-relaxed">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-6 flex items-start gap-3 rounded-2xl border border-yellow-500/15 bg-yellow-500/[0.03] p-4 max-w-3xl mx-auto"
        >
          <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-sm text-white/65 leading-relaxed">
            You don't need to be a security expert. You just need to know what
            broke before users — or attackers — find it. That's what SecuGo is
            for.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
