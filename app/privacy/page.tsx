import { LandingNavbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { GridBackground, RadialGlow } from "@/components/effects/grid-bg";

export const metadata = {
  title: "Privacy Policy — SecuGo",
  description: "How SecuGo collects, uses, and protects your data.",
};

const sections = [
  {
    title: "What we collect",
    body: `When you sign in with GitHub, we receive your GitHub username, public email address, and the OAuth access token required to read your repositories. We store your email and user ID in our database to associate your scan results with your account. We do not collect your password, payment information (paid plans are not yet live), or any personal data beyond what GitHub provides during OAuth.`,
  },
  {
    title: "How we use your data",
    body: `Your GitHub token is used exclusively to fetch repository file contents for security scanning. Scan results — including file names, line numbers, and vulnerability descriptions — are stored in our database and associated with your account so you can review them later. We use Google Gemini to perform AI-powered analysis of code snippets. Snippets are sent to Gemini's API over an encrypted connection and are not used to train models under our current API agreement.`,
  },
  {
    title: "What we do not do",
    body: `We do not sell your data. We do not share your repository contents or scan results with third parties except as required to operate the service (Supabase for storage, Google Gemini for AI analysis, Resend for email delivery). We do not store your GitHub access token persistently — it lives only in your encrypted session and is discarded when you sign out.`,
  },
  {
    title: "Data retention",
    body: `Scan results and vulnerability findings are retained for as long as you have an active account. You may delete your account and all associated data at any time by contacting us at privacy@secugo.dev. We will action deletion requests within 30 days.`,
  },
  {
    title: "Cookies",
    body: `SecuGo uses a single session cookie managed by Supabase Auth to keep you signed in. We do not use advertising cookies, tracking pixels, or third-party analytics scripts. No cookie consent banner is shown because we only set strictly necessary cookies.`,
  },
  {
    title: "Third-party services",
    body: `We use Supabase (database and authentication), Google Gemini (AI analysis), and Resend (transactional email). Each of these services has its own privacy policy. We do not use any advertising or social tracking SDKs.`,
  },
  {
    title: "Contact",
    body: `Questions about this policy? Email us at privacy@secugo.dev. We will respond within 5 business days.`,
  },
];

export default function PrivacyPage() {
  return (
    <>
      <LandingNavbar />
      <main className="relative min-h-screen overflow-x-hidden">
        <GridBackground />
        <RadialGlow />

        <section className="relative pt-36 pb-24 px-4">
          <div className="mx-auto max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#6bf900]/30 bg-[#6bf900]/[0.07] text-[#6bf900] text-xs font-mono tracking-widest uppercase mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6bf900] animate-pulse" />
              Privacy Policy
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight mb-4">
              Your data, clearly explained.
            </h1>
            <p className="text-white/40 text-sm mb-14">Last updated: May 2026</p>

            <div className="space-y-10">
              {sections.map(({ title, body }) => (
                <div key={title}>
                  <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
                  <p className="text-white/55 text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
