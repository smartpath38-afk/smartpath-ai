"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    titleKey: "step1Title",
    descKey: "step1Desc",
  },
  {
    number: "02",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    titleKey: "step2Title",
    descKey: "step2Desc",
  },
  {
    number: "03",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    titleKey: "step3Title",
    descKey: "step3Desc",
  },
];

export default function HowItWorksSection() {
  const t = useTranslations("howItWorks");

  return (
    <section className="py-28 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.p
            initial={{ y: 8 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-white/40 text-sm font-medium tracking-widest uppercase mb-3"
          >
            Process
          </motion.p>
          <motion.h2
            initial={{ y: 12 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-4xl md:text-5xl font-semibold tracking-tight text-white"
          >
            {t("title")}
          </motion.h2>
          <motion.p
            initial={{ y: 12 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-white/40 mt-4 text-lg max-w-xl mx-auto"
          >
            {t("subtitle")}
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-white/[0.06] rounded-2xl overflow-hidden">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ y: 16 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-black p-6 md:p-10 relative group hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/60 group-hover:bg-white/10 group-hover:text-white transition-colors">
                  {step.icon}
                </div>
                <span className="text-white/10 text-4xl font-bold tabular-nums">
                  {step.number}
                </span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                {t(step.titleKey as "step1Title" | "step2Title" | "step3Title")}
              </h3>
              <p className="text-white/40 text-sm leading-relaxed">
                {t(step.descKey as "step1Desc" | "step2Desc" | "step3Desc")}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
