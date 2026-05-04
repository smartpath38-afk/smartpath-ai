# Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete SMARTPATH AI dashboard — upload portrait, select style, generate AI avatar via Fal.ai, view gallery, check billing.

**Architecture:** Dashboard lives at `/[locale]/dashboard` with a shared layout containing a fixed sidebar. The generate flow is: upload → Supabase storage → POST `/api/render` → Fal.ai → save result → polling GET `/api/render/[id]`. Gallery and Billing are separate sub-pages.

**Tech Stack:** Next.js 16.2.3 App Router, Tailwind CSS v4, shadcn/ui, Framer Motion, Supabase SSR (`@supabase/ssr`), `@fal-ai/client` v1.9.5

---

## File Map

**New files to create:**
```
src/lib/fal.ts                                        — fal client config + style prompt map
src/app/api/render/route.ts                           — POST: triggers Fal.ai render
src/app/api/render/[id]/route.ts                      — GET: poll render status
src/app/[locale]/dashboard/layout.tsx                 — shared dashboard shell (sidebar + header)
src/app/[locale]/dashboard/page.tsx                   — generate page (Server Component shell)
src/app/[locale]/dashboard/gallery/page.tsx           — gallery page (Server Component)
src/app/[locale]/dashboard/billing/page.tsx           — billing page (Server Component)
src/components/dashboard/DashboardSidebar.tsx         — fixed left sidebar (Client Component)
src/components/dashboard/DashboardHeader.tsx          — mobile header with hamburger (Client Component)
src/components/dashboard/RendersCounter.tsx           — renders used/limit bar (Server Component)
src/components/dashboard/GeneratePanel.tsx            — upload + style + generate (Client Component)
src/components/dashboard/UploadZone.tsx               — drag & drop photo input (Client Component)
src/components/dashboard/StyleSelector.tsx            — 8-style grid picker (Client Component)
src/components/dashboard/RenderResult.tsx             — progress + output image (Client Component)
src/components/dashboard/RenderGrid.tsx               — gallery grid (Client Component)
src/components/dashboard/RenderCard.tsx               — single render card (Client Component)
```

---

## Task 1: Fal.ai client + style prompts

**Files:**
- Create: `src/lib/fal.ts`

- [ ] **Step 1: Create the fal client module**

```typescript
// src/lib/fal.ts
import { createFalClient } from "@fal-ai/client";
import type { AvatarStyle } from "@/types";

export const fal = createFalClient({
  credentials: process.env.FAL_API_KEY!,
});

export const STYLE_PROMPTS: Record<AvatarStyle, string> = {
  cartoon_3d:
    "3D cartoon avatar, Pixar animation style, vibrant colors, smooth shading, expressive face, high quality render",
  anime:
    "anime portrait, Studio Ghibli aesthetic, soft pastel colors, clean linework, expressive eyes, detailed hair",
  oil_painting:
    "classical oil painting portrait, rich warm tones, visible brushstrokes, chiaroscuro lighting, museum quality",
  cyberpunk:
    "cyberpunk neon portrait, futuristic city background, neon lights, dark atmosphere, chrome augmentations, 4K",
  watercolor:
    "delicate watercolor portrait, soft washes of color, wet on wet technique, light and airy, artistic",
  realistic_portrait:
    "photorealistic portrait, professional studio lighting, sharp focus, 8K resolution, natural skin tones",
  sketch:
    "pencil sketch portrait, detailed graphite drawing, cross-hatching, artistic, black and white, fine art",
  fantasy:
    "fantasy portrait, epic lighting, magical atmosphere, ethereal glow, detailed fantasy costume, digital art",
};

export type FalImageResult = {
  images: Array<{ url: string; width: number; height: number }>;
};
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/fal.ts
git commit -m "feat: add fal.ai client and style prompts"
```

---

## Task 2: API route — POST /api/render

**Files:**
- Create: `src/app/api/render/route.ts`

- [ ] **Step 1: Create the render API route**

