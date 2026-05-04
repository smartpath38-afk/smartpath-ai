"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { PRICING_PLANS, type PlanDuration } from "@/types";

interface Props {
  locale: string;
}

const DURATIONS: { key: PlanDuration; labelKey: string }[] = [
  { key: "6m", labelKey: "6m" },
  { key: "1y", labelKey: "1y" },
  { key: "2y", labelKey: "2y" },
  { key: "lifetime", labelKey: "lifetime" },
];

export default function PricingPageClient({ locale }: Props) {
  const t = useTranslations("pricing");
  const [activeDuration, setActiveDuration] = useState<PlanDuration>("1y");

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="pt-32 pb-28 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white mb-4"
            >
              {t("title")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white/50 text-lg max-w-lg mx-auto"
            >
              {t("subtitle")}
            </motion.p>
          </div>

          {/* Duration switcher */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex justify-center mb-12"
          >
            <div className="flex gap-1 p-1 rounded-xl bg-white/[0.05] border border-white/[0.07] flex-wrap justify-center">
              {DURATIONS.map((d) => (
                <button
                  key={d.key}
                  onClick={() => setActiveDuration(d.key)}
                  className={`px-3 sm:px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeDuration === d.key
                      ? "bg-white text-black"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  {t(`duration.${d.labelKey}`)}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Pricing grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {PRICING_PLANS.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`relative rounded-2xl border flex flex-col p-5 md:p-7 ${
                  plan.popular
                    ? "border-white/25 bg-white/[0.07]"
                    : "border-white/[0.08] bg-white/[0.02]"
                }`}
              >
                {plan.popular && (
                  <>
                    {/* Mobile: inside the card */}
                    <div className="flex justify-center mb-4 sm:hidden">
                      <span className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-semibold tracking-wide">
                        {t("popular")}
                      </span>
                    </div>
                    {/* Tablet/Desktop: floating above the card */}
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 hidden sm:block">
                      <span className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-semibold tracking-wide">
                        {t("popular")}
                      </span>
                    </div>
                  </>
                )}

                {/* Plan name & renders */}
                <div className="mb-6">
                  <h3 className="text-white font-semibold text-base">
                    {t(`plans.${plan.id}.name`)}
                  </h3>
                  <p className="text-white/40 text-sm mt-1">
                    {t(`plans.${plan.id}.renders`)}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className="text-white text-4xl font-bold tracking-tight">
                      ${plan.prices[activeDuration]}
                    </span>
                  </div>
                  <p className="text-white/30 text-xs mt-1.5">
                    {activeDuration !== "lifetime"
                      ? `Annual plan · ${t(`duration.${activeDuration}`)}`
                      : `Max plan · ${t("duration.lifetime")}`}
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-8 flex-1">
                  {(
                    t.raw(`plans.${plan.id}.features`) as string[]
                  ).map((feature: string) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <svg
                        className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-white/60 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={`/${locale}/checkout?plan=${plan.id}&duration=${activeDuration}`}
                  className={`block text-center py-3 rounded-xl text-sm font-semibold transition-colors ${
                    plan.popular
                      ? "bg-white text-black hover:bg-white/90"
                      : "border border-white/10 text-white/80 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {t("cta")}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-8 text-white/25 text-sm"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure Payment
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Cancel Anytime
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              PayPal
            </div>
          </motion.div>
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
