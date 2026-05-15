"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchGitHubRepos } from "@/services/github";
import type { Repository } from "@/types";

function mapToRepository(ghRepo: any, userId: string): any {
  return {
    user_id: userId,
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
  };
}

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

export function useRepositories() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const loadFromDb = useCallback(async (userId: string) => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("repositories")
      .select("*")
      .eq("user_id", userId)
      .order("github_updated_at", { ascending: false });
    if (error) throw error;
    setRepos((data ?? []).map(mapFromDb));
  }, [supabase]);

  const syncFromGitHub = useCallback(async () => {
    if (!supabase) return;
    setSyncing(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not signed in");

      const token = session.provider_token;
      if (!token) {
        // provider_token expires from cookie — ask user to re-login
        throw new Error("GitHub token expired. Please sign out and sign in again.");
      }

      const ghRepos = await fetchGitHubRepos(token);
      const rows = ghRepos.map((r) => mapToRepository(r, session.user.id));

      const { error: upsertErr } = await supabase
        .from("repositories")
        .upsert(rows, { onConflict: "user_id,full_name" });
      if (upsertErr) throw upsertErr;

      await loadFromDb(session.user.id);
    } catch (e: any) {
      setError(e.message ?? "Failed to sync repositories");
    } finally {
      setSyncing(false);
    }
  }, [supabase, loadFromDb]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setLoading(false); return; }
      try {
        await loadFromDb(session.user.id);
        // Auto-sync if DB is empty
        const { count } = await supabase
          .from("repositories")
          .select("*", { count: "exact", head: true })
          .eq("user_id", session.user.id);
        if (count === 0) await syncFromGitHub();
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  return { repos, loading, syncing, error, syncFromGitHub };
}
