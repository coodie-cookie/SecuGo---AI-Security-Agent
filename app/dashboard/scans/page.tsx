"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertOctagon, CheckCircle2, ChevronRight, Loader2, ScanSearch, Timer } from "lucide-react";
import { useRealtimeScans } from "@/hooks/use-realtime-scans";
import { useRealtimeRepos } from "@/hooks/use-realtime-repos";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/utils";

export default function ScansPage() {
  const { scans, loading: scansLoading } = useRealtimeScans();
  const { repos, loading: reposLoading } = useRealtimeRepos();
  const loading = scansLoading || reposLoading;

  const sorted = [...scans].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );

  return (
    <div className="space-y-7">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-semibold tracking-tight">Scans</h1>
        <p className="mt-1 text-sm text-white/50">History of every security sweep across your repositories</p>
      </motion.div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
        {loading && (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        )}

        {!loading && sorted.length === 0 && (
          <div className="p-12 text-center">
            <ScanSearch className="mx-auto h-10 w-10 text-white/20" />
            <div className="mt-4 text-base font-medium">No scans yet</div>
            <p className="mt-1 text-sm text-white/45">
              Go to <Link href="/dashboard/repositories" className="text-lime-300 hover:underline">Repositories</Link> and scan a repo to see results here.
            </p>
          </div>
        )}

        <ul className="divide-y divide-white/[0.04]">
          {sorted.map((s, i) => {
            const repo = repos.find((r) => r.id === s.repositoryId);
            const isScanning = s.status === "scanning";
            return (
              <motion.li
                key={s.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
              >
                <Link
                  href={`/dashboard/scans/${s.id}`}
                  className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_2fr_1fr_auto_auto] items-center gap-4 p-5 hover:bg-white/[0.03] transition-colors group"
                >
                  <div className="h-10 w-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                    {isScanning
                      ? <Loader2 className="h-5 w-5 text-lime-300 animate-spin" />
                      : s.status === "complete"
                      ? <CheckCircle2 className="h-5 w-5 text-lime-300" />
                      : <ScanSearch className="h-5 w-5 text-white/60" />
                    }
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{repo?.fullName ?? "Repository"}</div>
                    <div className="text-xs text-white/45 mt-0.5">
                      {isScanning
                        ? "Scanning in progress..."
                        : `${formatRelativeTime(s.startedAt)} · ${s.filesScanned} files${s.duration ? ` · ${s.duration}s` : ""}`
                      }
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-2 flex-wrap">
                    {isScanning && <Badge variant="default" className="border-lime-400/30 text-lime-300"><Loader2 className="h-3 w-3 animate-spin" />Scanning</Badge>}
                    {s.criticalCount > 0 && <Badge variant="critical"><AlertOctagon className="h-3 w-3" />{s.criticalCount} critical</Badge>}
                    {s.highCount > 0 && <Badge variant="high">{s.highCount} high</Badge>}
                    {s.mediumCount > 0 && <Badge variant="medium">{s.mediumCount} med</Badge>}
                    {s.status === "complete" && s.vulnerabilityCount === 0 && <Badge variant="safe"><CheckCircle2 className="h-3 w-3" />Clean</Badge>}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-white/55 whitespace-nowrap">
                    <Timer className="h-3.5 w-3.5" />
                    {isScanning ? "running" : `${s.vulnerabilityCount} issue${s.vulnerabilityCount === 1 ? "" : "s"}`}
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-lime-300 transition-colors" />
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
