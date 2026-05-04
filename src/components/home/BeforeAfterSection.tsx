"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Example {
  style: string;
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
}

const EXAMPLES: Example[] = [
  {
    style: "Before / After",
    beforeSrc: "/images/1.webp",
    afterSrc: "/images/2.webp",
    beforeAlt: "Original portrait photo",
    afterAlt: "AI-generated avatar",
  },
  {
    style: "Before / After",
    beforeSrc: "/images/3.webp",
    afterSrc: "/images/4.webp",
    beforeAlt: "Original portrait photo",
    afterAlt: "AI-generated avatar",
  },
];

function ComparisonSlider({ before, after, beforeAlt, afterAlt }: {
  before: string;
  after: string;
  beforeAlt: string;
  afterAlt: string;
}) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden select-none touch-none cursor-col-resize"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* After image (full width, behind) */}
      <img
        src={after}
        alt={afterAlt}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Before image (clipped to left side) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <img
          src={before}
          alt={beforeAlt}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: `${10000 / position}%`, maxWidth: "none" }}
          draggable={false}
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
      />

      {/* Handle */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center z-10"
        style={{ left: `${position}%` }}
      >
        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
        </svg>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-semibold border border-white/10">
        Before
      </div>
      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-black text-xs font-semibold">
        After
      </div>
    </div>
  );
}

export default function BeforeAfterSection({ locale }: { locale: string }) {
  return (
    <section id="examples" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ y: 8 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            className="text-white/40 text-sm font-medium tracking-widest uppercase mb-3"
          >
            Examples
          </motion.p>
          <motion.h2
            initial={{ y: 12 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-4xl md:text-5xl font-semibold tracking-tight text-white"
          >
            See the Transformation
          </motion.h2>
          <motion.p
            initial={{ y: 12 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/40 mt-4 text-lg max-w-xl mx-auto"
          >
            Drag the slider to compare original photos with their AI-generated avatar counterparts.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {EXAMPLES.map((ex, i) => (
            <motion.div
              key={i}
              initial={{ y: 20 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex flex-col gap-3"
            >
              <ComparisonSlider
                before={ex.beforeSrc}
                after={ex.afterSrc}
                beforeAlt={ex.beforeAlt}
                afterAlt={ex.afterAlt}
              />
              <p className="text-center text-white/50 text-sm font-medium tracking-wide">
                {ex.style} Style
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ y: 12 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-14"
        >
          <Link
            href={`/${locale}/pricing`}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors"
          >
            Transform Your Photo Now
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
