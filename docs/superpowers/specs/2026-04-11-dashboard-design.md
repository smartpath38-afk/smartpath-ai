# SMARTPATH AI — Phase 5 Dashboard Design

**Date:** 2026-04-11  
**Stack:** Next.js 16.2.3, Tailwind CSS v4, shadcn/ui, Framer Motion, Supabase, Fal.ai

---

## 1. Architecture

### Routes
```
/[locale]/dashboard                → Main generate page
/[locale]/dashboard/gallery        → Render history
/[locale]/dashboard/billing        → Current plan + upgrade CTA
/api/render                        → POST — triggers Fal.ai render
/api/render/[id]                   → GET — poll render status
```

### Layout
- `src/app/[locale]/dashboard/layout.tsx` — shared dashboard layout
- `src/components/dashboard/DashboardSidebar.tsx` — sidebar fixe gauche
- `src/components/dashboard/DashboardHeader.tsx` — header mobile + renders counter

**Sidebar (desktop):** fixe, 220px, fond `#0a0a0a`, border-right `#1a1a1a`. Items: Generate, Gallery, Billing, Account. Logo en haut. User avatar + email en bas.

**Mobile:** sidebar cachée, header avec hamburger → Sheet (drawer) shadcn/ui.

---

## 2. Page Generate (`/dashboard`)

### Composants
- `src/components/dashboard/UploadZone.tsx`
- `src/components/dashboard/StyleSelector.tsx`
- `src/components/dashboard/RenderButton.tsx`
- `src/components/dashboard/RenderProgress.tsx`

### Flow
1. User uploade une photo portrait (drag & drop ou click). Validation : JPEG/PNG/WEBP, max 10MB. Preview immédiate.
2. User sélectionne un style parmi 8 : `cartoon_3d`, `anime`, `oil_painting`, `cyberpunk`, `watercolor`, `realistic_portrait`, `sketch`, `fantasy`.
3. Clic "Generate Avatar" → vérifie quota → upload image vers Supabase storage `inputs/` → insert row dans `renders` (status: `processing`) → appel POST `/api/render` → affiche progress.
4. Polling GET `/api/render/[id]` toutes les 3s jusqu'à `completed` ou `failed`.
5. Résultat affiché immédiatement sous le bouton.

### Quota Check
- Avant génération : `count_monthly_renders(user_id)` vs `subscription.monthly_render_limit`.
- Si quota dépassé → modal "Upgrade your plan" avec lien `/[locale]/pricing`.
- Si pas d'abonnement actif → même modal.

---

## 3. Page Gallery (`/dashboard/gallery`)

### Composants
- `src/app/[locale]/dashboard/gallery/page.tsx`
- `src/components/dashboard/RenderGrid.tsx`
- `src/components/dashboard/RenderCard.tsx`

### Features
- Grid responsive 2→3→4 colonnes des renders `completed` de l'utilisateur.
- Chaque carte : thumbnail output, style badge, date, bouton Download, bouton Delete.
- Delete → soft delete via Supabase (ou hard delete + supprimer storage).
- Pagination ou infinite scroll (infinite scroll avec Intersection Observer).
- État vide : illustration + CTA vers `/dashboard`.

---

## 4. Page Billing (`/dashboard/billing`)

### Composants
- `src/app/[locale]/dashboard/billing/page.tsx`

### Features
- Affiche plan actif : nom, expires_at, renders utilisés ce mois / limite.
- Progress bar renders.
- Si pas d'abonnement actif : bannière "No active plan" + bouton "View Plans".
- Lien vers `/[locale]/pricing`.
- Pas de gestion de paiement directement ici (Phase 6).

---

## 5. API Routes

### `POST /api/render`
```
Body: { renderId: string }
```
1. Vérifie auth session (server client).
2. Récupère le render row (ownership check).
3. Récupère signed URL de l'image input depuis Supabase storage.
4. Appel Fal.ai : `fal.subscribe("fal-ai/flux/dev", { input: { image_url, style } })`.
5. Upload output vers Supabase storage `renders/[user_id]/[renderId].jpg`.
6. Update render row : `output_image_url`, `status: completed`.
7. Retourne `{ status: "completed", output_image_url }`.
8. Sur erreur : update `status: failed`, retourne `{ status: "failed" }`.

### `GET /api/render/[id]`
1. Vérifie auth.
2. Retourne render row `{ status, output_image_url }`.

---

## 6. Fal.ai Integration

**Package :** `@fal-ai/serverless-client` (ou `@fal-ai/client`)  
**Clé :** `FAL_API_KEY` (déjà dans `.env.local`)  
**Modèle choisi :** `fal-ai/flux/dev` avec `lora` ou prompt style injecté.

**Style → Prompt mapping** dans `src/lib/fal.ts` :
```ts
const STYLE_PROMPTS: Record<AvatarStyle, string> = {
  cartoon_3d: "3D cartoon avatar style, Pixar-like rendering...",
  anime: "anime style portrait, Studio Ghibli aesthetic...",
  // etc.
}
```

---

## 7. Renders Counter (Header)

- Composant `RendersCounter` dans `DashboardHeader` : `X / Y renders used this month`.
- Progress bar colorée : vert → orange → rouge selon usage.
- Données : server component via Supabase server client.

---

## 8. Data Flow

```
User → UploadZone → Supabase storage (inputs)
     → POST /api/render → Fal.ai → Supabase storage (renders)
     → renders table (status: completed)
     → GET /api/render/[id] polling → UI update
```

---

## 9. Fichiers à créer

```
src/app/[locale]/dashboard/layout.tsx
src/app/[locale]/dashboard/page.tsx
src/app/[locale]/dashboard/gallery/page.tsx
src/app/[locale]/dashboard/billing/page.tsx
src/app/api/render/route.ts
src/app/api/render/[id]/route.ts
src/components/dashboard/DashboardSidebar.tsx
src/components/dashboard/DashboardHeader.tsx
src/components/dashboard/UploadZone.tsx
src/components/dashboard/StyleSelector.tsx
src/components/dashboard/RenderButton.tsx
src/components/dashboard/RenderProgress.tsx
src/components/dashboard/RenderGrid.tsx
src/components/dashboard/RenderCard.tsx
src/components/dashboard/RendersCounter.tsx
src/lib/fal.ts
```

---

## 10. Contraintes techniques

- Next.js 16.2.3 (App Router, `proxy.ts` pas `middleware.ts`)
- Tailwind CSS v4 (pas de `tailwind.config.js` classique)
- Tous les Server Components qui lisent auth utilisent `src/lib/supabase/server.ts`
- Pas de `"use client"` dans les layout/page sauf nécessaire
- Design : fond noir `#000`, typographie blanche, accents violet/blue (cohérent avec homepage)
- Framer Motion pour transitions de page et animations upload
