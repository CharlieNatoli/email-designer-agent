import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Avoid bundling heavy/Node-only packages like mjml into edge/client builds
  // and ensure they are required at runtime on the Node server.
  experimental: {
    serverComponentsExternalPackages: ["mjml", "mjml-core"],
  },
};

export default nextConfig;
