import { NextRequest } from "next/server";
import { Resend } from "resend";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { ScanReportPDF } from "@/components/pdf/scan-report";
import { createClient } from "@/lib/supabase/server";
import type { Scan, Vulnerability, Repository } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    // Require authenticated session
    const supabase = await createClient();
    if (!supabase) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const {
      email,
      scan,
      repo,
      vulnerabilities,
    }: {
      email: string;
      scan: Scan;
      repo: Repository;
      vulnerabilities: Vulnerability[];
    } = await req.json();

    if (!email || !scan || !repo) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      createElement(ScanReportPDF, { scan, repo, vulnerabilities })
    );

    const criticalCount = vulnerabilities.filter((v) => v.severity === "critical").length;
    const highCount = vulnerabilities.filter((v) => v.severity === "high").length;

    const subject =
      criticalCount > 0
        ? `🚨 ${criticalCount} critical issue${criticalCount > 1 ? "s" : ""} found in ${repo.name}`
        : `Security scan complete — ${repo.name}`;

    // Send to the authenticated user's email.
    // RESEND_TO_EMAIL overrides the recipient in sandbox/demo mode only.
    // Remove this override and verify your domain at resend.com/domains for production.
    const toEmail = process.env.RESEND_TO_EMAIL ?? user.email ?? email;

    const { data, error } = await resend.emails.send({
      from: "SecuGo <onboarding@resend.dev>",
      to: toEmail,
      subject,
      html: buildEmailHTML({ repo, scan, vulnerabilities, criticalCount, highCount }),
      attachments: [
        {
          filename: `secugo-report-${repo.name}-${new Date().toISOString().split("T")[0]}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      console.error("Resend error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, id: data?.id });
  } catch (err: any) {
    console.error("Email route error:", err);
    return Response.json({ error: err.message ?? "Failed to send email" }, { status: 500 });
  }
}

function buildEmailHTML({
  repo,
  scan,
  vulnerabilities,
  criticalCount,
  highCount,
}: {
  repo: Repository;
  scan: Scan;
  vulnerabilities: Vulnerability[];
  criticalCount: number;
  highCount: number;
}) {
  const topFindings = [...vulnerabilities]
    .sort((a, b) => {
      const o = { critical: 0, high: 1, medium: 2, low: 3 };
      return o[a.severity] - o[b.severity];
    })
    .slice(0, 5);

  const severityColor = (s: string) => {
    if (s === "critical") return "#f87171";
    if (s === "high") return "#fb923c";
    if (s === "medium") return "#facc15";
    return "#60a5fa";
  };

  const findingsHTML = topFindings
    .map(
      (v) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #1f1f1f;">
          <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;color:${severityColor(v.severity)};background:${v.severity === "critical" ? "#2a0a0a" : v.severity === "high" ? "#1f1208" : "#1f1a08"};margin-right:8px;">${v.severity.toUpperCase()}</span>
          <strong style="color:#f8f8f8;font-size:13px;">${v.title}</strong>
          <div style="color:#555;font-size:11px;margin-top:3px;font-family:monospace;">${v.file}</div>
          <div style="color:#888;font-size:12px;margin-top:5px;">${v.aiExplanation ?? v.description}</div>
        </td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

    <!-- Logo -->
    <div style="margin-bottom:32px;">
      <span style="font-size:22px;font-weight:700;color:#6bf900;">SecuGo</span>
      <span style="font-size:13px;color:#555;margin-left:8px;">Security Report</span>
    </div>

    <!-- Headline -->
    <h1 style="color:#f8f8f8;font-size:24px;font-weight:700;margin:0 0 8px;">
      ${criticalCount > 0 ? `⚠️ ${criticalCount} critical issue${criticalCount > 1 ? "s" : ""} found` : "Scan complete"}
    </h1>
    <p style="color:#888;font-size:14px;margin:0 0 28px;">
      Repository: <strong style="color:#f8f8f8;">${repo.fullName}</strong>
    </p>

    <!-- Stats -->
    <div style="display:flex;gap:12px;margin-bottom:28px;">
      <div style="flex:1;background:#111;border:1px solid #1f1f1f;border-radius:8px;padding:14px;text-align:center;">
        <div style="font-size:28px;font-weight:700;color:#f8f8f8;">${scan.vulnerabilityCount}</div>
        <div style="font-size:11px;color:#555;text-transform:uppercase;letter-spacing:1px;">Total issues</div>
      </div>
      <div style="flex:1;background:#111;border:1px solid #3a0a0a;border-radius:8px;padding:14px;text-align:center;">
        <div style="font-size:28px;font-weight:700;color:#f87171;">${criticalCount}</div>
        <div style="font-size:11px;color:#555;text-transform:uppercase;letter-spacing:1px;">Critical</div>
      </div>
      <div style="flex:1;background:#111;border:1px solid #1f1f1f;border-radius:8px;padding:14px;text-align:center;">
        <div style="font-size:28px;font-weight:700;color:#fb923c;">${highCount}</div>
        <div style="font-size:11px;color:#555;text-transform:uppercase;letter-spacing:1px;">High</div>
      </div>
      <div style="flex:1;background:#111;border:1px solid #1f1f1f;border-radius:8px;padding:14px;text-align:center;">
        <div style="font-size:28px;font-weight:700;color:#f8f8f8;">${scan.filesScanned}</div>
        <div style="font-size:11px;color:#555;text-transform:uppercase;letter-spacing:1px;">Files scanned</div>
      </div>
    </div>

    <!-- Top findings -->
    ${topFindings.length > 0 ? `
    <div style="background:#111;border:1px solid #1f1f1f;border-radius:8px;padding:20px;margin-bottom:24px;">
      <div style="font-size:11px;color:#555;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Top findings</div>
      <table style="width:100%;border-collapse:collapse;">${findingsHTML}</table>
    </div>` : ""}

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:32px;">
      <a href="https://secugo.app/dashboard/scans" style="display:inline-block;background:#6bf900;color:#000;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;">
        View full report →
      </a>
    </div>

    <!-- PDF note -->
    <div style="background:#111;border:1px solid #1f1f1f;border-radius:8px;padding:16px;margin-bottom:32px;">
      <p style="color:#888;font-size:12px;margin:0;">
        📎 A full PDF report with AI explanations and fix suggestions for every issue is attached to this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #1a1a1a;padding-top:20px;text-align:center;">
      <p style="color:#333;font-size:11px;margin:0;">
        Sent by <strong style="color:#555;">SecuGo</strong> · AI security for modern startups
        <br>You're receiving this because you enabled critical issue notifications.
      </p>
    </div>

  </div>
</body>
</html>`;
}
