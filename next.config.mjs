/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/downloads/\\[sku\\]": ["./protected-downloads/**"],
    },
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
      { source: "/jespermakes/bambulab", destination: "/tools", permanent: true },
      { source: "/jespermakes/xtool", destination: "/tools", permanent: true },
      { source: "/jespermakes/youtubegear", destination: "/tools/category/office-youtube", permanent: true },
      { source: "/rubiomonocoat", destination: "/tools/rubio-monocoat-oil-plus-2c", permanent: true },
      { source: "/bambulab", destination: "/tools", permanent: true },
      { source: "/youtubegear", destination: "/tools/category/office-youtube", permanent: true },
      // Old Beacons versioned URLs
      { source: "/jespermakes/tools\\?__v\\=:v", destination: "/tools", permanent: true },
      { source: "/jespermakes/youtubegear\\?__v\\=:v", destination: "/tools/category/office-youtube", permanent: true },
      { source: "/jespermakes/xtool\\?__v\\=:v", destination: "/tools", permanent: true },
      { source: "/xtool", destination: "/tools", permanent: true },
      // Old Beacons shop product UUIDs — send to shop
      { source: "/shop/51018455-b7e0-439c-a9f9-9a906e73de3b", destination: "/shop", permanent: true },
      { source: "/shop/bfca615e-ccca-4e1c-8582-0c8ee9437621", destination: "/shop", permanent: true },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/.well-known/oauth-protected-resource",
        destination: "/api/well-known/oauth-protected-resource",
      },
      {
        source: "/.well-known/oauth-authorization-server",
        destination: "/api/well-known/oauth-authorization-server",
      },
    ];
  },
};

export default nextConfig;
