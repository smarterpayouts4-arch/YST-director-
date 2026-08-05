import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Avoid picking up a parent-directory lockfile as the workspace root.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
