import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-white/10 bg-white/[0.04] text-white/80",
        critical:
          "border-red-500/25 bg-red-500/10 text-red-300 shadow-[0_0_12px_-2px_rgba(239,68,68,0.4)]",
        high: "border-orange-500/25 bg-orange-500/10 text-orange-300",
        medium: "border-yellow-500/25 bg-yellow-500/10 text-yellow-300",
        low: "border-blue-500/25 bg-blue-500/10 text-blue-300",
        safe: "border-lime-400/30 bg-lime-400/10 text-lime-300 shadow-[0_0_12px_-2px_rgba(107,249,0,0.4)] dark:border-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300",
        outline: "border-white/15 bg-transparent text-white/70",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
