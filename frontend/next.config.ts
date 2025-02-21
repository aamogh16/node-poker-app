import * as dotenv from "dotenv";
import type { NextConfig } from "next";
import path from "path";

// Load .env from root directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL!,
  },
};

export default nextConfig;
