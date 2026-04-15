import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "img-cdn.hltv.org" },
      { protocol: "https", hostname: "static.hltv.org" },
    ],
  },
};

export default nextConfig;
