"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "./features";

const quotes = [
  {
    q: "Caught a Stripe key I'd shipped 3 weeks earlier. Embarrassing — and exactly what I needed.",
    name: "Maya Chen",
    role: "Solo founder, Tideline",
  },
  {
    q: "Reads like a senior engineer pair-reviewing my Cursor output. Zero security PTSD.",
    name: "Devon Park",
    role: "Indie hacker, Plotwhile",
  },
  {
    q: "We connected 12 repos and had a clean board within an hour. No DevSecOps team required.",
    name: "Ari Weiss",
    role: "CTO, Ledgerly",
  },
];

export function Testimonials() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          eyebrow="Loved by builders"
          title="Made for the team of one — and the team of fifty."
        />
        <div className="mt-14 grid md:grid-cols-3 gap-3">
          {quotes.map((q, i) => (
            <motion.figure
              key={q.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm"
            >
              <blockquote className="text-base text-white/80 leading-relaxed">
                "{q.q}"
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-lime-300 to-lime-700" />
                <div>
                  <div className="text-sm font-medium">{q.name}</div>
                  <div className="text-xs text-white/40">{q.role}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
