import PricingPageClient from "./PricingPageClient";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function PricingPage({ params }: Props) {
  const { locale } = await params;
  return <PricingPageClient locale={locale} />;
}
