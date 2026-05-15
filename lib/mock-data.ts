import type { Repository, Vulnerability, Scan, ChatMessage } from "@/types";

export const mockRepositories: Repository[] = [
  {
    id: "repo-1",
    name: "ai-todo-app",
    fullName: "indie-hacker/ai-todo-app",
    description: "AI-powered todo list built with Cursor and Next.js",
    visibility: "public",
    language: "TypeScript",
    stars: 142,
    updatedAt: "2026-05-08T14:23:00Z",
    riskLevel: "critical",
    scanStatus: "complete",
    lastScanAt: "2026-05-08T15:00:00Z",
    vulnerabilityCount: 7,
  },
  {
    id: "repo-2",
    name: "saas-starter",
    fullName: "indie-hacker/saas-starter",
    description: "Modern SaaS boilerplate with Stripe + Supabase",
    visibility: "private",
    language: "TypeScript",
    stars: 23,
    updatedAt: "2026-05-07T09:12:00Z",
    riskLevel: "medium",
    scanStatus: "complete",
    lastScanAt: "2026-05-07T10:30:00Z",
    vulnerabilityCount: 3,
  },
  {
    id: "repo-3",
    name: "claude-research-agent",
    fullName: "indie-hacker/claude-research-agent",
    description: "Autonomous research assistant using Claude API",
    visibility: "public",
    language: "Python",
    stars: 68,
    updatedAt: "2026-05-06T18:45:00Z",
    riskLevel: "high",
    scanStatus: "complete",
    lastScanAt: "2026-05-06T19:00:00Z",
    vulnerabilityCount: 4,
  },
  {
    id: "repo-4",
    name: "landing-page",
    fullName: "indie-hacker/landing-page",
    description: "Personal portfolio site",
    visibility: "public",
    language: "TypeScript",
    stars: 5,
    updatedAt: "2026-05-04T11:30:00Z",
    riskLevel: "safe",
    scanStatus: "complete",
    lastScanAt: "2026-05-04T12:00:00Z",
    vulnerabilityCount: 0,
  },
  {
    id: "repo-5",
    name: "vibe-code-editor",
    fullName: "indie-hacker/vibe-code-editor",
    description: "AI-first code editor experiment",
    visibility: "private",
    language: "TypeScript",
    stars: 11,
    updatedAt: "2026-05-03T07:18:00Z",
    riskLevel: "low",
    scanStatus: "idle",
    vulnerabilityCount: 1,
  },
  {
    id: "repo-6",
    name: "stripe-checkout-demo",
    fullName: "indie-hacker/stripe-checkout-demo",
    description: "One-click payment flow built with Bolt",
    visibility: "public",
    language: "JavaScript",
    stars: 34,
    updatedAt: "2026-05-01T16:09:00Z",
    riskLevel: "high",
    scanStatus: "complete",
    lastScanAt: "2026-05-01T17:00:00Z",
    vulnerabilityCount: 5,
  },
];

