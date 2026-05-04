import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="pt-32 pb-28 px-6">
        <div className="max-w-3xl mx-auto">

          <div className="mb-12">
            <p className="text-xs text-white/25 uppercase tracking-widest mb-3">Legal</p>
            <h1 className="text-4xl font-semibold tracking-tight text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-white/30 text-sm">Last updated: May 1, 2026</p>
          </div>

          <div className="space-y-8">

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">1. Introduction</h2>
              <p className="text-white/55 leading-relaxed">
                <strong className="text-white/80">SMARTPATH AI LLC</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), a limited liability company registered in the State of Montana, United States, is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use the SMARTPATH AI service at smartpathavatar.online (&quot;the Service&quot;). By using the Service, you acknowledge that you have read and understood this Policy.
              </p>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">2. Data Controller</h2>
              <p className="text-white/55 leading-relaxed">
                The data controller responsible for your personal information is:
              </p>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-white/55 text-sm leading-relaxed space-y-0.5">
                <p className="text-white/80 font-semibold">SMARTPATH AI LLC</p>
                <p>127 N Higgins Ave STE 307D #2673</p>
                <p>Missoula, MT 59802</p>
                <p>United States</p>
                <p className="pt-2">
                  <a href="mailto:contact@smartpathavatar.online" className="text-white/70 hover:text-white underline transition-colors">
                    contact@smartpathavatar.online
                  </a>
                </p>
              </div>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">3. Data We Collect</h2>
              <p className="text-white/55 leading-relaxed">
                We collect only the data strictly necessary to operate the Service:
              </p>
              <div className="space-y-3">
                {[
                  {
                    title: "Account data",
                    desc: "Email address, full name, and profile picture (if signed in with Google OAuth). Required to create and manage your account.",
                  },
                  {
                    title: "Payment data",
                    desc: "Transaction reference IDs and purchased plan details. SMARTPATH AI LLC does not store, process, or have access to credit card numbers, bank account information, or any raw payment instrument data. All payment processing is handled exclusively by our authorized third-party payment providers.",
                  },
                  {
                    title: "Uploaded images",
                    desc: "Portrait photographs you submit for avatar generation. These are processed securely under SMARTPATH AI LLC using private encrypted cloud storage and are used solely to generate your requested output. Input images are not shared with third parties and are not used for AI model training.",
                  },
                  {
                    title: "Generated outputs",
                    desc: "AI-generated avatar images associated with your account, stored in your personal gallery.",
                  },
                  {
                    title: "Usage data",
                    desc: "Number of renders performed, render timestamps, and subscription status. Used for quota enforcement, billing verification, and account management.",
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <p className="text-white/80 text-sm font-semibold mb-1">{item.title}</p>
                    <p className="text-white/45 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">4. How We Use Your Data</h2>
              <ul className="space-y-2">
                {[
                  "To provide and operate the Service (process AI avatar requests, enforce quotas)",
                  "To manage your account and authenticate your identity",
                  "To process and confirm purchases and deliver license access",
                  "To send transactional emails (purchase confirmations, account notices)",
                  "To detect, prevent, and investigate fraud, abuse, or unauthorized access",
                  "To comply with applicable legal and regulatory obligations",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-white/55 text-sm">
                    <span className="text-white/20 mt-0.5 flex-shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-white/55 leading-relaxed">
                We do not sell, rent, trade, or otherwise share your personal data with third parties for advertising, marketing, or any commercial purpose unrelated to the Service.
              </p>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">5. Third-Party Service Providers</h2>
              <p className="text-white/55 leading-relaxed">
                We engage the following sub-processors to operate the Service. Each provider operates under its own privacy policy and applicable data processing agreements:
              </p>
              <div className="space-y-3">
                {[
                  { name: "Supabase", purpose: "Database, user authentication, and encrypted file storage" },
                  { name: "Fal.ai", purpose: "AI image generation inference infrastructure" },
                  { name: "PayPal / Authorized Processors", purpose: "Secure payment processing (no card data reaches SMARTPATH AI LLC)" },
                  { name: "Resend", purpose: "Transactional and account notification email delivery" },
                ].map((item) => (
                  <div key={item.name} className="flex items-start gap-4 text-sm rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <span className="text-white/70 font-semibold min-w-[180px] flex-shrink-0">{item.name}</span>
                    <span className="text-white/40 leading-relaxed">{item.purpose}</span>
                  </div>
                ))}
              </div>
              <p className="text-white/55 leading-relaxed">
                We only share the minimum data necessary for each provider to fulfill their designated function.
              </p>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">6. Data Retention</h2>
              <p className="text-white/55 leading-relaxed">
                We retain your account data and generated avatar outputs for as long as your account remains active. Input images (uploaded portraits) are stored for a maximum of 30 days following upload, after which they are automatically and permanently deleted from our storage systems. Subscription and transaction records are retained for 7 years for accounting and legal compliance purposes.
              </p>
              <p className="text-white/55 leading-relaxed">
                Upon account deletion, all personal data and associated files are permanently purged within 30 days, except where retention is required by applicable law.
              </p>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">7. Your Rights</h2>
              <p className="text-white/55 leading-relaxed">
                Subject to applicable law, you have the following rights regarding your personal data:
              </p>
              <ul className="space-y-2">
                {[
                  "Right of access — request a copy of the personal data we hold about you",
                  "Right to rectification — request correction of inaccurate or incomplete data",
                  "Right to erasure — request deletion of your personal data",
                  "Right to data portability — receive your data in a structured, machine-readable format",
                  "Right to object — object to processing based on legitimate interests",
                  "Right to withdraw consent — where processing is based on your consent",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-white/55 text-sm">
                    <span className="text-white/20 mt-0.5 flex-shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-white/55 leading-relaxed">
                To exercise any of these rights, contact us at{" "}
                <a href="mailto:contact@smartpathavatar.online" className="text-white/70 hover:text-white underline transition-colors">
                  contact@smartpathavatar.online
                </a>. We will respond within 30 days of receiving your request.
              </p>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">8. Security</h2>
              <p className="text-white/55 leading-relaxed">
                SMARTPATH AI LLC implements industry-standard security measures to protect your data, including TLS/HTTPS encryption for all data in transit, row-level security (RLS) on all database tables, and private encrypted cloud storage for uploaded images that is inaccessible to other users. Despite these measures, no system can guarantee absolute security. We encourage you to use a strong, unique password and to notify us immediately of any suspected unauthorized access to your account.
              </p>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">9. Cookies</h2>
              <p className="text-white/55 leading-relaxed">
                We use only strictly necessary session cookies for authentication purposes, managed by our authentication provider (Supabase). We do not use tracking, advertising, analytics, or third-party marketing cookies. No cookie consent banner is required as we do not deploy non-essential cookies.
              </p>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">10. International Data Transfers</h2>
              <p className="text-white/55 leading-relaxed">
                Your data may be processed in data centers located in the United States and/or the European Union by our service providers. We ensure that appropriate contractual and technical safeguards are in place for any international transfers of personal data, in accordance with applicable privacy laws.
              </p>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">11. Children&apos;s Privacy</h2>
              <p className="text-white/55 leading-relaxed">
                The Service is not directed to individuals under the age of 16. We do not knowingly collect personal data from children. If you believe a minor has provided us with personal data, please contact us immediately and we will take steps to delete such information.
              </p>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">12. Changes to This Policy</h2>
              <p className="text-white/55 leading-relaxed">
                We may update this Privacy Policy periodically to reflect changes in our practices or applicable law. When we make material changes, we will notify you by email or via a notice on the platform. The &quot;Last updated&quot; date at the top of this page reflects the most recent revision.
              </p>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">13. Contact</h2>
              <p className="text-white/55 leading-relaxed">
                For any privacy-related inquiries or to exercise your rights, contact the data controller:
              </p>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-white/55 text-sm leading-relaxed space-y-0.5">
                <p className="text-white/80 font-semibold">SMARTPATH AI LLC</p>
                <p>127 N Higgins Ave STE 307D #2673</p>
                <p>Missoula, MT 59802</p>
                <p>United States</p>
                <p className="pt-2">
                  <a href="mailto:contact@smartpathavatar.online" className="text-white/70 hover:text-white underline transition-colors">
                    contact@smartpathavatar.online
                  </a>
                </p>
                <p>smartpathavatar.online</p>
              </div>
            </section>

          </div>

          <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-wrap gap-4 text-sm text-white/25">
            <Link href={`/${locale}/legal/terms`} className="hover:text-white/50 transition-colors">
              Terms of Service →
            </Link>
            <Link href={`/${locale}/legal/refund`} className="hover:text-white/50 transition-colors">
              Refund Policy →
            </Link>
            <Link href={`/${locale}/pricing`} className="hover:text-white/50 transition-colors">
              Back to Pricing
            </Link>
          </div>

        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
