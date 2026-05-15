"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  GitBranch,
  Globe,
  Lock,
  Loader2,
  ScanSearch,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "./severity-pill";
import { formatRelativeTime } from "@/lib/utils";
import { calcRepoScore, scoreColor, scoreLabel } from "@/lib/score";
import type { Repository } from "@/types";

function ScoreRing({ score }: { score: number }) {
  const size = 44;
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color = scoreColor(score);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={5} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth={5} strokeLinecap="round" fill="none"
          strokeDasharray={c} strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 4px ${color}88)`, transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <span className="absolute text-[10px] font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

export function RepositoryCard({
  repo,
  scanning,
  hasUpdate,
  onScan,
  index = 0,
}: {
  repo: Repository;
  scanning?: boolean;
  hasUpdate?: boolean;
  onScan?: () => void;
  index?: number;
}) {
  const score = calcRepoScore(repo.riskLevel, repo.vulnerabilityCount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-sm hover:border-white/[0.12] hover:bg-white/[0.035] transition-all overflow-hidden"
    >
      {/* Scan animation overlay */}
      {scanning && (
        <div aria-hidden className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
          <div className="absolute inset-x-0 h-1/2 bg-gradient-to-b from-lime-400/[0.08] via-lime-400/[0.02] to-transparent animate-scan" />
        </div>
      )}

      {/* Update detected banner */}
      <AnimatePresence>
        {hasUpdate && !scanning && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute inset-x-0 top-0 flex items-center justify-center gap-2 bg-gradient-to-r from-lime-400/20 via-lime-400/30 to-lime-400/20 border-b border-lime-400/30 py-1.5 px-3 z-10"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-lime-400 animate-pulse" />
            <span className="text-[11px] font-medium text-lime-300">
              Repo update detected — scan now
            </span>
            <Bell className="h-3 w-3 text-lime-400" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`relative ${hasUpdate && !scanning ? "pt-5" : ""}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <GitBranch className="h-3 w-3" />
              <span className="truncate">{repo.fullName}</span>
            </div>
            <div className="mt-1.5 text-base font-semibold tracking-tight truncate">
              {repo.name}
            </div>
          </div>

          {/* Score ring */}
          <div className="flex flex-col items-center shrink-0">
            <ScoreRing score={score} />
            <span className="text-[9px] text-white/35 mt-0.5">{scoreLabel(score)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-1.5">
          <Badge variant="outline" className="shrink-0 capitalize text-[10px] px-1.5 py-0">
            {repo.visibility === "private" ? <Lock className="h-2.5 w-2.5" /> : <Globe className="h-2.5 w-2.5" />}
            {repo.visibility}
          </Badge>
          <RiskBadge risk={repo.riskLevel} />
        </div>

        <p className="mt-2 text-sm text-white/50 line-clamp-1 min-h-[1.25rem]">
          {repo.description ?? "No description"}
        </p>

        <div className="mt-3 flex items-center gap-3 text-xs text-white/45">
          {repo.language && (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-lime-400/70" />
              {repo.language}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Star className="h-3 w-3" />
            {repo.stars}
          </span>
          {repo.lastScanAt && (
            <span>scanned {formatRelativeTime(repo.lastScanAt)}</span>
          )}
        </div>

        <div className="mt-4">
          <Button
            size="sm"
            variant={hasUpdate ? "default" : scanning ? "secondary" : "outline"}
            onClick={onScan}
            disabled={scanning}
            className="w-full"
          >
            {scanning ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" />Scanning...</>
            ) : (
              <><ScanSearch className="h-3.5 w-3.5" />{hasUpdate ? "Scan update" : "Scan repository"}</>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
