// src/app/api/render/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fal, STYLE_PROMPTS, type FalImageResult } from "@/lib/fal";
import type { AvatarStyle } from "@/types";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { renderId } = await request.json();
  if (!renderId) {
    return NextResponse.json({ error: "Missing renderId" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Fetch render row + verify ownership
  const { data: render, error: fetchError } = await admin
    .from("renders")
    .select("*")
    .eq("id", renderId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !render) {
    return NextResponse.json({ error: "Render not found" }, { status: 404 });
  }

  if (render.status !== "processing") {
    return NextResponse.json({ status: render.status, output_image_url: render.output_image_url });
  }

  try {
    // Get signed URL for input image
    const { data: signedData } = await admin.storage
      .from("inputs")
      .createSignedUrl(render.input_image_url, 900);

    if (!signedData?.signedUrl) {
      throw new Error("Could not get signed URL for input image");
    }

    // Call Fal.ai
    const style = render.style as AvatarStyle;
    if (!STYLE_PROMPTS[style]) {
      throw new Error(`Invalid avatar style: ${render.style}`);
    }
    const prompt = STYLE_PROMPTS[style];

    const result = await fal.subscribe("fal-ai/flux/dev", {
      input: {
        prompt: `Portrait photo of a person, ${prompt}`,
        image_url: signedData.signedUrl,
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        image_size: "square_hd",
      } as any,
    }) as { data: FalImageResult };

    const outputUrl = result.data.images[0]?.url;
    if (!outputUrl) throw new Error("No output image from Fal.ai");

    // Download output and upload to Supabase renders bucket
    const imageResponse = await fetch(outputUrl);
    const imageBlob = await imageResponse.blob();
    const outputPath = `${user.id}/${renderId}.jpg`;

    const { error: uploadError } = await admin.storage
      .from("renders")
      .upload(outputPath, imageBlob, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: publicData } = admin.storage
      .from("renders")
      .getPublicUrl(outputPath);

    // Update render row
    await admin
      .from("renders")
      .update({
        output_image_url: publicData.publicUrl,
        status: "completed",
      })
      .eq("id", renderId);

    return NextResponse.json({
      status: "completed",
      output_image_url: publicData.publicUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Render failed:", message, err);

    await admin
      .from("renders")
      .update({ status: "failed" })
      .eq("id", renderId);

    return NextResponse.json({ status: "failed", message }, { status: 500 });
  }
}
