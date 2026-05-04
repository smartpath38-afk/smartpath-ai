export type Locale = "en";

export type PlanName = "essential" | "pro" | "business" | "infinity";
export type PlanDuration = "6m" | "1y" | "2y" | "lifetime";
export type SubscriptionStatus = "active" | "expired" | "cancelled";
export type RenderStatus = "processing" | "completed" | "failed";
export type Gateway = "paypal";

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
  prices: Record<PlanDuration, number>;
  popular?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "essential",
    name: "Starter",
    monthlyRenderLimit: 50,
    prices: { "6m": 19.99, "1y": 29.99, "2y": 49.99, lifetime: 79.99 },
  },
  {
    id: "pro",
    name: "Essential",
    monthlyRenderLimit: 150,
    prices: { "6m": 39.99, "1y": 59.99, "2y": 99.99, lifetime: 149.99 },
  },
  {
    id: "business",
    name: "Pro Studio",
    monthlyRenderLimit: 500,
    prices: { "6m": 59.99, "1y": 99.99, "2y": 169.99, lifetime: 249.99 },
    popular: true,
  },
  {
    id: "infinity",
    name: "Business",
    monthlyRenderLimit: 2000,
    prices: { "6m": 119.99, "1y": 199.99, "2y": 329.99, lifetime: 499.99 },
  },
];

export const RENDER_LIMITS: Record<PlanName, number> = {
  essential: 50,
  pro: 150,
  business: 500,
  infinity: 2000,
};

export const PLAN_DURATIONS_MONTHS: Record<PlanDuration, number | null> = {
  "6m": 6,
  "1y": 12,
  "2y": 24,
  lifetime: null,
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

export const CHECKOUT_DESCRIPTIONS: Record<string, string> = {
  "essential-6m": "SMARTPATH AI — Digital service license activation, 6 months.",
  "essential-1y": "SMARTPATH AI — Digital service license activation, 12 months.",
  "essential-2y": "SMARTPATH AI — Digital service license activation, 24 months.",
  "essential-lifetime": "SMARTPATH AI — Lifetime digital service license activation.",
  "pro-6m": "SMARTPATH AI — Digital service license activation, 6 months.",
  "pro-1y": "SMARTPATH AI — Digital service license activation, 12 months.",
  "pro-2y": "SMARTPATH AI — Digital service license activation, 24 months.",
  "pro-lifetime": "SMARTPATH AI — Lifetime digital service license activation.",
  "business-6m": "SMARTPATH AI — Digital service license activation, 6 months.",
  "business-1y": "SMARTPATH AI — Digital service license activation, 12 months.",
  "business-2y": "SMARTPATH AI — Digital service license activation, 24 months.",
  "business-lifetime": "SMARTPATH AI — Lifetime digital service license activation.",
  "infinity-6m": "SMARTPATH AI — Digital service license activation, 6 months.",
  "infinity-1y": "SMARTPATH AI — Digital service license activation, 12 months.",
  "infinity-2y": "SMARTPATH AI — Digital service license activation, 24 months.",
  "infinity-lifetime": "SMARTPATH AI — Lifetime digital service license activation.",
};
