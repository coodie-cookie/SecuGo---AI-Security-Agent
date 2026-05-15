# SecuGo

**AI-powered security for modern startups and AI-built apps.**

SecuGo scans your repositories for exposed secrets, vulnerabilities, and dangerous mistakes — then explains everything in beginner-friendly language with AI-powered guidance. Built for indie hackers, vibe coders, and startup teams shipping with Cursor, Claude, Lovable, Bolt, and friends.

---

## ✨ What's inside

- **Cinematic landing page** — hero, scan preview, features, "why AI-built apps need security", how-it-works, testimonials, CTA, footer.
- **Premium 4-slide onboarding** — fullscreen, animated, skippable.
- **GitHub-OAuth login** via Supabase Auth (graceful demo-mode fallback).
- **Dashboard** — overview, repositories, scans, scan detail with vulnerability cards, AI assistant chat, settings.
- **Mock scanning engine** — animated terminal logs, progress, severity breakdowns. Architecture is ready to plug in Gitleaks / TruffleHog / Semgrep / CodeQL.
- **AI assistant** — chat UI with suggestion chips and context-aware mock responses.
- **Supabase schema** — `profiles`, `onboarding_state`, `repositories`, `scans`, `vulnerabilities`, `chat_messages`, all with RLS.

## 🧱 Tech stack

- Next.js 15 (App Router) · TypeScript · Tailwind CSS
- shadcn/ui-style primitives · Framer Motion · Lucide React
- Supabase (Auth + Postgres) — `@supabase/ssr`
- Vercel-ready

## 🚀 Getting started

```bash
# 1. Install deps
npm install

# 2. (Optional) wire up Supabase
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Run
npm run dev
```

Open <http://localhost:3000>.

> **No Supabase keys?** No problem. SecuGo runs in **demo mode**: clicking *Continue with GitHub* sets a demo session cookie and walks you through onboarding into the dashboard with realistic mock data.

## 🔐 Supabase setup

1. Create a new Supabase project.
2. In **Authentication → Providers**, enable **GitHub** and add your GitHub OAuth app credentials. Set the redirect URL to:
   ```
   https://<your-domain>/auth/callback
   ```
3. In the SQL editor, run the schema:
   ```bash
   supabase/schema.sql
   ```
4. Copy your project URL + anon key into `.env.local`.

## 🗂️ Project structure

```
app/
  (landing)/page.tsx           # Marketing site
  onboarding/                   # 4-slide cinematic intro
  login/                        # GitHub OAuth entry
  auth/callback/route.ts        # OAuth code exchange
  dashboard/
    layout.tsx                  # Sidebar + topbar
    page.tsx                    # Overview (stats, score, activity)
    repositories/               # Repo grid + scan trigger
    scans/                      # Scan history
    scans/[id]/                 # Vulnerability detail
    assistant/                  # AI chat
    settings/                   # Profile, integrations, prefs
components/
  brand/                        # Logo
  effects/                      # Particles, grid, glow
  landing/                      # Hero, features, CTA, ...
  onboarding/                   # 4 slide visuals
  dashboard/                    # Sidebar, topbar, cards, modals
  ui/                           # Button, Card, Badge, Input, ...
lib/
  supabase/                     # client, server, middleware helpers
  mock-data.ts                  # Realistic demo data
  utils.ts                      # cn(), time formatting
types/
  index.ts                      # Repository, Vulnerability, Scan, ...
supabase/
  schema.sql                    # Postgres schema + RLS policies
middleware.ts                   # Route protection + Supabase session refresh
```

## 🧪 Demo highlights

- Visit `/` for the landing page.
- Visit `/onboarding` to see the 4-slide flow.
- Visit `/login` and click *Continue with GitHub* — without env vars, you'll be dropped into the dashboard via demo mode.
- From the dashboard:
  - **Repositories** → click *Scan repository* on any card for the animated terminal.
  - **Scans** → click any scan to see the vulnerability cards with AI explanations and copy-pasteable fixes.
  - **AI Assistant** → ask a question or pick a suggestion chip.

## 🧭 Plugging in real scanning

The mock engine in `components/dashboard/scan-modal.tsx` and the data shape in `lib/mock-data.ts` mirror what real scanners emit:

- **Gitleaks / TruffleHog** → `category: 'secret'`
- **npm audit / Snyk / Trivy** → `category: 'dependency'`
- **Semgrep / CodeQL** → `category: 'auth' | 'injection' | 'config'`

Replace the in-memory data with rows from `vulnerabilities`, kick off scans via a Supabase Edge Function or background worker, and the UI is ready.

---

Made with care for builders. Stay safe out there.
