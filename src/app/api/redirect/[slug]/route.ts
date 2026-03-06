import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

    const { data, error } = await supabase
      .from('short_links')
      .select('destination')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Lien non trouvé" }, { status: 404 });
    }

    return NextResponse.json({
      slug,
      originalUrl: data.destination,
      found: true
    });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
