# Bank Compliance & Pricing Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all KYB red flags and switch pricing language from "one-time payment" to "Annual Subscription" framing across the full EN/DE site for Relay Financial bank account application.

**Architecture:** Pure content/UI layer edits only — no database, API, or authentication changes. All 9 files are either i18n JSON or React Server/Client Components. The checkout logic remains intact; only display labels and copy change.

**Tech Stack:** Next.js 16 App Router, next-intl (EN/DE), Tailwind CSS v4, TypeScript

---

## File Map

| File | What changes |
|------|-------------|
| `messages/en.json` | pricing.subtitle, pricing.plans.*.renders, checkout.durations.1y, checkout.oneTime |
| `messages/de.json` | Same keys in German |
| `src/app/[locale]/pricing/PricingPageClient.tsx` | Price sublabel text, "No Subscription" trust badge |
| `src/components/layout/Footer.tsx` | Privacy Policy href, copyright bottom row |
| `src/app/[locale]/about/page.tsx` | Founder section, "One-Time Licensing" card, mission paragraph |
| `src/app/[locale]/legal/terms/page.tsx` | Date + Section 2 description wording |
| `src/app/[locale]/legal/privacy/page.tsx` | Date only |
| `src/app/[locale]/legal/refund/page.tsx` | Date only |

---

## Task 1: Fix EN translation keys

**Files:**
- Modify: `messages/en.json`

- [ ] **Step 1: Update `pricing.subtitle`**

In `messages/en.json`, change:
```json
"subtitle": "One-time payment. No subscriptions. No hidden fees.",
```
To:
```json
"subtitle": "Annual subscription. Cancel anytime. No hidden fees.",
```

- [ ] **Step 2: Update `pricing.plans.*.renders` (all 4 plans)**

Change all four `renders` values:
```json
"essential": {
  "name": "Essential",
  "renders": "150 AI Generations per month",
```
```json
"pro": {
  "name": "Pro Studio",
  "renders": "450 AI Generations per month",
```
```json
"business": {
  "name": "Business Elite",
  "renders": "1,500 AI Generations per month",
```
```json
"infinity": {
  "name": "Infinity Legacy",
  "renders": "3,000 AI Generations per month",
```

- [ ] **Step 3: Fix `checkout.durations.1y` bug (critical — currently shows "Lifetime Access")**

In the `checkout.durations` block, change:
```json
"1y": "Lifetime Access",
```
To:
```json
"1y": "1-Year Plan",
```

- [ ] **Step 4: Update `checkout.oneTime` period label**

Change:
```json
"oneTime": "one-time",
```
To:
```json
"oneTime": "/ year",
```

- [ ] **Step 5: Verify JSON is valid**

Run: `node -e "JSON.parse(require('fs').readFileSync('messages/en.json','utf8')); console.log('valid')"`
Expected output: `valid`

- [ ] **Step 6: Commit**

```bash
git add messages/en.json
git commit -m "fix(i18n): switch EN pricing to annual subscription language, fix 1y=Lifetime bug"
```

---

## Task 2: Fix DE translation keys

**Files:**
- Modify: `messages/de.json`

- [ ] **Step 1: Update `pricing.subtitle`**

```json
"subtitle": "Jahresabonnement. Jederzeit kündbar. Keine versteckten Kosten.",
```

- [ ] **Step 2: Update `pricing.plans.*.renders` (all 4 plans)**

```json
"essential": {
  "name": "Essential",
  "renders": "150 KI-Generierungen pro Monat",
```
```json
"pro": {
  "name": "Pro Studio",
  "renders": "450 KI-Generierungen pro Monat",
```
```json
"business": {
  "name": "Business Elite",
  "renders": "1.500 KI-Generierungen pro Monat",
```
```json
"infinity": {
  "name": "Infinity Legacy",
  "renders": "3.000 KI-Generierungen pro Monat",
```

- [ ] **Step 3: Fix `checkout.durations.1y` bug**

```json
"1y": "1-Jahres-Plan",
```

- [ ] **Step 4: Update `checkout.oneTime` label**

```json
"oneTime": "/ Jahr",
```

- [ ] **Step 5: Verify JSON is valid**

Run: `node -e "JSON.parse(require('fs').readFileSync('messages/de.json','utf8')); console.log('valid')"`
Expected output: `valid`

- [ ] **Step 6: Commit**

```bash
git add messages/de.json
git commit -m "fix(i18n): switch DE pricing to annual subscription language, fix 1y=Lifetime bug"
```

---

## Task 3: Fix PricingPageClient — price sublabel and trust badge

