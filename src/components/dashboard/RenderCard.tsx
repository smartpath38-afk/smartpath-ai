// src/components/dashboard/RenderCard.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { STYLE_LABELS } from "@/types";
import type { Render } from "@/types";

interface Props {
  render: Render;
  onDelete: (id: string) => void;
}

export default function RenderCard({ render, onDelete }: Props) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this avatar?")) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/render/${render.id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error(`Delete failed with status ${response.status}`);
      }
      onDelete(render.id);
    } catch (err) {
      console.error("Delete error:", err);
      setDeleting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.02]"
    >
      {/* Image */}
      {render.output_image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={render.output_image_url}
          alt={`${STYLE_LABELS[render.style]} avatar`}
          className="w-full aspect-square object-cover"
        />
      ) : (
        <div className="w-full aspect-square bg-white/[0.03] flex items-center justify-center">
          <span className="text-white/20 text-xs">No output</span>
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
        <div className="flex justify-end gap-2">
          {render.output_image_url && (
            <a
              href={render.output_image_url}
              download="avatar.jpg"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              title="Download"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </a>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors disabled:opacity-50"
            title="Delete"
          >
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
        <span className="text-xs text-white/70 font-medium">{STYLE_LABELS[render.style]}</span>
      </div>
    </motion.div>
  );
}
