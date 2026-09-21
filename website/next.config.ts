import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Emits <route>/index.html for every page instead of <route>.html, so
  // Hostinger's Apache serves clean URLs (e.g. /about/) via its default
  // directory index — no custom .htaccess rewrite rules required.
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
