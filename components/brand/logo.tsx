"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";

const sizes = {
  sm: { img: 28, text: "text-base" },
  md: { img: 36, text: "text-lg" },
  lg: { img: 44, text: "text-2xl" },
};

export function Logo({
  className,
  showText = true,
  size = "md",
}: {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const { theme, mounted } = useTheme();
  const { img, text } = sizes[size];

  // Dark mode → white logo, Light mode → original logo
  const src = mounted && theme === "light" ? "/logo.svg" : "/secugo logo white.svg";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image
        src={src}
        alt="SecuGo"
        width={img}
        height={img}
        className="shrink-0"
        priority
      />
      {showText && (
        <span className={cn("font-semibold tracking-tight text-foreground", text)}>
          SecuGo
        </span>
      )}
    </div>
  );
}
