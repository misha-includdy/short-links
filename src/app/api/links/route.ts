import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('short_links')
      .select('slug, destination, clicks, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des liens' },
        { status: 500 }
      );
    }

    const links = (data || []).map(row => ({
      slug: row.slug,
      originalUrl: row.destination,
      shortUrl: `https://includdy.com/p/${row.slug}`,
      clicks: row.clicks,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ links });
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des liens' },
      { status: 500 }
    );
  }
}