**Files:**
- Modify: `src/app/[locale]/pricing/PricingPageClient.tsx`

- [ ] **Step 1: Replace the hardcoded price sublabel (around line 123–127)**

Find this block:
```tsx
<p className="text-white/30 text-xs mt-1.5">
  {activeDuration !== "lifetime"
    ? `One-time payment — ${t(`duration.${activeDuration}`)} access`
    : "One-time payment — Lifetime access"}
</p>
```

Replace with:
```tsx
<p className="text-white/30 text-xs mt-1.5">
  {activeDuration !== "lifetime"
    ? `Annual plan · ${t(`duration.${activeDuration}`)}`
    : `Lifetime plan · ${t("duration.lifetime")}`}
</p>
```

- [ ] **Step 2: Replace the "No Subscription" trust badge text (around line 187)**

Find:
```tsx
No Subscription
```

Replace with:
```tsx
Cancel Anytime
```

The full trust badge block to change (the second `<div className="flex items-center gap-2">` in the trust badges section):
```tsx
<div className="flex items-center gap-2">
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
  Cancel Anytime
</div>
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd "c:\Users\Ce Pc\Desktop\WEBSITE SAAS IMAGE AVATAR\smartpath-ai" && npx tsc --noEmit 2>&1 | head -20`
Expected: no errors related to PricingPageClient

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/pricing/PricingPageClient.tsx
git commit -m "fix(pricing): switch sublabel to Annual Plan framing, replace No Subscription badge"
```

---

## Task 4: Fix Footer — Privacy Policy link and copyright line

**Files:**
- Modify: `src/components/layout/Footer.tsx`

- [ ] **Step 1: Fix the broken Privacy Policy href**

Find (around line 96–100):
```tsx
<Link
  href={`/${locale}/privacy-policy`}
  className="text-white/40 hover:text-white/70 transition-colors"
>
  Privacy Policy
</Link>
```

Replace with:
```tsx
<Link
  href={`/${locale}/legal/privacy`}
  className="text-white/40 hover:text-white/70 transition-colors"
>
  Privacy Policy
</Link>
```

- [ ] **Step 2: Merge the two copyright bottom-row lines into one**

Find (around line 116–118):
```tsx
<div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3 text-xs text-white/20">
  <p>&copy; {year} SMARTPATH AI LLC. All rights reserved.</p>
  <p>Registered in Montana, United States.</p>
</div>
```

Replace with:
```tsx
<div className="flex items-center justify-center text-xs text-white/20">
  <p>&copy; {year} SMARTPATH AI LLC. Kalispell, MT, United States. All rights reserved.</p>
</div>
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd "c:\Users\Ce Pc\Desktop\WEBSITE SAAS IMAGE AVATAR\smartpath-ai" && npx tsc --noEmit 2>&1 | head -20`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Footer.tsx
git commit -m "fix(footer): correct privacy policy link path, consolidate copyright line"
```

---

## Task 5: Update About page — founder, feature card, mission

**Files:**
- Modify: `src/app/[locale]/about/page.tsx`

- [ ] **Step 1: Add founder section after "Our Mission"**

Find the divider after the "Our Mission" section:
```tsx
            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-white">What We Build</h2>
```

Insert a new section + divider before "What We Build":
```tsx
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">Our Founder</h2>
              <p className="text-white/55 leading-relaxed">
                SMARTPATH AI LLC was founded by{" "}
                <strong className="text-white/80">Fouad Hamdoune</strong>, an entrepreneur
                and technologist focused on making professional-grade AI tools accessible
                to creators, businesses, and independent professionals worldwide. Based in
                Kalispell, Montana, Fouad built SMARTPATH AI to bridge the gap between
                enterprise-level AI capabilities and everyday users.
              </p>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-white">What We Build</h2>
```

- [ ] **Step 2: Replace the "One-Time Licensing" feature card**

In the `{[...].map((item) => (...))}` features array inside "What We Build", find the entry:
```tsx
{
  title: "One-Time Licensing",
  desc: "No recurring charges. Purchase once and generate avatars throughout your license period with no hidden costs.",
},
```

Replace with:
```tsx
{
  title: "Annual Subscription Model",
  desc: "Flexible annual plans starting at €59.99/year. Generate avatars throughout your subscription period with full access from day one.",
},
```

- [ ] **Step 3: Update the mission paragraph**

Find:
```tsx
We believe that high-quality digital identity should be accessible to
everyone. SMARTPATH AI exists to make professional avatar generation
fast, affordable, and private — without subscriptions, hidden fees, or
compromises on output quality. One purchase, full access, zero friction.
```

