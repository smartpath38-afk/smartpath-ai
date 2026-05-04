// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  PRICING_PLANS,
  CHECKOUT_DESCRIPTIONS,
  type PlanName,
  type PlanDuration,
  type Gateway,
} from "@/types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ─── PayPal ───────────────────────────────────────────────────────────────────

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal is not configured. Please add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.");
  }

  const base64 = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${base64}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`PayPal auth failed: ${res.status}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

async function createPayPalSession(
  plan: PlanName,
  duration: PlanDuration,
  price: number,
  locale: string,
  orderId: string
): Promise<string> {
  const accessToken = await getPayPalAccessToken();
  const description = CHECKOUT_DESCRIPTIONS[`${plan}-${duration}`] ?? "SMARTPATH AI — Digital service license activation.";

  const body = {
    intent: "CAPTURE",
    purchase_units: [
      {
        custom_id: orderId, // used by webhook to identify plan+user
        amount: {
          currency_code: "USD",
          value: price.toFixed(2),
        },
        description,
      },
    ],
    application_context: {
      brand_name: "SMARTPATH AI",
      locale: "en-US",
      landing_page: "BILLING",
      user_action: "PAY_NOW",
      return_url: `${APP_URL}/${locale}/thank-you?gateway=paypal`,
      cancel_url: `${APP_URL}/${locale}/checkout?plan=${plan}&duration=${duration}&error=1`,
    },
  };

  const res = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal order error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const approveLink = (data.links as { rel: string; href: string }[])?.find(
    (l) => l.rel === "approve"
  )?.href;

  if (!approveLink) {
    throw new Error("PayPal did not return an approval URL.");
  }

  return approveLink;
}

// ─── Random order ID helper ───────────────────────────────────────────────────

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("").slice(0, bytes * 2);
}

// ─── Main handler ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { plan, duration, gateway, locale, email } = body as {
    plan: PlanName;
    duration: PlanDuration;
    gateway: Gateway;
    locale: string;
    email: string;
  };

  // Validate email
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
  }

  // Validate plan/duration
  const planDef = PRICING_PLANS.find((p) => p.id === plan);
  if (!planDef || !planDef.prices[duration]) {
    return NextResponse.json({ error: "Invalid plan or duration." }, { status: 400 });
  }

  const price = planDef.prices[duration];

  // orderId format: smartpath-{8chars}-{plan}-{duration}-{timestamp}
  // 8-char random hex for guests (no user ID)
  const uid8 = randomHex(4); // 4 bytes = 8 hex chars
  const orderId = `smartpath-${uid8}-${plan}-${duration}-${Date.now()}`;

  // Store guest order so webhooks can look up the email later
  const admin = createAdminClient();
  await admin.from("guest_orders").insert({ order_id: orderId, email, plan, duration });

  try {
    if (gateway !== "paypal") {
      return NextResponse.json({ error: "Unknown gateway." }, { status: 400 });
    }
    const checkoutUrl = await createPayPalSession(plan, duration, price, locale, orderId);

    return NextResponse.json({ url: checkoutUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed.";
    console.error(`[checkout] ${gateway} error:`, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
