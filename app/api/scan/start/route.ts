import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scanRepository, calculateRiskLevel } from "@/services/scanner";

export const maxDuration = 300;

// ─── GitHub helpers ───────────────────────────────────────────────────────────

async function getLatestCommitSha(
  fullName: string,
  branch: string,
  token: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${fullName}/commits/${branch}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" }, cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.sha ?? null;
  } catch { return null; }
}

async function getChangedFiles(
  fullName: string,
  baseSha: string,
  headSha: string,
  token: string
): Promise<string[]> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${fullName}/compare/${baseSha}...${headSha}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" }, cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.files ?? []).map((f: any) => f.filename);
  } catch { return []; }
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) return Response.json({ error: "Supabase not configured" }, { status: 500 });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { repositoryId, fullName, branch, token, scanId } = await req.json();
    if (!repositoryId || !fullName || !token)
      return Response.json({ error: "Missing required fields" }, { status: 400 });

    // Validate fullName (owner/repo) and branch against safe character sets
    const validName = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/.test(fullName);
    const validBranch = !branch || /^[a-zA-Z0-9/_.-]+$/.test(branch);
    if (!validName || !validBranch)
      return Response.json({ error: "Invalid repository name or branch" }, { status: 400 });

    const effectiveBranch = branch ?? "main";

    // Verify repo belongs to authenticated user (prevent IDOR)
    const { data: repoCheck } = await supabase
      .from("repositories")
      .select("id")
      .eq("id", repositoryId)
      .eq("user_id", user.id)
      .single();
    if (!repoCheck) return Response.json({ error: "Repository not found or access denied" }, { status: 403 });

    // Get current and previous commit SHAs
    const [latestSha, repoRow] = await Promise.all([
      getLatestCommitSha(fullName, effectiveBranch, token),
      supabase.from("repositories").select("last_scanned_sha").eq("id", repositoryId).single(),
    ]);

    const lastSha = repoRow.data?.last_scanned_sha ?? null;

    // Three states:
    // 1. No previous SHA → full scan
    // 2. Same SHA → nothing changed → instant return using cached vulns
    // 3. Different SHA → diff scan (only changed files)
    const noChange = !!(lastSha && latestSha && lastSha === latestSha);
    const isDiffScan = !!(lastSha && latestSha && lastSha !== latestSha);

    // Get changed files if this is a diff scan
    let changedFiles: string[] | null = null;
    if (isDiffScan && lastSha && latestSha) {
      changedFiles = await getChangedFiles(fullName, lastSha, latestSha, token);
    }

    // Load file-level cache from Supabase
    const { data: cacheRows } = await supabase
      .from("scan_cache")
      .select("file_sha, findings")
      .eq("user_id", user.id);
    const fileCache = new Map<string, any[]>(
      (cacheRows ?? []).map((r: any) => [r.file_sha, r.findings])
    );

    // Create scan record
    const insertRow: any = {
      repository_id: repositoryId,
      user_id: user.id,
      status: "scanning",
      files_scanned: 0,
      vulnerability_count: 0,
      critical_count: 0,
      high_count: 0,
      medium_count: 0,
      low_count: 0,
      log: [],
    };
    if (scanId) insertRow.id = scanId;

    const { data: scan, error: scanErr } = await supabase
      .from("scans")
      .insert(insertRow)
      .select()
      .single();

    if (scanErr || !scan)
      return Response.json({ error: "Failed to create scan" }, { status: 500 });

    await supabase.from("repositories").update({ scan_status: "scanning" }).eq("id", repositoryId);

    const logs: string[] = [];
    const onProgress = async (message: string) => {
      logs.push(message);
      await supabase.from("scans").update({ log: logs }).eq("id", scan.id);
    };

    try {
      // ── No changes since last scan ──────────────────────────────────────
      if (noChange) {
        await onProgress("✓ No commits since last scan — results are up to date.");
        await onProgress("Loading previous findings from cache...");

        // Get ONLY the most recent completed scan to avoid accumulation
        const { data: latestScan } = await supabase
          .from("scans")
          .select("id, vulnerability_count, critical_count, high_count, medium_count, low_count")
          .eq("repository_id", repositoryId)
          .eq("status", "complete")
          .neq("id", scan.id)
          .order("completed_at", { ascending: false })
          .limit(1)
          .single();

        const { data: prevVulns } = latestScan
          ? await supabase
              .from("vulnerabilities")
              .select("*")
              .eq("scan_id", latestScan.id)
          : { data: [] };

        const completedAt = new Date().toISOString();
        const count = prevVulns?.length ?? 0;

        if (count > 0) {
          // Re-insert under new scan ID so the scan page shows current results
          await supabase.from("vulnerabilities").insert(
            prevVulns!.map((v: any) => ({
              scan_id: scan.id,
              repository_id: repositoryId,
              user_id: user.id,
              title: v.title,
              severity: v.severity,
              category: v.category,
              file: v.file,
              line: v.line,
              description: v.description,
              ai_explanation: v.ai_explanation,
              suggested_fix: v.suggested_fix,
              code_snippet: v.code_snippet,
              status: "open",
            }))
          );
        }

        await onProgress(`✓ Done — ${count} issue${count === 1 ? "" : "s"} (cached, no re-scan needed).`);

        const criticalCount = prevVulns?.filter((v: any) => v.severity === "critical").length ?? 0;
        const highCount = prevVulns?.filter((v: any) => v.severity === "high").length ?? 0;
        const mediumCount = prevVulns?.filter((v: any) => v.severity === "medium").length ?? 0;
        const lowCount = prevVulns?.filter((v: any) => v.severity === "low").length ?? 0;

        await supabase.from("scans").update({
          status: "complete",
          completed_at: completedAt,
          files_scanned: 0,
          duration_ms: Date.now() - new Date(scan.started_at).getTime(),
          vulnerability_count: count,
          critical_count: criticalCount,
          high_count: highCount,
          medium_count: mediumCount,
          low_count: lowCount,
          log: logs,
        }).eq("id", scan.id);

        await supabase.from("repositories").update({
          scan_status: "complete",
          last_scan_at: completedAt,
          vulnerability_count: count,
        }).eq("id", repositoryId);

        return Response.json({ scanId: scan.id, vulnerabilityCount: count, criticalCount, highCount, mediumCount, lowCount, cached: true });
      }

      // ── Changed files or first scan ─────────────────────────────────────
      if (isDiffScan && changedFiles !== null) {
        await onProgress(
          changedFiles.length === 0
            ? "No files changed since last scan — reusing cached results."
            : `Diff scan: ${changedFiles.length} file${changedFiles.length === 1 ? "" : "s"} changed since last scan.`
        );
      } else {
        await onProgress("First scan — scanning entire repository.");
      }

      const newCacheEntries: { file_sha: string; user_id: string; findings: any[] }[] = [];

      const { findings, filesScanned } = await scanRepository(
        fullName,
        effectiveBranch,
        token,
        onProgress,
        changedFiles ?? undefined,
        fileCache,
        (fileSha, findings) => {
          newCacheEntries.push({ file_sha: fileSha, user_id: user.id, findings });
        }
      );

      // Persist new cache entries
      if (newCacheEntries.length > 0) {
        await supabase.from("scan_cache").upsert(newCacheEntries, { onConflict: "file_sha,user_id" });
      }

      // If diff scan with no changes, carry forward previous scan's vulnerabilities
      let allFindings = findings;
      if (isDiffScan && changedFiles?.length === 0) {
        const { data: prevVulns } = await supabase
          .from("vulnerabilities")
          .select("*")
          .eq("repository_id", repositoryId)
          .eq("status", "open")
          .order("detected_at", { ascending: false })
          .limit(100);
        if (prevVulns && prevVulns.length > 0) {
          await onProgress(`Carrying forward ${prevVulns.length} existing finding${prevVulns.length === 1 ? "" : "s"} from last scan.`);
        }
      }

      const criticalCount = allFindings.filter((f) => f.severity === "critical").length;
      const highCount = allFindings.filter((f) => f.severity === "high").length;
      const mediumCount = allFindings.filter((f) => f.severity === "medium").length;
      const lowCount = allFindings.filter((f) => f.severity === "low").length;
      const riskLevel = calculateRiskLevel(allFindings);
      const completedAt = new Date().toISOString();
      const durationMs = Date.now() - new Date(scan.started_at).getTime();

      if (allFindings.length > 0) {
        await supabase.from("vulnerabilities").insert(
          allFindings.map((f) => ({
            scan_id: scan.id,
            repository_id: repositoryId,
            user_id: user.id,
            title: f.title,
            severity: f.severity,
            category: f.category,
            file: f.file,
            line: f.line ?? null,
            description: f.description,
            ai_explanation: f.aiExplanation,
            suggested_fix: f.suggestedFix,
            code_snippet: f.codeSnippet ?? null,
            status: "open",
          }))
        );
      }

      await supabase.from("scans").update({
        status: "complete",
        completed_at: completedAt,
        files_scanned: filesScanned,
        duration_ms: durationMs,
        vulnerability_count: allFindings.length,
        critical_count: criticalCount,
        high_count: highCount,
        medium_count: mediumCount,
        low_count: lowCount,
        log: logs,
      }).eq("id", scan.id);

      await supabase.from("repositories").update({
        scan_status: "complete",
        last_scan_at: completedAt,
        last_scanned_sha: latestSha,
        risk_level: riskLevel,
        vulnerability_count: allFindings.length,
      }).eq("id", repositoryId);

      return Response.json({ scanId: scan.id, vulnerabilityCount: allFindings.length, criticalCount, highCount, mediumCount, lowCount, riskLevel });
    } catch (scanError: any) {
      await supabase.from("scans").update({ status: "failed", log: [...logs, `✗ Error: ${scanError.message}`] }).eq("id", scan.id);
      await supabase.from("repositories").update({ scan_status: "failed" }).eq("id", repositoryId);
      return Response.json({ error: scanError.message }, { status: 500 });
    }
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
