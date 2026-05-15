"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { PlanName } from "@/types";

interface Props {
  locale: string;
  planId: PlanName;
  planName: string;
  monthlyRenderLimit: number;
  price: number;
  prefillEmail: string;
  hasError: boolean;
}

function Spinner() {
  return (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function CheckoutClient({
  locale,
  planId,
  planName,
  price,
  prefillEmail,
  hasError,
}: Props) {
  const t = useTranslations("checkout");

  const [email, setEmail] = useState(prefillEmail);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    hasError ? t("errorCancelled") : null
  );

  function validateEmail() {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg(t("errorEmail"));
      return null;
    }
    return trimmed;
  }

  async function handleStripe() {
    const trimmedEmail = validateEmail();
    if (!trimmedEmail) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, email: trimmedEmail, locale }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Failed to create checkout session.");
      window.location.href = data.url;
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("errorGeneric"));
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f11] flex items-start sm:items-center justify-center
                    pt-24 pb-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px]"
      >
        <div className="bg-[#18181c] rounded-2xl sm:rounded-[20px]
                        p-5 sm:p-7
                        shadow-[0_24px_60px_rgba(0,0,0,0.55)]
                        border border-white/[0.07]">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-[18px] sm:text-[22px] font-bold text-white tracking-tight leading-none">
              {t("heading")}
            </h1>
          </div>

          {/* Order Summary */}
          <div className="bg-[#0f0f11] rounded-xl sm:rounded-2xl
                          px-4 sm:px-5 py-3.5 sm:py-4 mb-5 sm:mb-6
                          border border-white/[0.06]">
            <p className="text-[10px] font-semibold tracking-[0.13em] uppercase text-white/25 mb-2.5">
              {t("orderSummary")}
            </p>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm sm:text-base leading-tight truncate">
                  {planName}
                </p>
                <p className="text-white/35 text-xs mt-1">Monthly subscription</p>
              </div>
              <div className="text-right leading-none flex-shrink-0">
                <span className="text-white font-bold text-2xl sm:text-3xl">${price}</span>
                <span className="text-white/30 text-xs ml-1">{t("oneTime")}</span>
              </div>
            </div>
          </div>

          {/* Error */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20
                         text-red-400 text-xs text-center"
            >
              {errorMsg}
            </motion.div>
          )}

          {/* Email */}
          <div className="mb-5">
            <label
              htmlFor="checkout-email"
              className="flex items-center gap-1 text-[10px] sm:text-[11px] font-medium
                         text-white/40 tracking-wider uppercase mb-2"
            >
              {t("emailLabel")}
              <span className="text-red-400 text-xs leading-none">*</span>
            </label>
            <input
              id="checkout-email"
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrorMsg(null); }}
              placeholder="you@example.com"
              className="w-full bg-white/[0.03] border border-white/[0.09] rounded-xl
                         px-4 py-3 text-sm text-white placeholder-white/20
                         focus:outline-none focus:border-white/20 focus:bg-white/[0.05]
                         transition-all"
              autoComplete="email"
              autoCapitalize="none"
            />
            <div className="flex items-start gap-2 mt-2.5">
              <svg className="w-3.5 h-3.5 text-white/25 flex-shrink-0 mt-px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-white/25 text-[10px] leading-relaxed">
                {t("emailHint")}
              </p>
            </div>
          </div>

          {/* Pay with Stripe button */}
          <button
            onClick={handleStripe}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl font-semibold text-sm
                       bg-[#635BFF] hover:bg-[#5851E5] text-white
                       transition-colors flex items-center justify-center gap-2.5
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Spinner />
            ) : (
              <>
                {/* Stripe lock icon */}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Pay securely with Stripe
              </>
            )}
          </button>

          {/* Refund Policy */}
          <p className="text-center mt-4">
            <Link
              href={`/${locale}/legal/refund`}
              className="text-white/30 hover:text-white/55 text-[11px] underline underline-offset-2 transition-colors"
            >
              {t("refundLink")}
            </Link>
          </p>

          {/* Trust footer */}
          <div className="mt-4 sm:mt-5 pt-4 border-t border-white/[0.05] space-y-2">
            <div className="flex items-center gap-2 text-white/[0.18] text-[11px]">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              {t("sslNote")}
            </div>
            <p className="text-white/[0.18] text-[11px] leading-relaxed">
              {t("terms")}{" "}
              <Link href={`/${locale}/legal/terms`} className="text-white/35 underline hover:text-white/55 transition-colors">
                {t("termsLink")}
              </Link>
              {", "}
              <Link href={`/${locale}/legal/refund`} className="text-white/35 underline hover:text-white/55 transition-colors">
                {t("refundLink")}
              </Link>
              {" "}{t("and")}{" "}
              <Link href={`/${locale}/legal/privacy`} className="text-white/35 underline hover:text-white/55 transition-colors">
                {t("privacyLink")}
              </Link>.
            </p>
            <p className="text-white/[0.14] text-[10px] leading-relaxed pt-0.5">
              {t("businessLine")} ·{" "}
              <a href="mailto:contact@smartpathavatar.online" className="underline underline-offset-2 hover:text-white/28 transition-colors">
                contact@smartpathavatar.online
              </a>
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
