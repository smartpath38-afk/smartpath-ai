import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface Props {
  params: Promise<{ locale: string }>;
}

export const metadata = {
  title: "About — SMARTPATH AI",
  description:
    "SMARTPATH AI LLC is a Montana-based technology company specializing in AI-driven digital identity and avatar solutions.",
};

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="pt-32 pb-28 px-6">
        <div className="max-w-3xl mx-auto">

          <div className="mb-12">
            <p className="text-xs text-white/25 uppercase tracking-widest mb-3">Company</p>
            <h1 className="text-4xl font-semibold tracking-tight text-white mb-4">
              About SMARTPATH AI
            </h1>
            <p className="text-white/30 text-sm">
              Montana-based AI technology company
            </p>
          </div>

          <div className="space-y-8">

            <section className="space-y-3">
              <p className="text-white/55 leading-relaxed">
                <strong className="text-white/80">SMARTPATH AI LLC</strong> is a
                technology company registered in the State of Montana, United States,
                and headquartered at 127 N Higgins Ave STE 307D #2673, Missoula, MT 59802.
                We specialize in AI-driven digital identity and avatar solutions —
                enabling creators, professionals, and brands to transform their photos
                into professional-grade AI-generated portraits in seconds.
              </p>
              <p className="text-white/55 leading-relaxed">
                Our platform combines cutting-edge generative AI models with a
                streamlined, privacy-first user experience. We believe powerful tools
                should be simple, transparent, and built for real people — not locked
                behind complexity or complicated workflows.
              </p>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">Our Mission</h2>
              <p className="text-white/55 leading-relaxed">
                We believe that high-quality digital identity should be accessible to
                everyone. SMARTPATH AI exists to make professional avatar generation
                fast, affordable, and private — without hidden fees or compromises on
                output quality. Subscribe annually, generate at scale, and cancel
                anytime. Full access from the moment you subscribe.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">Our Founder</h2>
              <p className="text-white/55 leading-relaxed">
                SMARTPATH AI LLC was founded by{" "}
                <strong className="text-white/80">Fouad Hamdoune</strong>, an entrepreneur
                and technologist focused on making professional-grade AI tools accessible
                to creators, businesses, and independent professionals worldwide. Based in
                Missoula, Montana, Fouad built SMARTPATH AI to bridge the gap between
                enterprise-level AI capabilities and everyday users.
              </p>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-white">What We Build</h2>
              <p className="text-white/55 leading-relaxed">
                Our flagship product is a SaaS platform offering AI avatar generation
                across 8 unique artistic styles — from hyper-realistic portraits to
                anime, oil painting, cyberpunk, watercolor, sketch, and fantasy.
                Users subscribe to a plan, upload a clear portrait photograph,
                and receive studio-quality outputs within seconds.
              </p>
              <div className="space-y-3">
                {[
                  {
                    title: "8 Unique Styles",
                    desc: "Cartoon 3D, Anime, Oil Painting, Cyberpunk, Watercolor, Realistic Portrait, Sketch, and Fantasy — all crafted for professional output.",
                  },
                  {
                    title: "Privacy-First Design",
                    desc: "Uploaded images are processed securely under SMARTPATH AI LLC, never shared with third parties, and never used for AI model training.",
                  },
                  {
                    title: "Annual Subscription Model",
                    desc: "Flexible annual plans starting at $59.99/year. Generate avatars throughout your subscription period with full access from day one.",
                  },
                  {
                    title: "Built for Every Scale",
                    desc: "From individual creators to enterprise teams, our plans support 150 to 3,000 total avatar generations.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                  >
                    <p className="text-white/80 text-sm font-semibold mb-1">{item.title}</p>
                    <p className="text-white/45 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">Our Values</h2>
              <ul className="space-y-2">
                {[
                  "Transparency — clear pricing, no hidden fees, no surprise charges",
                  "Privacy — your data and images stay yours, always",
                  "Quality — professional-grade output that holds up in real use",
                  "Simplicity — three steps from upload to download, under one minute",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-white/55 text-sm">
                    <span className="text-white/20 mt-0.5 flex-shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">Company Details</h2>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-white/55 text-sm leading-relaxed space-y-0.5">
                <p className="text-white/80 font-semibold">SMARTPATH AI LLC</p>
                <p>127 N Higgins Ave STE 307D #2673</p>
                <p>Missoula, MT 59802</p>
                <p>United States</p>
                <p className="pt-2">
                  <a
                    href="mailto:contact@smartpathavatar.online"
                    className="text-white/70 hover:text-white underline transition-colors"
                  >
                    contact@smartpathavatar.online
                  </a>
                </p>
                <p>smartpathavatar.online</p>
              </div>
            </section>

          </div>

          <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-wrap gap-4 text-sm text-white/25">
            <Link
              href={`/${locale}/contact`}
              className="hover:text-white/50 transition-colors"
            >
              Contact Us →
            </Link>
            <Link
              href={`/${locale}/pricing`}
              className="hover:text-white/50 transition-colors"
            >
              View Pricing →
            </Link>
          </div>

        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
