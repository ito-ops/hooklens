import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 開発時に 127.0.0.1 からアクセスした際の HMR/devリソースの cross-origin ブロックを回避。
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
