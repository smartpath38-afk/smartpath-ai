// src/app/sitemap.ts
import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://smartpathavatar.online";
const LOCALES = ["en"];

type ChangeFreq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

interface SitemapEntry {
  url: string;
  lastModified?: string | Date;
  changeFrequency?: ChangeFreq;
  priority?: number;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: SitemapEntry[] = [];

  const pages: { path: string; changeFrequency: ChangeFreq; priority: number }[] = [
    { path: "", changeFrequency: "weekly", priority: 1.0 },
    { path: "/pricing", changeFrequency: "weekly", priority: 0.9 },
    { path: "/legal/terms", changeFrequency: "monthly", priority: 0.3 },
    { path: "/legal/privacy", changeFrequency: "monthly", priority: 0.3 },
    { path: "/legal/refund", changeFrequency: "monthly", priority: 0.3 },
  ];

  for (const locale of LOCALES) {
    for (const page of pages) {
      entries.push({
        url: `${APP_URL}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      });
    }
  }

  return entries;
}
