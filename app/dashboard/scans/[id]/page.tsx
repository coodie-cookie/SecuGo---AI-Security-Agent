"use client";

import { use, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertOctagon, ArrowLeft, CheckCircle2, Clock, FileCode2, Loader2, Mail, RefreshCw, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { VulnerabilityCard } from "@/components/dashboard/vulnerability-card";
import { FixPromptModal } from "@/components/dashboard/fix-prompt-modal";
import { useRealtimeScan } from "@/hooks/use-realtime-scans";
import { useRealtimeVulns } from "@/hooks/use-realtime-vulns";
import { useRealtimeRepos } from "@/hooks/use-realtime-repos";
import { createClient } from "@/lib/supabase/client";
import { generateFixPrompt } from "@/lib/fix-prompt";
import { formatRelativeTime } from "@/lib/utils";

export default function ScanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { scan, loading: scanLoading } = useRealtimeScan(id);
  const { vulns, loading: vulnsLoading } = useRealtimeVulns(id);
  const { repos } = useRealtimeRepos();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [promptOpen, setPromptOpen] = useState(false);

  const repo = repos.find((r) => r.id === scan?.repositoryId);
  const loading = scanLoading || vulnsLoading;
  const isScanning = scan?.status === "scanning";

  const sendReport = async () => {
    if (!scan || !repo) return;
    setSending(true);
    setSendError(null);
    try {
      const supabase = createClient();
      const email = supabase ? (await supabase.auth.getUser()).data.user?.email : null;
      if (!email) throw new Error("Could not get your email address.");
      const res = await fetch("/api/email/scan-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, scan, repo, vulnerabilities: vulns }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send");
      setSent(true);
    } catch (e: any) {
      setSendError(e.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-7">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <div className="grid grid-cols-4 gap-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
      </div>
    );
  }

  if (!scan) return <div className="text-white/50 p-8">Scan not found.</div>;

  return (
    <div className="space-y-7">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/dashboard/scans" className="inline-flex items-center gap-1.5 text-sm text-white/55 hover:text-white transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" />All scans
        </Link>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="text-xs text-white/45 font-mono">{repo?.fullName ?? "Repository"}</div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-balance">
              <span className="text-gradient-subtle">
                {isScanning
                  ? "Scanning in progress..."
                  : `${scan.vulnerabilityCount} issue${scan.vulnerabilityCount === 1 ? "" : "s"} across ${scan.filesScanned} files`
                }
              </span>
            </h1>
            <div className="mt-2 flex items-center gap-3 text-xs text-white/45">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {isScanning ? "Running now..." : `Completed ${formatRelativeTime(scan.completedAt ?? scan.startedAt)}`}
              </span>
              {scan.duration && <><span>·</span><span>Took {scan.duration}s</span></>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {!isScanning && vulns.length > 0 && (
              <Button
                variant="default"
                onClick={() => setPromptOpen(true)}
                className="bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-300 hover:to-lime-400"
              >
                <Wand2 className="h-4 w-4" />
                Copy AI fix prompt
              </Button>
            )}
            {!isScanning && (
              sent
                ? <div className="inline-flex items-center gap-2 text-sm text-lime-300 px-3 py-2 rounded-xl border border-lime-400/20 bg-lime-400/[0.04]">
                    <CheckCircle2 className="h-4 w-4" />Report sent!
                  </div>
                : <Button variant="secondary" onClick={sendReport} disabled={sending || isScanning}>
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                    {sending ? "Sending..." : "Email PDF report"}
                  </Button>
            )}
          </div>
        </div>
        {sendError && <p className="mt-2 text-xs text-red-300">{sendError}</p>}
      </motion.div>

      {/* Live log during scan */}
      {isScanning && scan.log && scan.log.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-xl border border-white/[0.06] bg-black/60 p-4 font-mono text-[12px] leading-6 max-h-48 overflow-y-auto">
          {scan.log.map((line, i) => (
            <div key={i} className={line.startsWith("✓") ? "text-lime-300" : line.includes("issue") ? "text-yellow-300" : "text-white/60"}>
              {line}
            </div>
          ))}
          <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }}
            className="inline-block w-2 h-3.5 bg-lime-300 align-middle" />
        </motion.div>
      )}

      {/* Severity tiles */}
      {!isScanning && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SevTile n={scan.criticalCount} label="Critical" variant="critical" icon={AlertOctagon} />
          <SevTile n={scan.highCount} label="High" variant="high" />
          <SevTile n={scan.mediumCount} label="Medium" variant="medium" />
          <SevTile n={scan.lowCount} label="Low" variant="low" />
        </motion.div>
      )}

      {/* Vulnerabilities */}
      <div className="space-y-2.5">
        {!isScanning && <div className="text-xs uppercase tracking-wider text-white/40 mb-1">Findings</div>}
        {vulnsLoading && [1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        {!vulnsLoading && vulns.map((v, i) => <VulnerabilityCard key={v.id} v={v} index={i} />)}
        {!vulnsLoading && !isScanning && vulns.length === 0 && (
          <div className="rounded-2xl border border-lime-400/20 bg-lime-400/[0.04] p-12 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-lime-300" />
            <div className="mt-4 text-base font-medium">All clear</div>
            <p className="mt-1 text-sm text-white/55 max-w-sm mx-auto">No issues detected. Keep shipping!</p>
          </div>
        )}
      </div>

      {scan && repo && (
        <FixPromptModal
          open={promptOpen}
          onClose={() => setPromptOpen(false)}
          prompt={generateFixPrompt(scan, repo, vulns, false)}
          concisePrompt={generateFixPrompt(scan, repo, vulns, true)}
          issueCount={vulns.length}
          repoName={repo.fullName}
        />
      )}
    </div>
  );
}

function SevTile({ n, label, variant, icon: Icon = FileCode2 }: {
  n: number; label: string; variant: "critical"|"high"|"medium"|"low"; icon?: any;
}) {
  const ring = { critical: "border-red-500/20", high: "border-orange-500/20", medium: "border-yellow-500/20", low: "border-blue-500/20" }[variant];
  return (
    <div className={`rounded-2xl border ${ring} bg-white/[0.02] p-5 backdrop-blur-sm`}>
      <div className="flex items-center justify-between text-xs text-white/45">
        <span className="uppercase tracking-wider">{label}</span>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <div className="text-3xl font-semibold tracking-tight">{n}</div>
        <Badge variant={variant} className="opacity-80">{variant}</Badge>
      </div>
    </div>
  );
}