```typescript
// src/app/api/render/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@/lib/supabase/admin";
import { fal, STYLE_PROMPTS, type FalImageResult } from "@/lib/fal";
import type { AvatarStyle } from "@/types";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { renderId } = await request.json();
  if (!renderId) {
    return NextResponse.json({ error: "Missing renderId" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Fetch render row + verify ownership
  const { data: render, error: fetchError } = await admin
    .from("renders")
    .select("*")
    .eq("id", renderId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !render) {
    return NextResponse.json({ error: "Render not found" }, { status: 404 });
  }

  if (render.status !== "processing") {
    return NextResponse.json({ status: render.status, output_image_url: render.output_image_url });
  }

  try {
    // Get signed URL for input image
    const { data: signedData } = await admin.storage
      .from("inputs")
      .createSignedUrl(render.input_image_url, 300);

    if (!signedData?.signedUrl) {
      throw new Error("Could not get signed URL for input image");
    }

    // Call Fal.ai
    const style = render.style as AvatarStyle;
    const prompt = STYLE_PROMPTS[style];

    const result = await fal.subscribe("fal-ai/flux/dev", {
      input: {
        prompt: `Portrait photo of a person, ${prompt}`,
        image_url: signedData.signedUrl,
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        image_size: "square_hd",
      },
    }) as { data: FalImageResult };

    const outputUrl = result.data.images[0]?.url;
    if (!outputUrl) throw new Error("No output image from Fal.ai");

    // Download output and upload to Supabase renders bucket
    const imageResponse = await fetch(outputUrl);
    const imageBlob = await imageResponse.blob();
    const outputPath = `${user.id}/${renderId}.jpg`;

    const { error: uploadError } = await admin.storage
      .from("renders")
      .upload(outputPath, imageBlob, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: publicData } = admin.storage
      .from("renders")
      .getPublicUrl(outputPath);

    // Update render row
    await admin
      .from("renders")
      .update({
        output_image_url: publicData.publicUrl,
        status: "completed",
      })
      .eq("id", renderId);

    return NextResponse.json({
      status: "completed",
      output_image_url: publicData.publicUrl,
    });
  } catch (err) {
    console.error("Render failed:", err);

    await admin
      .from("renders")
      .update({ status: "failed" })
      .eq("id", renderId);

    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/render/route.ts
git commit -m "feat: add POST /api/render route with fal.ai integration"
```

---

## Task 3: API route — GET /api/render/[id]

**Files:**
- Create: `src/app/api/render/[id]/route.ts`

- [ ] **Step 1: Create polling route**

```typescript
// src/app/api/render/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: render, error } = await admin
    .from("renders")
    .select("id, status, output_image_url, style, created_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !render) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: render.status,
    output_image_url: render.output_image_url,
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/render/[id]/route.ts
git commit -m "feat: add GET /api/render/[id] polling route"
```

---

## Task 4: Dashboard sidebar component

**Files:**
- Create: `src/components/dashboard/DashboardSidebar.tsx`

- [ ] **Step 1: Create the sidebar**

```typescript
// src/components/dashboard/DashboardSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  {
    key: "generate",
    label: "Generate",
    href: (locale: string) => `/${locale}/dashboard`,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    key: "gallery",
    label: "Gallery",
    href: (locale: string) => `/${locale}/dashboard/gallery`,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
  },
  {
    key: "billing",
    label: "Billing",
    href: (locale: string) => `/${locale}/dashboard/billing`,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push(`/${locale}`);
    router.refresh();
  }

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-[220px] bg-[#050505] border-r border-white/[0.06] z-40">
      {/* Logo */}
      <div className="p-5 border-b border-white/[0.06]">
        <Link href={`/${locale}`} className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center shrink-0">
            <span className="text-black font-bold text-xs">S</span>
          </div>
          <span className="text-white font-semibold tracking-tight text-sm">
            SMARTPATH AI
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const href = item.href(locale);
          const isActive =
            item.key === "generate"
              ? pathname === href
              : pathname.startsWith(href);

          return (
            <Link
              key={item.key}
              href={href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "text-white bg-white/[0.08]"
                  : "text-white/50 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-white/[0.08] rounded-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10">{item.icon}</span>
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom: logout */}
      <div className="p-3 border-t border-white/[0.06]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/DashboardSidebar.tsx
git commit -m "feat: add DashboardSidebar component"
```

---

## Task 5: Dashboard mobile header

**Files:**
- Create: `src/components/dashboard/DashboardHeader.tsx`

- [ ] **Step 1: Create mobile header with Sheet drawer**