export const mockVulnerabilities: Vulnerability[] = [
  {
    id: "vuln-1",
    repositoryId: "repo-1",
    scanId: "scan-1",
    title: "Exposed OpenAI API Key",
    severity: "critical",
    category: "secret",
    file: "src/lib/openai.ts",
    line: 4,
    description:
      "An OpenAI API key is hardcoded directly in the source file and committed to the repository.",
    aiExplanation:
      "Anyone who clones or views this public repo can grab this key and use your OpenAI account to generate massive bills, leak data, or impersonate your app. This is the single most common — and most expensive — mistake in AI-built apps.",
    suggestedFix:
      "Move the key into an environment variable (e.g. OPENAI_API_KEY) and read it from process.env at runtime. Then rotate the exposed key in your OpenAI dashboard right away — assume it's already compromised.",
    codeSnippet: `import OpenAI from "openai";\n\nconst openai = new OpenAI({\n  apiKey: "sk-proj-9aXk...REDACTED...x83Z"\n});`,
    fixedSnippet: `import OpenAI from "openai";\n\nconst openai = new OpenAI({\n  apiKey: process.env.OPENAI_API_KEY!\n});`,
    detectedAt: "2026-05-08T15:00:00Z",
    status: "open",
  },
  {
    id: "vuln-2",
    repositoryId: "repo-1",
    scanId: "scan-1",
    title: "Supabase Service Role Key Committed to .env",
    severity: "critical",
    category: "secret",
    file: ".env",
    line: 3,
    description:
      "The Supabase service_role key is present in a tracked .env file. This key bypasses Row Level Security entirely.",
    aiExplanation:
      "The service_role key is the master key for your database — it ignores all your security rules. If someone finds this, they can read, write, or delete any row in any table. .env files should never be committed.",
    suggestedFix:
      "Add `.env` and `.env.local` to your `.gitignore`, remove the file from history with `git filter-repo`, then rotate the service_role key in the Supabase dashboard.",
    detectedAt: "2026-05-08T15:00:00Z",
    status: "open",
  },
  {
    id: "vuln-3",
    repositoryId: "repo-1",
    scanId: "scan-1",
    title: "Public /admin route with no authentication",
    severity: "high",
    category: "auth",
    file: "src/app/admin/page.tsx",
    description:
      "The /admin route renders user management UI without checking whether the visitor is authenticated or an admin.",
    aiExplanation:
      "Anyone who navigates to yoursite.com/admin sees the admin panel. AI coding tools sometimes generate routes without auth guards because the prompt didn't mention them.",
    suggestedFix:
      "Wrap the page in a server-side auth check using your Supabase session, and verify the user has an admin role before rendering. Redirect to /login if not authorized.",
    codeSnippet: `export default function AdminPage() {\n  return <UserManagementPanel />;\n}`,
    fixedSnippet: `import { redirect } from "next/navigation";\nimport { createClient } from "@/lib/supabase/server";\n\nexport default async function AdminPage() {\n  const supabase = createClient();\n  const { data: { user } } = await supabase.auth.getUser();\n  if (!user || user.app_metadata?.role !== "admin") redirect("/login");\n  return <UserManagementPanel />;\n}`,
    detectedAt: "2026-05-08T15:00:00Z",
    status: "open",
  },
  {
    id: "vuln-4",
    repositoryId: "repo-1",
    scanId: "scan-1",
    title: "Outdated next.js with known RCE",
    severity: "high",
    category: "dependency",
    file: "package.json",
    description:
      "next@13.4.1 has a known remote code execution vulnerability (CVE-2024-34351).",
    aiExplanation:
      "Older Next.js versions have security holes that have already been patched. Running an outdated version means you're knowingly leaving the door open.",
    suggestedFix:
      "Run `npm install next@latest` and redeploy. Set up Dependabot or Renovate so you get notified of future CVEs automatically.",
    detectedAt: "2026-05-08T15:00:00Z",
    status: "open",
  },
  {
    id: "vuln-5",
    repositoryId: "repo-1",
    scanId: "scan-1",
    title: "CORS configured with wildcard origin",
    severity: "medium",
    category: "config",
    file: "next.config.mjs",
    description:
      "Access-Control-Allow-Origin is set to `*`, allowing any website to call your API.",
    aiExplanation:
      "Wildcard CORS lets any website make requests to your API from a user's browser, which can be abused for cross-site attacks if any of your endpoints rely on cookies for auth.",
    suggestedFix:
      "Replace `*` with an explicit allowlist of your production domains.",
    detectedAt: "2026-05-08T15:00:00Z",
    status: "open",
  },
  {
    id: "vuln-6",
    repositoryId: "repo-1",
    scanId: "scan-1",
    title: "User input passed directly into SQL query",
    severity: "critical",
    category: "injection",
    file: "src/app/api/search/route.ts",
    line: 12,
    description:
      "A user-supplied `q` parameter is concatenated into a raw SQL string.",
    aiExplanation:
      "This is a classic SQL injection. An attacker can craft a query string that dumps your entire database or deletes tables. Always use parameterized queries.",
    suggestedFix:
      "Switch to a parameterized query — your ORM/Supabase client supports this natively. Never concatenate user input into SQL strings.",
    codeSnippet: `const { data } = await supabase.rpc(\n  "raw_sql",\n  { query: \`SELECT * FROM posts WHERE title LIKE '%\${q}%'\` }\n);`,
    fixedSnippet: `const { data } = await supabase\n  .from("posts")\n  .select("*")\n  .ilike("title", \`%\${q}%\`);`,
    detectedAt: "2026-05-08T15:00:00Z",
    status: "open",
  },
  {
    id: "vuln-7",
    repositoryId: "repo-1",
    scanId: "scan-1",
    title: "Missing rate limiting on /api/chat",
    severity: "medium",
    category: "config",
    file: "src/app/api/chat/route.ts",
    description:
      "The AI chat endpoint has no rate limiting, allowing unlimited requests per IP.",
    aiExplanation:
      "Without rate limits, anyone can hammer your endpoint and run up your OpenAI bill. This is one of the top ways AI-built apps get drained overnight.",
    suggestedFix:
      "Add a rate limiter — Upstash Ratelimit + Vercel KV is a 10-line drop-in solution. Cap to e.g. 10 requests / minute per IP.",
    detectedAt: "2026-05-08T15:00:00Z",
    status: "open",
  },
  {
    id: "vuln-8",
    repositoryId: "repo-3",
    scanId: "scan-3",
    title: "Anthropic API key in client bundle",
    severity: "critical",
    category: "secret",
    file: "src/components/ChatBox.tsx",
    line: 8,
    description: "ANTHROPIC_API_KEY is referenced from client-side code, embedding it in the JS bundle shipped to users.",
    aiExplanation:
      "Any environment variable used in a React component (without the right prefix or server boundary) ends up in the JavaScript downloaded by every visitor's browser. They can extract it from devtools in seconds.",
    suggestedFix:
      "Move all Anthropic SDK calls to a server route or server action. The browser should call your server, your server calls Anthropic.",
    detectedAt: "2026-05-06T19:00:00Z",
    status: "open",
  },
  {
    id: "vuln-9",
    repositoryId: "repo-3",
    scanId: "scan-3",
    title: "Eval used to run user-supplied prompts",
    severity: "high",
    category: "injection",
    file: "agent/runner.py",
    line: 47,
    description:
      "The agent uses Python's eval() on strings returned by the model.",
    aiExplanation:
      "If your model is ever prompt-injected, eval gives the attacker direct Python execution on your server. This is one of the most dangerous patterns in AI agent code.",
    suggestedFix:
      "Replace eval with a strict parser that only handles the actions you've explicitly defined. Treat all model output as untrusted input.",
    detectedAt: "2026-05-06T19:00:00Z",
    status: "open",
  },
  {
    id: "vuln-10",
    repositoryId: "repo-2",
    scanId: "scan-2",
    title: "Stripe webhook missing signature verification",
    severity: "high",
    category: "auth",
    file: "src/app/api/webhooks/stripe/route.ts",
    description: "Webhook handler trusts incoming request bodies without verifying the Stripe signature header.",
    aiExplanation:
      "Anyone who knows your webhook URL can POST fake events and trick your app into granting paid access for free.",
    suggestedFix:
      "Use stripe.webhooks.constructEvent with your webhook secret to verify the signature on every incoming request.",
    detectedAt: "2026-05-07T10:30:00Z",
    status: "open",
  },
  {
    id: "vuln-11",
    repositoryId: "repo-2",
    scanId: "scan-2",
    title: "RLS disabled on `profiles` table",
    severity: "medium",
    category: "config",
    file: "supabase/migrations/0001_init.sql",
    description: "Row Level Security is not enabled on the profiles table.",
    aiExplanation:
      "Without RLS, your anon key can read every profile in the database. Most Supabase data leaks happen this way.",
    suggestedFix:
      "ALTER TABLE profiles ENABLE ROW LEVEL SECURITY; then add policies for SELECT/UPDATE that scope to auth.uid().",
    detectedAt: "2026-05-07T10:30:00Z",
    status: "open",
  },
  {
    id: "vuln-12",
    repositoryId: "repo-2",
    scanId: "scan-2",
    title: "Outdated `axios` with prototype pollution CVE",
    severity: "low",
    category: "dependency",
    file: "package.json",
    description: "axios@0.21.1 has a known prototype pollution issue.",
    aiExplanation:
      "Lower-severity dependency CVEs that are still worth fixing during regular maintenance.",
    suggestedFix: "Run `npm install axios@latest`.",
    detectedAt: "2026-05-07T10:30:00Z",
    status: "open",
  },
  {
    id: "vuln-13",
    repositoryId: "repo-6",
    scanId: "scan-6",
    title: "Stripe secret key in client component",
    severity: "critical",
    category: "secret",
    file: "src/components/CheckoutButton.tsx",
    line: 3,
    description: "STRIPE_SECRET_KEY referenced from a client component.",
    aiExplanation:
      "Stripe secret keys give full access to your Stripe account — refunding charges, viewing customers, creating payouts. In a client bundle, this is catastrophic.",
    suggestedFix:
      "Create a /api/checkout server route, do the Stripe call there, return the session URL. The browser only ever sees the public key.",
    detectedAt: "2026-05-01T17:00:00Z",
    status: "open",
  },
];

