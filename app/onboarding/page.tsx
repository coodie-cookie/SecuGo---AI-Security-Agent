"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Github,
  Shield,
  ShieldCheck,
  ScanSearch,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { Particles } from "@/components/effects/particles";
import { GridBackground, RadialGlow } from "@/components/effects/grid-bg";
import { OnboardingSlide1 } from "@/components/onboarding/slide-1";
import { OnboardingSlide2 } from "@/components/onboarding/slide-2";
import { OnboardingSlide3 } from "@/components/onboarding/slide-3";
import { OnboardingSlide4 } from "@/components/onboarding/slide-4";

const slides = [
  {
    icon: Shield,
    headline: "Welcome to SecuGo",
    subtext: "AI-powered security for modern startups and AI-built apps.",
    Visual: OnboardingSlide1,
    cta: "Get Started",
  },
  {
    icon: ScanSearch,
    headline: "Catch risks before production",
    subtext:
      "Detect exposed API keys, vulnerable packages, and dangerous mistakes — before they become disasters.",
    Visual: OnboardingSlide2,
    cta: "Next",
  },
  {
    icon: Sparkles,
    headline: "Understand problems instantly",
    subtext:
      "SecuGo explains vulnerabilities in plain English and helps you fix them with AI guidance.",
    Visual: OnboardingSlide3,
    cta: "Next",
  },
  {
    icon: ShieldCheck,
    headline: "Connect GitHub. Scan. Ship safely.",
    subtext:
      "Secure your repositories in minutes with a workflow built for founders and modern developers.",
    Visual: OnboardingSlide4,
    cta: "Enter Dashboard",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const finish = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("secugo_onboarding_complete", "true");
    }
    router.push("/dashboard");
  };

  const go = (i: number) => {
    setDirection(i > step ? 1 : -1);
    setStep(i);
  };
  const next = () => (step === slides.length - 1 ? finish() : go(step + 1));
  const back = () => step > 0 && go(step - 1);

  const slide = slides[step];

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(107,249,0,0.12),transparent_60%)]" />
      <GridBackground />
      <RadialGlow />
      <div className="absolute inset-0 mask-radial">
        <Particles density={60} />
      </div>

      {/* Top bar */}
      <header className="relative z-20 flex items-center justify-between px-6 py-5">
        <Logo size="sm" />
        <div className="flex items-center gap-2 text-xs text-white/40">
          <span>{step + 1}</span>
          <span>/</span>
          <span>{slides.length}</span>
        </div>
        <button
          onClick={finish}
          className="flex items-center gap-1.5 text-xs text-white/45 hover:text-white transition-colors"
        >
          Skip <X className="h-3.5 w-3.5" />
        </button>
      </header>

      {/* Progress indicators */}
      <div className="relative z-20 mx-auto max-w-md px-6 mt-2 flex gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className="h-1 flex-1 rounded-full bg-white/[0.06] overflow-hidden"
            aria-label={`Go to step ${i + 1}`}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-lime-500 to-lime-300"
              initial={false}
              animate={{ width: i <= step ? "100%" : "0%" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{
                boxShadow:
                  i <= step ? "0 0 12px rgba(107,249,0,0.6)" : undefined,
              }}
            />
          </button>
        ))}
      </div>

      {/* Slide */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-6 py-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 40 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-5xl grid lg:grid-cols-[1fr_1.1fr] gap-10 items-center"
          >
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-400/10 border border-lime-400/30 shadow-[0_0_40px_-8px_rgba(107,249,0,0.5)]"
              >
                <slide.icon className="h-7 w-7 text-lime-300" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.6 }}
                className="mt-7 text-4xl md:text-6xl font-semibold tracking-tight text-balance leading-[1.05]"
              >
                <span className="text-gradient-subtle">{slide.headline}</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.6 }}
                className="mt-5 max-w-lg mx-auto lg:mx-0 text-base md:text-lg text-white/55 leading-relaxed"
              >
                {slide.subtext}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.6 }}
                className="mt-9 flex items-center gap-2 justify-center lg:justify-start"
              >
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={back}
                  disabled={step === 0}
                  className="disabled:opacity-30"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button size="lg" onClick={next} className="min-w-[180px]">
                  {step === slides.length - 1 && (
                    <Github className="h-4 w-4" />
                  )}
                  {slide.cta}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-square max-w-xl mx-auto w-full"
            >
              <slide.Visual />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