Replace with:
```tsx
We believe that high-quality digital identity should be accessible to
everyone. SMARTPATH AI exists to make professional avatar generation
fast, affordable, and private — without hidden fees or compromises on
output quality. Subscribe annually, generate at scale, and cancel
anytime. Full access from the moment you subscribe.
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd "c:\Users\Ce Pc\Desktop\WEBSITE SAAS IMAGE AVATAR\smartpath-ai" && npx tsc --noEmit 2>&1 | head -20`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/about/page.tsx
git commit -m "feat(about): add founder Fouad Hamdoune, update to subscription model framing"
```

---

## Task 6: Update legal pages — dates and Terms section 2

**Files:**
- Modify: `src/app/[locale]/legal/terms/page.tsx`
- Modify: `src/app/[locale]/legal/privacy/page.tsx`
- Modify: `src/app/[locale]/legal/refund/page.tsx`

- [ ] **Step 1: Update date in Terms page**

Find:
```tsx
<p className="text-white/30 text-sm">Last updated: May 1, 2025</p>
```

Replace with:
```tsx
<p className="text-white/30 text-sm">Last updated: May 1, 2026</p>
```

- [ ] **Step 2: Update Terms Section 2 — Description of Service**

Find in `terms/page.tsx`:
```tsx
The Service is offered on a one-time digital license basis granting access for a fixed duration (6 months, 1 year, 2 years, or lifetime) as selected at the time of purchase.
```

Replace with:
```tsx
The Service is offered on an annual subscription basis granting access for the selected period (6 months, 1 year, 2 years, or lifetime) as chosen at the time of purchase.
```

- [ ] **Step 3: Update date in Privacy Policy page**

In `privacy/page.tsx`, find:
```tsx
<p className="text-white/30 text-sm">Last updated: May 1, 2025</p>
```

Replace with:
```tsx
<p className="text-white/30 text-sm">Last updated: May 1, 2026</p>
```

- [ ] **Step 4: Update date in Refund Policy page**

In `refund/page.tsx`, find:
```tsx
<p className="text-white/30 text-sm">Last updated: May 1, 2025</p>
```

Replace with:
```tsx
<p className="text-white/30 text-sm">Last updated: May 1, 2026</p>
```

- [ ] **Step 5: Verify TypeScript compiles clean**

Run: `cd "c:\Users\Ce Pc\Desktop\WEBSITE SAAS IMAGE AVATAR\smartpath-ai" && npx tsc --noEmit 2>&1 | head -20`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add src/app/[locale]/legal/terms/page.tsx src/app/[locale]/legal/privacy/page.tsx src/app/[locale]/legal/refund/page.tsx
git commit -m "fix(legal): update dates to 2026, align Terms section 2 with subscription model"
```

---

## Final Verification Checklist

After all tasks complete, run a full build and manually verify:

- [ ] **Build passes:** `cd "c:\Users\Ce Pc\Desktop\WEBSITE SAAS IMAGE AVATAR\smartpath-ai" && npx next build 2>&1 | tail -20`
- [ ] **EN pricing page:** subtitle reads "Annual subscription. Cancel anytime. No hidden fees." — not "One-time payment"
- [ ] **EN pricing cards:** renders label reads "150 AI Generations per month" (not "Total")
- [ ] **Pricing price sublabel:** reads "Annual plan · 1 Year" (not "One-time payment")
- [ ] **Trust badge:** reads "Cancel Anytime" (not "No Subscription")
- [ ] **EN checkout - 1y plan:** order summary reads "1-Year Plan" (not "Lifetime Access")
- [ ] **EN checkout - price suffix:** reads "/ year" (not "one-time")
- [ ] **DE pricing page:** subtitle and renders updated in German
- [ ] **DE checkout - 1y plan:** reads "1-Jahres-Plan"
- [ ] **Footer Privacy Policy link:** navigates to `/en/legal/privacy` (not `/en/privacy-policy`)
- [ ] **Footer copyright:** reads "© 2026 SMARTPATH AI LLC. Kalispell, MT, United States. All rights reserved."
- [ ] **About page:** "Fouad Hamdoune" appears in Founder section
- [ ] **About page:** "Annual Subscription Model" card visible (not "One-Time Licensing")
- [ ] **Terms page:** date reads "May 1, 2026", Section 2 says "annual subscription basis"
- [ ] **Privacy page:** date reads "May 1, 2026"
- [ ] **Refund page:** date reads "May 1, 2026"
