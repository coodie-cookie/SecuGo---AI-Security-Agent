"use client";

import { motion } from "framer-motion";
import { AlertOctagon, FileCode2, Key, ShieldAlert } from "lucide-react";

const lines = [
  "$ secugo scan ./ai-todo-app",
  "→ Cloning repository...",
  "→ Indexing 142 files",
  "→ Running secret detection (gitleaks)",
  "→ Running dependency audit",
  "→ Running config review",
  "✗ Found 7 issues across 5 files",
];

const findings = [
  { icon: Key, label: "OPENAI_API_KEY exposed", severity: "critical" },
  { icon: ShieldAlert, label: "Open /admin route", severity: "high" },
  { icon: AlertOctagon, label: "CORS wildcard", severity: "medium" },
];

export function OnboardingSlide2() {
  return (
    <div className="relative h-full w-full">
      {/* Terminal */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="relative rounded-2xl border border-white/[0.08] bg-black/60 backdrop-blur-xl shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)] overflow-hidden"
      >
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/[0.06]">
          <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <div className="ml-auto text-[10px] text-white/30 font-mono">
            scan.log
          </div>
        </div>
        <div className="p-5 font-mono text-[12px] leading-6 text-white/70 min-h-[180px]">
          {lines.map((l, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.18, duration: 0.4 }}
              className={
                l.startsWith("✗")
                  ? "text-red-300"
                  : l.startsWith("→")
                  ? "text-lime-300/80"
                  : "text-white/50"
              }
            >
              {l}
            </motion.div>
          ))}
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="inline-block w-2 h-4 bg-lime-300 align-middle ml-1"
          />
        </div>
      </motion.div>

      {/* Floating findings */}
      <div className="mt-3 space-y-2">
        {findings.map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.6 + i * 0.18, duration: 0.5 }}
            className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md p-3"
          >
            <div
              className={`h-8 w-8 rounded-lg border flex items-center justify-center ${
                f.severity === "critical"
                  ? "bg-red-500/10 border-red-500/30 text-red-300"
                  : f.severity === "high"
                  ? "bg-orange-500/10 border-orange-500/30 text-orange-300"
                  : "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"
              }`}
            >
              <f.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 text-sm font-medium">{f.label}</div>
            <div className="text-[11px] text-white/40 flex items-center gap-1">
              <FileCode2 className="h-3 w-3" />
              detected
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
