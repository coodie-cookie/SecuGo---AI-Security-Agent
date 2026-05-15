"use client";

import { motion } from "framer-motion";
import { Sparkles, User, Wrench } from "lucide-react";

export function OnboardingSlide3() {
  return (
    <div className="relative h-full w-full flex items-center justify-center">
      <div className="w-full max-w-md space-y-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-start gap-3 justify-end"
        >
          <div className="rounded-2xl rounded-tr-sm bg-white/[0.05] border border-white/[0.08] p-3.5 max-w-[85%]">
            <div className="text-sm text-white/85">
              What does this CORS warning even mean?
            </div>
          </div>
          <div className="h-9 w-9 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center">
            <User className="h-4 w-4 text-white/60" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex items-start gap-3"
        >
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-lime-400 to-lime-700 flex items-center justify-center shadow-[0_0_18px_-4px_rgba(107,249,0,0.6)]">
            <Sparkles className="h-4 w-4 text-black" />
          </div>
          <div className="rounded-2xl rounded-tl-sm bg-lime-400/[0.04] border border-lime-400/20 p-3.5 max-w-[85%]">
            <div className="text-sm text-white/85 leading-relaxed">
              Think of CORS like a bouncer at a club. Right now, your bouncer
              is letting{" "}
              <span className="text-lime-300">anyone</span> in — that's the
              wildcard <span className="font-mono text-xs">*</span>. Want me to
              show you a safer version?
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          className="ml-12 rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-md overflow-hidden"
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.05] text-[11px] text-white/40">
            <span className="font-mono">next.config.mjs</span>
            <span className="flex items-center gap-1.5 text-lime-300">
              <Wrench className="h-3 w-3" />
              suggested fix
            </span>
          </div>
          <pre className="p-3 text-[11px] font-mono leading-5 text-white/70 overflow-x-auto">
            <span className="text-red-300/80">{"- Allow-Origin: *\n"}</span>
            <span className="text-lime-300">
              {"+ Allow-Origin: https://yourapp.com"}
            </span>
          </pre>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.6, duration: 0.5 }}
          className="ml-12 inline-flex items-center gap-2 text-xs text-lime-300/90"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-lime-400 animate-pulse" />
          AI assistant typing...
        </motion.div>
      </div>
    </div>
  );
}
