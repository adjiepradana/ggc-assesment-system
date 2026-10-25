import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXTAUTH_URL || "https://gogreatcareer.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/student/", "/admin/", "/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
