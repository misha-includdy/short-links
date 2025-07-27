import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function POST(request: NextRequest) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { url, slug } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: "URL requise" }, { status: 400 });
    }

    if (!slug?.trim()) {
      return NextResponse.json({ error: "Slug requis" }, { status: 400 });
    }

    const finalSlug = slug.trim();

    // Check if slug already exists in Redis
    const existingData = await redis.get(finalSlug);
    
    if (existingData) {
      // Check if it's the new JSON format or old string format
      try {
        const parsed = JSON.parse(existingData as string);
        if (parsed && typeof parsed.originalUrl === 'string') {
          // New format exists
          return NextResponse.json({ 
            error: "Ce slug existe déjà. Veuillez choisir un autre slug." 
          }, { status: 409 });
        }
      } catch {
        // Old format exists (just a string)
        return NextResponse.json({ 
          error: "Ce slug existe déjà. Veuillez choisir un autre slug." 
        }, { status: 409 });
      }
    }

    // Store the slug-URL pair in Redis with creation date
    const linkData = {
      originalUrl: url,
      createdAt: new Date().toISOString()
    };
    await redis.set(finalSlug, JSON.stringify(linkData));

    const shortUrl = `https://includdy.com/p/${finalSlug}`;
    
    return NextResponse.json({
      originalUrl: url,
      shortUrl: shortUrl,
      slug: finalSlug,
      userId: user.id,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Redis error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
} 