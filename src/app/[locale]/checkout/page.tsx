// src/app/[locale]/checkout/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PRICING_PLANS, CHECKOUT_DESCRIPTIONS, type PlanName, type PlanDuration } from "@/types";
import CheckoutClient from "./CheckoutClient";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ plan?: string; duration?: string; error?: string }>;
}

export default async function CheckoutPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { plan, duration, error } = await searchParams;

  // Validate params
  const validPlans: PlanName[] = ["essential", "pro", "business", "infinity"];
  const validDurations: PlanDuration[] = ["6m", "1y", "2y", "lifetime"];

  if (!plan || !duration || !validPlans.includes(plan as PlanName) || !validDurations.includes(duration as PlanDuration)) {
    redirect(`/${locale}/pricing`);
  }

  const planName = plan as PlanName;
  const planDuration = duration as PlanDuration;

  const planDef = PRICING_PLANS.find((p) => p.id === planName)!;
  const price = planDef.prices[planDuration];
  const description = CHECKOUT_DESCRIPTIONS[`${planName}-${planDuration}`] ?? "";

  // Optionally get user email if authenticated (pre-fill the email field)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <CheckoutClient
      locale={locale}
      planId={planName}
      planDuration={planDuration}
      planName={planDef.name}
      monthlyRenderLimit={planDef.monthlyRenderLimit}
      price={price}
      description={description}
      prefillEmail={user?.email ?? ""}
      hasError={error === "1"}
    />
  );
}
