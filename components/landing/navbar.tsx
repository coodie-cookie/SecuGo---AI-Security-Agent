"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { label: "Features", anchor: "features" },
  { label: "How it works", anchor: "how" },
  { label: "Why SecuGo", anchor: "why" },
];

export function LandingNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const scrollTo = (anchor: string) => {
    if (pathname !== "/") {
      router.push(`/#${anchor}`);
      return;
    }
    const el = document.getElementById(anchor);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 px-4 pt-4"
    >
      <div className="mx-auto max-w-6xl glass-strong rounded-2xl px-4 py-2.5 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Logo size="sm" />
        </Link>
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {NAV_LINKS.map(({ label, anchor }) => (
            <button
              key={anchor}
              onClick={() => scrollTo(anchor)}
              className="px-3 py-2 text-white/60 hover:text-white transition-colors"
            >
              {label}
            </button>
          ))}
          <Link
            href="/pricing"
            className="px-3 py-2 text-white/60 hover:text-white transition-colors"
          >
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle size="sm" />
          <Button asChild size="sm">
            <Link href="/login">
              <Github className="h-4 w-4" />
              Connect GitHub
            </Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
