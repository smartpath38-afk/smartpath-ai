// src/app/[locale]/dashboard/gallery/page.tsx
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import RenderGrid from "@/components/dashboard/RenderGrid";
import type { Render } from "@/types";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function GalleryPage({ params }: Props) {
  const { locale } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = createAdminClient();
  const { data: renders } = await admin
    .from("renders")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Gallery</h1>
        <p className="text-white/40 text-sm mt-1">
          {renders?.length ?? 0} avatar{(renders?.length ?? 0) !== 1 ? "s" : ""} generated
        </p>
      </div>
      <RenderGrid initialRenders={(renders as Render[]) ?? []} locale={locale} />
    </div>
  );
}
