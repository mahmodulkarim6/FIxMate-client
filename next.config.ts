import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    // Service photos are uploaded to ImgBB through the Express API, so the
    // optimizer needs to be allowed to fetch from ImgBB's CDN hosts.
    remotePatterns: [
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "images.ibb.co" },
    ],
  },
}

export default nextConfig