```typescript
// src/components/dashboard/DashboardHeader.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { key: "generate", label: "Generate", href: (l: string) => `/${l}/dashboard` },
  { key: "gallery", label: "Gallery", href: (l: string) => `/${l}/dashboard/gallery` },
  { key: "billing", label: "Billing", href: (l: string) => `/${l}/dashboard/billing` },
];

export default function DashboardHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push(`/${locale}`);
    router.refresh();
  }

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-[#050505] border-b border-white/[0.06] px-4 h-14 flex items-center justify-between">
      <Link href={`/${locale}`} className="flex items-center gap-2">
        <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
          <span className="text-black font-bold text-[10px]">S</span>
        </div>
        <span className="text-white font-semibold text-sm tracking-tight">SMARTPATH AI</span>
      </Link>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="p-2 text-white/60 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="bg-[#050505] border-white/[0.06] w-64 p-0">
          <div className="p-5 border-b border-white/[0.06]">
            <span className="text-white font-semibold text-sm">Menu</span>
          </div>
          <nav className="p-3 space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const href = item.href(locale);
              const isActive =
                item.key === "generate" ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={item.key}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-white bg-white/[0.08]"
                      : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/[0.06]">
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-colors text-left"
            >
              Sign out
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/DashboardHeader.tsx
git commit -m "feat: add DashboardHeader mobile component"
```

---

## Task 6: RendersCounter server component

**Files:**
- Create: `src/components/dashboard/RendersCounter.tsx`

- [ ] **Step 1: Create renders counter**

```typescript
// src/components/dashboard/RendersCounter.tsx
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@/lib/supabase/admin";

export default async function RendersCounter() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = createAdminClient();

  // Get active subscription
  const { data: sub } = await admin
    .rpc("get_active_subscription", { p_user_id: user.id })
    .single();

  // Count this month's renders
  const { data: countData } = await admin
    .rpc("count_monthly_renders", { p_user_id: user.id })
    .single();

  const used = (countData as number) ?? 0;
  const limit = sub ? (sub as { monthly_render_limit: number }).monthly_render_limit : 0;
  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;

  const barColor =
    percentage >= 90
      ? "bg-red-500"
      : percentage >= 70
      ? "bg-orange-500"
      : "bg-emerald-500";

  if (!sub) {
    return (
      <div className="px-5 py-3 border-b border-white/[0.06]">
        <p className="text-xs text-white/30">No active plan</p>
      </div>
    );
  }

  return (
    <div className="px-5 py-3 border-b border-white/[0.06]">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-white/40">Renders this month</span>
        <span className="text-xs text-white/60 font-medium tabular-nums">
          {used} / {limit}
        </span>
      </div>
      <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/RendersCounter.tsx
git commit -m "feat: add RendersCounter server component"
```

---

## Task 7: Dashboard layout

**Files:**
- Create: `src/app/[locale]/dashboard/layout.tsx`

- [ ] **Step 1: Create dashboard layout**

```typescript
// src/app/[locale]/dashboard/layout.tsx
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import RendersCounter from "@/components/dashboard/RendersCounter";

interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Desktop sidebar */}
      <DashboardSidebar />

      {/* Mobile header */}
      <DashboardHeader />

      {/* Main content — offset by sidebar on desktop */}
      <main className="lg:ml-[220px] min-h-screen">
        {/* Renders counter — desktop only inside sidebar area is handled by sidebar, 
            this banner shows on all screen sizes at top of content */}
        <div className="hidden lg:block">
          <RendersCounter />
        </div>
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/[locale]/dashboard/layout.tsx
git commit -m "feat: add dashboard layout with sidebar"
```

---

## Task 8: UploadZone component

**Files:**
- Create: `src/components/dashboard/UploadZone.tsx`

- [ ] **Step 1: Create drag & drop upload zone**

```typescript
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
          ${preview ? "h-64" : "h-52"}
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/UploadZone.tsx
git commit -m "feat: add UploadZone drag & drop component"
```

---

## Task 9: StyleSelector component

**Files:**
- Create: `src/components/dashboard/StyleSelector.tsx`

- [ ] **Step 1: Create style grid picker**

```typescript
// src/components/dashboard/StyleSelector.tsx
"use client";

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

const STYLE_EMOJIS: Record<AvatarStyle, string> = {
  cartoon_3d: "🎨",
  anime: "⛩️",
  oil_painting: "🖼️",
  cyberpunk: "🤖",
  watercolor: "💧",
  realistic_portrait: "📸",
  sketch: "✏️",
  fantasy: "🔮",
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
            <span className="text-xl">{STYLE_EMOJIS[style]}</span>
            <span className="text-xs font-medium text-center leading-tight relative z-10">
              {STYLE_LABELS[style]}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/StyleSelector.tsx
git commit -m "feat: add StyleSelector grid component"
```

---

## Task 10: RenderResult component

**Files:**
- Create: `src/components/dashboard/RenderResult.tsx`

- [ ] **Step 1: Create render result / progress component**

```typescript
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
          className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-8 flex flex-col items-center gap-4"
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/RenderResult.tsx
git commit -m "feat: add RenderResult progress/output component"
```

---

## Task 11: GeneratePanel — main client component

