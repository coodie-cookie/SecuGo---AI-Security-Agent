"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Repository } from "@/types";

const POLL_INTERVAL = 30_000; // 30 seconds

async function fetchHeadSha(
  fullName: string,
  branch: string,
  token: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${fullName}/commits/${branch}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.sha ?? null;
  } catch {
    return null;
  }
}

export function useGitHubSync(repos: Repository[]) {
  const [updatedRepos, setUpdatedRepos] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Store the latest GitHub head SHA per repo so Realtime can compare
  const headShasRef = useRef<Map<string, string>>(new Map());
  const supabase = createClient();

  const check = useCallback(async () => {
    if (!supabase || repos.length === 0) return;
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.provider_token;
    if (!token) return;

    const { data: rows } = await supabase
      .from("repositories")
      .select("id, full_name, default_branch, last_scanned_sha")
      .in("id", repos.map((r) => r.id));

    if (!rows) return;

    const newUpdated = new Set<string>(updatedRepos);
    let changed = false;

    await Promise.all(
      rows.map(async (row) => {
        const headSha = await fetchHeadSha(
          row.full_name,
          row.default_branch ?? "main",
          token
        );
        if (!headSha) return;

        // Store latest head SHA so the Realtime handler can reference it
        headShasRef.current.set(row.id, headSha);

        const hasUpdate = !row.last_scanned_sha || row.last_scanned_sha !== headSha;

        if (hasUpdate && !newUpdated.has(row.id)) {
          newUpdated.add(row.id);
          changed = true;
        } else if (!hasUpdate && newUpdated.has(row.id)) {
          newUpdated.delete(row.id);
          changed = true;
        }
      })
    );

    if (changed) setUpdatedRepos(new Set(newUpdated));
  }, [repos, supabase, updatedRepos]);

  // ── Realtime: clear badge instantly when scan completes ──────────────────
  useEffect(() => {
    if (!supabase) return;
    let channel: any;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      channel = supabase
        .channel(`github-sync-sha-watch-${Date.now()}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "repositories",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const { id, last_scanned_sha } = payload.new as any;
            const latestHead = headShasRef.current.get(id);
            // If the new SHA matches what GitHub reports as HEAD → scan caught up
            if (last_scanned_sha && latestHead && last_scanned_sha === latestHead) {
              setUpdatedRepos((prev) => {
                if (!prev.has(id)) return prev;
                const next = new Set(prev);
                next.delete(id);
                return next;
              });
            }
          }
        )
        .subscribe();
    });

    return () => { if (channel) supabase.removeChannel(channel); };
  }, [supabase]);

  // ── Polling ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (repos.length === 0) return;
    const initial = setTimeout(check, 3000);
    timerRef.current = setInterval(check, POLL_INTERVAL);
    return () => {
      clearTimeout(initial);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [repos.length]);

  return { updatedRepos };
}
