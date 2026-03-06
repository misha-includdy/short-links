import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";

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
