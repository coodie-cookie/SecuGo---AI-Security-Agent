"use client";

import { Bell, Command, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function Topbar({ email }: { email?: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/[0.06] bg-black/40 backdrop-blur-xl px-4 md:px-6">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-lime-300/80 transition-colors" />
          <input
            placeholder="Search repos, vulnerabilities, files..."
            className="h-10 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] pl-10 pr-16 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-lime-400/30 focus:bg-white/[0.04] transition-all"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 rounded-md border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-white/40">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(107,249,0,0.7)]" />
        </Button>
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
