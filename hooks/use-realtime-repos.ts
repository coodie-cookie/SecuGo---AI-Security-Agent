"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchGitHubRepos } from "@/services/github";
import type { Repository } from "@/types";

function mapFromDb(row: any): Repository {
  return {
    id: row.id,
    name: row.name,
    fullName: row.full_name,
    description: row.description ?? undefined,
    visibility: row.visibility,
    language: row.language ?? undefined,
    stars: row.stars ?? 0,
    updatedAt: row.github_updated_at ?? row.created_at,
    riskLevel: row.risk_level,
    scanStatus: row.scan_status,
    lastScanAt: row.last_scan_at ?? undefined,
    vulnerabilityCount: row.vulnerability_count ?? 0,
  };
}

export function useRealtimeRepos() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const loadFromDb = useCallback(async (userId: string) => {
    if (!supabase) return;
    const { data } = await supabase
      .from("repositories")
      .select("*")
      .eq("user_id", userId)
      .order("github_updated_at", { ascending: false });
    setRepos((data ?? []).map(mapFromDb));
  }, []);

  const syncFromGitHub = useCallback(async () => {
    if (!supabase) return;
    setSyncing(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not signed in");
      const token = session.provider_token;
      if (!token) throw new Error("GitHub token expired. Please sign out and sign in again.");

      const ghRepos = await fetchGitHubRepos(token);

      // Fetch existing repos so we don't overwrite scan results (score, risk level, vuln count)
      const { data: existing } = await supabase
        .from("repositories")
        .select("id, full_name, risk_level, scan_status, vulnerability_count, last_scan_at, last_scanned_sha")
        .eq("user_id", session.user.id);

      const existingMap = new Map((existing ?? []).map((r: any) => [r.full_name, r]));

      const rows = ghRepos.map((r) => {
        const prev = existingMap.get(r.full_name);
        return {
          user_id: session.user.id,
          github_id: r.id,
          name: r.name,
          full_name: r.full_name,
          description: r.description ?? null,
          visibility: r.private ? "private" : "public",
          language: r.language ?? null,
          stars: r.stargazers_count,
          default_branch: r.default_branch,
          github_updated_at: r.updated_at,
          // ── Preserve existing scan data — only use defaults for brand-new repos ──
          risk_level: prev?.risk_level ?? "safe",
          scan_status: prev?.scan_status ?? "idle",
          vulnerability_count: prev?.vulnerability_count ?? 0,
          last_scan_at: prev?.last_scan_at ?? null,
          last_scanned_sha: prev?.last_scanned_sha ?? null,
        };
      });

      await supabase.from("repositories").upsert(rows, { onConflict: "user_id,full_name" });

      // Remove repos that no longer exist on GitHub (deleted/renamed/access revoked).
      // Without this, stale rows accumulate in the dashboard forever.
      const liveIds = ghRepos.map((r) => r.id);
      if (liveIds.length > 0) {
        await supabase
          .from("repositories")
          .delete()
          .eq("user_id", session.user.id)
          .not("github_id", "in", `(${liveIds.join(",")})`);
      }

      await loadFromDb(session.user.id);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSyncing(false);
    }
  }, [loadFromDb]);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let channel: any;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setLoading(false); return; }
      await loadFromDb(session.user.id);

      const { count } = await supabase
        .from("repositories")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id);
      if (count === 0) await syncFromGitHub();
      setLoading(false);

      channel = supabase
        .channel(`repos-realtime-${Date.now()}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "repositories", filter: `user_id=eq.${session.user.id}` },
          () => loadFromDb(session.user.id)
        )
        .subscribe();
    });

    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  return { repos, loading, syncing, error, syncFromGitHub };
}
