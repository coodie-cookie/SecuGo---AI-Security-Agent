"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function LandingNavbar() {
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
          <Link
            href="#features"
            className="px-3 py-2 text-white/60 hover:text-white transition-colors"
          >
            Features
          </Link>
          <Link
            href="#how"
            className="px-3 py-2 text-white/60 hover:text-white transition-colors"
          >
            How it works
          </Link>
          <Link
            href="#why"
            className="px-3 py-2 text-white/60 hover:text-white transition-colors"
          >
            Why SecuGo
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle size="sm" />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/login">Sign in</Link>
          </Button>
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
