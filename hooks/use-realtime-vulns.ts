"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Vulnerability } from "@/types";

function mapFromDb(row: any): Vulnerability {
  return {
    id: row.id,
    repositoryId: row.repository_id,
    scanId: row.scan_id,
    title: row.title,
    severity: row.severity,
    category: row.category,
    file: row.file,
    line: row.line ?? undefined,
    description: row.description,
    aiExplanation: row.ai_explanation ?? row.description,
    suggestedFix: row.suggested_fix ?? "",
    codeSnippet: row.code_snippet ?? undefined,
    fixedSnippet: row.fixed_snippet ?? undefined,
    detectedAt: row.detected_at,
    status: row.status,
  };
}

export function useRealtimeVulns(scanId: string) {
  const [vulns, setVulns] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let channel: any;

    const load = async () => {
      const { data } = await supabase
        .from("vulnerabilities")
        .select("*")
        .eq("scan_id", scanId)
        .order("severity", { ascending: true });
      setVulns((data ?? []).map(mapFromDb));
      setLoading(false);
    };

    load();

    channel = supabase
      .channel(`vulns-${scanId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vulnerabilities", filter: `scan_id=eq.${scanId}` },
        load
      )
      .subscribe();

    return () => { if (channel) supabase.removeChannel(channel); };
  }, [scanId]);

  return { vulns, loading };
}

export function useRealtimeRecentVulns(limit = 5) {
  const [vulns, setVulns] = useState<Vulnerability[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!supabase) return;
    let channel: any;

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("vulnerabilities")
        .select("*")
        .eq("user_id", user.id)
        .order("detected_at", { ascending: false })
        .limit(limit);
      setVulns((data ?? []).map(mapFromDb));
    };

    load();
    channel = supabase
      .channel("recent-vulns")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "vulnerabilities" }, load)
      .subscribe();

    return () => { if (channel) supabase.removeChannel(channel); };
  }, [limit]);

  return vulns;
}
