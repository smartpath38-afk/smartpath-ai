# Bank Compliance & Pricing Overhaul — Design Spec

**Date:** 2026-05-02
**Project:** SMARTPATH AI SaaS — Image to Avatar
**Purpose:** Prepare site for Relay Financial business bank account KYB review by fixing compliance red flags, standardizing pricing language to Annual Subscription model, and ensuring full EN/DE consistency.

---

## Scope

15 targeted file edits. No database, API, or authentication changes. All changes are UI/content layer only.

---

## 1. Critical Bug Fixes

### 1a. Checkout Duration Label Bug
**File:** `messages/en.json` and `messages/de.json`
**Problem:** `checkout.durations."1y"` reads "Lifetime Access" (EN) / "Lebenslanger Zugang" (DE). Any customer buying the 1-year plan sees "Lifetime Access" in their order summary — a misrepresentation and chargeback risk.
**Fix:**
- EN: `"1y": "1-Year Plan"`
- DE: `"1y": "1-Jahres-Plan"`

### 1b. Broken Privacy Policy Footer Link
**File:** `src/components/layout/Footer.tsx`
**Problem:** Privacy Policy link points to `/{locale}/privacy-policy` but the actual page is at `/{locale}/legal/privacy`. Dead link on a legal navigation element.
**Fix:** Change href to `/{locale}/legal/privacy`.

---

## 2. Pricing Model Language — Annual Subscription Framing

### 2a. Pricing Page Subtitle
**Files:** `messages/en.json`, `messages/de.json`
- EN: `pricing.subtitle` → `"Annual subscription. Cancel anytime. No hidden fees."`
- DE: `pricing.subtitle` → `"Jahresabonnement. Jederzeit kündbar. Keine versteckten Kosten."`

### 2b. Plan Render Description
**Files:** `messages/en.json`, `messages/de.json`
- EN: `pricing.plans.*.renders` — change "Total Avatar Generations" → "AI Generations per month"
  - essential: `"150 AI Generations per month"`
  - pro: `"450 AI Generations per month"`
  - business: `"1,500 AI Generations per month"`
  - infinity: `"3,000 AI Generations per month"`
- DE: same pattern with "KI-Generierungen pro Monat"

### 2c. Pricing Card Price Sublabel
**File:** `src/app/[locale]/pricing/PricingPageClient.tsx`
- Remove hardcoded `"One-time payment — X access"` text (line 125-127)
- Replace with: `"Annual plan · {t(`duration.${activeDuration}`)}"` (for non-lifetime) and `"Lifetime plan"` for lifetime

### 2d. "No Subscription" Trust Badge
**File:** `src/app/[locale]/pricing/PricingPageClient.tsx`
- Change trust badge text "No Subscription" → "Cancel Anytime"

### 2e. Checkout Order Summary Period Label
**Files:** `messages/en.json`, `messages/de.json`
- EN: Repurpose `checkout.oneTime` key or add duration-aware label. For now rename value from `"one-time"` to `"/ year"` (generic, shown next to price). The durations.1y label fix in 1a handles the specific plan label.
- DE: `"oneTime"` → `"/ Jahr"`

---

## 3. About Page — Founder & Model Updates

**File:** `src/app/[locale]/about/page.tsx`

### 3a. Add Founder Section
Insert a new section after "Our Mission" introducing the founder:
> "SMARTPATH AI LLC was founded by **Fouad Hamdoune**, an entrepreneur and technologist with a focus on making professional-grade AI tools accessible to creators, businesses, and independent professionals worldwide."

### 3b. Update "One-Time Licensing" Feature Card
Replace the card titled "One-Time Licensing" (desc: "No recurring charges...") with:
- Title: `"Annual Subscription Model"`
- Desc: `"Flexible annual plans starting at €59.99/year. Generate avatars throughout your subscription period with full access from day one."`

### 3c. Update Mission Paragraph
Remove: `"One purchase, full access, zero friction."`
Replace with: `"Subscribe annually, generate at scale, and cancel anytime. Full access from the moment you subscribe."`

---

## 4. Footer — Copyright Line

**File:** `src/components/layout/Footer.tsx`
**Change:** Merge the two bottom-row paragraphs into one authoritative line:
`© 2026 SMARTPATH AI LLC. Kalispell, MT, United States. All rights reserved.`

---

## 5. Legal Pages — Date Update

**Files:** `src/app/[locale]/legal/terms/page.tsx`, `src/app/[locale]/legal/privacy/page.tsx`, `src/app/[locale]/legal/refund/page.tsx`
- `Last updated: May 1, 2025` → `Last updated: May 1, 2026`

---

## 6. Terms of Service — Description of Service Update

**File:** `src/app/[locale]/legal/terms/page.tsx`
- Section 2 currently says "offered on a one-time digital license basis". Update to reflect subscription model: "offered on an annual subscription basis granting access for the selected period (6 months, 1 year, 2 years, or lifetime)."

---

## Files Changed

| File | Type of Change |
|------|---------------|
| `messages/en.json` | pricing subtitle, renders labels, checkout durations, oneTime label |
| `messages/de.json` | same as EN, in German |
| `src/app/[locale]/pricing/PricingPageClient.tsx` | price sublabel text, trust badge |
| `src/app/[locale]/checkout/CheckoutClient.tsx` | no code change needed (uses translation keys) |
| `src/components/layout/Footer.tsx` | privacy link fix, copyright line update |
| `src/app/[locale]/about/page.tsx` | founder section, feature card update, mission text |
| `src/app/[locale]/legal/terms/page.tsx` | date update, section 2 wording |
| `src/app/[locale]/legal/privacy/page.tsx` | date update |
| `src/app/[locale]/legal/refund/page.tsx` | date update |

---

## Compliance Checklist (Post-Implementation)

- [ ] No "one-time payment" language visible on any public page
- [ ] All pricing cards show `€X.XX / Year` (or period equivalent)
- [ ] Checkout order summary shows correct plan duration label (not "Lifetime" for 1-year)
- [ ] Footer Privacy Policy link works
- [ ] About page mentions founder Fouad Hamdoune
- [ ] All legal pages dated 2026
- [ ] EN and DE translations are synchronized
- [ ] `contact@smartpath.ai` is the sole support contact shown
- [ ] Footer copyright: `© 2026 SMARTPATH AI LLC. Kalispell, MT, United States. All rights reserved.`
