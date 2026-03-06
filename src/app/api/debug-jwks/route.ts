import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const issuerUrl = process.env.KINDE_ISSUER_URL;
  const jwksUrl = `${issuerUrl}/.well-known/jwks.json`;

  const results: Record<string, unknown> = {
    issuerUrl,
    jwksUrl,
    timestamp: new Date().toISOString(),
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const start = Date.now();
    const response = await fetch(jwksUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; IncluddyLink/1.0)" },
    });
    clearTimeout(timeout);

    const headersObj: Record<string, string> = {};
    response.headers.forEach((v, k) => {
      headersObj[k] = v;
    });

    // Read as text first to see exactly what we get
    const rawText = await response.text();

    results.fetchTimeMs = Date.now() - start;
    results.status = response.status;
    results.statusText = response.statusText;
    results.headers = headersObj;
    results.bodyLength = rawText.length;
    results.bodyPreview = rawText.substring(0, 500);
    results.bodyEnd = rawText.substring(Math.max(0, rawText.length - 100));

    // Try to parse as JSON
    try {
      const json = JSON.parse(rawText);
      results.jsonValid = true;
      results.keysCount = json.keys?.length ?? "no keys field";
    } catch (parseErr) {
      results.jsonValid = false;
      results.parseError = String(parseErr);
    }
  } catch (err) {
    results.fetchError = String(err);
    results.errorName = err instanceof Error ? err.name : "unknown";
  }

  return NextResponse.json(results, { status: 200 });
}
