import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/login",
          "/account",
          "/thank-you",
        ],
      },
    ],
    sitemap: "https://jespermakes.com/sitemap.xml",
  };
}
