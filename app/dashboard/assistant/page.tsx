"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Bot, Loader2, RotateCcw, Send, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "@/components/dashboard/chat-provider";
import type { ChatMessage } from "@/types";

const suggestions = [
  "How do I scan my repo with SecuGo?",
  "What's an exposed secret?",
  "How does CORS work?",
  "Is my Stripe webhook safe?",
  "What does RLS mean?",
];

export default function AssistantPage() {
  const { messages, thinking, send, clear } = useChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, thinking]);

  const handleSend = (text?: string) => {
    const t = text ?? input;
    setInput("");
    send(t);
  };

  return (
    <div className="space-y-5 h-[calc(100vh-8rem)] flex flex-col">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-lime-300/80">
              <Sparkles className="h-3 w-3" />
              AI security assistant
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              <span className="text-gradient-subtle">
                Ask anything about your security.
              </span>
            </h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clear}
            className="text-white/40 hover:text-white/70"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear chat
          </Button>
        </div>
      </motion.div>

      <div className="flex-1 min-h-0 grid lg:grid-cols-[1fr_280px] gap-3">
        {/* Chat */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm flex flex-col min-h-0">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-5">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <Bubble key={m.id} m={m} />
              ))}
              {thinking && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-lime-400 to-lime-700 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-black" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-lime-400/[0.04] border border-lime-400/15 px-4 py-3 inline-flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-lime-300" />
                    <span className="text-sm text-white/65">Thinking...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input */}
          <div className="border-t border-white/[0.05] p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-end gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] p-2 focus-within:border-lime-400/30 transition-colors"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                placeholder="Ask about a vulnerability, paste a snippet, or just say hi..."
                className="flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none max-h-32"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || thinking}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Suggestions */}
        <aside className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5 space-y-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-white/40">
              Try asking
            </div>
            <div className="mt-3 space-y-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  disabled={thinking}
                  className="group w-full text-left rounded-xl border border-white/[0.06] bg-white/[0.01] p-3 text-sm text-white/75 hover:bg-white/[0.04] hover:border-lime-400/20 transition-all disabled:opacity-50"
                >
                  <span className="flex items-center justify-between gap-2">
                    {s}
                    <ArrowRight className="h-3.5 w-3.5 text-white/30 group-hover:text-lime-300 transition-colors" />
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-lime-400/15 bg-lime-400/[0.04] p-4">
            <div className="text-xs text-lime-300 font-medium mb-1.5">
              Chat is saved
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              Your conversation stays here as you navigate around the dashboard.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Bubble({ m }: { m: ChatMessage }) {
  const isUser = m.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center ${
          isUser
            ? "bg-white/[0.05] border border-white/10"
            : "bg-gradient-to-br from-lime-400 to-lime-700 shadow-[0_0_18px_-4px_rgba(107,249,0,0.5)]"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-white/70" />
        ) : (
          <Bot className="h-4 w-4 text-black" />
        )}
      </div>
      <div
        className={`max-w-[78%] px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "rounded-2xl rounded-tr-sm bg-white/[0.05] border border-white/10 text-white"
            : "rounded-2xl rounded-tl-sm bg-lime-400/[0.04] border border-lime-400/15 text-white/85"
        }`}
      >
        {m.content}
      </div>
    </motion.div>
  );
}
