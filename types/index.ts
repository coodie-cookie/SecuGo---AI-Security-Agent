export type Severity = "critical" | "high" | "medium" | "low";

export type RiskLevel = "safe" | "low" | "medium" | "high" | "critical";

export type ScanStatus = "idle" | "queued" | "scanning" | "complete" | "failed";

export interface Repository {
  id: string;
  name: string;
  fullName: string;
  description?: string;
  visibility: "public" | "private";
  language?: string;
  stars: number;
  updatedAt: string;
  riskLevel: RiskLevel;
  scanStatus: ScanStatus;
  lastScanAt?: string;
  vulnerabilityCount: number;
}

export interface Vulnerability {
  id: string;
  repositoryId: string;
  scanId: string;
  title: string;
  severity: Severity;
  category:
    | "secret"
    | "dependency"
    | "config"
    | "auth"
    | "injection"
    | "exposure";
  file: string;
  line?: number;
  description: string;
  aiExplanation: string;
  suggestedFix: string;
  codeSnippet?: string;
  fixedSnippet?: string;
  detectedAt: string;
  status: "open" | "resolved" | "ignored";
}

export interface Scan {
  id: string;
  repositoryId: string;
  startedAt: string;
  completedAt?: string;
  status: ScanStatus;
  vulnerabilityCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  filesScanned: number;
  duration?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface User {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  githubUsername?: string;
  onboardingComplete: boolean;
}
