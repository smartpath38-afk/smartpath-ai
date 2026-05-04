// src/components/dashboard/DashboardHeader.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { key: "generate", label: "Generate", href: (l: string) => `/${l}/dashboard` },
  { key: "gallery", label: "Gallery", href: (l: string) => `/${l}/dashboard/gallery` },
  { key: "billing", label: "Billing", href: (l: string) => `/${l}/dashboard/billing` },
];

export default function DashboardHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push(`/${locale}`);
    router.refresh();
  }

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-[#050505] border-b border-white/[0.06] px-4 h-14 flex items-center justify-between">
      <Link href={`/${locale}`} className="flex items-center gap-2">
        <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
          <span className="text-black font-bold text-[10px]">S</span>
        </div>
        <span className="text-white font-semibold text-sm tracking-tight">SMARTPATH AI</span>
      </Link>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger aria-label="Open navigation menu" className="p-2 text-white/60 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </SheetTrigger>
        <SheetContent side="right" className="bg-[#050505] border-white/[0.06] w-64 p-0">
          <div className="p-5 border-b border-white/[0.06]">
            <span className="text-white font-semibold text-sm">Menu</span>
          </div>
          <nav className="p-3 space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const href = item.href(locale);
              const isActive =
                item.key === "generate" ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={item.key}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-white bg-white/[0.08]"
                      : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/[0.06]">
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-colors text-left"
            >
              Sign out
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
