import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function RefundPage({ params }: Props) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="pt-32 pb-28 px-6">
        <div className="max-w-3xl mx-auto">

          <div className="mb-12">
            <p className="text-xs text-white/25 uppercase tracking-widest mb-3">Legal</p>
            <h1 className="text-4xl font-semibold tracking-tight text-white mb-4">
              Refund Policy
            </h1>
            <p className="text-white/30 text-sm">Last updated: May 1, 2026</p>
          </div>

          {/* Important notice banner */}
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-5 mb-10">
            <div className="flex items-start gap-3">
              <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-amber-300/80 text-sm leading-relaxed">
                <strong className="text-amber-300">Important:</strong> Due to the computational nature of AI image processing, our refund policy is strictly limited. Please read this policy carefully before completing your purchase.
              </p>
            </div>
          </div>

          <div className="space-y-8">

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">1. General Policy — No Refunds After Processing</h2>
              <p className="text-white/55 leading-relaxed">
                SMARTPATH AI LLC operates an AI-powered image transformation service. Each avatar generation request consumes real computational resources, including GPU processing time and third-party AI inference costs, that are incurred immediately and irreversibly upon request. For this reason, and in accordance with standard digital services practices:
              </p>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                <p className="text-white/80 font-semibold text-sm mb-2">
                  All purchases are final once the license is activated or any AI rendering has been initiated.
                </p>
                <p className="text-white/50 text-sm leading-relaxed">
                  This includes cases where the user is dissatisfied with the aesthetic quality of AI-generated outputs, as output variation is an inherent and disclosed characteristic of generative AI technology. No refunds will be issued for change of mind, partial use of the monthly quota, or style preferences.
                </p>
              </div>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">2. The Only Eligible Refund Condition</h2>
              <p className="text-white/55 leading-relaxed">
                A refund may be granted <strong className="text-white/80">exclusively</strong> under the following single condition:
              </p>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-white/60 text-xs font-bold mt-0.5">✓</span>
                  <div>
                    <p className="text-white/80 text-sm font-semibold mb-1">
                      Verified technical failure before any AI processing was initiated
                    </p>
                    <p className="text-white/45 text-sm leading-relaxed">
                      A critical technical malfunction attributable solely to SMARTPATH AI LLC&apos;s infrastructure that completely prevented the Service from functioning, and where no AI rendering request was submitted or processed.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-white/55 leading-relaxed">
                The following situations do <strong className="text-white/80">NOT</strong> qualify for a refund under any circumstances:
              </p>
              <ul className="space-y-2">
                {[
                  "Dissatisfaction with the artistic style, likeness, or quality of AI-generated outputs",
                  "Having consumed any portion of your monthly render quota",
                  "Accidental purchase or incorrect plan selection after license activation",
                  "Change of mind or no longer needing the Service",
                  "Third-party payment provider fees or currency conversion losses",
                  "Account suspension or termination resulting from a violation of our Terms of Service",
                  "Service unavailability due to scheduled maintenance or force majeure events",
                  "Issues with your own device, browser, or internet connection",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-white/50 text-sm">
                    <span className="text-red-400/60 mt-0.5 flex-shrink-0">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">3. How to Submit a Refund Request</h2>
              <p className="text-white/55 leading-relaxed">
                If you believe you meet the sole eligible condition described in Section 2, you must submit a refund request within <strong className="text-white/80">48 hours</strong> of your purchase date. Requests submitted after this window will not be considered.
              </p>
              <p className="text-white/55 leading-relaxed">Your request must be sent by email to{" "}
                <a href="mailto:contact@smartpathavatar.online" className="text-white/70 hover:text-white underline transition-colors">
                  contact@smartpathavatar.online
                </a>{" "}
                and must include all of the following:
              </p>
              <ul className="space-y-2">
                {[
                  "Your full name and registered email address",
                  "Your payment transaction reference or order ID",
                  "Date and time of purchase",
                  "A detailed description of the technical failure encountered",
                  "Screenshots, screen recordings, or error logs evidencing the failure",
                  "Confirmation that no AI rendering was initiated or processed",
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
              <h2 className="text-lg font-semibold text-white">4. Review Process &amp; Timeline</h2>
              <p className="text-white/55 leading-relaxed">
                Upon receiving a refund request, SMARTPATH AI LLC will:
              </p>
              <ol className="space-y-2 list-none">
                {[
                  "Acknowledge receipt of your request within 2 business days",
                  "Investigate the reported technical failure against our server logs and infrastructure records",
                  "Verify that no AI processing was performed on your account",
                  "Communicate our decision within 5 business days of acknowledgment",
                ].map((item, i) => (
                  <li key={item} className="flex items-start gap-3 text-white/55 text-sm">
                    <span className="text-white/30 font-medium mt-0.5 flex-shrink-0 min-w-[16px]">{i + 1}.</span>
                    {item}
                  </li>
                ))}
              </ol>
              <p className="text-white/55 leading-relaxed">
                SMARTPATH AI LLC reserves the right to approve or deny any refund request at its sole and absolute discretion. Approval of a refund in one case does not create an obligation or precedent to approve future requests.
              </p>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">5. Refund Method</h2>
              <p className="text-white/55 leading-relaxed">
                Approved refunds will be processed back to the original payment method used at the time of purchase. Processing times vary by payment provider but typically take between 5 and 10 business days to appear. SMARTPATH AI LLC is not responsible for any delays imposed by the payment provider or financial institution.
              </p>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">6. Chargebacks &amp; Payment Disputes</h2>
              <p className="text-white/55 leading-relaxed">
                We strongly encourage users to contact us directly at{" "}
                <a href="mailto:contact@smartpathavatar.online" className="text-white/70 hover:text-white underline transition-colors">
                  contact@smartpathavatar.online
                </a>{" "}
                before initiating any payment dispute or chargeback with their bank or payment provider. Filing a chargeback without first contacting us is a violation of these Terms.
              </p>
              <p className="text-white/55 leading-relaxed">
                In the event of a chargeback or dispute initiated outside of our refund process, SMARTPATH AI LLC reserves the right to immediately suspend the associated account, reverse any remaining license access, and provide our payment providers and the relevant financial institution with full transaction records, usage logs, and evidence of service delivery, as necessary to contest the dispute.
              </p>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">7. Governing Law</h2>
              <p className="text-white/55 leading-relaxed">
                This Refund Policy is governed by the laws of the <strong className="text-white/80">State of Montana, United States</strong> and forms an integral part of our{" "}
                <Link href={`/${locale}/legal/terms`} className="text-white/70 hover:text-white underline transition-colors">
                  Terms of Service
                </Link>.
              </p>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">8. Contact</h2>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-white/55 text-sm leading-relaxed space-y-0.5">
                <p className="text-white/80 font-semibold">SMARTPATH AI LLC</p>
                <p>1001 S. Main St. Ste 600</p>
                <p>Kalispell, MT 59901</p>
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
            <Link href={`/${locale}/legal/privacy`} className="hover:text-white/50 transition-colors">
              Privacy Policy →
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
