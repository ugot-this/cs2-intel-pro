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
  // hltv → got-scraping → header-generator data файлуудыг Vercel serverless-д оруулна
  serverExternalPackages: ["hltv", "got-scraping", "header-generator", "fingerprint-generator"],
  outputFileTracingIncludes: {
    "/*": [
      "./node_modules/header-generator/data_files/**",
      "./node_modules/fingerprint-generator/data_files/**",
    ],
  },
};

export default nextConfig;
