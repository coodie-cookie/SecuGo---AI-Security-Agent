import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { Scan, Vulnerability, Repository } from "@/types";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#0a0a0a",
    padding: 40,
    fontFamily: "Helvetica",
    color: "#f8f8f8",
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
    borderBottom: "1px solid #1f1f1f",
    paddingBottom: 20,
  },
  brand: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#6bf900" },
  brandSub: { fontSize: 9, color: "#555", marginTop: 2 },
  metaRight: { alignItems: "flex-end" },
  metaLabel: { fontSize: 8, color: "#555", marginBottom: 2 },
  metaValue: { fontSize: 10, color: "#aaa" },

  // Summary cards
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 28 },
  summaryCard: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 8,
    padding: 14,
    border: "1px solid #1f1f1f",
  },
  summaryLabel: { fontSize: 8, color: "#555", textTransform: "uppercase", letterSpacing: 1 },
  summaryValue: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#f8f8f8", marginTop: 4 },

  // Section
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#555",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  // Vuln card
  vulnCard: {
    backgroundColor: "#111",
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    border: "1px solid #1f1f1f",
  },
  vulnHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 },
  vulnTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#f8f8f8", flex: 1 },
  severityBadge: { borderRadius: 4, paddingHorizontal: 7, paddingVertical: 3, fontSize: 8, fontFamily: "Helvetica-Bold" },
  vulnFile: { fontSize: 8, color: "#555", fontFamily: "Helvetica-Oblique", marginBottom: 8 },
  label: { fontSize: 8, color: "#6bf900", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 },
  body: { fontSize: 9, color: "#aaa", lineHeight: 1.5 },
  divider: { borderTop: "1px solid #1a1a1a", marginVertical: 8 },

  // Footer
  footer: {
    position: "absolute",
    bottom: 28,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1px solid #1f1f1f",
    paddingTop: 10,
  },
  footerText: { fontSize: 8, color: "#333" },
});

function severityColor(s: string) {
  if (s === "critical") return { bg: "#2a0a0a", text: "#f87171" };
  if (s === "high") return { bg: "#1f1208", text: "#fb923c" };
  if (s === "medium") return { bg: "#1f1a08", text: "#facc15" };
  return { bg: "#0a0f1f", text: "#60a5fa" };
}

export function ScanReportPDF({
  scan,
  repo,
  vulnerabilities,
}: {
  scan: Scan;
  repo: Repository;
  vulnerabilities: Vulnerability[];
}) {
  const date = new Date(scan.completedAt ?? scan.startedAt).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  const ordered = [...vulnerabilities].sort((a, b) => {
    const o = { critical: 0, high: 1, medium: 2, low: 3 };
    return o[a.severity] - o[b.severity];
  });

  return (
    <Document
      title={`SecuGo Security Report — ${repo.fullName}`}
      author="SecuGo"
      subject="Security Scan Report"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>SecuGo</Text>
            <Text style={styles.brandSub}>AI Security Report</Text>
          </View>
          <View style={styles.metaRight}>
            <Text style={styles.metaLabel}>Repository</Text>
            <Text style={styles.metaValue}>{repo.fullName}</Text>
            <Text style={[styles.metaLabel, { marginTop: 6 }]}>Scan date</Text>
            <Text style={styles.metaValue}>{date}</Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total issues</Text>
            <Text style={styles.summaryValue}>{scan.vulnerabilityCount}</Text>
          </View>
          <View style={[styles.summaryCard, { border: "1px solid #3a0a0a" }]}>
            <Text style={styles.summaryLabel}>Critical</Text>
            <Text style={[styles.summaryValue, { color: "#f87171" }]}>{scan.criticalCount}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>High</Text>
            <Text style={[styles.summaryValue, { color: "#fb923c" }]}>{scan.highCount}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Medium</Text>
            <Text style={[styles.summaryValue, { color: "#facc15" }]}>{scan.mediumCount}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Files scanned</Text>
            <Text style={styles.summaryValue}>{scan.filesScanned}</Text>
          </View>
        </View>

        {/* Vulnerabilities */}
        <Text style={styles.sectionTitle}>Findings</Text>

        {ordered.map((v) => {
          const { bg, text } = severityColor(v.severity);
          return (
            <View key={v.id} style={styles.vulnCard} wrap={false}>
              <View style={styles.vulnHeader}>
                <Text style={styles.vulnTitle}>{v.title}</Text>
                <View style={[styles.severityBadge, { backgroundColor: bg }]}>
                  <Text style={{ color: text, fontSize: 8, fontFamily: "Helvetica-Bold" }}>
                    {v.severity.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.vulnFile}>
                {v.file}{v.line ? `:${v.line}` : ""}
              </Text>

              <Text style={styles.label}>What was found</Text>
              <Text style={styles.body}>{v.description}</Text>

              {v.aiExplanation && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.label}>AI explanation</Text>
                  <Text style={styles.body}>{v.aiExplanation}</Text>
                </>
              )}

              {v.suggestedFix && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.label}>Suggested fix</Text>
                  <Text style={styles.body}>{v.suggestedFix}</Text>
                </>
              )}
            </View>
          );
        })}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Generated by SecuGo · secugo.app
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
