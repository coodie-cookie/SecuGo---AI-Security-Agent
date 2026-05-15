import { geminiModel } from "@/lib/gemini";

export interface ScanFinding {
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  category: "secret" | "dependency" | "config" | "auth" | "injection" | "exposure";
  file: string;
  line?: number;
  description: string;
  aiExplanation: string;
  suggestedFix: string;
  codeSnippet?: string;
}

// ─── Secret / hardcoded credential patterns ──────────────────────────────────
const SECRET_PATTERNS: {
  name: string;
  regex: RegExp;
  severity: ScanFinding["severity"];
  description: string;
  fix: string;
}[] = [
  {
    name: "Exposed OpenAI API Key",
    regex: /sk-(?:proj-)?[A-Za-z0-9_-]{20,}/,
    severity: "critical",
    description: "An OpenAI API key is hardcoded in source code and may be committed to version control.",
    fix: "Move to process.env.OPENAI_API_KEY, add to .env.local, and rotate the exposed key immediately in your OpenAI dashboard.",
  },
  {
    name: "Exposed Anthropic API Key",
    regex: /sk-ant-[A-Za-z0-9_-]{20,}/,
    severity: "critical",
    description: "An Anthropic Claude API key is hardcoded in source code.",
    fix: "Move to process.env.ANTHROPIC_API_KEY and rotate the key in your Anthropic dashboard immediately.",
  },
  {
    name: "Exposed Google / Gemini API Key",
    regex: /AIza[0-9A-Za-z\-_]{35}/,
    severity: "critical",
    description: "A Google API key (used for Gemini, Maps, Firebase etc.) is hardcoded in source code.",
    fix: "Move to process.env.GOOGLE_API_KEY and restrict the key's allowed APIs in Google Cloud Console.",
  },
  {
    name: "Exposed Stripe Live Secret Key",
    regex: /sk_live_[0-9a-zA-Z]{24,}/,
    severity: "critical",
    description: "A live Stripe secret key is hardcoded. This grants full access to your Stripe account including payouts.",
    fix: "Move to process.env.STRIPE_SECRET_KEY immediately and rotate the key in the Stripe dashboard. This is your money.",
  },
  {
    name: "Exposed Stripe Test Secret Key",
    regex: /sk_test_[0-9a-zA-Z]{24,}/,
    severity: "high",
    description: "A Stripe test secret key is hardcoded. Even test keys should not be in source code.",
    fix: "Move to process.env.STRIPE_SECRET_KEY to build the right habit — keys should never be in code.",
  },
  {
    name: "Exposed GitHub Personal Access Token",
    regex: /gh[pousr]_[A-Za-z0-9_]{36,}/,
    severity: "critical",
    description: "A GitHub personal access token is hardcoded. This can be used to access and modify your GitHub repositories.",
    fix: "Revoke this token immediately on github.com/settings/tokens and use environment variables.",
  },
  {
    name: "Hardcoded JWT Secret",
    regex: /jwt[_-]?secret\s*[=:]\s*['"][^'"]{6,}['"]/i,
    severity: "critical",
    description: "A JWT signing secret is hardcoded. Anyone with access to your code can forge authentication tokens.",
    fix: "Use a long random secret in process.env.JWT_SECRET. Generate one with: openssl rand -base64 32",
  },
  {
    name: "Hardcoded Database Password",
    regex: /(?:db|database|mysql|postgres|mongo)[_-]?password\s*[=:]\s*['"][^'"]{4,}['"]/i,
    severity: "critical",
    description: "A database password is hardcoded in source code.",
    fix: "Move to process.env.DATABASE_PASSWORD and rotate the credential immediately.",
  },
  {
    name: "AWS Access Key Exposed",
    regex: /AKIA[0-9A-Z]{16}/,
    severity: "critical",
    description: "An AWS access key ID is hardcoded. Combined with the secret key, this grants full AWS API access.",
    fix: "Deactivate this key in AWS IAM immediately and move credentials to environment variables or IAM roles.",
  },
  {
    name: "Secret in NEXT_PUBLIC_ Variable",
    // Exclude NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY —
    // these are intentionally public by Supabase design.
    regex: /NEXT_PUBLIC_(?!SUPABASE_URL|SUPABASE_ANON_KEY)(?:.*(?:key|secret|token|password|api)[^=\n]*)/i,
    severity: "critical",
    description: "A variable with NEXT_PUBLIC_ prefix is being used for what appears to be a secret. NEXT_PUBLIC_ variables are embedded into the browser JavaScript bundle — every visitor can see them.",
    fix: "Remove the NEXT_PUBLIC_ prefix. Server-side secrets must use plain env vars (process.env.MY_SECRET) and only be accessed in API routes or server components.",
  },
];

