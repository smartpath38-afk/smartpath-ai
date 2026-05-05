"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { PlanName, PlanDuration } from "@/types";

interface Props {
  locale: string;
  planId: PlanName;
  planDuration: PlanDuration;
  planName: string;
  monthlyRenderLimit: number;
  price: number;
  description: string;
  prefillEmail: string;
  hasError: boolean;
}


/* ─── Official PayPal button (pill, PP icon + wordmark) ────────────────────── */
function PayPalButtonFace() {
  return (
    <span className="flex items-center justify-center gap-2.5 pointer-events-none select-none">
      {/* PP double-shield monogram */}
      <svg width="28" height="32" viewBox="0 0 28 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Dark blue P — back, upper-left */}
        <path
          fill="#003087"
          d="M3.5 1h10c5.2 0 8.5 3 8.5 7.8C22 15 17.5 18 11.5 18H8.5L6.5 28H1L3.5 1Z"
        />
        <path
          fill="#003087"
          d="M10 13h3.2c2.6 0 4.3-1.4 4.3-3.7S15.8 5.7 13.2 5.7H10.5L10 13Z"
        />
        {/* Light blue P — front, lower-right */}
        <path
          fill="#009CDE"
          d="M8 5h10c5.2 0 8.5 3 8.5 7.8C26.5 19 22 22 16 22H13L11 32H5.5L8 5Z"
        />
        <path
          fill="#009CDE"
          d="M14.5 17h3.2c2.6 0 4.3-1.4 4.3-3.7s-1.7-3.6-4.3-3.6H15L14.5 17Z"
        />
      </svg>

      {/* PayPal wordmark */}
      <span
        className="text-[22px] font-bold leading-none tracking-tight"
        style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
      >
        <span style={{ color: "#003087" }}>Pay</span>
        <span style={{ color: "#009CDE" }}>Pal</span>
      </span>
    </span>
  );
}

/* ─── Spinner ───────────────────────────────────────────────────────────────── */
function Spinner({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke={color} strokeWidth="3" />
      <path className="opacity-80" fill={color} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Main component
═══════════════════════════════════════════════════════════════════════════════ */
export default function CheckoutClient({
  locale,
  planId,
  planDuration,
  planName,
  price,
  description,
  prefillEmail,
  hasError,
}: Props) {
  const t = useTranslations("checkout");

  const [email, setEmail] = useState(prefillEmail);
  const [loading, setLoading] = useState<"paypal" | null>(null);
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

  async function handlePayPal() {
    const trimmedEmail = validateEmail();
    if (!trimmedEmail) return;
    setLoading("paypal");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, duration: planDuration, gateway: "paypal", locale, email: trimmedEmail }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Failed to create checkout session.");
      window.location.href = data.url;
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("errorGeneric"));
      setLoading(null);
    }
  }

  return (
    /* Full-screen container — scrollable on short/mobile viewports */
    <div className="min-h-screen bg-[#0f0f11] flex items-start sm:items-center justify-center
                    py-8 sm:py-12 px-4">
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

          {/* ── Header ── */}
          <div className="mb-6">
            <h1 className="text-[18px] sm:text-[22px] font-bold text-white tracking-tight leading-none">
              {t("heading")}
            </h1>
          </div>

          {/* ── Order Summary ── */}
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
                <p className="text-white/35 text-xs mt-1">{t(`durations.${planDuration}`)}</p>
              </div>
              <div className="text-right leading-none flex-shrink-0">
                <span className="text-white font-bold text-2xl sm:text-3xl">${price}</span>
                <span className="text-white/30 text-xs ml-1">{t("oneTime")}</span>
              </div>
            </div>
          </div>

          {/* ── Error ── */}
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

          {/* ── Email ── */}
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
            {/* Info hint */}
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

          {/* ── Payment — Coming Soon ── */}
          <div className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <svg className="w-7 h-7 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-white/70 font-semibold text-sm mb-1">Payment Processing Coming Soon</p>
            <p className="text-white/30 text-xs leading-relaxed">
              We&apos;re finalizing our payment system. To complete your purchase, please contact us directly at{" "}
              <a href="mailto:contact@smartpathavatar.online"
                className="text-white/50 underline underline-offset-2 hover:text-white/70 transition-colors">
                contact@smartpathavatar.online
              </a>
            </p>
          </div>

          {/* ── Refund Policy — trust signal near payment buttons ── */}
          <p className="text-center mt-4">
            <Link
              href={`/${locale}/legal/refund`}
              className="text-white/30 hover:text-white/55 text-[11px] underline underline-offset-2 transition-colors"
            >
              {t("refundLink")}
            </Link>
          </p>

          {/* ── Trust footer ── */}
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
              <Link
                href={`/${locale}/legal/terms`}
                className="text-white/35 underline hover:text-white/55 transition-colors"
              >
                {t("termsLink")}
              </Link>
              {", "}
              <Link
                href={`/${locale}/legal/refund`}
                className="text-white/35 underline hover:text-white/55 transition-colors"
              >
                {t("refundLink")}
              </Link>
              {" "}{t("and")}{" "}
              <Link
                href={`/${locale}/legal/privacy`}
                className="text-white/35 underline hover:text-white/55 transition-colors"
              >
                {t("privacyLink")}
              </Link>.
            </p>
            {/* Legal entity + support — visible to bank reviewers */}
            <p className="text-white/[0.14] text-[10px] leading-relaxed pt-0.5">
              {t("businessLine")} ·{" "}
              <a
                href="mailto:contact@smartpathavatar.online"
                className="underline underline-offset-2 hover:text-white/28 transition-colors"
              >
                contact@smartpathavatar.online
              </a>
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
