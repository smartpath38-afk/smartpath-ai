// src/app/robots.ts
import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://smartpathavatar.online";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/en/"],
        disallow: [
          "/en/dashboard/",
          "/en/checkout/",
          "/en/auth/",
          "/api/",
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
