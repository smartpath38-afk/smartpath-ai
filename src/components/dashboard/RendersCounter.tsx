// src/components/dashboard/RendersCounter.tsx
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function RendersCounter() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = createAdminClient();

  // Get active subscription
  const { data: sub } = await admin
    .rpc("get_active_subscription", { p_user_id: user.id })
    .single();

  // Count this month's renders
  const { data: countData } = await admin
    .rpc("count_monthly_renders", { p_user_id: user.id })
    .single();

  const used = (countData as number) ?? 0;
  const limit = sub ? (sub as { monthly_render_limit: number }).monthly_render_limit : 0;
  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;

  const barColor =
    percentage >= 90
      ? "bg-red-500"
      : percentage >= 70
      ? "bg-orange-500"
      : "bg-emerald-500";

  if (!sub) {
    return (
      <div className="px-5 py-3 border-b border-white/[0.06]">
        <p className="text-xs text-white/30">No active plan</p>
      </div>
    );
  }

  return (
    <div className="px-5 py-3 border-b border-white/[0.06]">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-white/40">Renders this month</span>
        <span className="text-xs text-white/60 font-medium tabular-nums">
          {used} / {limit}
        </span>
      </div>
      <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
