import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: "Slug requis" }, { status: 400 });
    }

    // Get the original URL from Redis
    const linkData = await redis.get(slug);

    if (!linkData) {
      return NextResponse.json({ error: "Lien non trouvé" }, { status: 404 });
    }

    let originalUrl: string;
    try {
      // Try to parse as JSON (new format with creation date)
      const parsed = JSON.parse(linkData as string);
      originalUrl = parsed.originalUrl;
    } catch {
      // Fallback for old format (just URL string)
      originalUrl = linkData as string;
    }

    return NextResponse.json({ 
      slug,
      originalUrl,
      found: true 
    });
    
  } catch (error) {
    console.error("Redis error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
} 