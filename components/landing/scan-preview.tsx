"use client";

import { motion } from "framer-motion";
import {
  AlertOctagon,
  CheckCircle2,
  FileCode2,
  Key,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const findings = [
  {
    icon: Key,
    title: "Exposed OpenAI API Key",
    file: "src/lib/openai.ts",
    severity: "critical" as const,
  },
  {
    icon: ShieldAlert,
    title: "Public /admin route, no auth check",
    file: "src/app/admin/page.tsx",
    severity: "high" as const,
  },
  {
    icon: AlertOctagon,
    title: "Wildcard CORS configured",
    file: "next.config.mjs",
    severity: "medium" as const,
  },
];

export function ScanPreview() {
  return (
    <div className="relative mx-auto max-w-4xl">
      <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-xl shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)] overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
          </div>
          <div className="flex items-center gap-2 rounded-md px-2.5 py-1 text-[11px] text-white/50 bg-white/[0.03] border border-white/[0.06]">
            <span className="h-1.5 w-1.5 rounded-full bg-lime-400 animate-pulse" />
            secugo.app/dashboard/scans/scan-1
          </div>
          <div className="w-12" />
        </div>

        <div className="grid md:grid-cols-[260px_1fr] divide-x divide-white/[0.06]">
          {/* Sidebar */}
          <div className="hidden md:flex flex-col gap-2 p-4 bg-white/[0.01]">
            <div className="text-[11px] uppercase tracking-wider text-white/30 px-2 mb-1">
              Repository
            </div>
            <div className="flex items-center gap-2 rounded-lg p-2 bg-white/[0.04] border border-white/[0.06]">
              <div className="h-7 w-7 rounded-md bg-gradient-to-br from-lime-400 to-lime-700 flex items-center justify-center text-black text-[10px] font-bold">
                AI
              </div>
              <div className="text-left">
                <div className="text-xs font-medium">ai-todo-app</div>
                <div className="text-[10px] text-white/40">indie-hacker</div>
              </div>
            </div>
            <div className="text-[11px] uppercase tracking-wider text-white/30 px-2 mt-3 mb-1">
              Severity
            </div>
            <div className="space-y-1.5 text-[11px]">
              {[
                ["Critical", 3, "bg-red-500"],
                ["High", 2, "bg-orange-400"],
                ["Medium", 2, "bg-yellow-400"],
                ["Low", 0, "bg-blue-400"],
              ].map(([label, n, dot]) => (
                <div
                  key={label as string}
                  className="flex items-center justify-between px-2 py-1 rounded-md hover:bg-white/[0.03]"
                >
                  <span className="flex items-center gap-2 text-white/60">
                    <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                    {label}
                  </span>
                  <span className="text-white/40">{n as number}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Main */}
          <div className="p-5 text-left">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-white/40">
                  Scan complete
                </div>
                <div className="mt-1 text-2xl font-semibold tracking-tight">
                  7 issues across 142 files
                </div>
              </div>
              <Badge variant="critical" className="px-3 py-1">
                <AlertOctagon className="h-3 w-3" />
                3 critical
              </Badge>
            </div>

            <div className="mt-5 space-y-2">
              {findings.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + i * 0.12 }}
                  className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 hover:border-lime-400/20 hover:bg-white/[0.04] transition-all"
                >
                  <div className="h-9 w-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                    <f.icon className="h-4 w-4 text-white/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {f.title}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-white/40 mt-0.5">
                      <FileCode2 className="h-3 w-3" />
                      {f.file}
                    </div>
                  </div>
                  <Badge variant={f.severity}>{f.severity}</Badge>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="mt-4 rounded-xl border border-lime-400/20 bg-lime-400/[0.04] p-4 flex gap-3"
            >
              <div className="h-8 w-8 rounded-lg bg-lime-400/15 border border-lime-400/30 flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-lime-300" />
              </div>
              <div>
                <div className="text-xs text-lime-300 font-medium mb-1">
                  AI explanation
                </div>
                <div className="text-sm text-white/70 leading-relaxed">
                  Your OpenAI key is hardcoded in a public file. Anyone can use
                  it to drain your account.{" "}
                  <span className="text-lime-300">Rotate it now</span> and move
                  it to <span className="font-mono text-xs">.env.local</span>.
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating accent cards */}
      <motion.div
        initial={{ opacity: 0, x: -30, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="hidden lg:flex absolute -left-12 top-1/3 items-center gap-2 rounded-xl glass-strong px-3 py-2 text-xs animate-float"
      >
        <CheckCircle2 className="h-4 w-4 text-lime-400" />
        <div>
          <div className="text-white/80 font-medium">Fix applied</div>
          <div className="text-white/40 text-[10px]">CORS hardened</div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 30, y: -10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="hidden lg:flex absolute -right-10 top-20 items-center gap-2 rounded-xl glass-strong px-3 py-2 text-xs animate-float"
        style={{ animationDelay: "1s" }}
      >
        <Key className="h-4 w-4 text-red-400" />
        <div>
          <div className="text-white/80 font-medium">Secret detected</div>
          <div className="text-white/40 text-[10px]">sk-proj-...</div>
        </div>
      </motion.div>
    </div>
  );
}