// ─── Code pattern patterns (auth, injection, config) ─────────────────────────
const CODE_PATTERNS: {
  name: string;
  regex: RegExp;
  severity: ScanFinding["severity"];
  category: ScanFinding["category"];
  description: string;
  fix: string;
  fileFilter?: RegExp;
}[] = [
  {
    name: "eval() on Untrusted Input",
    regex: /eval\s*\(/,
    severity: "critical",
    category: "injection",
    description: "eval() executes a string as code. If user input or AI model output ever reaches eval(), it enables remote code execution.",
    fix: "Remove eval(). Use JSON.parse() for data, or a strict whitelist parser for commands. Never evaluate untrusted strings.",
  },
  {
    name: "SQL Injection — String Concatenation",
    regex: /(?:query|sql|db\.raw)\s*\([`'"]\s*SELECT.*\$\{/is,
    severity: "critical",
    category: "injection",
    description: "User input is being concatenated directly into a SQL query string, enabling SQL injection attacks.",
    fix: "Use parameterized queries. With Supabase: .eq('column', value). With raw SQL: db.query('SELECT ... WHERE id = $1', [id])",
  },
  {
    name: "dangerouslySetInnerHTML (XSS Risk)",
    regex: /dangerouslySetInnerHTML/,
    severity: "high",
    category: "injection",
    description: "dangerouslySetInnerHTML can execute malicious scripts if the content includes unsanitized user input.",
    fix: "Sanitize HTML with DOMPurify before passing to dangerouslySetInnerHTML, or use a safe rendering library.",
  },
  {
    name: "Wildcard CORS Configuration",
    // Matches both header string format and JS object property format
    regex: /(?:Access-Control-Allow-Origin["']?\s*[=:]\s*["']?\s*\*|["']Access-Control-Allow-Origin["']\s*:\s*["']\*)/,
    severity: "high",
    category: "config",
    description: "CORS is set to allow all origins (*). Any website can make cross-origin requests to your API.",
    fix: "Replace * with your specific allowed domains: 'https://yourapp.com'. Only use * for truly public APIs that don't use cookies.",
  },
  {
    name: "Missing Stripe Webhook Signature Verification",
    // Matches Stripe import without constructEvent in the same file (checked via whole-file scan below)
    regex: /stripe.*webhook|webhook.*stripe|checkout\.session\.completed|payment_intent\.(succeeded|failed)/i,
    severity: "high",
    category: "auth",
    description: "A Stripe webhook handler was found. Without signature verification, anyone can send fake payment events to your endpoint.",
    fix: "Add: const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET). Reject if it throws.",
    fileFilter: /\.(ts|js)x?$/,
  },
  {
    name: "No Rate Limiting on AI Endpoint",
    regex: /(?:openai|anthropic|gemini|generateContent|createCompletion|chat\.completions)/i,
    severity: "high",
    category: "config",
    description: "An AI API call was found in a route handler with no visible rate limiting. Without limits, a single user can drain your entire AI budget overnight.",
    fix: "Add rate limiting with Upstash Ratelimit (10-minute setup): npm install @upstash/ratelimit @upstash/redis",
    fileFilter: /(?:api|route)\.(ts|js)x?$/,
  },
  {
    name: "Unprotected Admin Route",
    regex: /export\s+(?:default\s+)?(?:async\s+)?function\s+\w*[Aa]dmin/,
    severity: "high",
    category: "auth",
    description: "An admin page or function was found with no visible authentication check. AI code generators often skip auth on admin pages.",
    fix: "Add a server-side auth check at the top: const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect('/login');",
    fileFilter: /\.(ts|js)x?$/,
  },
  {
    name: ".env File Committed to Repository",
    regex: /.*/,
    severity: "critical",
    category: "secret",
    description: "A .env file is present in the repository. Environment files contain secrets and must never be committed to version control.",
    fix: "Add .env, .env.local, and .env.*.local to your .gitignore immediately. Remove from history with: git filter-repo --path .env --invert-paths",
    fileFilter: /^\.env/,
  },
  {
    name: "Console.log Leaking Sensitive Data",
    regex: /console\.log\s*\(.*(?:token|key|secret|password|auth|jwt|session)/i,
    severity: "medium",
    category: "exposure",
    description: "console.log with a potentially sensitive variable name was found. In production, this logs credentials to server logs which may be stored or monitored.",
    fix: "Remove console.log statements that include tokens, keys, or user credentials before deploying to production.",
  },
  {
    name: "Python eval() on Model Output",
    regex: /eval\s*\(.*(?:response|output|result|model|llm|gpt|claude|gemini)/i,
    severity: "critical",
    category: "injection",
    description: "Python eval() is being called on what appears to be AI model output. This enables prompt injection attacks to run arbitrary code on your server.",
    fix: "Never pass model output to eval(). Parse structured responses with json.loads() and validate against a strict schema.",
    fileFilter: /\.py$/,
  },
  {
    name: "Missing .gitignore for .env Files",
    regex: /.*/,
    severity: "high",
    category: "config",
    description: "No .gitignore rule was found for .env files. This means environment files with secrets could be accidentally committed.",
    fix: "Add these lines to your .gitignore: .env, .env.local, .env.*.local, .env.production",
    fileFilter: /^\.gitignore$/,
  },
];

// ─── GitHub API helpers ───────────────────────────────────────────────────────

const RELEVANT_EXTENSIONS = /\.(ts|tsx|js|jsx|py|go|rb|php|java|env|yaml|yml|json|toml|sh)$|^\.env|^\.gitignore|^Dockerfile|docker-compose/i;
const SKIP_PATHS = /node_modules|\.next|\.git|dist\/|build\/|__pycache__|\.cache|coverage\//;
const MAX_FILES = 50;
const MAX_FILE_SIZE = 150_000; // 150KB

async function getRepoTree(
  fullName: string,
  branch: string,
  token: string
): Promise<{ path: string; size: number; sha: string }[]> {
  const res = await fetch(
    `https://api.github.com/repos/${fullName}/git/trees/${branch}?recursive=1`,
    { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" }, cache: "no-store" }
  );
  if (!res.ok) throw new Error(`GitHub tree API ${res.status}`);
  const data = await res.json();
  return (data.tree ?? [])
    .filter(
      (f: any) =>
        f.type === "blob" &&
        RELEVANT_EXTENSIONS.test(f.path) &&
        !SKIP_PATHS.test(f.path) &&
        (f.size ?? 0) < MAX_FILE_SIZE
    )
    .slice(0, MAX_FILES);
}

async function getFileContent(
  fullName: string,
  path: string,
  token: string
): Promise<string> {
  const res = await fetch(
    `https://api.github.com/repos/${fullName}/contents/${encodeURIComponent(path)}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" }, cache: "no-store" }
  );
  if (!res.ok) return "";
  const data = await res.json();
  if (!data.content) return "";
  try {
    return Buffer.from(data.content, "base64").toString("utf-8");
  } catch {
    return "";
  }
}

// ─── Regex scanner ────────────────────────────────────────────────────────────

function runRegexScan(filePath: string, content: string): Omit<ScanFinding, "aiExplanation">[] {
  const findings: Omit<ScanFinding, "aiExplanation">[] = [];
  const lines = content.split("\n");
  const filename = filePath.split("/").pop() ?? "";
  // .env.example and .env.sample are safe to commit — they contain placeholders
  const isEnvFile = /^\.env/.test(filename) && !/\.(example|sample|template)$/.test(filename);
  const isGitignore = /^\.gitignore$/.test(filePath.split("/").pop() ?? "");

  // .env file committed
  if (isEnvFile) {
    const envPattern = CODE_PATTERNS.find((p) => p.name.includes(".env File Committed"));
    if (envPattern) {
      findings.push({
        title: envPattern.name,
        severity: envPattern.severity,
        category: envPattern.category,
        file: filePath,
        description: envPattern.description,
        suggestedFix: envPattern.fix,
        codeSnippet: lines.slice(0, 5).join("\n"),
      });
    }
    // Still check for secrets inside .env files
  }

  // .gitignore missing env rules
  if (isGitignore && !content.includes(".env")) {
    const p = CODE_PATTERNS.find((p) => p.name.includes("gitignore"));
    if (p) {
      findings.push({
        title: p.name,
        severity: p.severity,
        category: p.category,
        file: filePath,
        description: p.description,
        suggestedFix: p.fix,
      });
    }
  }

  // Secret patterns
  for (const pattern of SECRET_PATTERNS) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip comment lines and placeholder values
      if (/^\s*(?:#|\/\/)/.test(line)) continue;
      if (/(?:your[_-]?key|xxx|example|placeholder|insert|here|todo)/i.test(line)) continue;
      if (pattern.regex.test(line)) {
        const match = line.match(pattern.regex)?.[0] ?? "";
        const redacted = match.length > 8
          ? `${match.slice(0, 6)}...${match.slice(-4)}`
          : "REDACTED";
        findings.push({
          title: pattern.name,
          severity: pattern.severity,
          category: "secret",
          file: filePath,
          line: i + 1,
          description: pattern.description,
          suggestedFix: pattern.fix,
          codeSnippet: line.replace(match, redacted).trim(),
        });
        break; // one finding per pattern per file
      }
    }
  }

  // Code patterns (line by line)
  for (const pattern of CODE_PATTERNS) {
    if (pattern.fileFilter && !pattern.fileFilter.test(filePath)) continue;
    if (pattern.name.includes(".env") || pattern.name.includes("gitignore")) continue;
    for (let i = 0; i < lines.length; i++) {
      if (/^\s*(?:#|\/\/)/.test(lines[i])) continue;
      if (pattern.regex.test(lines[i])) {
        findings.push({
          title: pattern.name,
          severity: pattern.severity,
          category: pattern.category,
          file: filePath,
          line: i + 1,
          description: pattern.description,
          suggestedFix: pattern.fix,
          codeSnippet: lines.slice(Math.max(0, i - 1), i + 3).join("\n").trim(),
        });
        break;
      }
    }
  }

  // ── Whole-file checks (patterns that span multiple lines) ──────────────────

  // Stripe webhook without constructEvent: file imports/uses Stripe but never
  // calls constructEvent — classic vibe-coder mistake
  if (
    /\.(ts|js)x?$/.test(filePath) &&
    /stripe|Stripe/i.test(content) &&
    /webhook|checkout\.session|payment_intent/i.test(content) &&
    !/constructEvent/i.test(content)
  ) {
    findings.push({
      title: "Missing Stripe Webhook Signature Verification",
      severity: "high",
      category: "auth",
      file: filePath,
      description:
        "A Stripe webhook handler was found but stripe.webhooks.constructEvent() is never called. Anyone can POST fake payment events to this endpoint.",
      suggestedFix:
        "Add: const event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET). Reject requests that throw.",
    });
  }

  // CORS wildcard: whole-file check as backup for JS object syntax
  if (
    /\.(ts|js)x?$/.test(filePath) &&
    /Access-Control-Allow-Origin/.test(content) &&
    /["']?\s*\*\s*["']?/.test(content.split("Access-Control-Allow-Origin")[1]?.slice(0, 30) ?? "")
  ) {
    if (!findings.some((f) => f.title.includes("CORS"))) {
      findings.push({
        title: "Wildcard CORS Configuration",
        severity: "high",
        category: "config",
        file: filePath,
        description:
          "CORS is set to allow all origins (*). Any website can make cross-origin requests to your API.",
        suggestedFix:
          "Replace * with your specific domain: 'https://yourapp.com'.",
      });
    }
  }

  return findings;
}

// ─── Gemini deep analysis ─────────────────────────────────────────────────────

async function geminiAnalyzeFile(
  filePath: string,
  content: string
): Promise<Omit<ScanFinding, "aiExplanation">[]> {
  const trimmed = content.slice(0, 6000);
  const prompt = `You are a strict security code reviewer. Analyze this Next.js / React / Node.js file for security issues that indie hackers and vibe coders commonly miss.

File: ${filePath}
\`\`\`
${trimmed}
\`\`\`

Flag ALL of the following if present — do not skip any:

1. HARDCODED LISTS: Any array or variable containing emails, usernames, IDs, or roles directly in source code (e.g. ALLOWED_EMAILS, ADMIN_USERS). These leak user info and are hard to update.

2. CLIENT-SIDE AUTH ONLY: Any authentication or authorization check that runs only in a React component or client-side page — an attacker can bypass this by calling APIs directly or disabling JS.

3. MISSING SERVER-SIDE VALIDATION: Login or access control logic that only exists in a frontend component with no corresponding server-side check.

4. HARDCODED SECRETS: Any API key, password, token, or secret string directly in code.

5. EXPOSED SENSITIVE DATA: console.log of tokens, passwords, or user data.

6. INSECURE DIRECT OBJECT REFERENCE: Using user-supplied IDs without verifying ownership.

7. EVAL OR DYNAMIC CODE EXECUTION: eval(), new Function(), or similar.

8. SQL/COMMAND INJECTION: String concatenation into queries or shell commands.

9. CORS WILDCARD: Any response that sets Access-Control-Allow-Origin to * on an API route that handles user data or authentication. This allows any website to make requests to your API.

10. MISSING WEBHOOK SIGNATURE VERIFICATION: Any Stripe webhook handler (look for stripe, webhook, checkout.session, payment_intent) that does NOT call stripe.webhooks.constructEvent(). Without this, anyone can send fake payment events to grant themselves free access.

Be strict on points 9 and 10 — these are extremely common in vibe-coded apps. If you see a Stripe webhook route without constructEvent, always flag it. If you see Access-Control-Allow-Origin set to wildcard, always flag it.

Return a JSON array. Each item must have exactly these fields:
{
  "title": "short descriptive name",
  "severity": "critical" | "high" | "medium" | "low",
  "category": "auth" | "injection" | "config" | "exposure" | "secret",
  "line": <line number as integer, or null>,
  "description": "what is wrong and why it is dangerous (2 sentences)",
  "suggestedFix": "specific fix instruction (1-2 sentences)"
}

Return [] only if there are genuinely zero issues. Return ONLY valid JSON array, no markdown, no explanation.`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    const items = JSON.parse(jsonMatch[0]);
    return items
      .filter((i: any) => i.title && i.severity && i.description)
      .slice(0, 3)
      .map((i: any) => ({
        title: i.title,
        severity: i.severity,
        category: i.category ?? "config",
        file: filePath,
        line: i.line ?? undefined,
        description: i.description,
        suggestedFix: i.suggestedFix ?? "Review and fix the issue.",
      }));
  } catch (e: any) {
    console.error(`Gemini deep scan failed for ${filePath}:`, e?.message ?? e);
    return [];
  }
}

// ─── AI explanation for each finding ─────────────────────────────────────────

async function generateExplanation(finding: Omit<ScanFinding, "aiExplanation">): Promise<string> {
  try {
    const result = await geminiModel.generateContent(
      `In 2 short sentences, explain why this security issue is dangerous for a vibe coder / indie hacker, using plain English:
Title: ${finding.title}
Description: ${finding.description}
No jargon. Be specific about the real-world impact.`
    );
    return result.response.text().trim();
  } catch {
    return finding.description;
  }
}

// ─── Risk level calculator ────────────────────────────────────────────────────

export function calculateRiskLevel(findings: ScanFinding[]) {
  if (findings.some((f) => f.severity === "critical")) return "critical";
  if (findings.some((f) => f.severity === "high")) return "high";
  if (findings.some((f) => f.severity === "medium")) return "medium";
  if (findings.length > 0) return "low";
  return "safe";
}

// ─── Main scan function ───────────────────────────────────────────────────────

export async function scanRepository(
  fullName: string,
  branch: string,
  token: string,
  onProgress: (log: string) => Promise<void>,
  changedFilesFilter?: string[],       // undefined = full scan, [] = no changes
  fileCache?: Map<string, ScanFinding[]>, // file SHA → cached findings
  onCacheWrite?: (sha: string, findings: ScanFinding[]) => void
): Promise<{ findings: ScanFinding[]; filesScanned: number }> {
  await onProgress(`Starting scan of ${fullName}...`);

  // 1. Get file tree
  await onProgress("Fetching repository structure from GitHub...");
  const tree = await getRepoTree(fullName, branch, token);

  // Apply diff filter if provided
  const filteredTree = changedFilesFilter
    ? tree.filter((f) => changedFilesFilter.includes(f.path))
    : tree;

  if (changedFilesFilter && filteredTree.length === 0) {
    return { findings: [], filesScanned: 0 };
  }

  await onProgress(`Found ${filteredTree.length} file${filteredTree.length === 1 ? "" : "s"} to analyse.`);

  const allFindings: ScanFinding[] = [];
  let filesScanned = 0;

  // 2. Regex scan — fetch files in parallel batches of 10
  const regexHits: Map<string, Omit<ScanFinding, "aiExplanation">[]> = new Map();
  const highRiskFiles: string[] = [];
  const BATCH = 10;

  await onProgress(`Scanning ${filteredTree.length} files...`);

  for (let i = 0; i < filteredTree.length; i += BATCH) {
    const batch = filteredTree.slice(i, i + BATCH);
    await Promise.all(batch.map(async (file) => {
    // Check file SHA cache first
    if (fileCache && file.sha && fileCache.has(file.sha)) {
      const cached = fileCache.get(file.sha)!;
      allFindings.push(...cached);
      filesScanned++;
      return;
    }

    const content = await getFileContent(fullName, file.path, token);
    if (!content) return;
    filesScanned++;

    const hits = runRegexScan(file.path, content);
    if (hits.length > 0) {
      regexHits.set(file.path, hits);
    }

    if (/(?:api|route|middleware|auth|login|webhook|admin)/i.test(file.path) &&
      /\.(ts|tsx|js|jsx|py)$/.test(file.path)) {
      highRiskFiles.push(file.path);
    }
    }));
  }

  await onProgress(`Regex scan complete. Found hits in ${regexHits.size} files.`);

  // Write per-file findings to cache
  if (onCacheWrite) {
    for (const file of filteredTree) {
      if (!file.sha || (fileCache && fileCache.has(file.sha))) continue;
      const hits = regexHits.get(file.path) ?? [];
      if (hits.length > 0) onCacheWrite(file.sha, hits as ScanFinding[]);
    }
  }

  // 3. Regex findings — use pre-written explanations instantly (no Gemini needed)
  await onProgress(`Regex scan complete. Found issues in ${regexHits.size} file${regexHits.size === 1 ? "" : "s"}.`);
  for (const [, hits] of regexHits) {
    for (const hit of hits.slice(0, 3)) {
      allFindings.push({ ...hit, aiExplanation: hit.description });
    }
  }

  // 4. Gemini deep analysis on max 2 high-risk files (parallel)
  const toDeepScan = highRiskFiles.filter((f) => !regexHits.has(f)).slice(0, 4);
  await onProgress(`Found ${highRiskFiles.length} high-risk file${highRiskFiles.length === 1 ? "" : "s"} for AI review: ${highRiskFiles.slice(0, 5).join(", ")}${highRiskFiles.length > 5 ? "..." : ""}`);
  if (toDeepScan.length > 0) {
    await onProgress(`Running AI deep scan on: ${toDeepScan.join(", ")}`);
    const contents = await Promise.all(toDeepScan.map((f) => getFileContent(fullName, f, token)));
    const geminiResults = await Promise.all(
      toDeepScan.map((filePath, i) =>
        contents[i] ? geminiAnalyzeFile(filePath, contents[i]) : Promise.resolve([])
      )
    );
    for (let i = 0; i < geminiResults.length; i++) {
      const findings = geminiResults[i];
      await onProgress(`AI found ${findings.length} issue${findings.length === 1 ? "" : "s"} in ${toDeepScan[i]}`);
      for (const gf of findings) {
        allFindings.push({ ...gf, aiExplanation: gf.description });
      }
    }
  } else {
    await onProgress("No additional high-risk files to deep scan.");
  }

  // Deduplicate by file + line (primary) and fuzzy title (secondary).
  // Gemini often reports the same issue with slightly different wording,
  // so we normalise the title before comparing.
  const seen = new Set<string>();
  const unique = allFindings.filter((f) => {
    // Key 1: exact file + line
    const lineKey = `${f.file}::${f.line ?? ""}`;
    // Key 2: file + normalised title (lowercase, strip punctuation)
    const normTitle = f.title.toLowerCase().replace(/[^a-z0-9]/g, "");
    const titleKey = `${f.file}::${normTitle}`;

    if (seen.has(lineKey) || seen.has(titleKey)) return false;
    if (f.line) seen.add(lineKey);
    seen.add(titleKey);
    return true;
  });

  await onProgress(
    unique.length > 0
      ? `✓ Scan complete — found ${unique.length} issue${unique.length === 1 ? "" : "s"}.`
      : "✓ Scan complete — no issues found. Your repo looks clean!"
  );

  return { findings: unique, filesScanned };
}
