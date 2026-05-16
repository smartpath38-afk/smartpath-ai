import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PlanName } from "@/types";

const DODO_PRODUCT_TO_PLAN: Record<string, PlanName> = {
  [process.env.DODO_PRODUCT_STARTER    ?? ""]: "starter",
  [process.env.DODO_PRODUCT_PRO        ?? ""]: "pro",
  [process.env.DODO_PRODUCT_ENTERPRISE ?? ""]: "enterprise",
};

async function verifyDodoSignature(rawBody: string, headers: Headers): Promise<boolean> {
  const secret = process.env.DODO_WEBHOOK_SECRET ?? "";
  const webhookId        = headers.get("webhook-id")        ?? "";
  const webhookTimestamp = headers.get("webhook-timestamp") ?? "";
  const webhookSignature = headers.get("webhook-signature") ?? "";

  if (!webhookId || !webhookTimestamp || !webhookSignature) return false;

  // Reject stale webhooks (>5 min)
  const ts = parseInt(webhookTimestamp, 10);
  if (Math.abs(Date.now() / 1000 - ts) > 300) return false;

  const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;

  // Secret is base64-encoded after the "whsec_" prefix
  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ""), "base64");

  const key = await crypto.subtle.importKey(
    "raw", secretBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sigBytes = await crypto.subtle.sign("HMAC", key, Buffer.from(signedContent));
  const computed = Buffer.from(sigBytes).toString("base64");

  // webhook-signature may be "v1,<sig1> v1,<sig2>"
  const signatures = webhookSignature.split(" ").map((s) => s.replace(/^v1,/, ""));
  return signatures.some((s) => s === computed);
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  const valid = await verifyDodoSignature(rawBody, request.headers);
  if (!valid) {
    console.warn("[webhook/dodo] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const event = JSON.parse(rawBody) as { type: string; data: any };
  const admin = createAdminClient();

  try {
    switch (event.type) {
      case "subscription.active": {
        const sub = event.data;
        const email: string = sub.customer?.email ?? sub.billing?.email ?? "";
        const productId: string = sub.product_id ?? "";
        const subscriptionId: string = sub.subscription_id ?? sub.id ?? "";
        const plan = DODO_PRODUCT_TO_PLAN[productId];

        if (!email || !plan || !subscriptionId) {
          console.error("[webhook/dodo] Missing data", { email, plan, subscriptionId });
          break;
        }

        const userId = await findOrCreateUserByEmail(admin, email);
        if (!userId) break;

        await admin.rpc("activate_subscription", {
          p_user_id: userId,
          p_plan_name: plan,
          p_plan_duration: "monthly",
          p_gateway: "dodo",
          p_payment_id: subscriptionId,
        });

        triggerConfirmationEmail(userId, email, plan, subscriptionId);
        break;
      }

      case "payment.succeeded": {
        const payment = event.data;
        const subscriptionId: string = payment.subscription_id ?? "";
        if (!subscriptionId) break;

        const { data: existingSub } = await admin
          .from("subscriptions")
          .select("user_id, plan_name")
          .eq("gateway_payment_id", subscriptionId)
          .eq("gateway", "dodo")
          .eq("status", "active")
          .limit(1)
          .single();

        if (!existingSub?.user_id) break;

        await admin.rpc("activate_subscription", {
          p_user_id: existingSub.user_id,
          p_plan_name: existingSub.plan_name,
          p_plan_duration: "monthly",
          p_gateway: "dodo",
          p_payment_id: subscriptionId,
        });
        break;
      }

      case "subscription.cancelled": {
        const subscriptionId: string = event.data?.subscription_id ?? event.data?.id ?? "";
        if (!subscriptionId) break;

        await admin
          .from("subscriptions")
          .update({ status: "cancelled" })
          .eq("gateway_payment_id", subscriptionId)
          .eq("gateway", "dodo");
        break;
      }
    }
  } catch (err) {
    console.error("[webhook/dodo] Handler error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function findOrCreateUserByEmail(admin: any, email: string): Promise<string | null> {
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (existing?.id) return existing.id;

  const { data, error } = await admin.auth.admin.createUser({ email, email_confirm: true });
  if (error || !data?.user) {
    console.error("[webhook/dodo] Failed to create user:", email, error);
    return null;
  }
  return data.user.id;
}

function triggerConfirmationEmail(userId: string, email: string, plan: string, orderId: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  fetch(`${appUrl}/api/emails/purchase-confirmation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, email, plan, duration: "monthly", orderId }),
  }).catch((e) => console.error("[webhook/dodo] email trigger failed:", e));
}
