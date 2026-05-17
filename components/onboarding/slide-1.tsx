"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";

export function OnboardingSlide1() {
  return (
    <div className="relative flex items-center justify-center h-full">
      {/* Glow rings */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1 + i * 0.18, opacity: 0.5 - i * 0.12 }}
          transition={{
            duration: 2.5,
            delay: i * 0.4,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          className="absolute h-56 w-56 rounded-full border border-lime-400/30"
          style={{
            boxShadow: `0 0 ${40 + i * 10}px rgba(107,249,0,${0.2 - i * 0.04})`,
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative h-44 w-44 rounded-3xl bg-gradient-to-br from-lime-300 via-lime-500 to-lime-700 flex items-center justify-center shadow-[0_0_80px_-10px_rgba(107,249,0,0.7)]"
      >
        <Shield className="h-20 w-20 text-black" strokeWidth={2.2} />
        <div className="absolute inset-0 rounded-3xl ring-1 ring-white/30" />
        <motion.div
          className="absolute inset-0 rounded-3xl"
          animate={{ opacity: [0.25, 0.55, 0.25] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          style={{
            background:
              "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4), transparent 60%)",
          }}
        />
      </motion.div>

      {/* Floating accents */}
      {[
        { top: "10%", left: "12%", d: 0 },
        { top: "20%", right: "8%", d: 0.3 },
        { bottom: "15%", left: "18%", d: 0.6 },
        { bottom: "10%", right: "12%", d: 0.9 },
      ].map(({ d, ...pos }, i) => (
        <motion.div
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-lime-300"
          style={{
            ...pos,
            boxShadow: "0 0 12px rgba(107,249,0,0.8)",
          }}
          animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 3, delay: d, repeat: Infinity }}
        />
      ))}
    </div>
  );
}
