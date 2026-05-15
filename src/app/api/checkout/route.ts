import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PRICING_PLANS, STRIPE_PRICE_IDS, type PlanName } from "@/types";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export async function POST(request: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
  }
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

  const priceId = STRIPE_PRICE_IDS[plan];
  if (!priceId) {
    return NextResponse.json({ error: "Stripe price not configured for this plan." }, { status: 500 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      metadata: { plan, email },
      success_url: `${APP_URL}/${locale}/thank-you?gateway=stripe&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/${locale}/checkout?plan=${plan}&error=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed.";
    console.error("[checkout] Stripe error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
