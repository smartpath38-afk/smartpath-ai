// src/components/dashboard/RenderGrid.tsx
"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import RenderCard from "./RenderCard";
import type { Render } from "@/types";

interface Props {
  initialRenders: Render[];
  locale: string;
}

export default function RenderGrid({ initialRenders, locale }: Props) {
  const [renders, setRenders] = useState(initialRenders);

  function handleDelete(id: string) {
    setRenders((prev) => prev.filter((r) => r.id !== id));
  }

  if (renders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        <p className="text-white/50 font-medium text-sm">No avatars yet</p>
        <p className="text-white/25 text-xs mt-1 mb-6">Generate your first avatar to see it here.</p>
        <a
          href={`/${locale}/dashboard`}
          className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
        >
          Generate Now
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <AnimatePresence>
        {renders.map((render) => (
          <RenderCard key={render.id} render={render} onDelete={handleDelete} />
        ))}
      </AnimatePresence>
    </div>
  );
}
