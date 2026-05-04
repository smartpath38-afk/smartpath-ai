import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SMARTPATH AI — Transform Your Photo Into a Stunning AI Avatar",
  description:
    "Professional AI-powered avatar generation. Transform any photo into stunning stylized artwork in seconds. 8 unique styles. Built for creators, professionals, and brands.",
  keywords: ["AI avatar", "avatar generator", "AI photo", "avatar creation", "AI art"],
  openGraph: {
    title: "SMARTPATH AI — AI Avatar Generator",
    description: "Transform any photo into a stunning AI avatar in seconds.",
    siteName: "SMARTPATH AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
