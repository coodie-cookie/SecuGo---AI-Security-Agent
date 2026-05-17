"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { LandingNavbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { GridBackground, RadialGlow } from "@/components/effects/grid-bg";
import { Particles } from "@/components/effects/particles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BillingCycle = "monthly" | "yearly";

interface Plan {
  name: string;
  badge?: string;
  bestFor: string;
  monthlyPrice: string;
  yearlyPrice: string;
  yearlyNote?: string;
  description: string;
  features: { label: string; included: boolean; note?: string }[];
  cta: string;
  ctaHref: string | null;
  highlight: boolean;
  comingSoon?: boolean;
}

const plans: Plan[] = [
  {
    name: "Free",
    bestFor: "Students & hobby devs",
    monthlyPrice: "$0",
    yearlyPrice: "$0",
    description: "For weekend builds and side projects.",
    features: [
      { label: "10 scans per week (40/month)", included: true },
      { label: "Up to 10k lines of code", included: true },
      { label: "Git diff scanning", included: true },
      { label: "Basic vulnerability detection (10 types)", included: true },
      { label: "Gemini AI explanations", included: true },
      { label: "3 AI fix prompts every 2 weeks", included: true },
      { label: "PDF reports", included: false, note: "Basic summary only" },
      { label: "Email reports", included: false },
    ],
    cta: "Get started free",
    ctaHref: "/login",
    highlight: false,
  },
  {
    name: "Builder",
    badge: "Most Popular",
    bestFor: "Serious builders & indie hackers",
    monthlyPrice: "$19",
    yearlyPrice: "$15",
    yearlyNote: "$190/year — save $38",
    description: "For indie devs shipping production code.",
    features: [
      { label: "Unlimited scans", included: true },
      { label: "Up to 120k lines of code", included: true },
      { label: "Git diff scanning", included: true },
      { label: "Full vulnerability detection (20+ types)", included: true },
      { label: "Gemini AI explanations", included: true },
      { label: "Unlimited AI fix prompts", included: true },
      { label: "10 PDF reports per month", included: true },
      { label: "Email reports", included: true },
    ],
    cta: "Paid plans coming soon",
    ctaHref: null,
    highlight: true,
    comingSoon: true,
  },
  {
    name: "Studio",
    bestFor: "Agencies & startups",
    monthlyPrice: "$49",
    yearlyPrice: "$39",
    yearlyNote: "$468/year — per user",
    description: "For teams that ship and need accountability.",
    features: [
      { label: "Unlimited scans", included: true },
      { label: "Unlimited lines of code", included: true },
      { label: "Git diff scanning", included: true },
      { label: "Full + custom vulnerability rules", included: true },
      { label: "Gemini AI explanations", included: true },
      { label: "Unlimited AI fix prompts + team library", included: true },
      { label: "Unlimited PDF reports", included: true },
      { label: "Email reports + priority support", included: true },
    ],
    cta: "Paid plans coming soon",
    ctaHref: null,
    highlight: false,
    comingSoon: true,
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

export default function PricingPage() {
  const [billing, setBilling] = useState<BillingCycle>("monthly");

  return (
    <>
      <LandingNavbar />
      <main className="relative min-h-screen overflow-x-hidden">
        <GridBackground />
        <RadialGlow />
        <div className="absolute inset-0 mask-radial pointer-events-none">
          <Particles density={30} />
        </div>

        <section className="relative pt-36 pb-24 px-4">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#6bf900]/30 bg-[#6bf900]/[0.07] text-[#6bf900] text-xs font-mono tracking-widest uppercase mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6bf900] animate-pulse" />
                Pricing model
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight text-balance">
                Free to start. Scales with
                <br className="hidden sm:block" />
                your shipping pace.
              </h1>
              <p className="mt-4 text-white/55 text-lg max-w-xl mx-auto">
                No credit card required. Upgrade anytime as your team grows.
              </p>

              {/* Billing segmented control */}
              <div className="mt-8 flex flex-col items-center gap-2">
                <div className="relative flex items-center rounded-xl border border-white/[0.1] bg-white/[0.04] p-1">
                  {/* Sliding highlight */}
                  <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    className={cn(
                      "absolute top-1 bottom-1 rounded-lg",
                      billing === "yearly"
                        ? "bg-[#6bf900] shadow-[0_0_14px_rgba(107,249,0,0.4)]"
                        : "bg-white/[0.1]"
                    )}
                    style={{ left: billing === "monthly" ? 4 : "50%", right: billing === "yearly" ? 4 : "50%" }}
                  />
                  {(["monthly", "yearly"] as BillingCycle[]).map((cycle) => (
                    <button
                      key={cycle}
                      onClick={() => setBilling(cycle)}
                      className={cn(
                        "relative z-10 px-5 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200 capitalize w-24",
                        billing === cycle
                          ? cycle === "yearly" ? "text-black" : "text-white"
                          : "text-white/45 hover:text-white/70"
                      )}
                    >
                      {cycle}
                    </button>
                  ))}
                </div>
                <div className="h-5">
                  <AnimatePresence>
                    {billing === "yearly" && (
                      <motion.span
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#6bf900]/10 border border-[#6bf900]/30 text-[#6bf900]"
                      >
                        Save up to 20%
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Pricing cards */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch"
            >
              {plans.map((plan) => {
                const price = billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
                const isFree = plan.monthlyPrice === "$0";

                return (
                  <motion.div
                    key={plan.name}
                    variants={cardVariants}
                    className={cn(
                      "relative flex flex-col rounded-2xl border p-7 transition-all",
                      plan.highlight
                        ? "border-[#6bf900]/40 bg-[#6bf900]/[0.04] shadow-[0_0_60px_-20px_rgba(107,249,0,0.25)]"
                        : "border-white/[0.08] bg-white/[0.02]"
                    )}
                  >
                    {plan.highlight && (
                      <div
                        aria-hidden
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{
                          background: "radial-gradient(60% 40% at 50% 0%, rgba(107,249,0,0.10), transparent 70%)",
                        }}
                      />
                    )}

                    <div className="relative flex flex-col flex-1">
                      {/* Plan name + badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-mono tracking-widest uppercase text-white/50">
                          {plan.name}
                        </span>
                        {plan.badge && (
                          <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-full bg-[#6bf900]/10 border border-[#6bf900]/30 text-[#6bf900]">
                            {plan.badge}
                          </span>
                        )}
                      </div>

                      {/* Best for banner */}
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] mb-4 w-fit",
                        plan.highlight
                          ? "bg-[#6bf900]/10 border border-[#6bf900]/20 text-[#6bf900]/80"
                          : "bg-white/[0.04] border border-white/[0.07] text-white/45"
                      )}>
                        <span className={cn("w-1 h-1 rounded-full", plan.highlight ? "bg-[#6bf900]" : "bg-white/30")} />
                        Best for: {plan.bestFor}
                      </div>

                      {/* Price */}
                      <div className="flex items-end gap-1 mb-1">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={price}
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.2 }}
                            className="text-5xl font-bold text-white leading-none"
                          >
                            {price}
                          </motion.span>
                        </AnimatePresence>
                        <span className="text-white/40 text-sm mb-1">/month</span>
                      </div>

                      {/* Yearly note */}
                      <div className="h-5 mb-3">
                        <AnimatePresence>
                          {billing === "yearly" && !isFree && plan.yearlyNote && (
                            <motion.p
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="text-[11px] text-[#6bf900]/70 font-mono"
                            >
                              {plan.yearlyNote}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-white/45 font-mono leading-relaxed mb-6">
                        {plan.description}
                      </p>

                      {/* Features */}
                      <ul className="space-y-2.5 mb-8 flex-1">
                        {plan.features.map((f) => (
                          <li key={f.label} className="flex items-start gap-2.5 text-sm">
                            {f.included ? (
                              <Check className={cn("h-4 w-4 shrink-0 mt-0.5", plan.highlight ? "text-[#6bf900]" : "text-[#6bf900]/70")} />
                            ) : (
                              <X className="h-4 w-4 shrink-0 mt-0.5 text-white/20" />
                            )}
                            <span className={f.included ? "text-white/70" : "text-white/30"}>
                              {f.label}
                              {f.note && <span className="text-white/30 text-xs ml-1">({f.note})</span>}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <div>
                        {plan.comingSoon ? (
                          <button
                            disabled
                            className="w-full h-11 rounded-xl border border-white/[0.1] bg-white/[0.03] text-sm text-white/35 cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-white/25" />
                            Paid plans coming soon
                          </button>
                        ) : (
                          <Button asChild size="lg" variant={plan.highlight ? "default" : "outline"} className="w-full">
                            <Link href={plan.ctaHref!}>{plan.cta}</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Comparison table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-16 overflow-x-auto"
            >
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left py-4 pr-6 text-white/40 font-normal text-xs uppercase tracking-widest w-48">Feature</th>
                    {["Free", "Builder", "Studio"].map((h, i) => (
                      <th key={h} className={cn(
                        "py-4 px-4 text-center font-semibold",
                        i === 1 ? "text-[#6bf900]" : "text-white"
                      )}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Price", cells: ["$0 / month", "$19 / month", "$49 / month per user"] },
                    { feature: "Best for", cells: ["Students, hobby devs", "Serious builders, indie hackers", "Agencies, startups"] },
                    { feature: "Scans", cells: ["10 / week (40/month)", "Unlimited", "Unlimited"] },
                    { feature: "Repository size", cells: ["Up to 10k LOC", "Up to 120k LOC", "Unlimited LOC"] },
                    { feature: "Git diff scanning", cells: [true, true, true] },
                    { feature: "Vulnerability detection", cells: ["Basic (10 types)", "Full (20+ types)", "Full + custom rules"] },
                    { feature: "AI fix prompts", cells: ["3 every 2 weeks", "Unlimited", "Unlimited + team library"] },
                    { feature: "PDF reports", cells: [false, "10 detailed / month", "Unlimited"] },
                  ].map((row, ri) => (
                    <tr key={row.feature} className={cn(
                      "border-b border-white/[0.04] transition-colors hover:bg-white/[0.015]",
                      ri % 2 === 0 ? "" : "bg-white/[0.01]"
                    )}>
                      <td className="py-4 pr-6 text-white/55 font-medium text-sm">{row.feature}</td>
                      {row.cells.map((cell, ci) => (
                        <td key={ci} className={cn("py-4 px-4 text-center", ci === 1 ? "text-white" : "text-white/60")}>
                          {cell === true ? (
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-[#6bf900]/15 mx-auto">
                              <Check className="h-3.5 w-3.5 text-[#6bf900]" />
                            </span>
                          ) : cell === false ? (
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-white/[0.04] mx-auto">
                              <X className="h-3.5 w-3.5 text-white/20" />
                            </span>
                          ) : (
                            <span className={ci === 1 ? "font-medium" : ""}>{cell}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            {/* Bottom note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-10 text-center text-sm text-white/35"
            >
              All plans include GitHub OAuth, Gemini-powered analysis, and the AI security assistant.{" "}
              <Link href="/login" className="text-white/60 hover:text-white transition-colors underline underline-offset-2">
                Start for free →
              </Link>
            </motion.p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
