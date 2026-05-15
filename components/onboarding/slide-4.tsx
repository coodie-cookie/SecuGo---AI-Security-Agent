"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Github, Lock, ShieldCheck } from "lucide-react";

const steps = [
  { icon: Github, label: "Connected to GitHub", state: "done" as const },
  { icon: Lock, label: "Repository indexed (142 files)", state: "done" as const },
  { icon: ShieldCheck, label: "Security score: 94 / 100", state: "done" as const },
];

const repos = [
  { name: "ai-todo-app", risk: "safe" },
  { name: "saas-starter", risk: "safe" },
  { name: "stripe-checkout-demo", risk: "safe" },
];

export function OnboardingSlide4() {
  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center gap-4">
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative h-32 w-32 rounded-full bg-gradient-to-br from-lime-300 to-lime-700 flex items-center justify-center shadow-[0_0_60px_-10px_rgba(107,249,0,0.7)]"
      >
        <CheckCircle2 className="h-16 w-16 text-black" strokeWidth={2.2} />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute inset-0 rounded-full ring-2 ring-lime-400/40"
        />
      </motion.div>

      <div className="w-full max-w-md space-y-2">
        {steps.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.15 }}
            className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 backdrop-blur-sm"
          >
            <div className="h-8 w-8 rounded-lg bg-lime-400/10 border border-lime-400/30 flex items-center justify-center">
              <s.icon className="h-4 w-4 text-lime-300" />
            </div>
            <div className="flex-1 text-sm text-white/85">{s.label}</div>
            <CheckCircle2 className="h-4 w-4 text-lime-400" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="w-full max-w-md flex items-center gap-2 px-1"
      >
        {repos.map((r) => (
          <div
            key={r.name}
            className="flex-1 rounded-lg border border-lime-400/20 bg-lime-400/[0.04] px-2.5 py-2 text-[11px] text-white/75 truncate"
          >
            <span className="text-lime-300 mr-1">●</span>
            {r.name}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
