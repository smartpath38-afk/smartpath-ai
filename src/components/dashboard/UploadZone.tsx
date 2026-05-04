// src/components/dashboard/UploadZone.tsx
"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onFileSelected: (file: File) => void;
  preview: string | null;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 10;

export default function UploadZone({ onFileSelected, preview, disabled }: Props) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function validate(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type)) return "Only JPEG, PNG, or WEBP files are accepted.";
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return `File must be under ${MAX_SIZE_MB}MB.`;
    return null;
  }

  function handleFile(file: File) {
    const err = validate(file);
    if (err) { setError(err); return; }
    setError(null);
    onFileSelected(file);
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [disabled]
  );

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  return (
    <div className="space-y-2">
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden
          ${dragging ? "border-white/40 bg-white/[0.06]" : "border-white/[0.10] hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04]"}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${preview ? "h-52 sm:h-64" : "h-44 sm:h-52"}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onInputChange}
          disabled={disabled}
        />

        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Portrait preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-sm font-medium">Change photo</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center">
                <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm text-white/70 font-medium">Drop your portrait here</p>
                <p className="text-xs text-white/30 mt-1">or click to browse — JPEG, PNG, WEBP up to 10MB</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
