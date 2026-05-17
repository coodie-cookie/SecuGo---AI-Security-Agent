"use client";

import { Zap } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";

export function Topbar({ email }: { email?: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/[0.06] bg-black/40 backdrop-blur-xl px-4 md:px-6">
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.06] bg-white/[0.02] pl-3 pr-4 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-lime-400 animate-ping opacity-60" />
            <span className="relative rounded-full h-2 w-2 bg-lime-400 shadow-[0_0_8px_rgba(107,249,0,0.7)]" />
          </span>
          <span className="text-xs text-white/65 font-medium">All systems operational</span>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-1 min-w-0">
        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#6bf900]/10 border border-[#6bf900]/30 text-[#6bf900] text-[10px] font-mono tracking-widest uppercase mx-2">
          <Zap className="h-2.5 w-2.5" />
          Builder +
        </span>
        <ThemeToggle />
        <div className="ml-2 flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.02] pl-1 pr-3 py-1">
          <Avatar className="h-7 w-7">
            <AvatarFallback>
              {(email?.[0] ?? "i").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-white/70 hidden sm:inline">
            {email ?? "indie-hacker"}
          </span>
        </div>
      </div>
    </header>
  );
}
