import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PRICING_PLANS, type PlanName } from "@/types";

export async function POST(request: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
  }

  const priceIds: Record<PlanName, string> = {
    starter: process.env.STRIPE_PRICE_STARTER_MONTHLY ?? "",
    pro:     process.env.STRIPE_PRICE_PRO_MONTHLY     ?? "",
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY ?? "",
  };

  const rawAppUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const APP_URL = rawAppUrl.replace(/\/+$/, "");

  const stripe = new Stripe(stripeKey);

  const body = await request.json();
  const { plan, email, locale } = body as {
    plan: PlanName;
    email: string;
    locale: string;
  };

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
  }

  const planDef = PRICING_PLANS.find((p) => p.id === plan);
  if (!planDef) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const priceId = priceIds[plan];
  if (!priceId) {
    return NextResponse.json({ error: "Stripe price not configured for this plan." }, { status: 500 });
  }

  const successUrl = `${APP_URL}/${locale}/thank-you?gateway=stripe&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl  = `${APP_URL}/${locale}/checkout?plan=${plan}&error=1`;

  console.log("[checkout] APP_URL:", APP_URL);
  console.log("[checkout] priceId:", priceId);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      metadata: { plan, email },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed.";
    console.error("[checkout] Stripe error:", message);
    console.error("[checkout] success_url was:", successUrl);
    console.error("[checkout] cancel_url was:", cancelUrl);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
