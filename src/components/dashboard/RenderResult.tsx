// src/components/dashboard/RenderResult.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { RenderStatus } from "@/types";

interface Props {
  status: RenderStatus | "idle";
  outputUrl: string | null;
  onReset: () => void;
}

export default function RenderResult({ status, outputUrl, onReset }: Props) {
  return (
    <AnimatePresence mode="wait">
      {status === "idle" && null}

      {status === "processing" && (
        <motion.div
          key="processing"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-8 flex flex-col items-center gap-4"
        >
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <div className="absolute inset-0 rounded-full border-2 border-t-white animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-white font-medium text-sm">Generating your avatar…</p>
            <p className="text-white/40 text-xs mt-1">This usually takes 15–30 seconds</p>
          </div>
        </motion.div>
      )}

      {status === "completed" && outputUrl && (
        <motion.div
          key="completed"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-4"
        >
          <div className="rounded-xl overflow-hidden border border-white/[0.08]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={outputUrl}
              alt="Generated avatar"
              className="w-full object-cover"
            />
          </div>
          <div className="flex gap-3">
            <a
              href={outputUrl}
              download="avatar.jpg"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-11 flex items-center justify-center rounded-lg bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
            >
              Download
            </a>
            <button
              onClick={onReset}
              className="flex-1 h-11 rounded-lg border border-white/10 text-white/70 text-sm hover:text-white hover:border-white/20 transition-colors"
            >
              New Avatar
            </button>
          </div>
        </motion.div>
      )}

      {status === "failed" && (
        <motion.div
          key="failed"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="rounded-xl border border-red-500/20 bg-red-500/[0.05] p-6 text-center"
        >
          <p className="text-red-400 font-medium text-sm">Generation failed</p>
          <p className="text-white/30 text-xs mt-1 mb-4">Something went wrong. Please try again.</p>
          <button
            onClick={onReset}
            className="px-4 py-2 rounded-lg border border-white/10 text-white/60 text-sm hover:text-white transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
