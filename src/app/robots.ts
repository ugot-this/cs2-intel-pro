import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://cs2intelpro.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/blog", "/about", "/contact"],
        disallow: ["/dashboard/", "/admin/", "/api/", "/login", "/register", "/reset-password"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
