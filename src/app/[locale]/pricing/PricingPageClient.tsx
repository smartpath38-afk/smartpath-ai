"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { PRICING_PLANS } from "@/types";

interface Props {
  locale: string;
}

export default function PricingPageClient({ locale }: Props) {
  const t = useTranslations("pricing");

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="pt-32 pb-28 px-6">
        <div className="max-w-5xl mx-auto">
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

          {/* Pricing grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    <div className="flex justify-center mb-4 sm:hidden">
                      <span className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-semibold tracking-wide">
                        {t("popular")}
                      </span>
                    </div>
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
                      ${plan.monthlyPrice}
                    </span>
                    <span className="text-white/30 text-sm mb-1.5">{t("perMonth")}</span>
                  </div>
                  <p className="text-white/30 text-xs mt-1.5">Billed monthly · cancel anytime</p>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-8 flex-1">
                  {(t.raw(`plans.${plan.id}.features`) as string[]).map((feature: string) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <svg
                        className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white/60 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={`/${locale}/checkout?plan=${plan.id}`}
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
              {/* Stripe logo mark */}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/>
              </svg>
              Powered by Stripe
            </div>
          </motion.div>
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
