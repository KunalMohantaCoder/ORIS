import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(process.cwd()),
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"]
  }
};

export default nextConfig;
