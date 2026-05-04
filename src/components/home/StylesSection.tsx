"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const styles = [
  { key: "cartoon3d",        label: "Cartoon 3D",        image: "/images/styles/style1.webp", accent: "from-blue-500/60 to-purple-600/60" },
  { key: "anime",            label: "Anime",              image: "/images/styles/style2.webp", accent: "from-pink-500/60 to-rose-600/60" },
  { key: "oilPainting",      label: "Oil Painting",       image: "/images/styles/style3.webp", accent: "from-amber-500/60 to-orange-600/60" },
  { key: "cyberpunk",        label: "Cyberpunk",          image: "/images/styles/style4.webp", accent: "from-cyan-500/60 to-blue-600/60" },
  { key: "watercolor",       label: "Watercolor",         image: "/images/styles/style5.webp", accent: "from-teal-500/60 to-emerald-600/60" },
  { key: "realisticPortrait",label: "Realistic Portrait", image: "/images/styles/style6.webp", accent: "from-stone-500/60 to-zinc-600/60" },
  { key: "sketch",           label: "Sketch",             image: "/images/styles/style7.webp", accent: "from-slate-400/60 to-gray-600/60" },
  { key: "fantasy",          label: "Fantasy",            image: "/images/styles/style8.webp", accent: "from-violet-500/60 to-fuchsia-600/60" },
] as const;

export default function StylesSection() {
  const t = useTranslations("styles");

  return (
    <section id="styles" className="py-28 px-6 bg-white/[0.01]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.p
            initial={{ y: 8 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            className="text-white/40 text-sm font-medium tracking-widest uppercase mb-3"
          >
            Styles
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {styles.map((style, i) => (
            <motion.div
              key={style.key}
              initial={{ scale: 0.97 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group relative rounded-xl overflow-hidden cursor-default aspect-[3/4] bg-white/[0.04]"
            >
              {/* Style image */}
              <img
                src={style.image}
                alt={style.label}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                draggable={false}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />

              {/* Dark gradient overlay — stronger at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

              {/* Accent color overlay on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${style.accent} opacity-0 group-hover:opacity-40 transition-opacity duration-300`}
              />

              {/* Border */}
              <div className="absolute inset-0 rounded-xl ring-1 ring-white/[0.08] group-hover:ring-white/20 transition-all duration-300" />

              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-semibold text-sm drop-shadow-lg">
                  {t(style.key)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
