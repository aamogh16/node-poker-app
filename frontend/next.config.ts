import * as dotenv from "dotenv";
import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const nextConfig: NextConfig = {
  env: {
    BACKEND_PORT: process.env.BACKEND_PORT!,
    WS_URL: process.env.WS_URL!,
    SOCKET_KEY: process.env.SOCKET_KEY!,
  },
};

export default nextConfig;
