import { Badge } from "@/components/ui/badge";
import type { Severity, RiskLevel } from "@/types";

const sevLabels: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return <Badge variant={severity}>{sevLabels[severity]}</Badge>;
}

const riskMap: Record<RiskLevel, { label: string; variant: any }> = {
  safe: { label: "Safe", variant: "safe" },
  low: { label: "Low risk", variant: "low" },
  medium: { label: "Medium risk", variant: "medium" },
  high: { label: "High risk", variant: "high" },
  critical: { label: "Critical risk", variant: "critical" },
};

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const { label, variant } = riskMap[risk];
  return <Badge variant={variant}>{label}</Badge>;
}
