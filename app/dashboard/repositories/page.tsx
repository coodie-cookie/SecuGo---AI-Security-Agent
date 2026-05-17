"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Github, Loader2, Plus, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { RepositoryCard } from "@/components/dashboard/repository-card";
import { ScanModal } from "@/components/dashboard/scan-modal";
import { RepoPickerModal } from "@/components/dashboard/repo-picker-modal";
import { useRealtimeRepos } from "@/hooks/use-realtime-repos";
import { useGitHubSync } from "@/hooks/use-github-sync";
import { AutoSyncCounter } from "@/components/dashboard/auto-sync-counter";
import type { Repository } from "@/types";


export default function RepositoriesPage() {
  const { repos, loading, syncing, error, syncFromGitHub, connectRepo, disconnectRepo } = useRealtimeRepos();
  const { updatedRepos } = useGitHubSync(repos);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Repository | null>(null);
  const [modal, setModal] = useState(false);
  const [forceScan, setForceScan] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const filtered = repos.filter(
    (r) =>
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.fullName.toLowerCase().includes(query.toLowerCase())
  );

  const startScan = (repo: Repository, opts?: { force?: boolean }) => {
    setForceScan(opts?.force ?? false);
    setActive(repo);
    setModal(true);
  };

  const connectedFullNames = new Set(repos.map((r) => r.fullName));

  return (
    <div className="space-y-7">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Repositories</h1>
          <p className="mt-1 text-sm text-white/50">
            {loading ? "Loading..." : `${repos.length} connected · pick one to scan`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={syncFromGitHub} disabled={syncing || loading} className="text-white/50 hover:text-white">
            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {syncing ? "Syncing..." : "Refresh"}
          </Button>
          <Button size="sm" onClick={() => setPickerOpen(true)} disabled={loading}>
            <Plus className="h-4 w-4" />
            Connect repository
          </Button>
          <AutoSyncCounter onTick={syncFromGitHub} />
        </div>
      </motion.div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/[0.05] p-4">
          <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-sm text-white/80">{error}</p>
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter repositories..." className="pl-10" />
      </div>

      {loading && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((r, i) => (
            <RepositoryCard
              key={r.id}
              repo={r}
              scanning={active?.id === r.id && modal}
              hasUpdate={updatedRepos.has(r.id)}
              onScan={() => startScan(r)}
              onForceScan={() => startScan(r, { force: true })}
              onDisconnect={() => disconnectRepo(r.id)}
              index={i}
            />
          ))}
        </div>
      )}

      {!loading && repos.length === 0 && !error && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
            <Github className="h-5 w-5 text-white/40" />
          </div>
          <div className="mt-4 text-base font-medium">No repositories connected</div>
          <p className="mt-1 text-sm text-white/45">Connect a GitHub repository to start scanning.</p>
          <Button className="mt-5" onClick={() => setPickerOpen(true)}>
            <Plus className="h-4 w-4" />
            Connect repository
          </Button>
        </div>
      )}

      {!loading && repos.length > 0 && filtered.length === 0 && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
          <div className="mt-4 text-base font-medium">No matching repos</div>
          <p className="mt-1 text-sm text-white/45">Try a different search term.</p>
        </div>
      )}

      <ScanModal
        repo={active}
        open={modal}
        force={forceScan}
        onClose={() => { setModal(false); setActive(null); setForceScan(false); }}
      />

      <RepoPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        connectedFullNames={connectedFullNames}
        onConnect={connectRepo}
        connectedCount={repos.length}
      />
    </div>
  );
}
