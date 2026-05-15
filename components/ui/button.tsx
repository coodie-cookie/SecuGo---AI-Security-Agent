"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-lime-400 text-black shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_24px_-8px_rgba(107,249,0,0.6)] hover:bg-lime-300 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_32px_-8px_rgba(107,249,0,0.8)] active:scale-[0.98]",
        secondary:
          "bg-white/[0.04] text-white border border-white/10 hover:bg-white/[0.08] hover:border-white/15 active:scale-[0.98]",
        ghost: "text-white/70 hover:bg-white/[0.04] hover:text-white",
        outline:
          "border border-white/10 bg-transparent text-white hover:bg-white/[0.04] hover:border-lime-400/40",
        destructive:
          "bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20",
        link: "text-lime-400 underline-offset-4 hover:underline px-0",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
