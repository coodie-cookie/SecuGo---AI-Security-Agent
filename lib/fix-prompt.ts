import type { Scan, Vulnerability, Repository } from "@/types";

export function generateFixPrompt(
  scan: Scan,
  repo: Repository,
  vulnerabilities: Vulnerability[],
  concise = false
): string {
  const order = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...vulnerabilities].sort(
    (a, b) => order[a.severity] - order[b.severity]
  );

  const critical = sorted.filter((v) => v.severity === "critical").length;
  const high = sorted.filter((v) => v.severity === "high").length;
  const medium = sorted.filter((v) => v.severity === "medium").length;
  const low = sorted.filter((v) => v.severity === "low").length;

  const issueBlocks = sorted
    .map((v, i) => {
      const lineRef = v.line ? ` (line ${v.line})` : "";
      const snippet = v.codeSnippet
        ? `\n**Vulnerable code:**\n\`\`\`\n${v.codeSnippet}\n\`\`\`\n`
        : "";
      return `### Issue ${i + 1}: ${v.title} [${v.severity.toUpperCase()}]

**File:** \`${v.file}\`${lineRef}

**Problem:** ${v.description}${snippet}
**Fix instructions:** ${v.suggestedFix}
`;
    })
    .join("\n");

  const intro = concise
    ? ""
    : `You are a senior security engineer helping me fix security vulnerabilities in my codebase. A scan of my repository **${repo.fullName}** just found **${vulnerabilities.length} issue${vulnerabilities.length === 1 ? "" : "s"}** that I need you to fix.\n\n**Summary:** ${critical} critical, ${high} high, ${medium} medium, ${low} low\n\nPlease open each affected file, apply the suggested fix, and verify nothing else breaks. When you're done, give me a short summary of every change you made.\n\n---\n\n`;

  const instructions = concise
    ? ""
    : `\n---\n\n## How to proceed\n\n1. **Start with critical and high severity issues first** — they're the most dangerous.\n2. **For exposed secrets:** move them to environment variables (\`.env.local\`), add \`.env*\` to \`.gitignore\`, and remind me to rotate the leaked credentials in their respective dashboards.\n3. **For auth issues:** add server-side session checks at the top of every protected route.\n4. **For injection issues:** replace string concatenation with parameterized queries or strict input validation.\n5. **For config issues:** update the config files and explain what each change does.\n\nUse \`process.env.VAR_NAME\` for any new environment variables and tell me what to add to my \`.env.local\` file.\n\n**Preserve all existing application logic without exception. Do not remove, alter, or interfere with any functional code while resolving errors — fixes must be strictly additive or targeted, leaving all other logic entirely intact.**\n\nWhen all fixes are applied, give me:\n- A summary of files changed\n- A list of new environment variables to set\n- Any manual steps I still need to do (rotating keys, updating CI, etc.)\n\nStart by acknowledging this plan, then proceed file by file.`;

  return `${intro}## Issues to fix\n\n${issueBlocks}${instructions}`;
}
