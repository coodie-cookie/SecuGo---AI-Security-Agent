"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  const { theme, toggle, mounted } = useTheme();
  const isDark = theme === "dark";
  const dim = size === "sm" ? "h-8 w-8" : "h-9 w-9";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={cn(
        "relative inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70",
        "hover:bg-white/[0.08] hover:text-white hover:border-lime-400/30 transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/30",
        dim,
        className
      )}
    >
      <Sun className={cn("h-4 w-4 absolute transition-all", mounted && !isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75")} />
      <Moon className={cn("h-4 w-4 absolute transition-all", mounted && isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-75")} />
    </button>
  );
}