**Files:**
- Create: `src/components/dashboard/GeneratePanel.tsx`

- [ ] **Step 1: Create the generate panel orchestrating upload, style, and render**

```typescript
// src/components/dashboard/GeneratePanel.tsx
"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
  const router = useRouter();
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
    <div className="max-w-2xl space-y-8">
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
            {!hasActivePlan ? "You need an active plan to generate avatars." : "You've reached your monthly render limit."}
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/GeneratePanel.tsx
git commit -m "feat: add GeneratePanel orchestrator component"
```

---

## Task 12: Dashboard generate page (Server Component shell)

**Files:**
- Create: `src/app/[locale]/dashboard/page.tsx`

- [ ] **Step 1: Create the generate page**

```typescript
// src/app/[locale]/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@/lib/supabase/admin";
import GeneratePanel from "@/components/dashboard/GeneratePanel";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function DashboardPage({ params }: Props) {
  await params; // locale not needed here directly

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null; // proxy.ts handles redirect

  const admin = createAdminClient();

  const { data: sub } = await admin
    .rpc("get_active_subscription", { p_user_id: user.id })
    .single();

  const { data: countData } = await admin
    .rpc("count_monthly_renders", { p_user_id: user.id })
    .single();

  const hasActivePlan = !!sub;
  const rendersUsed = (countData as number) ?? 0;
  const rendersLimit = sub
    ? (sub as { monthly_render_limit: number }).monthly_render_limit
    : 0;

  return (
    <GeneratePanel
      hasActivePlan={hasActivePlan}
      rendersUsed={rendersUsed}
      rendersLimit={rendersLimit}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/[locale]/dashboard/page.tsx
git commit -m "feat: add dashboard generate page"
```

---

## Task 13: RenderCard and RenderGrid components

**Files:**
- Create: `src/components/dashboard/RenderCard.tsx`
- Create: `src/components/dashboard/RenderGrid.tsx`

- [ ] **Step 1: Create RenderCard**

```typescript
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
      await fetch(`/api/render/${render.id}`, { method: "DELETE" });
      onDelete(render.id);
    } catch {
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
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
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
            className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors disabled:opacity-50"
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
```

- [ ] **Step 2: Create RenderGrid**

```typescript
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
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/RenderCard.tsx src/components/dashboard/RenderGrid.tsx
git commit -m "feat: add RenderCard and RenderGrid components"
```

---

## Task 14: DELETE /api/render/[id] route

**Files:**
- Modify: `src/app/api/render/[id]/route.ts`

- [ ] **Step 1: Add DELETE handler to the existing route file**

```typescript
// src/app/api/render/[id]/route.ts
// ADD this after the existing GET export:

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Fetch to get storage paths before deletion
  const { data: render } = await admin
    .from("renders")
    .select("input_image_url, output_image_url, user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!render) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete from storage (best-effort)
  await admin.storage.from("inputs").remove([render.input_image_url]);
  const outputPath = `${user.id}/${id}.jpg`;
  await admin.storage.from("renders").remove([outputPath]);

  // Delete render row
  await admin.from("renders").delete().eq("id", id).eq("user_id", user.id);

  return NextResponse.json({ success: true });
}
```

The full updated file should be:

```typescript
// src/app/api/render/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: render, error } = await admin
    .from("renders")
    .select("id, status, output_image_url, style, created_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !render) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: render.status,
    output_image_url: render.output_image_url,
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: render } = await admin
    .from("renders")
    .select("input_image_url, output_image_url, user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!render) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await admin.storage.from("inputs").remove([render.input_image_url]);
  await admin.storage.from("renders").remove([`${user.id}/${id}.jpg`]);
  await admin.from("renders").delete().eq("id", id).eq("user_id", user.id);

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/render/[id]/route.ts
git commit -m "feat: add DELETE /api/render/[id] route"
```

---

## Task 15: Gallery page

**Files:**
- Create: `src/app/[locale]/dashboard/gallery/page.tsx`

- [ ] **Step 1: Create gallery page**

```typescript
// src/app/[locale]/dashboard/gallery/page.tsx
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@/lib/supabase/admin";
import RenderGrid from "@/components/dashboard/RenderGrid";
import type { Render } from "@/types";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function GalleryPage({ params }: Props) {
  const { locale } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = createAdminClient();
  const { data: renders } = await admin
    .from("renders")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Gallery</h1>
        <p className="text-white/40 text-sm mt-1">
          {renders?.length ?? 0} avatar{(renders?.length ?? 0) !== 1 ? "s" : ""} generated
        </p>
      </div>
      <RenderGrid initialRenders={(renders as Render[]) ?? []} locale={locale} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/[locale]/dashboard/gallery/page.tsx
git commit -m "feat: add gallery page"
```

