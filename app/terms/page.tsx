import { LandingNavbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { GridBackground, RadialGlow } from "@/components/effects/grid-bg";

export const metadata = {
  title: "Terms of Service — SecuGo",
  description: "SecuGo terms of service — what you can expect from us and what we expect from you.",
};

const sections = [
  {
    title: "1. Acceptance",
    body: `By accessing or using SecuGo ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. These terms apply to all users, including free-tier users and future paid subscribers.`,
  },
  {
    title: "2. Description of service",
    body: `SecuGo is an AI-powered security scanning tool that connects to your GitHub repositories via OAuth and analyzes code for potential security vulnerabilities. The Service uses Google Gemini to generate AI-powered explanations and suggestions. All findings are advisory — SecuGo does not modify your code or repositories.`,
  },
  {
    title: "3. Your responsibilities",
    body: `You are responsible for ensuring you have the right to scan any repository you connect to SecuGo. Do not use the Service to scan repositories you do not own or have explicit permission to analyze. You must not attempt to reverse-engineer, abuse, or overload the Service. You are responsible for reviewing and verifying all security findings before acting on them — SecuGo's AI may make mistakes.`,
  },
  {
    title: "4. No warranty on findings",
    body: `SecuGo is a security aid, not a guarantee. Scan results are provided on an "as-is" basis. We do not warrant that scans are complete, accurate, or free of false positives or false negatives. You should always apply independent judgment and consult qualified security professionals for critical decisions.`,
  },
  {
    title: "5. Intellectual property",
    body: `SecuGo and its underlying technology, branding, and UI are the intellectual property of SecuGo Inc. Your repository code remains your property at all times. We claim no rights over the content of repositories you scan.`,
  },
  {
    title: "6. Limitation of liability",
    body: `To the maximum extent permitted by applicable law, SecuGo Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, including but not limited to data loss, security breaches, or business interruption.`,
  },
  {
    title: "7. Termination",
    body: `We reserve the right to suspend or terminate your access to the Service at any time for violations of these Terms. You may stop using the Service and revoke GitHub OAuth access at any time from your GitHub settings.`,
  },
  {
    title: "8. Changes to terms",
    body: `We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the new Terms. We will make reasonable efforts to notify users of material changes via the email associated with their account.`,
  },
  {
    title: "9. Contact",
    body: `Questions about these Terms? Email legal@secugo.dev. We aim to respond within 5 business days.`,
  },
];

export default function TermsPage() {
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
              Terms of Service
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight mb-4">
              Plain terms, no surprises.
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
