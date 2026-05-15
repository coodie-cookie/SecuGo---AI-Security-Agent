"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const INTERVAL = 30;

const PARTICLES = [
  { x: -60, y: -40, r: 0, emoji: "💥" },
  { x: 55,  y: -35, r: 15, emoji: "✨" },
  { x: -45, y: 30,  r: -10, emoji: "🔒" },
  { x: 60,  y: 25,  r: 5,  emoji: "⚡" },
  { x: 0,   y: -55, r: 0,  emoji: "🛡️" },
];

export function AutoSyncCounter({ onTick }: { onTick?: () => void }) {
  const [count, setCount] = useState(INTERVAL);
  const [boom, setBoom] = useState(false);
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    const t = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          setBoom(true);
          setTimeout(() => setBoom(false), 1800);
          onTickRef.current?.();
          return INTERVAL;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const pct = ((INTERVAL - count) / INTERVAL) * 100;

  return (
    <div className="relative flex flex-col items-center gap-1.5 mt-2">
      {/* Counter row */}
      <div className="flex items-center gap-2 text-[11px] text-white/35">
        <span>Auto scanning in:</span>
        <span className="font-mono text-white/55 tabular-nums w-6 text-center">
          {count}s
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-0.5 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="h-full bg-lime-400/60 rounded-full"
          style={{ width: `${100 - pct}%` }}
          transition={{ duration: 0.9, ease: "linear" }}
        />
      </div>

      {/* Boom explosion */}
      <AnimatePresence>
        {boom && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Particles */}
            {PARTICLES.map((p, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 1, x: 0, y: 0, scale: 0.4, rotate: 0 }}
                animate={{
                  opacity: 0,
                  x: p.x,
                  y: p.y,
                  scale: 1.2,
                  rotate: p.r * 6,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: "easeOut", delay: i * 0.04 }}
                className="absolute text-base select-none"
              >
                {p.emoji}
              </motion.span>
            ))}

            {/* "Boom. updated" text — flies downward */}
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.8 }}
              animate={{ opacity: 1, y: 28, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="absolute whitespace-nowrap text-[11px] font-semibold text-lime-300"
              style={{ textShadow: "0 0 12px rgba(107,249,0,0.8)" }}
            >
              Boom. updated
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