---

## Task 16: Billing page

**Files:**
- Create: `src/app/[locale]/dashboard/billing/page.tsx`

- [ ] **Step 1: Create billing page**

```typescript
// src/app/[locale]/dashboard/billing/page.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@/lib/supabase/admin";
import { PRICING_PLANS } from "@/types";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function BillingPage({ params }: Props) {
  const { locale } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = createAdminClient();

  const { data: sub } = await admin
    .rpc("get_active_subscription", { p_user_id: user.id })
    .single();

  const { data: countData } = await admin
    .rpc("count_monthly_renders", { p_user_id: user.id })
    .single();

  const used = (countData as number) ?? 0;

  type Sub = {
    plan_name: string;
    plan_duration: string;
    expires_at: string | null;
    monthly_render_limit: number;
    status: string;
  };

  const subscription = sub as Sub | null;
  const planDef = subscription
    ? PRICING_PLANS.find((p) => p.id === subscription.plan_name)
    : null;

  const percentage = subscription
    ? Math.min((used / subscription.monthly_render_limit) * 100, 100)
    : 0;

  const barColor =
    percentage >= 90 ? "bg-red-500" : percentage >= 70 ? "bg-orange-500" : "bg-emerald-500";

  function formatDuration(d: string): string {
    const map: Record<string, string> = {
      "6m": "6 months",
      "1y": "1 year",
      "2y": "2 years",
      lifetime: "Lifetime",
    };
    return map[d] ?? d;
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Billing</h1>
        <p className="text-white/40 text-sm mt-1">Your current plan and usage.</p>
      </div>

      {subscription ? (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 space-y-5">
          {/* Plan name */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Active Plan</p>
              <p className="text-white font-semibold text-lg">
                {planDef?.name ?? subscription.plan_name}
              </p>
              <p className="text-white/40 text-sm">
                {formatDuration(subscription.plan_duration)}
                {subscription.expires_at &&
                  ` · Expires ${new Date(subscription.expires_at).toLocaleDateString()}`}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
              Active
            </span>
          </div>

          <div className="h-px bg-white/[0.06]" />

          {/* Renders */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-white/60">Renders this month</p>
              <p className="text-sm text-white/80 font-medium tabular-nums">
                {used} / {subscription.monthly_render_limit}
              </p>
            </div>
            <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${barColor}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-8 text-center">
          <p className="text-white/50 font-medium text-sm mb-1">No active plan</p>
          <p className="text-white/25 text-xs mb-6">Purchase a plan to start generating avatars.</p>
          <Link
            href={`/${locale}/pricing`}
            className="px-5 py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
          >
            View Plans
          </Link>
        </div>
      )}

      <p className="text-xs text-white/20">
        For billing questions, contact{" "}
        <a href="mailto:support@smartpath.com" className="text-white/40 hover:text-white/60 transition-colors">
          support@smartpath.com
        </a>
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/[locale]/dashboard/billing/page.tsx
git commit -m "feat: add billing page"
```

---

## Task 17: Dev server smoke test

- [ ] **Step 1: Start the dev server**

```bash
cd "c:/Users/Ce Pc/Desktop/WEBSITE SAAS IMAGE AVATAR/smartpath-ai"
npm run dev
```

- [ ] **Step 2: Verify no TypeScript/build errors in terminal output**

Expected: `▲ Next.js 16.x.x` and `✓ Ready in Xs` with no red errors.

- [ ] **Step 3: Check these routes load without error**

- `http://localhost:3000/en/dashboard` → redirects to login (not logged in)
- `http://localhost:3000/en/dashboard` (logged in) → GeneratePanel renders
- `http://localhost:3000/en/dashboard/gallery` → gallery grid or empty state
- `http://localhost:3000/en/dashboard/billing` → billing card or "no plan"

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete Phase 5 dashboard — generate, gallery, billing"
```

---

## Spec Coverage Check

| Spec requirement | Task |
|---|---|
| Dashboard layout sidebar | Task 4, 5, 7 |
| Upload zone drag & drop | Task 8 |
| Style selector 8 styles | Task 9 |
| Fal.ai integration | Task 1, 2 |
| Render progress + output | Task 10 |
| Gallery with download/delete | Task 13, 14, 15 |
| Renders counter | Task 6 |
| Quota check + upgrade CTA | Task 11 |
| Billing page | Task 16 |
| Polling API | Task 3 |
