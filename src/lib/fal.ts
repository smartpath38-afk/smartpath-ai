// src/lib/fal.ts
import { createFalClient } from "@fal-ai/client";
import type { AvatarStyle } from "@/types";

export const fal = createFalClient({
  credentials: process.env.FAL_API_KEY!,
});

export const STYLE_PROMPTS: Record<AvatarStyle, string> = {
  cartoon_3d:
    "3D cartoon avatar, Pixar animation style, vibrant colors, smooth shading, expressive face, high quality render",
  anime:
    "anime portrait, Studio Ghibli aesthetic, soft pastel colors, clean linework, expressive eyes, detailed hair",
  oil_painting:
    "classical oil painting portrait, rich warm tones, visible brushstrokes, chiaroscuro lighting, museum quality",
  cyberpunk:
    "cyberpunk neon portrait, futuristic city background, neon lights, dark atmosphere, chrome augmentations, 4K",
  watercolor:
    "delicate watercolor portrait, soft washes of color, wet on wet technique, light and airy, artistic",
  realistic_portrait:
    "photorealistic portrait, professional studio lighting, sharp focus, 8K resolution, natural skin tones",
  sketch:
    "pencil sketch portrait, detailed graphite drawing, cross-hatching, artistic, black and white, fine art",
  fantasy:
    "fantasy portrait, epic lighting, magical atmosphere, ethereal glow, detailed fantasy costume, digital art",
};

export type FalImageResult = {
  images: Array<{ url: string; width: number; height: number }>;
};
