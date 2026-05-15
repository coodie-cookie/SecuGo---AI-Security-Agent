"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertOctagon, ArrowUpRight, Bot, Clock, GitBranch, Plus, ScanSearch, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { SecurityScoreRing } from "@/components/dashboard/security-score";
import { useRealtimeRepos } from "@/hooks/use-realtime-repos";
import { useRealtimeScans } from "@/hooks/use-realtime-scans";
import { useRealtimeRecentVulns } from "@/hooks/use-realtime-vulns";
import { SeverityBadge, RiskBadge } from "@/components/dashboard/severity-pill";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/utils";
import { calcRepoScore, scoreColor, scoreLabel } from "@/lib/score";

function scoreFromRepos(repos: any[]) {
  if (repos.length === 0) return 100;
  const scanned = repos.filter((r) => r.scanStatus === "complete");
  if (scanned.length === 0) return 100;
  const penalty = { critical: 25, high: 12, medium: 5, low: 2 };
  let deductions = 0;
  for (const r of scanned) {
    if (r.riskLevel === "critical") deductions += penalty.critical;
    else if (r.riskLevel === "high") deductions += penalty.high;
    else if (r.riskLevel === "medium") deductions += penalty.medium;
    else if (r.riskLevel === "low") deductions += penalty.low;
  }
  return Math.max(0, Math.min(100, 100 - Math.round(deductions / scanned.length)));
}

export default function DashboardPage() {
  const { repos, loading: reposLoading } = useRealtimeRepos();
  const { scans, loading: scansLoading } = useRealtimeScans();
  const recentVulns = useRealtimeRecentVulns(4);
  const loading = reposLoading || scansLoading;

  const totalRepos = repos.length;
  const totalVulns = repos.reduce((a, r) => a + r.vulnerabilityCount, 0);
  const criticalRepos = repos.filter((r) => r.riskLevel === "critical").length;
  const lastScan = repos.map((r) => r.lastScanAt).filter(Boolean).sort().pop();
  const score = scoreFromRepos(repos);
  const topRepos = [...repos].sort((a, b) => b.vulnerabilityCount - a.vulnerabilityCount).slice(0, 4);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-xs text-lime-300/80 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" />Welcome back
          </div>
          <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">
            <span className="text-gradient-subtle">Here's how your code is doing.</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link href="/dashboard/assistant"><Bot className="h-4 w-4" />Ask the assistant</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/repositories"><Plus className="h-4 w-4" />Scan a repo</Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loading
          ? [1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)
          : <>
              <StatCard icon={GitBranch} label="Repositories" value={totalRepos} trend={`${repos.filter(r => r.scanStatus === "complete").length} scanned`} index={0} />
              <StatCard icon={ShieldAlert} label="Vulnerabilities" value={totalVulns} trend="across all repos" accent="warning" index={1} />
              <StatCard icon={AlertOctagon} label="Critical repos" value={criticalRepos} trend={criticalRepos > 0 ? "Needs attention" : "All clear"} accent={criticalRepos > 0 ? "danger" : "success"} index={2} />
              <StatCard icon={Clock} label="Last scan" value={lastScan ? formatRelativeTime(lastScan) : "Never"} trend={`${scans.length} total scans`} accent="success" index={3} />
            </>
        }
      </div>

      {/* Score + recent findings */}
      <div className="grid lg:grid-cols-3 gap-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
          className="lg:col-span-1 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm flex flex-col items-center justify-center">
          <SecurityScoreRing score={loading ? 0 : score} />
          <div className="mt-5 text-center">
            <div className="text-sm text-white/75">Average across {totalRepos} repo{totalRepos !== 1 ? "s" : ""}</div>
            <div className="mt-1 inline-flex items-center gap-1 text-xs text-lime-300">
              <TrendingUp className="h-3 w-3" />
              {score >= 85 ? "Excellent security posture" : score >= 60 ? "Some issues to fix" : "Needs attention"}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }}
          className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/[0.05]">
            <div>
              <div className="text-base font-medium">Recent findings</div>
              <div className="text-xs text-white/45 mt-0.5">Issues your last scans uncovered</div>
            </div>
            <Link href="/dashboard/scans" className="text-xs text-lime-300 hover:text-lime-200 inline-flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {recentVulns.length === 0
            ? <div className="p-8 text-center text-sm text-white/40">
                {loading ? "Loading..." : "No vulnerabilities found yet. Scan a repo to see results here."}
              </div>
            : <ul className="divide-y divide-white/[0.04]">
                {recentVulns.map((v) => (
                  <li key={v.id}>
                    <Link href={`/dashboard/scans/${v.scanId}`}
                      className="flex items-center gap-3 p-4 hover:bg-white/[0.03] transition-colors">
                      <div className="h-9 w-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                        <ScanSearch className="h-4 w-4 text-white/60" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{v.title}</div>
                        <div className="text-xs text-white/45 truncate font-mono">{v.file}</div>
                      </div>
                      <SeverityBadge severity={v.severity} />
                    </Link>
                  </li>
                ))}
              </ul>
          }
        </motion.div>
      </div>

      {/* Top repos */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.6 }}
        className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/[0.05]">
          <div>
            <div className="text-base font-medium">Top risk repositories</div>
            <div className="text-xs text-white/45 mt-0.5">Sorted by vulnerability count</div>
          </div>
          <Link href="/dashboard/repositories" className="text-xs text-lime-300 hover:text-lime-200 inline-flex items-center gap-1">
            All repos <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        {topRepos.length === 0
          ? <div className="p-8 text-center text-sm text-white/40">
              {loading ? "Loading..." : <Link href="/dashboard/repositories" className="text-lime-300 hover:underline">Connect and scan a repository</Link>}
            </div>
          : <ul className="divide-y divide-white/[0.04]">
              {topRepos.map((r) => {
                const score = calcRepoScore(r.riskLevel, r.vulnerabilityCount);
                const color = scoreColor(score);
                return (
                  <li key={r.id}>
                    <Link href="/dashboard/repositories"
                      className="grid grid-cols-[1fr_auto_auto_auto] md:grid-cols-[2fr_1fr_auto_auto_auto] items-center gap-3 p-4 hover:bg-white/[0.03] transition-colors">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{r.fullName}</div>
                        <div className="text-xs text-white/40 truncate">{r.description}</div>
                      </div>
                      <div className="hidden md:block text-xs text-white/50">{r.language}</div>
                      <div className="text-xs text-white/55 whitespace-nowrap">{r.vulnerabilityCount} issues</div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold" style={{ color }}>{score}</span>
                        <span className="text-[10px] text-white/35 hidden md:block">{scoreLabel(score)}</span>
                      </div>
                      <RiskBadge risk={r.riskLevel} />
                    </Link>
                  </li>
                );
              })}
            </ul>
        }
      </motion.div>
    </div>
  );
}
