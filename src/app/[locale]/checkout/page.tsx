import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PRICING_PLANS, type PlanName } from "@/types";
import CheckoutClient from "./CheckoutClient";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ plan?: string; error?: string }>;
}

export default async function CheckoutPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { plan, error } = await searchParams;

  const validPlans: PlanName[] = ["starter", "pro", "enterprise"];

  if (!plan || !validPlans.includes(plan as PlanName)) {
    redirect(`/${locale}/pricing`);
  }

  const planName = plan as PlanName;
  const planDef = PRICING_PLANS.find((p) => p.id === planName)!;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0f11]">
      <Navbar />
      <main className="flex-1">
        <CheckoutClient
          locale={locale}
          planId={planName}
          planName={planDef.name}
          monthlyRenderLimit={planDef.monthlyRenderLimit}
          price={planDef.monthlyPrice}
          prefillEmail={user?.email ?? ""}
          hasError={error === "1"}
        />
      </main>
      <Footer locale={locale} />
    </div>
  );
}
