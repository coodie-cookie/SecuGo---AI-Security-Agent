"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Scan } from "@/types";

function mapFromDb(row: any): Scan {
  return {
    id: row.id,
    repositoryId: row.repository_id,
    startedAt: row.started_at,
    completedAt: row.completed_at ?? undefined,
    status: row.status,
    vulnerabilityCount: row.vulnerability_count ?? 0,
    criticalCount: row.critical_count ?? 0,
    highCount: row.high_count ?? 0,
    mediumCount: row.medium_count ?? 0,
    lowCount: row.low_count ?? 0,
    filesScanned: row.files_scanned ?? 0,
    duration: row.duration_ms ? Math.round(row.duration_ms / 1000) : undefined,
  };
}

export function useRealtimeScans() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const load = useCallback(async (userId: string) => {
    if (!supabase) return;
    const { data } = await supabase
      .from("scans")
      .select("*")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(50);
    setScans((data ?? []).map(mapFromDb));
  }, []);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let channel: any;

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return; }
      await load(user.id);
      setLoading(false);

      channel = supabase
        .channel(`scans-realtime-${Date.now()}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "scans", filter: `user_id=eq.${user.id}` },
          () => load(user.id)
        )
        .subscribe();
    });

    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  return { scans, loading };
}

// Hook for a single scan with live log streaming
export function useRealtimeScan(scanId: string) {
  const [scan, setScan] = useState<(Scan & { log: string[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let channel: any;

    const load = async () => {
      const { data } = await supabase
        .from("scans")
        .select("*")
        .eq("id", scanId)
        .single();
      if (data) setScan({ ...mapFromDb(data), log: data.log ?? [] });
      setLoading(false);
    };

    load();

    channel = supabase
      .channel(`scan-${scanId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "scans", filter: `id=eq.${scanId}` },
        (payload) => {
          const row = payload.new;
          setScan({ ...mapFromDb(row), log: row.log ?? [] });
        }
      )
      .subscribe();

    return () => { if (channel) supabase.removeChannel(channel); };
  }, [scanId]);

  return { scan, loading };
}
