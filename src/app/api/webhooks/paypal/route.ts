// src/app/api/webhooks/paypal/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// PayPal webhook event: PAYMENT.CAPTURE.COMPLETED
// Verifies signature via PayPal API, then activates subscription.

async function verifyPayPalWebhook(
  request: NextRequest,
  body: string
): Promise<boolean> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;

  if (!clientId || !clientSecret || !webhookId) return true; // skip if not configured

  // Get PayPal access token
  const base64 = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const tokenRes = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${base64}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!tokenRes.ok) return false;
  const { access_token: accessToken } = await tokenRes.json();

  // Verify webhook signature
  const verifyRes = await fetch(
    "https://api-m.paypal.com/v1/notifications/verify-webhook-signature",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: request.headers.get("paypal-auth-algo") ?? "",
        cert_url: request.headers.get("paypal-cert-url") ?? "",
        client_id: clientId,
        transmission_id: request.headers.get("paypal-transmission-id") ?? "",
        transmission_sig: request.headers.get("paypal-transmission-sig") ?? "",
        transmission_time: request.headers.get("paypal-transmission-time") ?? "",
        webhook_id: webhookId,
        webhook_event: JSON.parse(body),
      }),
    }
  );

  if (!verifyRes.ok) return false;
  const { verification_status } = await verifyRes.json();
  return verification_status === "SUCCESS";
}

export async function POST(request: NextRequest) {
  const body = await request.text();

  const isValid = await verifyPayPalWebhook(request, body);
  if (!isValid) {
    console.warn("[webhook/paypal] Signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = event.event_type as string;

  // Only process completed captures
  if (eventType !== "PAYMENT.CAPTURE.COMPLETED") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const resource = event.resource as Record<string, unknown>;
  const captureId = resource?.id as string | undefined;

  const supplementary = resource?.supplementary_data as Record<string, unknown> | undefined;
  const relatedIds = supplementary?.related_ids as Record<string, string> | undefined;
  const orderId = relatedIds?.order_id as string | undefined;

  if (!orderId || !captureId) {
    console.error("[webhook/paypal] Missing orderId or captureId", resource);
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Look up the PayPal order to get custom_id
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "PayPal not configured" }, { status: 500 });
  }

  const base64 = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const tokenRes = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${base64}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!tokenRes.ok) {
    return NextResponse.json({ error: "PayPal auth failed" }, { status: 500 });
  }

  const { access_token: accessToken } = await tokenRes.json();

  const orderRes = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!orderRes.ok) {
    return NextResponse.json({ error: "Could not fetch PayPal order" }, { status: 500 });
  }

  const order = await orderRes.json();
  // custom_id = "smartpath-{uid8}-{plan}-{duration}-{timestamp}"
  const customId: string = (order?.purchase_units?.[0]?.custom_id as string) ?? "";
  const parsed = parseOrderId(customId);

  if (!parsed) {
    console.error("[webhook/paypal] Cannot parse custom_id:", customId);
    return NextResponse.json({ error: "Cannot parse order metadata" }, { status: 400 });
  }

  const { plan, duration } = parsed;
  const admin = createAdminClient();

  const userId = await resolveOrCreateUser(admin, customId);
  if (!userId) {
    console.error("[webhook/paypal] Cannot resolve user for orderId:", customId);
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await activateSubscriptionAndEmail(admin, userId, plan, duration, "paypal", captureId, customId);

  return NextResponse.json({ ok: true });
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function parseOrderId(orderId: string) {
  // Format: smartpath-{uid8}-{plan}-{duration}-{timestamp}
  const parts = orderId.split("-");
  if (parts.length !== 5 || parts[0] !== "smartpath") return null;
  const [, userIdPrefix, plan, duration] = parts;
  return { userIdPrefix, plan, duration };
}

async function resolveOrCreateUser(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  orderId: string
): Promise<string | null> {
  const parsed = parseOrderId(orderId);
  if (!parsed) return null;

  // Try existing profile by uid8 prefix (authenticated user flow)
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .ilike("id", `${parsed.userIdPrefix}%`)
    .limit(1)
    .single();

  if (profile?.id) return profile.id;

  // Fall back to guest_orders lookup by full orderId
  const { data: guestOrder } = await admin
    .from("guest_orders")
    .select("email")
    .eq("order_id", orderId)
    .single();

  if (!guestOrder?.email) return null;

  return findOrCreateUserByEmail(admin, guestOrder.email);
}

async function findOrCreateUserByEmail(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  email: string
): Promise<string | null> {
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (existing?.id) return existing.id;

  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
  });

  if (error || !data?.user) {
    console.error("[webhook] Failed to create user for email:", email, error);
    return null;
  }

  return data.user.id;
}

async function activateSubscriptionAndEmail(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  userId: string,
  plan: string,
  duration: string,
  gateway: string,
  paymentId: string,
  orderId: string
) {
  await admin.rpc("activate_subscription", {
    p_user_id: userId,
    p_plan_name: plan,
    p_plan_duration: duration,
    p_gateway: gateway,
    p_payment_id: paymentId,
  });

  const { data: profile } = await admin
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .single();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  fetch(`${appUrl}/api/emails/purchase-confirmation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, email: profile?.email, plan, duration, orderId }),
  }).catch((e) => console.error("[webhook] email trigger failed:", e));
}
