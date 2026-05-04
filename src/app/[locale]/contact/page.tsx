import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ContactForm from "@/components/contact/ContactForm";

interface Props {
  params: Promise<{ locale: string }>;
}

export const metadata = {
  title: "Contact — SMARTPATH AI",
  description: "Get in touch with the SMARTPATH AI team for support, billing, or general inquiries.",
};

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="pt-32 pb-28 px-6">
        <div className="max-w-3xl mx-auto">

          <div className="mb-12">
            <p className="text-xs text-white/25 uppercase tracking-widest mb-3">Support</p>
            <h1 className="text-4xl font-semibold tracking-tight text-white mb-4">
              Contact Us
            </h1>
            <p className="text-white/40 leading-relaxed max-w-lg">
              Have a question, need help with your account, or want to discuss commercial
              licensing? We typically respond within 1–2 business days.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Sidebar info */}
            <div className="flex flex-col gap-6">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-1">
                <p className="text-white/25 text-[10px] font-semibold uppercase tracking-widest mb-3">
                  Support Email
                </p>
                <a
                  href="mailto:contact@smartpathavatar.online"
                  className="text-white/70 hover:text-white text-sm underline transition-colors"
                >
                  contact@smartpathavatar.online
                </a>
                <p className="text-white/25 text-xs pt-1">
                  For all inquiries — billing, technical, account, and privacy requests.
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-1">
                <p className="text-white/25 text-[10px] font-semibold uppercase tracking-widest mb-3">
                  Company
                </p>
                <p className="text-white/55 text-sm font-semibold">SMARTPATH AI LLC</p>
                <p className="text-white/30 text-xs leading-relaxed">
                  127 N Higgins Ave STE 307D #2673<br />
                  Missoula, MT 59802<br />
                  United States
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                <p className="text-white/25 text-[10px] font-semibold uppercase tracking-widest mb-3">
                  Response Time
                </p>
                <p className="text-white/50 text-sm">1–2 business days</p>
                <p className="text-white/25 text-xs pt-1">
                  Monday to Friday, excluding US public holidays.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-2">
              <ContactForm />
            </div>

          </div>

        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
