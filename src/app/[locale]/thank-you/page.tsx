// src/app/[locale]/thank-you/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ gateway?: string }>;
}

export default async function ThankYouPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { gateway } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  const gatewayLabel: Record<string, string> = {
    paypal: "PayPal",
  };

  const gwLabel = gateway ? (gatewayLabel[gateway] ?? gateway) : null;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="pt-24 sm:pt-32 pb-16 sm:pb-28 px-4 sm:px-6">
        <div className="max-w-lg mx-auto text-center">

          {/* Success icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <svg
                  className="w-9 h-9 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              {/* Glow */}
              <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-xl" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
            Thank You for Your Purchase
          </h1>

          <p className="text-white/50 text-base leading-relaxed mb-2">
            Your payment was successfully processed
            {gwLabel ? ` via ${gwLabel}` : ""}.
          </p>
          <p className="text-white/40 text-sm mb-10">
            Your license is now active. A confirmation email has been sent to your address.
          </p>

          {/* Note about activation */}
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 mb-10 text-left">
            <p className="text-white/30 text-xs leading-relaxed">
              <span className="text-white/50 font-medium">Note:</span> If your dashboard doesn&apos;t reflect the new plan immediately, please wait a few seconds and refresh. Payment webhooks are processed in real-time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/${locale}/dashboard`}
              className="px-8 py-3.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors"
            >
              Go to Dashboard
            </Link>
            <Link
              href={`/${locale}/dashboard/billing`}
              className="px-8 py-3.5 rounded-xl border border-white/10 text-white/70 font-medium text-sm hover:border-white/20 hover:text-white transition-colors"
            >
              View Billing
            </Link>
          </div>

          <p className="mt-12 text-xs text-white/20">
            Questions?{" "}
            <a
              href="mailto:contact@smartpathavatar.online"
              className="text-white/35 hover:text-white/50 transition-colors"
            >
              contact@smartpathavatar.online
            </a>
          </p>
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
