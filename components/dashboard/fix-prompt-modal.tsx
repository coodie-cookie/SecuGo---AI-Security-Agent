"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Copy,
  Sparkles,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function FixPromptModal({
  open,
  onClose,
  prompt,
  concisePrompt,
  issueCount,
  repoName,
}: {
  open: boolean;
  onClose: () => void;
  prompt: string;
  concisePrompt: string;
  issueCount: number;
  repoName: string;
}) {
  const [copied, setCopied] = useState(false);
  const [concise, setConcise] = useState(false);

  const activePrompt = concise ? concisePrompt : prompt;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(activePrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {}
  };

  // Esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-3xl flex flex-col max-h-[88vh] rounded-2xl border border-white/[0.08] bg-[#0a0a0a]/95 backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
              {/* Header */}
              <div className="flex items-start justify-between p-5 border-b border-white/[0.06] shrink-0">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center shrink-0 shadow-[0_0_24px_-6px_rgba(107,249,0,0.5)]">
                    <Wand2 className="h-5 w-5 text-lime-300" />
                  </div>
                  <div>
                    <div className="text-sm font-medium flex items-center gap-2">
                      AI fix prompt
                      <span className="inline-flex items-center gap-1 rounded-full border border-lime-400/20 bg-lime-400/[0.06] px-2 py-0.5 text-[10px] text-lime-300">
                        <Sparkles className="h-2.5 w-2.5" />
                        Works with any AI
                      </span>
                    </div>
                    <div className="text-xs text-white/45 mt-1 max-w-md">
                      Copy this prompt and paste it into Claude, ChatGPT, Cursor, Copilot, or any AI coding assistant — it will fix all {issueCount} issue{issueCount === 1 ? "" : "s"} in <span className="font-mono text-white/65">{repoName}</span> in one go.
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/40 hover:text-white p-2 transition-colors shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Prompt body */}
              <div className="flex-1 overflow-y-auto p-5">
                <div className="relative rounded-xl border border-white/[0.06] bg-black/60">
                  <pre className="p-5 text-[12px] font-mono leading-6 text-white/75 whitespace-pre-wrap break-words overflow-x-hidden">
                    {activePrompt}
                  </pre>
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex items-center justify-between gap-2 p-5 border-t border-white/[0.06] shrink-0">
                <div className="text-[11px] text-white/40">
                  Works in Claude, Cursor, Codex, GitHub Copilot Chat
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setConcise((c) => !c)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                      concise
                        ? "border-lime-400/30 bg-lime-400/10 text-lime-300"
                        : "border-white/[0.08] bg-white/[0.03] text-white/55 hover:text-white hover:border-white/15"
                    }`}
                  >
                    <Zap className="h-3.5 w-3.5" />
                    To the point
                    <span className={`h-1.5 w-1.5 rounded-full ${concise ? "bg-lime-400" : "bg-white/20"}`} />
                  </button>
                  <Button onClick={copy} size="sm">
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy prompt
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
