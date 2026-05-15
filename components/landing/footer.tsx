import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06]">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="col-span-2">
            <Logo size="sm" />
            <p className="mt-4 max-w-xs text-sm text-white/45 leading-relaxed">
              Security for AI-built apps. Built for indie hackers, vibe coders,
              and modern startup teams.
            </p>
          </div>
          <FooterCol
            heading="Product"
            links={[
              ["Features", "#features"],
              ["How it works", "#how"],
              ["Pricing", "#"],
              ["Changelog", "#"],
            ]}
          />
          <FooterCol
            heading="Company"
            links={[
              ["About", "#"],
              ["Security", "#"],
              ["Privacy", "#"],
              ["Terms", "#"],
            ]}
          />
        </div>
        <div className="mt-12 pt-6 border-t border-white/[0.04] space-y-3">
          <div className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-xs text-white/50 text-center">
            <span>🔒</span>
            SecuGo does not modify your repository or code. All findings are read-only. Please review all suggested changes before applying them.
          </div>
          <div className="flex items-center justify-between text-xs text-white/35">
            <span>© {new Date().getFullYear()} SecuGo Inc.</span>
            <span>Made with care for builders.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  heading,
  links,
}: {
  heading: string;
  links: [string, string][];
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-white/35">
        {heading}
      </div>
      <ul className="mt-4 space-y-2.5">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link
              href={href}
              className="text-sm text-white/65 hover:text-white transition-colors"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
