"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";
import { PRICING_PLANS } from "@/types";

interface Props {
  locale: string;
}

export default function PricingPreviewSection({ locale }: Props) {
  const t = useTranslations("pricing");

  return (
    <section className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.p
            initial={{ y: 8 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            className="text-white/40 text-sm font-medium tracking-widest uppercase mb-3"
          >
            Pricing
          </motion.p>
          <motion.h2
            initial={{ y: 12 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-4xl md:text-5xl font-semibold tracking-tight text-white"
          >
            {t("title")}
          </motion.h2>
          <motion.p
            initial={{ y: 12 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/40 mt-4 text-lg max-w-xl mx-auto"
          >
            {t("subtitle")}
          </motion.p>
        </div>

        {/* Show 1y price as preview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {PRICING_PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ y: 16 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={`relative rounded-xl border p-4 sm:p-6 flex flex-col ${
                plan.popular
                  ? "border-white/20 bg-white/[0.06]"
                  : "border-white/[0.07] bg-white/[0.02]"
              }`}
            >
              {plan.popular && (
                <>
                  {/* Mobile: inside the card */}
                  <div className="flex justify-center mb-3 md:hidden">
                    <span className="px-3 py-1 rounded-full bg-white text-black text-xs font-semibold">
                      {t("popular")}
                    </span>
                  </div>
                  {/* Desktop: floating above the card */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 hidden md:block">
                    <span className="px-3 py-1 rounded-full bg-white text-black text-xs font-semibold">
                      {t("popular")}
                    </span>
                  </div>
                </>
              )}

              <div className="mb-4">
                <p className="text-white font-semibold text-sm">
                  {t(`plans.${plan.id}.name`)}
                </p>
                <p className="text-white/40 text-xs mt-0.5">
                  {t(`plans.${plan.id}.renders`)}
                </p>
              </div>

              <div className="mb-6">
                <span className="text-white text-3xl font-bold">
                  ${plan.prices["1y"]}
                </span>
              </div>

              <Link
                href={`/${locale}/checkout?plan=${plan.id}&duration=1y`}
                className={`mt-auto block text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  plan.popular
                    ? "bg-white text-black hover:bg-white/90"
                    : "border border-white/10 text-white/70 hover:border-white/20 hover:text-white"
                }`}
              >
                {t("cta")}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href={`/${locale}/pricing`}
            className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
          >
            View all plans and durations
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
