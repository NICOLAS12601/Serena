import { NextResponse, type NextRequest } from "next/server";

// Every browser call to /api/... is forwarded to the NestJS API by the rewrite
// in next.config.ts. Here we add the key shared with the API (INTERNAL_API_KEY),
// which rejects requests without it: only the web can call the API.
// The header is set on the request going upstream, never on the response, so
// the browser never sees the key.
export function proxy(request: NextRequest) {
  const key = process.env.INTERNAL_API_KEY;
  if (!key) return NextResponse.next(); // local development without a key
  const headers = new Headers(request.headers);
  headers.set("x-internal-api-key", key);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: "/api/:path*",
};
