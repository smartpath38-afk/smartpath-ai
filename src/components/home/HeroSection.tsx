"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";

interface HeroSectionProps {
  locale: string;
}

export default function HeroSection({ locale }: HeroSectionProps) {
  const t = useTranslations("hero");

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(255,255,255,0.08),transparent)]" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ y: 8 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-white/50 text-xs font-medium tracking-wide mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {t("badge")}
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 16 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight text-white leading-[1.08] mb-6"
        >
          {t("title")}
        </motion.h1>

        <motion.p
          initial={{ y: 16 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-10"
        >
          {t("subtitle")}
        </motion.p>

        <motion.div
          initial={{ y: 16 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href={`/${locale}/pricing`}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors"
          >
            {t("cta")}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <a
            href="#examples"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/10 text-white/70 font-medium text-sm hover:border-white/20 hover:text-white transition-colors"
          >
            {t("ctaSecondary")}
          </a>
        </motion.div>

        {/* Social proof */}
        <div className="mt-12 md:mt-16 flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-8 gap-y-3">
          {[
            { value: "8", label: "Avatar Styles" },
            { value: "HD", label: "Quality Output" },
            { value: "< 30s", label: "Generation Time" },
            { value: "3000+", label: "Renders / mo" },
          ].map((stat) => (
            <div key={stat.value} className="text-center">
              <p className="text-white font-semibold text-lg">{stat.value}</p>
              <p className="text-white/30 text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}
