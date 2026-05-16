export type Locale = "en";

export type PlanName = "starter" | "pro" | "enterprise";
export type PlanDuration = "monthly";
export type SubscriptionStatus = "active" | "expired" | "cancelled";
export type RenderStatus = "processing" | "completed" | "failed";
export type Gateway = "stripe" | "dodo";

export type AvatarStyle =
  | "cartoon_3d"
  | "anime"
  | "oil_painting"
  | "cyberpunk"
  | "watercolor"
  | "realistic_portrait"
  | "sketch"
  | "fantasy";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_name: PlanName;
  plan_duration: PlanDuration;
  status: SubscriptionStatus;
  monthly_render_limit: number;
  expires_at: string | null;
  gateway: Gateway;
  gateway_payment_id: string;
  created_at: string;
}

export interface Render {
  id: string;
  user_id: string;
  style: AvatarStyle;
  input_image_url: string;
  output_image_url: string | null;
  status: RenderStatus;
  created_at: string;
}

export interface PricingPlan {
  id: PlanName;
  name: string;
  monthlyRenderLimit: number;
  monthlyPrice: number;
  popular?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyRenderLimit: 50,
    monthlyPrice: 19,
  },
  {
    id: "pro",
    name: "Pro",
    monthlyRenderLimit: 200,
    monthlyPrice: 49,
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyRenderLimit: 1000,
    monthlyPrice: 99,
  },
];

export const RENDER_LIMITS: Record<PlanName, number> = {
  starter: 50,
  pro: 200,
  enterprise: 1000,
};

export const STRIPE_PRICE_IDS: Record<PlanName, string> = {
  starter: process.env.STRIPE_PRICE_STARTER_MONTHLY ?? "",
  pro: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY ?? "",
};

export const STYLE_LABELS: Record<AvatarStyle, string> = {
  cartoon_3d: "Cartoon 3D",
  anime: "Anime",
  oil_painting: "Oil Painting",
  cyberpunk: "Cyberpunk",
  watercolor: "Watercolor",
  realistic_portrait: "Realistic Portrait",
  sketch: "Sketch",
  fantasy: "Fantasy",
};
