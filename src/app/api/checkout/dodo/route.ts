import { NextRequest, NextResponse } from "next/server";
import { PRICING_PLANS, type PlanName } from "@/types";

const DODO_PRODUCT_IDS: Record<PlanName, string> = {
  starter:    process.env.DODO_PRODUCT_STARTER    ?? "",
  pro:        process.env.DODO_PRODUCT_PRO        ?? "",
  enterprise: process.env.DODO_PRODUCT_ENTERPRISE ?? "",
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.DODO_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Dodo Payments is not configured." }, { status: 500 });
  }

  const rawAppUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const APP_URL = rawAppUrl.replace(/\/+$/, "");

  const body = await request.json();
  const { plan, email, locale } = body as { plan: PlanName; email: string; locale: string };

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
  }

  const planDef = PRICING_PLANS.find((p) => p.id === plan);
  if (!planDef) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const productId = DODO_PRODUCT_IDS[plan];
  if (!productId) {
    return NextResponse.json({ error: "Dodo product not configured for this plan." }, { status: 500 });
  }

  const returnUrl = `${APP_URL}/${locale}/thank-you?gateway=dodo`;

  try {
    const res = await fetch("https://api.dodopayments.com/subscriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer: { email, name: email.split("@")[0] },
        product_id: productId,
        payment_link: true,
        return_url: returnUrl,
        quantity: 1,
        metadata: { plan, email },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[checkout/dodo] API error:", errText);
      return NextResponse.json({ error: "Dodo checkout failed." }, { status: 502 });
    }

    const data = await res.json() as { payment_link?: string };
    if (!data.payment_link) {
      return NextResponse.json({ error: "No payment link returned." }, { status: 502 });
    }

    return NextResponse.json({ url: data.payment_link });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed.";
    console.error("[checkout/dodo] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
