import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: path.join(__dirname, "..", ".."),
  },
  // Enable source maps in production for coverage reporting
  // This allows monocart-coverage-reports to map bundled code back to source files
  productionBrowserSourceMaps: true,
  // Turbopack generates source maps by default in dev mode
};

export default nextConfig;
