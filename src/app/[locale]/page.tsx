import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import StylesSection from "@/components/home/StylesSection";
import BeforeAfterSection from "@/components/home/BeforeAfterSection";
import PricingPreviewSection from "@/components/home/PricingPreviewSection";
import FaqSection from "@/components/home/FaqSection";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main>
        <HeroSection locale={locale} />
        <HowItWorksSection />
        <StylesSection />
        <BeforeAfterSection locale={locale} />
        <PricingPreviewSection locale={locale} />
        <FaqSection />
      </main>
      <Footer locale={locale} />
    </div>
  );
}
