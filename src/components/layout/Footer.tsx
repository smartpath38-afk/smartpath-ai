import Link from "next/link";

interface FooterProps {
  locale: string;
}

export default function Footer({ locale }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.05] bg-black">
      <div className="max-w-6xl mx-auto px-6 py-10 sm:py-12">

        {/* Top row — brand + links */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">

          {/* Brand block */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-white/80 font-bold tracking-tight text-sm">
                SMARTPATH<span className="text-white/30 font-light"> AI</span>
              </span>
            </div>
            <p className="text-white/25 text-xs leading-relaxed max-w-[260px]">
              SMARTPATH AI LLC<br />
              1001 S. Main St. Ste 600<br />
              Kalispell, MT 59901 — United States
            </p>
            <a
              href="mailto:contact@smartpathavatar.online"
              className="text-white/25 hover:text-white/50 text-xs transition-colors w-fit"
            >
              contact@smartpathavatar.online
            </a>
          </div>

          {/* Links block */}
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 text-sm">

            <div className="flex flex-col gap-2.5">
              <p className="text-white/20 text-[10px] font-semibold tracking-widest uppercase mb-0.5">
                Company
              </p>
              <Link
                href={`/${locale}/about`}
                className="text-white/40 hover:text-white/70 transition-colors"
              >
                About
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="text-white/40 hover:text-white/70 transition-colors"
              >
                Contact
              </Link>
            </div>

            <div className="flex flex-col gap-2.5">
              <p className="text-white/20 text-[10px] font-semibold tracking-widest uppercase mb-0.5">
                Product
              </p>
              <Link
                href={`/${locale}/pricing`}
                className="text-white/40 hover:text-white/70 transition-colors"
              >
                Pricing
              </Link>
              <Link
                href={`/${locale}#styles`}
                className="text-white/40 hover:text-white/70 transition-colors"
              >
                Styles
              </Link>
              <Link
                href={`/${locale}#examples`}
                className="text-white/40 hover:text-white/70 transition-colors"
              >
                Examples
              </Link>
            </div>

            <div className="flex flex-col gap-2.5">
              <p className="text-white/20 text-[10px] font-semibold tracking-widest uppercase mb-0.5">
                Legal
              </p>
              <Link
                href={`/${locale}/legal/terms`}
                className="text-white/40 hover:text-white/70 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href={`/${locale}/legal/privacy`}
                className="text-white/40 hover:text-white/70 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href={`/${locale}/legal/refund`}
                className="text-white/40 hover:text-white/70 transition-colors"
              >
                Refund Policy
              </Link>
            </div>

          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/[0.05] my-8" />

        {/* Bottom row — copyright */}
        <div className="flex items-center justify-center text-xs text-white/20">
          <p>&copy; {year} SMARTPATH AI LLC. Kalispell, MT, United States. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}
