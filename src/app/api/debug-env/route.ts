import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "(not set)",
    VERCEL_URL: process.env.VERCEL_URL ?? "(not set)",
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY
      ? `${process.env.STRIPE_SECRET_KEY.slice(0, 12)}...` : "(not set)",
    STRIPE_PRICE_PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "(not set)",
    STRIPE_PRICE_STARTER_MONTHLY: process.env.STRIPE_PRICE_STARTER_MONTHLY ?? "(not set)",
    STRIPE_PRICE_ENTERPRISE_MONTHLY: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY ?? "(not set)",
    computed_APP_URL: (
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
    ).replace(/\/+$/, ""),
  });
}
