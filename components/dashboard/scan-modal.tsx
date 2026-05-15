"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertOctagon, CheckCircle2, Loader2, ScanSearch, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/client";
import type { Repository } from "@/types";

type ScanState = "idle" | "scanning" | "complete" | "failed";

export function ScanModal({
  repo,
  open,
  onClose,
}: {
  repo: Repository | null;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [state, setState] = useState<ScanState>("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [scanId, setScanId] = useState<string | null>(null);
  const [result, setResult] = useState<{ vulnerabilityCount: number; criticalCount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  // Scroll logs to bottom
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  // Subscribe to scan log updates via Supabase Realtime
  const subscribeToScan = (id: string) => {
    const supabase = createClient();
    if (!supabase) return;

    channelRef.current = supabase
      .channel(`scan-modal-${id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "scans", filter: `id=eq.${id}` },
        (payload) => {
          const row = payload.new;
          if (row.log && Array.isArray(row.log)) {
            setLogs(row.log);
            // Estimate progress from log length
            const logLen = row.log.length;
            setProgress(Math.min(95, logLen * 8));
          }
          if (row.status === "complete") {
            setProgress(100);
            setState("complete");
            setResult({
              vulnerabilityCount: row.vulnerability_count,
              criticalCount: row.critical_count,
            });
          }
          if (row.status === "failed") {
            setState("failed");
            setError("Scan failed. Check your GitHub token or try again.");
          }
        }
      )
      .subscribe();
  };

  const startScan = async () => {
    if (!repo) return;
    setState("scanning");
    setLogs([]);
    setProgress(5);
    setError(null);
    setResult(null);

    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Supabase not configured");

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.provider_token) {
        throw new Error("GitHub token not available. Please sign out and sign in again.");
      }

      // Generate scan ID on the client so we can subscribe to Realtime
      // updates immediately, BEFORE the scan starts running on the server.
      const newScanId = crypto.randomUUID();
      setScanId(newScanId);
      subscribeToScan(newScanId);

      // Get branch from DB
      const { data: repoData } = await supabase
        .from("repositories")
        .select("default_branch")
        .eq("id", repo.id)
        .single();

      const branch = repoData?.default_branch ?? "main";

      // Fire the scan (don't await — let Realtime drive UI updates)
      fetch("/api/scan/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scanId: newScanId,
          repositoryId: repo.id,
          fullName: repo.fullName,
          branch,
          token: session.provider_token,
        }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            setState("failed");
            setError(data.error ?? "Scan failed");
          }
          // Successful completion is handled by the Realtime subscription
        })
        .catch((e) => {
          setState("failed");
          setError(e.message);
        });
    } catch (e: any) {
      setState("failed");
      setError(e.message);
    }
  };

  // Auto-start when modal opens
  useEffect(() => {
    if (open && repo && state === "idle") {
      startScan();
    }
    if (!open) {
      setState("idle");
      setLogs([]);
      setProgress(0);
      setScanId(null);
      setResult(null);
      setError(null);
      if (channelRef.current) {
        const supabase = createClient();
        supabase?.removeChannel(channelRef.current);
      }
    }
  }, [open, repo]);

  return (
    <AnimatePresence>
      {open && repo && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-2xl rounded-2xl border border-white/[0.08] bg-[#0a0a0a]/95 backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-xl border flex items-center justify-center ${
                    state === "complete"
                      ? "bg-lime-400/10 border-lime-400/30"
                      : state === "failed"
                      ? "bg-red-500/10 border-red-500/30"
                      : "bg-white/[0.04] border-white/[0.08]"
                  }`}>
                    {state === "complete" ? (
                      <CheckCircle2 className="h-5 w-5 text-lime-300" />
                    ) : state === "failed" ? (
                      <AlertOctagon className="h-5 w-5 text-red-300" />
                    ) : (
                      <ScanSearch className="h-5 w-5 text-white/60" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      {state === "complete" ? "Scan complete" : state === "failed" ? "Scan failed" : "Scanning repository"}
                    </div>
                    <div className="text-xs text-white/45">{repo.fullName}</div>
                  </div>
                </div>
                <button onClick={onClose} className="text-white/40 hover:text-white p-2 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5">
                {/* Progress */}
                <div className="flex items-center justify-between text-xs text-white/50 mb-2">
                  <span className="flex items-center gap-1.5">
                    {state === "scanning" && <Loader2 className="h-3 w-3 animate-spin text-lime-400" />}
                    {state === "scanning" ? "In progress..." : state === "complete" ? "Done" : state === "failed" ? "Failed" : "Starting..."}
                  </span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />

                {/* Live log terminal */}
                <div
                  ref={logRef}
                  className="mt-4 h-52 overflow-y-auto rounded-xl border border-white/[0.06] bg-black/80 p-4 font-mono text-[12px] leading-6"
                >
                  {logs.length === 0 && state === "scanning" && (
                    <span className="text-white/40">Initializing scanner...</span>
                  )}
                  {logs.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={
                        line.startsWith("✓")
                          ? "text-lime-300"
                          : line.startsWith("✗")
                          ? "text-red-300"
                          : line.includes("issue") || line.includes("found")
                          ? "text-yellow-300"
                          : "text-white/60"
                      }
                    >
                      {line}
                    </motion.div>
                  ))}
                  {state === "scanning" && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="inline-block w-2 h-3.5 bg-lime-300 align-middle ml-1"
                    />
                  )}
                </div>

                {/* Result */}
                {state === "complete" && result && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 flex items-center gap-3 rounded-xl border p-4 ${
                      result.criticalCount > 0
                        ? "border-red-500/20 bg-red-500/[0.05]"
                        : "border-lime-400/20 bg-lime-400/[0.04]"
                    }`}
                  >
                    {result.criticalCount > 0
                      ? <AlertOctagon className="h-5 w-5 text-red-300 shrink-0" />
                      : <CheckCircle2 className="h-5 w-5 text-lime-300 shrink-0" />
                    }
                    <div className="flex-1 text-sm text-white/80">
                      {result.vulnerabilityCount === 0
                        ? "No issues found — your repo looks clean!"
                        : <>Found <strong className="text-white">{result.vulnerabilityCount} issue{result.vulnerabilityCount !== 1 ? "s" : ""}</strong>{result.criticalCount > 0 ? ` — ${result.criticalCount} critical` : ""}. Review them now.</>
                      }
                    </div>
                    {result.vulnerabilityCount > 0 && scanId && (
                      <Button size="sm" onClick={() => { onClose(); router.push(`/dashboard/scans/${scanId}`); }}>
                        View results
                      </Button>
                    )}
                  </motion.div>
                )}

                {state === "scanning" && (
                  <p className="mt-3 text-center text-[11px] text-white/30">
                    SecuGo uses AI and may make mistakes — always review findings before acting on them.
                  </p>
                )}

                {state === "failed" && error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.05] p-4 text-sm text-red-300 flex items-center justify-between gap-4"
                  >
                    <span>{error}</span>
                    {error.toLowerCase().includes("token") && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          const supabase = createClient();
                          if (supabase) await supabase.auth.signOut();
                          document.cookie = "secugo_demo_session=; max-age=0; path=/";
                          window.location.href = "/login";
                        }}
                      >
                        Sign out & reconnect
                      </Button>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
