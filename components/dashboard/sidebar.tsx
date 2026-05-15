"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  GitBranch,
  LayoutDashboard,
  ScanSearch,
  Settings,
  Plus,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/repositories", label: "Repositories", icon: GitBranch },
  { href: "/dashboard/scans", label: "Scans", icon: ScanSearch },
  { href: "/dashboard/assistant", label: "AI Assistant", icon: Bot },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-white/[0.06] bg-black/30 backdrop-blur-xl">
      <div className="px-5 pt-5 pb-4">
        <Link href="/dashboard">
          <Logo size="sm" />
        </Link>
      </div>

      <div className="px-3">
        <Button asChild size="sm" className="w-full justify-start">
          <Link href="/dashboard/repositories">
            <Plus className="h-4 w-4" />
            Connect repository
          </Link>
        </Button>
      </div>

      <nav className="mt-6 px-3 space-y-0.5 flex-1">
        <div className="px-2 mb-2 text-[11px] uppercase tracking-wider text-white/30">
          Workspace
        </div>
        {items.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-all relative",
                active
                  ? "bg-white/[0.05] text-white"
                  : "text-white/55 hover:text-white hover:bg-white/[0.03]"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  active ? "text-lime-300" : "text-white/40 group-hover:text-white/70"
                )}
              />
              {item.label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(107,249,0,0.6)]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-2xl border border-lime-400/15 bg-gradient-to-b from-lime-400/[0.04] to-transparent p-4">
        <div className="text-xs text-lime-300 font-medium">Public beta</div>
        <p className="mt-1 text-xs text-white/55 leading-relaxed">
          Free for indie hackers and startups under 10 people.
        </p>
        <Button size="sm" variant="outline" className="mt-3 w-full">
          Upgrade later
        </Button>
      </div>
    </aside>
  );
}
