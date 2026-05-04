// src/app/api/render/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: render, error } = await admin
    .from("renders")
    .select("id, status, output_image_url, style, created_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !render) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: render.status,
    output_image_url: render.output_image_url,
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: render } = await admin
    .from("renders")
    .select("input_image_url, output_image_url, user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!render) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await admin.storage.from("inputs").remove([render.input_image_url]);
  await admin.storage.from("renders").remove([`${user.id}/${id}.jpg`]);
  await admin.from("renders").delete().eq("id", id).eq("user_id", user.id);

  return NextResponse.json({ success: true });
}
