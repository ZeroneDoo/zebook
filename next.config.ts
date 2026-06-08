import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // output: "standalone",
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: "https",
  //       hostname: "api.dicebear.com",
  //     },
  //   ],
  // },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
