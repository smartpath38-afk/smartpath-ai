// src/app/api/emails/purchase-confirmation/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { PRICING_PLANS, type PlanName, type PlanDuration } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);

const DURATION_LABELS: Record<string, string> = {
  "6m": "6 months",
  "1y": "1 year",
  "2y": "2 years",
  lifetime: "Max",
};

export async function POST(request: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[emails] RESEND_API_KEY not set — skipping email");
    return NextResponse.json({ ok: true, skipped: true });
  }

  const body = await request.json();
  const { userId, email: directEmail, plan, duration } = body as {
    userId?: string;
    email?: string;
    plan: PlanName;
    duration: PlanDuration;
  };

  if (!plan || !duration) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  let recipientEmail = directEmail ?? "";
  let firstName = "there";
  let isNewAccount = false;

  if (userId) {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("email, full_name")
      .eq("id", userId)
      .single();

    if (profile?.email) {
      recipientEmail = profile.email;
      firstName = profile.full_name?.split(" ")[0] ?? "there";
    }

    // If email matches userId but profile has no full_name, likely a newly created guest account
    if (!profile?.full_name) {
      isNewAccount = true;
    }
  } else if (directEmail) {
    // Guest user — account was auto-created, they need to set a password
    isNewAccount = true;
  }

  if (!recipientEmail) {
    return NextResponse.json({ error: "No recipient email" }, { status: 400 });
  }

  const planDef = PRICING_PLANS.find((p) => p.id === plan);
  const planName = planDef?.name ?? plan;
  const price = planDef?.prices[duration];
  const durationLabel = DURATION_LABELS[duration] ?? duration;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://smartpathavatar.online";

  const html = buildEmailHtml({
    firstName,
    planName,
    durationLabel,
    price: price ? `$${price}` : "",
    renderLimit: planDef?.monthlyRenderLimit ?? 0,
    loginUrl: `${appUrl}/en/auth/login`,
    resetPasswordUrl: `${appUrl}/en/auth/login`,
    isNewAccount,
  });

  const { error } = await resend.emails.send({
    from: "SMARTPATH AI <noreply@smartpathavatar.online>",
    to: recipientEmail,
    subject: `Your SMARTPATH AI license is active — ${planName} (${durationLabel})`,
    html,
  });

  if (error) {
    console.error("[emails] Resend error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// ─── Email template ────────────────────────────────────────────────────────────

function buildEmailHtml({
  firstName,
  planName,
  durationLabel,
  price,
  renderLimit,
  loginUrl,
  resetPasswordUrl,
  isNewAccount,
}: {
  firstName: string;
  planName: string;
  durationLabel: string;
  price: string;
  renderLimit: number;
  loginUrl: string;
  resetPasswordUrl: string;
  isNewAccount: boolean;
}): string {
  const ctaBlock = isNewAccount
    ? `
      <div style="text-align:center;margin-bottom:20px;">
        <a href="${resetPasswordUrl}" style="display:inline-block;background:#ffffff;color:#000000;font-size:14px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:-0.2px;">
          Set Your Password →
        </a>
      </div>
      <p style="margin:0 0 28px;text-align:center;font-size:13px;color:rgba(255,255,255,0.35);line-height:1.6;">
        We created an account for you with this email address.<br/>
        Click above and use <strong style="color:rgba(255,255,255,0.6);">Forgot Password</strong> to set a password and access your dashboard.
      </p>`
    : `
      <div style="text-align:center;margin-bottom:28px;">
        <a href="${loginUrl}" style="display:inline-block;background:#ffffff;color:#000000;font-size:14px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:-0.2px;">
          Go to Dashboard →
        </a>
      </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your SMARTPATH AI License is Active</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:48px 24px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:40px;text-align:center;">
              <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">SMARTPATH AI</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#141414;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:40px;">

              <!-- Success icon -->
              <div style="text-align:center;margin-bottom:28px;">
                <span style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:rgba(52,211,153,0.1);font-size:24px;">✓</span>
              </div>

              <h1 style="margin:0 0 8px;text-align:center;font-size:22px;font-weight:600;color:#ffffff;letter-spacing:-0.3px;">
                License Activated
              </h1>
              <p style="margin:0 0 32px;text-align:center;font-size:15px;color:rgba(255,255,255,0.45);">
                Hi ${firstName}, your purchase was successful.
              </p>

              <!-- Plan details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px;margin-bottom:28px;">
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:13px;color:rgba(255,255,255,0.4);">Plan</td>
                        <td style="text-align:right;font-size:13px;color:#ffffff;font-weight:500;">${planName}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:13px;color:rgba(255,255,255,0.4);">Access period</td>
                        <td style="text-align:right;font-size:13px;color:#ffffff;font-weight:500;">${durationLabel}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:13px;color:rgba(255,255,255,0.4);">Monthly renders</td>
                        <td style="text-align:right;font-size:13px;color:#ffffff;font-weight:500;">${renderLimit.toLocaleString()}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:13px;color:rgba(255,255,255,0.4);">Total paid</td>
                        <td style="text-align:right;font-size:14px;color:#ffffff;font-weight:700;">${price}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              ${ctaBlock}

              <p style="margin:0;text-align:center;font-size:12px;color:rgba(255,255,255,0.2);">
                Questions? Contact us at
                <a href="mailto:contact@smartpathavatar.online" style="color:rgba(255,255,255,0.35);text-decoration:none;">contact@smartpathavatar.online</a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:32px;text-align:center;">
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.15);">
                SMARTPATH AI LLC · 30 N Gould St Ste R, Sheridan, WY 82801, USA · smartpathavatar.online
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:rgba(255,255,255,0.1);">
                This is a transactional email — you cannot unsubscribe from purchase confirmations.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
