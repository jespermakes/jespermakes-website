/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/api/downloads/\\[sku\\]": ["./protected-downloads/**"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "fgrwwf1ctwchpvxd.public.blob.vercel-storage.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      // Old Beacons link-in-bio URLs
      { source: "/jespermakes/tools", destination: "/tools", permanent: true },
      { source: "/jespermakes/jespermakes.com", destination: "/", permanent: true },
      { source: "/jespermakes/bambulab", destination: "/bambulab", permanent: true },
      { source: "/jespermakes/xtool", destination: "/tools", permanent: true },
      { source: "/jespermakes/youtubegear", destination: "/tools/category/office-youtube-gear", permanent: true },
      // Was pointing at /tools/rubio-monocoat-oil-plus-2c, which is now hidden.
      { source: "/rubiomonocoat", destination: "/rubio", permanent: true },

      // The Rubio tool pages were folded into the shop (11 Aug 2026). They were
      // duplicates of the /rubio product pages with worse links: hardcoded to
      // the UK store, so a German visitor got pounds instead of euros. One
      // canonical page per product now, and these keep their link equity.
      { source: "/tools/rubio-monocoat-oil-plus-2c", destination: "/rubio/oil-plus-2c", permanent: true },
      { source: "/tools/rubio-monocoat-durogrit", destination: "/rubio/durogrit", permanent: true },
      { source: "/tools/rubio-monocoat-woodcream", destination: "/rubio/woodcream", permanent: true },
      { source: "/tools/rubio-monocoat-matcha-green", destination: "/rubio/matcha-green", permanent: true },
      // A kit of several products rather than one, so it lands on the shop
      // where the whole care range sits together.
      { source: "/tools/rubio-monocoat-care-kit", destination: "/rubio", permanent: true },
      // Every entry in this category was Rubio, so the category is the shop now.
      { source: "/tools/category/finishing", destination: "/rubio", permanent: true },
      // /bambulab was a redirect to the H2D tool page (825aa0a). It is the Bambu
      // section itself now (src/app/bambulab), so the redirect is gone and the
      // H2D tool page keeps its own URL. Browsers that cached the old 308 still
      // land on the H2D page, which still carries the affiliate link.
      { source: "/bambu", destination: "/bambulab", permanent: false },
      // The printed lamps page became the lamp generator at the URL the H2D film links to.
      { source: "/printed-lamps", destination: "/lamp-designer", permanent: true },
      { source: "/youtubegear", destination: "/tools/category/office-youtube-gear", permanent: true },
      // Old Beacons versioned URLs
      { source: "/jespermakes/tools\\?__v\\=:v", destination: "/tools", permanent: true },
      { source: "/jespermakes/youtubegear\\?__v\\=:v", destination: "/tools/category/office-youtube-gear", permanent: true },
      { source: "/jespermakes/xtool\\?__v\\=:v", destination: "/tools", permanent: true },
      { source: "/xtool", destination: "/tools", permanent: true },
      // Old Beacons shop product UUIDs — send to shop
      { source: "/shop/51018455-b7e0-439c-a9f9-9a906e73de3b", destination: "/shop", permanent: true },
      { source: "/shop/bfca615e-ccca-4e1c-8582-0c8ee9437621", destination: "/shop", permanent: true },
      // Old Squarespace URLs. Both still surface in Google results and were
      // 404ing, throwing away whatever link equity they had accumulated.
      { source: "/tools-i-use", destination: "/tools", permanent: true },
      { source: "/jespers-blog", destination: "/blog", permanent: true },
      { source: "/jespers-blog/:slug*", destination: "/blog", permanent: true },
      // Remaining sponsor vanity paths, completing the set already covered
      // above (rubiomonocoat, bambulab, xtool). One per brand in public/brands.
      { source: "/festool", destination: "/tools/category/festool", permanent: true },
      { source: "/navimow", destination: "/tools/segway-navimow-x450", permanent: true },
      { source: "/epidemicsound", destination: "/tools/epidemic-sound", permanent: true },
      { source: "/milanote", destination: "/tools", permanent: true },
      { source: "/betterhelp", destination: "/tools", permanent: true },
      // Emails that end a sentence with "jespermakes.com/mediakit." get the
      // full stop linked by mail clients, and that path 404ed.
      { source: "/mediakit\\.", destination: "/mediakit", permanent: true },
      { source: "/mediakit%2E", destination: "/mediakit", permanent: true },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        // studio.jespermakes.com → /studio
        {
          source: "/",
          has: [{ type: "host", value: "studio.jespermakes.com" }],
          destination: "/studio",
        },
        {
          source: "/:path*",
          has: [{ type: "host", value: "studio.jespermakes.com" }],
          destination: "/studio/:path*",
        },
      ],
      afterFiles: [
        {
          source: "/.well-known/oauth-protected-resource",
          destination: "/api/well-known/oauth-protected-resource",
        },
        {
          source: "/.well-known/oauth-authorization-server",
          destination: "/api/well-known/oauth-authorization-server",
        },
      ],
    };
  },
};

export default nextConfig;
