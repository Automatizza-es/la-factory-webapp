import path from "node:path";
import type { NextConfig } from "next";
import { APP_ORIGIN } from "./src/lib/app-origin";

const nextConfig: NextConfig = {
  // Keep old email/invitation links working and consolidate installs on hub.
  // Limit this to the old public alias so preview deployments still work.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "web-six-liart-89\\.vercel\\.app" }],
        destination: `${APP_ORIGIN}/:path*`,
        permanent: true,
      },
    ];
  },
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
