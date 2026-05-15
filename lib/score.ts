import type { RiskLevel } from "@/types";

// Per-repo score based on risk level and vulnerability count
export function calcRepoScore(
  riskLevel: RiskLevel,
  vulnerabilityCount: number
): number {
  if (vulnerabilityCount === 0) return 100;
  const base: Record<RiskLevel, number> = {
    safe: 100,
    low: 82,
    medium: 63,
    high: 38,
    critical: 12,
  };
  // Small deduction for every additional issue beyond the first
  const extra = Math.min(20, Math.floor((vulnerabilityCount - 1) * 2));
  return Math.max(0, base[riskLevel] - extra);
}

export function scoreColor(score: number): string {
  if (score >= 85) return "#6bf900";
  if (score >= 65) return "#facc15";
  if (score >= 40) return "#fb923c";
  return "#f87171";
}

export function scoreLabel(score: number): string {
  if (score >= 85) return "Good";
  if (score >= 65) return "Fair";
  if (score >= 40) return "Poor";
  return "Critical";
}
