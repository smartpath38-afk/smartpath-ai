"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import UploadZone from "./UploadZone";
import StyleSelector from "./StyleSelector";
import RenderResult from "./RenderResult";
import type { AvatarStyle, RenderStatus } from "@/types";

interface Props {
  hasActivePlan: boolean;
  rendersUsed: number;
  rendersLimit: number;
}

type RenderState = {
  status: RenderStatus | "idle";
  outputUrl: string | null;
  renderId: string | null;
};

export default function GeneratePanel({ hasActivePlan, rendersUsed, rendersLimit }: Props) {
  const params = useParams();
  const locale = params.locale as string;
  const supabase = createClient();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [style, setStyle] = useState<AvatarStyle | null>(null);
  const [renderState, setRenderState] = useState<RenderState>({
    status: "idle",
    outputUrl: null,
    renderId: null,
  });
  const [quotaError, setQuotaError] = useState(false);

  function handleFileSelected(f: File) {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setRenderState({ status: "idle", outputUrl: null, renderId: null });
  }

  function handleReset() {
    setFile(null);
    setPreview(null);
    setStyle(null);
    setRenderState({ status: "idle", outputUrl: null, renderId: null });
    setQuotaError(false);
  }

  async function pollStatus(renderId: string) {
    const maxPolls = 60; // 3 minutes max
    let polls = 0;

    const interval = setInterval(async () => {
      polls++;
      if (polls > maxPolls) {
        clearInterval(interval);
        setRenderState((prev) => ({ ...prev, status: "failed" }));
        return;
      }

      try {
        const res = await fetch(`/api/render/${renderId}`);
        const data = await res.json();

        if (data.status === "completed") {
          clearInterval(interval);
          setRenderState({ status: "completed", outputUrl: data.output_image_url, renderId });
        } else if (data.status === "failed") {
          clearInterval(interval);
          setRenderState((prev) => ({ ...prev, status: "failed" }));
        }
      } catch {
        clearInterval(interval);
        setRenderState((prev) => ({ ...prev, status: "failed" }));
      }
    }, 3000);
  }

  async function handleGenerate() {
    if (!file || !style) return;

    setQuotaError(false);

    // Quota check
    if (!hasActivePlan || rendersUsed >= rendersLimit) {
      setQuotaError(true);
      return;
    }

    setRenderState({ status: "processing", outputUrl: null, renderId: null });

    try {
      // 1. Upload image to Supabase storage
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const ext = file.name.split(".").pop() ?? "jpg";
      const inputPath = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("inputs")
        .upload(inputPath, file, { contentType: file.type, upsert: false });

      if (uploadError) throw uploadError;

      // 2. Insert render row
      const { data: renderRow, error: insertError } = await supabase
        .from("renders")
        .insert({
          user_id: user.id,
          style,
          input_image_url: inputPath,
          status: "processing",
        })
        .select("id")
        .single();

      if (insertError || !renderRow) throw insertError ?? new Error("Insert failed");

      const renderId = renderRow.id;
      setRenderState((prev) => ({ ...prev, renderId }));

      // 3. Trigger render API (fire and forget — polling handles status)
      fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ renderId }),
      });

      // 4. Start polling
      pollStatus(renderId);
    } catch (err) {
      console.error("Generate failed:", err);
      setRenderState({ status: "failed", outputUrl: null, renderId: null });
    }
  }

  const isGenerating = renderState.status === "processing";
  const canGenerate = !!file && !!style && !isGenerating;

  return (
    <div className="max-w-2xl w-full space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Generate Avatar</h1>
        <p className="text-white/40 text-sm mt-1">Upload a portrait and choose a style.</p>
      </div>

      {/* Quota error */}
      {quotaError && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 flex items-center justify-between gap-4"
        >
          <p className="text-amber-400 text-sm">
            {!hasActivePlan
              ? "You need an active plan to generate avatars."
              : "You've reached your monthly render limit."}
          </p>
          <a
            href={`/${locale}/pricing`}
            className="shrink-0 px-3 py-1.5 rounded-md bg-amber-500/20 text-amber-300 text-xs font-medium hover:bg-amber-500/30 transition-colors"
          >
            View Plans
          </a>
        </motion.div>
      )}

      {/* Upload */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
          1. Upload Portrait
        </label>
        <UploadZone
          onFileSelected={handleFileSelected}
          preview={preview}
          disabled={isGenerating}
        />
      </div>

      {/* Style selector */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
          2. Choose Style
        </label>
        <StyleSelector
          selected={style}
          onSelect={setStyle}
          disabled={isGenerating}
        />
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={!canGenerate}
        className="w-full h-12 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            Generating…
          </span>
        ) : (
          "Generate Avatar"
        )}
      </button>

      {/* Result */}
      {renderState.status !== "idle" && (
        <RenderResult
          status={renderState.status}
          outputUrl={renderState.outputUrl}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
