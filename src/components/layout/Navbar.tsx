"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const t = useTranslations("nav");
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setMobileOpen(false);
    router.push(`/${locale}`);
    router.refresh();
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || mobileOpen
          ? "bg-black/95 backdrop-blur-md border-b border-white/[0.06]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2.5 group"
          onClick={() => setMobileOpen(false)}
        >
          <span className="text-white font-bold tracking-tight text-lg">
            SMARTPATH<span className="text-white/40 font-light"> AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            href={`/${locale}/pricing`}
            className="px-3.5 py-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            {t("pricing")}
          </Link>

          <div className="w-px h-4 bg-white/10 mx-1" />

          {user ? (
            <>
              <Link
                href={`/${locale}/dashboard`}
                className="px-3.5 py-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                {t("dashboard")}
              </Link>
              <button
                onClick={handleLogout}
                className="ml-1 px-4 py-2 text-sm rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors"
              >
                {t("logout")}
              </button>
            </>
          ) : (
            <>
              <Link
                href={`/${locale}/auth/login`}
                className="px-3.5 py-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                {t("login")}
              </Link>
              <Link
                href={`/${locale}/pricing`}
                className="ml-1 px-4 py-2 text-sm rounded-lg bg-white text-black font-medium hover:bg-white/90 transition-colors"
              >
                {t("getStarted")}
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger button */}
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="md:hidden p-2.5 text-white/60 hover:text-white transition-colors"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-black/95 border-b border-white/[0.06] px-6 pb-6">
          <div className="space-y-0.5 pt-2">
            <Link
              href={`/${locale}/pricing`}
              onClick={() => setMobileOpen(false)}
              className="flex items-center py-3.5 text-sm text-white/60 hover:text-white border-b border-white/[0.06] transition-colors"
            >
              {t("pricing")}
            </Link>

            {user ? (
              <>
                <Link
                  href={`/${locale}/dashboard`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center py-3.5 text-sm text-white/70 hover:text-white border-b border-white/[0.06] transition-colors"
                >
                  {t("dashboard")}
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center py-3.5 text-sm text-white/60 hover:text-white transition-colors"
                >
                  {t("logout")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href={`/${locale}/auth/login`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center py-3.5 text-sm text-white/70 hover:text-white border-b border-white/[0.06] transition-colors"
                >
                  {t("login")}
                </Link>
                <div className="pt-3">
                  <Link
                    href={`/${locale}/pricing`}
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center py-3.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
                  >
                    {t("getStarted")}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
