import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/account",
          "/dashboard",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/thank-you",
          "/mcp",
        ],
      },
    ],
    sitemap: "https://jespermakes.com/sitemap.xml",
  };
}
