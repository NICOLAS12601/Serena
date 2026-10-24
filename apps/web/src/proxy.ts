import { NextResponse, type NextRequest } from "next/server";

// Every browser call to /api/... is forwarded to the NestJS API by the rewrite
// in next.config.ts. Here we add the key shared with the API (INTERNAL_API_KEY),
// which rejects requests without it: only the web can call the API.
// We also pass the visitor's IP (for the API's rate limits) as Netlify saw it
// on its first server, where the visitor cannot fake it. The API believes it
// only together with the key (ADR-016).
// Headers are set on the request going upstream, never on the response, so
// the browser never sees the key.
export function proxy(request: NextRequest) {
  const key = process.env.INTERNAL_API_KEY;
  if (!key) return NextResponse.next(); // local development without a key
  const headers = new Headers(request.headers);
  headers.set("x-internal-api-key", key);
  // Never forward an x-client-ip the visitor wrote themselves.
  headers.delete("x-client-ip");
  const visitorIp = request.headers.get("x-nf-client-connection-ip");
  if (visitorIp) headers.set("x-client-ip", visitorIp);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: "/api/:path*",
};
