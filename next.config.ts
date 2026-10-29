import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `next build` writes the hostable site to `out/`.
  output: "export",
  // Each route becomes a folder with index.html, which Apache serves on cPanel.
  trailingSlash: true,
  images: {
    // There is no Next.js server on cPanel to resize images.
    unoptimized: true,
  },
};

export default nextConfig;
