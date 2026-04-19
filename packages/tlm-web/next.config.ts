import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: path.join(__dirname, "..", ".."),
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
