// src/components/dashboard/StyleSelector.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import type { AvatarStyle } from "@/types";
import { STYLE_LABELS } from "@/types";

interface Props {
  selected: AvatarStyle | null;
  onSelect: (style: AvatarStyle) => void;
  disabled?: boolean;
}

const STYLES: AvatarStyle[] = [
  "cartoon_3d",
  "anime",
  "oil_painting",
  "cyberpunk",
  "watercolor",
  "realistic_portrait",
  "sketch",
  "fantasy",
];

const STYLE_ICONS: Record<AvatarStyle, React.ReactNode> = {
  cartoon_3d: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 13s1.5 2 4 2 4-2 4-2" />
      <path d="M9 9h.01M15 9h.01" />
    </svg>
  ),
  anime: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 7h20" />
      <path d="M4 5h16" />
      <path d="M7 7v13" />
      <path d="M17 7v13" />
      <path d="M7 13h10" />
    </svg>
  ),
  oil_painting: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 15l4-4 4 4 3-3 7 7" />
      <circle cx="8" cy="8" r="1.5" />
    </svg>
  ),
  cyberpunk: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="7" width="14" height="11" rx="1" />
      <path d="M9 11h.01M15 11h.01" />
      <path d="M9 15h6" />
      <path d="M9 4h6" />
      <path d="M12 4v3" />
      <path d="M2 13h3M19 13h3" />
    </svg>
  ),
  watercolor: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 0 1 10 10c0 2.21-1.79 4-4 4h-1.5a1.5 1.5 0 0 0 0 3 1.5 1.5 0 0 1-1.5 1.5A9.5 9.5 0 0 1 2.5 12 10 10 0 0 1 12 2z" />
      <circle cx="7" cy="12" r="1" />
      <circle cx="10.5" cy="8" r="1" />
      <circle cx="14.5" cy="8" r="1" />
      <circle cx="17" cy="12" r="1" />
    </svg>
  ),
  realistic_portrait: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  ),
  sketch: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  ),
  fantasy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12l4 6-10 13L2 9Z" />
      <path d="M11 3 8 9l4 13 4-13-3-6" />
      <path d="M2 9h20" />
    </svg>
  ),
};

export default function StyleSelector({ selected, onSelect, disabled }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      {STYLES.map((style) => {
        const isSelected = selected === style;
        return (
          <motion.button
            key={style}
            whileTap={{ scale: 0.97 }}
            onClick={() => !disabled && onSelect(style)}
            disabled={disabled}
            className={`relative flex flex-col items-center gap-2 p-3.5 rounded-xl border text-left transition-all
              ${isSelected
                ? "border-white/40 bg-white/[0.08] text-white"
                : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.16] text-white/60"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {isSelected && (
              <motion.div
                layoutId="style-selected"
                className="absolute inset-0 rounded-xl border border-white/40"
                transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
              />
            )}
            <div className="w-6 h-6">{STYLE_ICONS[style]}</div>
            <span className="text-xs font-medium text-center leading-tight relative z-10">
              {STYLE_LABELS[style]}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
