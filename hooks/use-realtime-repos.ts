"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchGitHubRepos, type GitHubRepo } from "@/services/github";
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

  // Refreshes metadata (stars, description, branch, updated_at) for already-connected
  // repos only. Does NOT auto-connect new repos — users connect repos explicitly via the picker.
  const syncFromGitHub = useCallback(async () => {
    if (!supabase) return;
    setSyncing(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not signed in");
      const token = session.provider_token;
      if (!token) throw new Error("GitHub token expired. Please sign out and sign in again.");

      const { data: existing } = await supabase
        .from("repositories")
        .select("id, full_name, github_id, risk_level, scan_status, vulnerability_count, last_scan_at, last_scanned_sha")
        .eq("user_id", session.user.id);

      if (!existing || existing.length === 0) { setLoading(false); setSyncing(false); return; }

      // Fetch all GitHub repos to get fresh metadata, then update only already-connected ones
      const ghRepos = await fetchGitHubRepos(token);
      const ghMap = new Map(ghRepos.map((r) => [r.full_name, r]));
      const liveGhIds = new Set(ghRepos.map((r) => r.id));

      const rows = existing
        .filter((row: any) => ghMap.has(row.full_name)) // skip repos deleted from GitHub
        .map((row: any) => {
          const gh = ghMap.get(row.full_name)!;
          return {
            id: row.id,
            user_id: session.user.id,
            github_id: gh.id,
            name: gh.name,
            full_name: gh.full_name,
            description: gh.description ?? null,
            visibility: gh.private ? "private" : "public",
            language: gh.language ?? null,
            stars: gh.stargazers_count,
            default_branch: gh.default_branch,
            github_updated_at: gh.updated_at,
            risk_level: row.risk_level,
            scan_status: row.scan_status,
            vulnerability_count: row.vulnerability_count,
            last_scan_at: row.last_scan_at,
            last_scanned_sha: row.last_scanned_sha,
          };
        });

      if (rows.length > 0) {
        await supabase.from("repositories").upsert(rows, { onConflict: "user_id,full_name" });
      }

      // Remove connected repos that no longer exist on GitHub
      const staleIds = existing
        .filter((row: any) => !liveGhIds.has(row.github_id))
        .map((row: any) => row.id);
      if (staleIds.length > 0) {
        await supabase.from("repositories").delete().in("id", staleIds);
      }

      await loadFromDb(session.user.id);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSyncing(false);
    }
  }, [loadFromDb]);

  // Explicitly connect a single GitHub repo chosen by the user
  const connectRepo = useCallback(async (ghRepo: GitHubRepo) => {
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from("repositories").upsert({
      user_id: session.user.id,
      github_id: ghRepo.id,
      name: ghRepo.name,
      full_name: ghRepo.full_name,
      description: ghRepo.description ?? null,
      visibility: ghRepo.private ? "private" : "public",
      language: ghRepo.language ?? null,
      stars: ghRepo.stargazers_count,
      default_branch: ghRepo.default_branch,
      github_updated_at: ghRepo.updated_at,
      risk_level: "safe",
      scan_status: "idle",
      vulnerability_count: 0,
    }, { onConflict: "user_id,full_name" });
    await loadFromDb(session.user.id);
  }, [loadFromDb]);

  // Disconnect (remove) a repo from the dashboard without touching GitHub
  const disconnectRepo = useCallback(async (repoId: string) => {
    if (!supabase) return;
    await supabase.from("repositories").delete().eq("id", repoId);
  }, []);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let channel: any;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setLoading(false); return; }
      await loadFromDb(session.user.id);
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

  return { repos, loading, syncing, error, syncFromGitHub, connectRepo, disconnectRepo };
}
