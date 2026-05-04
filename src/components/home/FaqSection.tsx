"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

const faqs = ["1", "2", "3", "4", "5"] as const;

export default function FaqSection() {
  const t = useTranslations("faq");
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section className="py-28 px-6 bg-white/[0.01]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ y: 12 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-semibold tracking-tight text-white"
          >
            {t("title")}
          </motion.h2>
        </div>

        <div className="space-y-1">
          {faqs.map((n, i) => {
            const isOpen = open === n;
            return (
              <motion.div
                key={n}
                initial={{ y: 8 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : n)}
                  className="w-full flex items-center justify-between gap-4 py-5 px-1 text-left border-b border-white/[0.07] hover:border-white/[0.12] transition-colors group"
                >
                  <span className="text-white font-medium text-sm group-hover:text-white/90">
                    {t(`q${n}` as "q1" | "q2" | "q3" | "q4" | "q5")}
                  </span>
                  <svg
                    className={`w-4 h-4 text-white/30 flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="py-4 px-1 text-white/50 text-sm leading-relaxed">
                        {t(`a${n}` as "a1" | "a2" | "a3" | "a4" | "a5")}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
