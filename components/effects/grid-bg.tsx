import { cn } from "@/lib/utils";

export function GridBackground({
  className,
  fade = true,
}: {
  className?: string;
  fade?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute inset-0 grid-bg pointer-events-none",
        fade && "mask-radial",
        className
      )}
    />
  );
}

export function RadialGlow({
  className,
  color = "rgba(107,249,0,0.18)",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        background: `radial-gradient(60% 50% at 50% 0%, ${color}, transparent 70%)`,
      }}
    />
  );
}
