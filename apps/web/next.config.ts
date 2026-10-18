import type { NextConfig } from "next";

// Where the NestJS API runs. Server-side only: the browser never calls it
// directly, it goes through the /api rewrite below (ADR-011).
const API_URL = process.env.API_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  // The browser calls /api/... on the web's own domain and Next.js forwards it
  // to the API. The admin session cookie is then first-party, so browsers
  // that block third-party cookies (Safari) still accept it.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/:path*` }];
  },
};

export default nextConfig;
