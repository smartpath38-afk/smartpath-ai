import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="pt-32 pb-28 px-6">
        <div className="max-w-3xl mx-auto">

          <div className="mb-12">
            <p className="text-xs text-white/25 uppercase tracking-widest mb-3">Legal</p>
            <h1 className="text-4xl font-semibold tracking-tight text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-white/30 text-sm">Last updated: May 1, 2026</p>
          </div>

          <div className="space-y-8">

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">1. Agreement to Terms</h2>
              <p className="text-white/55 leading-relaxed">
                These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;User&quot;, &quot;you&quot;) and <strong className="text-white/80">SMARTPATH AI LLC</strong>, a limited liability company registered in the State of Montana, United States (&quot;SMARTPATH AI&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). By accessing or using the SMARTPATH AI service available at smartpathavatar.online (&quot;the Service&quot;), you agree to be bound by these Terms. If you do not agree, you must not use the Service.
              </p>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">2. Description of Service</h2>
              <p className="text-white/55 leading-relaxed">
                SMARTPATH AI provides an AI-powered image transformation platform that converts portrait photographs into stylized avatar images across 8 distinct artistic styles. The Service is offered on an annual subscription basis granting access for the selected period (6 months, 1 year, 2 years, or lifetime) as chosen at the time of purchase.
              </p>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">3. License &amp; Access</h2>
              <p className="text-white/55 leading-relaxed">
                Upon completing a purchase, SMARTPATH AI LLC grants you a non-exclusive, non-transferable, revocable license to access and use the Service for the duration specified in your plan. Lifetime plans grant access for as long as the Service is commercially operated by SMARTPATH AI LLC.
              </p>
              <p className="text-white/55 leading-relaxed">
                Each plan includes a monthly render quota as specified at the time of purchase. Unused renders do not carry over to the following month. Your license is personal and may not be shared, sublicensed, resold, or transferred to any other person or entity.
              </p>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">4. Payments &amp; Refunds</h2>
              <p className="text-white/55 leading-relaxed">
                All purchases are charged as a single upfront payment for the selected subscription period, denominated in USD. Payments are processed exclusively by our third-party payment providers (PayPal and other authorized processors). SMARTPATH AI LLC does not store, access, or process your payment card data directly.
              </p>
              <p className="text-white/55 leading-relaxed">
                <strong className="text-white/80">Refund Policy:</strong> Due to the nature of AI processing, which consumes computational resources upon each request, all purchases are final once the license is activated or any renders have been consumed. Refunds are not issued for change of mind, partial use, or dissatisfaction with AI output quality, as these are inherent characteristics of generative AI services.
              </p>
              <p className="text-white/55 leading-relaxed">
                A full refund may be issued <strong className="text-white/80">only</strong> in the event of a verified technical failure that completely prevented the Service from functioning at the time of purchase, provided that no AI processing was initiated. Refund requests on this basis must be submitted to{" "}
                <a href="mailto:contact@smartpathavatar.online" className="text-white/70 hover:text-white underline transition-colors">
                  contact@smartpathavatar.online
                </a>{" "}
                within <strong className="text-white/80">48 hours</strong> of purchase with supporting evidence of the failure. SMARTPATH AI LLC reserves the right to investigate and determine eligibility at its sole discretion. For full details, see our{" "}
                <Link href={`/${locale}/legal/refund`} className="text-white/70 hover:text-white underline transition-colors">
                  Refund Policy
                </Link>.
              </p>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">5. Acceptable Use</h2>
              <p className="text-white/55 leading-relaxed">You agree not to:</p>
              <ul className="space-y-2">
                {[
                  "Upload images of individuals without their explicit consent",
                  "Generate content that is defamatory, harassing, obscene, or that violates the rights of others",
                  "Attempt to reverse-engineer, decompile, scrape, or abuse the Service or its underlying infrastructure",
                  "Share, sell, or transfer your account credentials or access to any third party",
                  "Use the Service for any unlawful purpose under applicable law",
                  "Circumvent technical measures or quotas enforced by the Service",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-white/55 text-sm">
                    <span className="text-white/20 mt-0.5 flex-shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-white/55 leading-relaxed">
                Violation of these rules may result in immediate account suspension or termination without refund.
              </p>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">6. Intellectual Property</h2>
              <p className="text-white/55 leading-relaxed">
                You retain all rights to the images you upload. By uploading an image, you grant SMARTPATH AI LLC a limited, non-exclusive, royalty-free license to process it solely for the purpose of generating your requested avatar output. We do not use your uploaded images for AI model training, advertising, or any purpose beyond direct service delivery, and we do not share them with third parties.
              </p>
              <p className="text-white/55 leading-relaxed">
                Generated avatar outputs are granted to you for personal or commercial use (depending on your plan tier). SMARTPATH AI LLC retains no ownership rights over your generated outputs.
              </p>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">7. Disclaimers &amp; Limitation of Liability</h2>
              <p className="text-white/55 leading-relaxed">
                THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. AI-generated outputs may vary in quality and accuracy. SMARTPATH AI LLC makes no guarantee regarding the artistic quality or likeness accuracy of generated avatars.
              </p>
              <p className="text-white/55 leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, SMARTPATH AI LLC SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE. OUR TOTAL LIABILITY TO YOU SHALL NOT EXCEED THE AMOUNT PAID BY YOU FOR THE SERVICE IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
              </p>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">8. Service Availability</h2>
              <p className="text-white/55 leading-relaxed">
                We strive to maintain high service availability but do not guarantee uninterrupted access. Scheduled maintenance, third-party infrastructure issues, or force majeure events may temporarily affect availability. Periods of downtime do not extend the duration of your purchased license.
              </p>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">9. Account Termination</h2>
              <p className="text-white/55 leading-relaxed">
                You may request closure of your account at any time by contacting{" "}
                <a href="mailto:contact@smartpathavatar.online" className="text-white/70 hover:text-white underline transition-colors">
                  contact@smartpathavatar.online
                </a>. We reserve the right to suspend or permanently terminate accounts that violate these Terms, engage in fraudulent activity, initiate unjustified chargebacks, or create legal or reputational risk for SMARTPATH AI LLC, without prior notice and without refund.
              </p>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">10. Changes to Terms</h2>
              <p className="text-white/55 leading-relaxed">
                We may update these Terms at any time. Material changes will be communicated by email to your registered address or by a prominent notice on the platform, at least 7 days before taking effect. Your continued use of the Service after the effective date constitutes acceptance of the revised Terms.
              </p>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">11. Governing Law &amp; Jurisdiction</h2>
              <p className="text-white/55 leading-relaxed">
                These Terms of Service are governed by and construed in accordance with the laws of the <strong className="text-white/80">State of Montana, United States</strong>, without regard to its conflict of law provisions. Any dispute, claim, or controversy arising out of or relating to these Terms or the Service shall be subject to the exclusive jurisdiction of the state and federal courts located in <strong className="text-white/80">Flathead County, Montana</strong>. You hereby irrevocably consent to the personal jurisdiction of such courts.
              </p>
              <p className="text-white/55 leading-relaxed">
                Notwithstanding the foregoing, SMARTPATH AI LLC reserves the right to seek injunctive or other equitable relief in any court of competent jurisdiction to protect its intellectual property or confidential information.
              </p>
            </section>

            <div className="h-px bg-white/[0.05]" />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">12. Contact &amp; Legal Notices</h2>
              <p className="text-white/55 leading-relaxed">
                For any questions, legal notices, or formal communications regarding these Terms, please contact:
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
            <Link href={`/${locale}/legal/privacy`} className="hover:text-white/50 transition-colors">
              Privacy Policy →
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
