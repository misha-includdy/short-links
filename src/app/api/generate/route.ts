import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

    // Check if slug already exists
    const { data: existing } = await supabase
      .from('short_links')
      .select('id')
      .eq('slug', finalSlug)
      .single();

    if (existing) {
      return NextResponse.json({
        error: "Ce slug existe déjà. Veuillez choisir un autre slug."
      }, { status: 409 });
    }

    // Insert new short link
    const { error } = await supabase
      .from('short_links')
      .insert({ slug: finalSlug, destination: url });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    const shortUrl = `https://includdy.com/p/${finalSlug}`;

    return NextResponse.json({
      originalUrl: url,
      shortUrl: shortUrl,
      slug: finalSlug,
      userId: user.id,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
