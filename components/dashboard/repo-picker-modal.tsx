"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Github, Loader2, Plus, Search, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fetchGitHubRepos, type GitHubRepo } from "@/services/github";
import { cn } from "@/lib/utils";

export function RepoPickerModal({
  open,
  onClose,
  connectedFullNames,
  onConnect,
  repoLimit,
  connectedCount,
}: {
  open: boolean;
  onClose: () => void;
  connectedFullNames: Set<string>;
  onConnect: (repo: GitHubRepo) => Promise<void>;
  repoLimit?: number;
  connectedCount: number;
}) {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [connecting, setConnecting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) { setQuery(""); return; }
    setLoading(true);
    setError(null);
    const supabase = createClient();
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.provider_token) {
        setError("GitHub token expired. Please sign out and sign in again.");
        setLoading(false);
        return;
      }
      try {
        const ghRepos = await fetchGitHubRepos(session.provider_token);
        setRepos(ghRepos);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    });
  }, [open]);

  const filtered = repos.filter(
    (r) =>
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.full_name.toLowerCase().includes(query.toLowerCase())
  );

  const handleConnect = async (repo: GitHubRepo) => {
    setConnecting(repo.id);
    try {
      await onConnect(repo);
    } finally {
      setConnecting(null);
    }
  };

  const atLimit = repoLimit != null && connectedCount >= repoLimit;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0a0a0a]/95 backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] flex flex-col max-h-[80vh]">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/[0.06] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                    <Github className="h-4 w-4 text-white/60" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Connect a repository</div>
                    <div className="text-xs text-white/40">
                      {repoLimit != null
                        ? `${connectedCount} / ${repoLimit} connected on your plan`
                        : `${connectedCount} connected`}
                    </div>
                  </div>
                </div>
                <button onClick={onClose} className="text-white/40 hover:text-white p-2 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-white/[0.04] shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search your repositories..."
                    className="w-full h-9 bg-white/[0.03] border border-white/[0.06] rounded-lg pl-9 pr-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-lime-400/30 transition-colors"
                  />
                </div>
              </div>

              {/* Limit warning */}
              {atLimit && (
                <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-yellow-500/[0.07] border border-yellow-500/20 text-xs text-yellow-300 shrink-0">
                  You've reached your plan limit of {repoLimit} repositories. Upgrade to connect more.
                </div>
              )}

              {/* List */}
              <div className="overflow-y-auto flex-1 p-2">
                {loading && (
                  <div className="flex items-center justify-center py-12 gap-2 text-white/40 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading your repositories...
                  </div>
                )}
                {error && (
                  <div className="p-4 text-sm text-red-300 text-center">{error}</div>
                )}
                {!loading && !error && filtered.length === 0 && (
                  <div className="py-12 text-center text-sm text-white/35">No repositories found.</div>
                )}
                {!loading && !error && filtered.map((repo) => {
                  const isConnected = connectedFullNames.has(repo.full_name);
                  const isConnecting = connecting === repo.id;
                  const isDisabled = isConnected || isConnecting || (atLimit && !isConnected);
                  return (
                    <div
                      key={repo.id}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-xl px-3 py-3 transition-colors",
                        isConnected ? "opacity-50" : "hover:bg-white/[0.03]"
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{repo.name}</div>
                        <div className="text-xs text-white/40 truncate">{repo.full_name}</div>
                      </div>
                      <button
                        onClick={() => !isDisabled && handleConnect(repo)}
                        disabled={isDisabled}
                        className={cn(
                          "shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                          isConnected
                            ? "bg-lime-400/10 border border-lime-400/20 text-lime-300 cursor-default"
                            : atLimit
                            ? "border border-white/[0.08] text-white/25 cursor-not-allowed"
                            : "bg-white/[0.04] border border-white/[0.08] text-white/70 hover:bg-lime-400/10 hover:border-lime-400/30 hover:text-lime-300"
                        )}
                      >
                        {isConnecting ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : isConnected ? (
                          <><Check className="h-3 w-3" />Connected</>
                        ) : (
                          <><Plus className="h-3 w-3" />Connect</>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