export const mockScans: Scan[] = [
  {
    id: "scan-1",
    repositoryId: "repo-1",
    startedAt: "2026-05-08T14:58:00Z",
    completedAt: "2026-05-08T15:00:00Z",
    status: "complete",
    vulnerabilityCount: 7,
    criticalCount: 3,
    highCount: 2,
    mediumCount: 2,
    lowCount: 0,
    filesScanned: 142,
    duration: 124,
  },
  {
    id: "scan-2",
    repositoryId: "repo-2",
    startedAt: "2026-05-07T10:28:00Z",
    completedAt: "2026-05-07T10:30:00Z",
    status: "complete",
    vulnerabilityCount: 3,
    criticalCount: 0,
    highCount: 1,
    mediumCount: 1,
    lowCount: 1,
    filesScanned: 89,
    duration: 96,
  },
  {
    id: "scan-3",
    repositoryId: "repo-3",
    startedAt: "2026-05-06T18:57:00Z",
    completedAt: "2026-05-06T19:00:00Z",
    status: "complete",
    vulnerabilityCount: 4,
    criticalCount: 1,
    highCount: 2,
    mediumCount: 1,
    lowCount: 0,
    filesScanned: 67,
    duration: 152,
  },
];

export const mockChatHistory: ChatMessage[] = [
  {
    id: "msg-1",
    role: "assistant",
    content:
      "Hey 👋 I'm your SecuGo AI assistant. I can explain any vulnerability, walk you through fixes, or answer security questions in plain English. What would you like to look at first?",
    timestamp: new Date().toISOString(),
  },
];

export const sampleAssistantReplies: Record<string, string> = {
  default:
    "Great question. In short: the safest pattern is to keep all secrets server-side, validate user input at every boundary, and assume any value coming from the browser is untrusted. Want me to walk through a specific issue in your repo?",
  secret:
    "Treat any secret that has ever been committed as already leaked — even if you delete the file in the next commit, Git keeps the history forever. Rotate the key first, then clean up the repo.",
  rls:
    "RLS (Row Level Security) is Postgres saying \"only return rows that match this rule\". Without it, your anon key can read your whole database. Always enable it on user-facing tables, then write policies tied to auth.uid().",
  cors:
    "Wildcard CORS (`*`) is fine for fully public APIs, but the moment you accept cookies or auth headers from the browser, you need an explicit allowlist of your own domains.",
};
