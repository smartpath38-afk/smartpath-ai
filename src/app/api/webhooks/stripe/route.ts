import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { STRIPE_PRICE_IDS, type PlanName } from "@/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_TO_PLAN: Record<string, PlanName> = Object.fromEntries(
  (Object.entries(STRIPE_PRICE_IDS) as [PlanName, string][])
    .filter(([, v]) => v)
    .map(([plan, priceId]) => [priceId, plan])
);

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Webhook verification failed";
    console.warn("[webhook/stripe] Signature error:", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const email = session.customer_details?.email ?? (session.metadata?.email as string);
        const plan = session.metadata?.plan as PlanName | undefined;
        const subscriptionId = session.subscription as string;

        if (!email || !plan || !subscriptionId) {
          console.error("[webhook/stripe] Missing session data", { email, plan, subscriptionId });
          break;
        }

        const userId = await findOrCreateUserByEmail(admin, email);
        if (!userId) {
          console.error("[webhook/stripe] Cannot resolve user for email:", email);
          break;
        }

        await admin.rpc("activate_subscription", {
          p_user_id: userId,
          p_plan_name: plan,
          p_plan_duration: "monthly",
          p_gateway: "stripe",
          p_payment_id: subscriptionId,
        });

        triggerConfirmationEmail(userId, email, plan, subscriptionId);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.billing_reason !== "subscription_cycle") break;

        const subscriptionId = invoice.subscription as string;
        const priceId = invoice.lines?.data?.[0]?.price?.id;
        const plan = priceId ? PRICE_TO_PLAN[priceId] : undefined;

        if (!subscriptionId || !plan) break;

        const { data: existingSub } = await admin
          .from("subscriptions")
          .select("user_id")
          .eq("gateway_payment_id", subscriptionId)
          .eq("gateway", "stripe")
          .eq("status", "active")
          .limit(1)
          .single();

        if (!existingSub?.user_id) break;

        await admin.rpc("activate_subscription", {
          p_user_id: existingSub.user_id,
          p_plan_name: plan,
          p_plan_duration: "monthly",
          p_gateway: "stripe",
          p_payment_id: subscriptionId,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await admin
          .from("subscriptions")
          .update({ status: "cancelled" })
          .eq("gateway_payment_id", subscription.id)
          .eq("gateway", "stripe");
        break;
      }
    }
  } catch (err) {
    console.error("[webhook/stripe] Handler error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
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
    console.error("[webhook/stripe] Failed to create user:", email, error);
    return null;
  }

  return data.user.id;
}

function triggerConfirmationEmail(
  userId: string,
  email: string,
  plan: string,
  orderId: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  fetch(`${appUrl}/api/emails/purchase-confirmation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, email, plan, duration: "monthly", orderId }),
  }).catch((e) => console.error("[webhook/stripe] email trigger failed:", e));
}
