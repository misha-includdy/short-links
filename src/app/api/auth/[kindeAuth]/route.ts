import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

// Patch global fetch to add User-Agent header — AWS WAF on Kinde's
// JWKS endpoint challenges requests without a browser-like User-Agent,
// returning 202 with empty body instead of the actual JWKS JSON.
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (url.includes(".well-known/jwks.json")) {
    const headers = new Headers(init?.headers);
    if (!headers.has("User-Agent")) {
      headers.set("User-Agent", "Mozilla/5.0 (compatible; IncluddyLink/1.0)");
    }
    return originalFetch(input, { ...init, headers });
  }
  return originalFetch(input, init);
};

const handler = handleAuth();

export async function GET(request: NextRequest, context: { params: Promise<{ kindeAuth: string }> }) {
  try {
    return await handler(request, context);
  } catch (error) {
    console.error("Kinde auth error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ kindeAuth: string }> }) {
  try {
    return await handler(request, context);
  } catch (error) {
    console.error("Kinde auth error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
