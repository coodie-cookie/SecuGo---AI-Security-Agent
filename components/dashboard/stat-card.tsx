"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  accent = "default",
  index = 0,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  accent?: "default" | "danger" | "warning" | "success";
  index?: number;
}) {
  const accentClasses = {
    default: "text-white/70 bg-white/[0.04] border-white/[0.06]",
    danger: "text-red-300 bg-red-500/10 border-red-500/20",
    warning: "text-orange-300 bg-orange-500/10 border-orange-500/20",
    success: "text-lime-300 bg-lime-400/10 border-lime-400/25",
  }[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-white/[0.12] hover:bg-white/[0.035] transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="text-xs text-white/45">{label}</div>
        <div
          className={cn(
            "h-8 w-8 rounded-lg border flex items-center justify-center",
            accentClasses
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-4 text-3xl font-semibold tracking-tight">{value}</div>
      {trend && (
        <div className="mt-2 text-xs text-white/40">{trend}</div>
      )}
    </motion.div>
  );
}
