// src/app/[locale]/dashboard/billing/page.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PRICING_PLANS } from "@/types";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function BillingPage({ params }: Props) {
  const { locale } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = createAdminClient();

  const { data: sub } = await admin
    .rpc("get_active_subscription", { p_user_id: user.id })
    .single();

  const { data: countData } = await admin
    .rpc("count_monthly_renders", { p_user_id: user.id })
    .single();

  const used = (countData as number) ?? 0;

  type Sub = {
    plan_name: string;
    plan_duration: string;
    expires_at: string | null;
    monthly_render_limit: number;
    status: string;
  };

  const subscription = sub as Sub | null;
  const planDef = subscription
    ? PRICING_PLANS.find((p) => p.id === subscription.plan_name)
    : null;

  const percentage = subscription
    ? Math.min((used / subscription.monthly_render_limit) * 100, 100)
    : 0;

  const barColor =
    percentage >= 90 ? "bg-red-500" : percentage >= 70 ? "bg-orange-500" : "bg-emerald-500";

  function formatDuration(d: string): string {
    const map: Record<string, string> = {
      "6m": "6 months",
      "1y": "1 year",
      "2y": "2 years",
      lifetime: "Max",
    };
    return map[d] ?? d;
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Billing</h1>
        <p className="text-white/40 text-sm mt-1">Your current plan and usage.</p>
      </div>

      {subscription ? (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 space-y-5">
          {/* Plan name */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Active Plan</p>
              <p className="text-white font-semibold text-lg">
                {planDef?.name ?? subscription.plan_name}
              </p>
              <p className="text-white/40 text-sm">
                {formatDuration(subscription.plan_duration)}
                {subscription.expires_at &&
                  ` · Expires ${new Date(subscription.expires_at).toLocaleDateString()}`}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
              Active
            </span>
          </div>

          <div className="h-px bg-white/[0.06]" />

          {/* Renders */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-white/60">Renders this month</p>
              <p className="text-sm text-white/80 font-medium tabular-nums">
                {used} / {subscription.monthly_render_limit}
              </p>
            </div>
            <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${barColor}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-8 text-center">
          <p className="text-white/50 font-medium text-sm mb-1">No active plan</p>
          <p className="text-white/25 text-xs mb-6">Purchase a plan to start generating avatars.</p>
          <Link
            href={`/${locale}/pricing`}
            className="px-5 py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
          >
            View Plans
          </Link>
        </div>
      )}

      <p className="text-xs text-white/20">
        For billing questions, contact{" "}
        <a href="mailto:contact@smartpathavatar.online" className="text-white/40 hover:text-white/60 transition-colors">
          contact@smartpathavatar.online
        </a>
      </p>
    </div>
  );
}
