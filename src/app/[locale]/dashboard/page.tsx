// src/app/[locale]/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import GeneratePanel from "@/components/dashboard/GeneratePanel";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function DashboardPage({ params }: Props) {
  await params; // locale not needed here directly

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null; // proxy.ts handles redirect

  const admin = createAdminClient();

  const { data: sub } = await admin
    .rpc("get_active_subscription", { p_user_id: user.id })
    .single();

  const { data: countData } = await admin
    .rpc("count_monthly_renders", { p_user_id: user.id })
    .single();

  const hasActivePlan = !!sub;
  const rendersUsed = (countData as number) ?? 0;
  const rendersLimit = sub
    ? (sub as { monthly_render_limit: number }).monthly_render_limit
    : 0;

  return (
    <GeneratePanel
      hasActivePlan={hasActivePlan}
      rendersUsed={rendersUsed}
      rendersLimit={rendersLimit}
    />
  );
}
