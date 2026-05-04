"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: undefined, // No email verification
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Auto sign-in after registration (no email verification)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push(`/${locale}/dashboard`);
    router.refresh();
  }

  async function handleGoogleSignup() {
    setGoogleLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/${locale}/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 border-r border-white/[0.06]">
        <Link href={`/${locale}`} className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-sm">S</span>
          </div>
          <span className="text-white font-semibold tracking-tight text-lg">
            SMARTPATH AI
          </span>
        </Link>

        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            {[
              { label: "150–3,000", desc: "AI renders per month" },
              { label: "8 Styles", desc: "From Anime to Oil Painting" },
              { label: "HD Quality", desc: "Full-resolution downloads" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="w-px h-8 bg-white/20 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold">{item.label}</p>
                  <p className="text-white/40 text-sm mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <p className="text-white/20 text-xs">
          &copy; {new Date().getFullYear()} SMARTPATH AI LLC
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden justify-center mb-8">
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center">
                <span className="text-black font-bold text-xs">S</span>
              </div>
              <span className="text-white font-semibold tracking-tight">SMARTPATH AI</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              {t("registerTitle")}
            </h1>
            <p className="text-white/50 mt-1.5 text-sm">{t("registerSubtitle")}</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-4 px-3.5 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 h-11 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            {t("googleBtn")}
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-white/30 text-xs">{t("orContinue")}</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          {/* Registration form */}
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">
                {t("fullName")}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
                className="w-full h-11 rounded-lg border border-white/10 bg-white/5 px-3.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/30 transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">
                {t("email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full h-11 rounded-lg border border-white/10 bg-white/5 px-3.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/30 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">
                {t("password")}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={8}
                className="w-full h-11 rounded-lg border border-white/10 bg-white/5 px-3.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/30 transition-colors"
                placeholder="Min. 8 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full h-11 rounded-lg bg-white hover:bg-white/90 text-black text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Creating account...</span>
                </div>
              ) : (
                t("registerBtn")
              )}
            </button>
          </form>

          <p className="text-center text-xs text-white/25 mt-4 leading-relaxed">
            By creating an account you agree to our{" "}
            <Link href={`/${locale}/legal/terms`} className="text-white/40 hover:text-white/60 transition-colors">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href={`/${locale}/legal/privacy`} className="text-white/40 hover:text-white/60 transition-colors">
              Privacy Policy
            </Link>
          </p>

          <p className="text-center text-sm text-white/40 mt-4">
            {t("hasAccount")}{" "}
            <Link
              href={`/${locale}/auth/login`}
              className="text-white hover:text-white/80 font-medium transition-colors"
            >
              {t("signIn")}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
