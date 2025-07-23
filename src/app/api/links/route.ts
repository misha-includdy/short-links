import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET() {
  try {
    const keys = await redis.keys('*');
    const links = [];

    for (const key of keys) {
      const originalUrl = await redis.get(key);
      if (originalUrl) {
        links.push({
          slug: key,
          originalUrl: originalUrl as string,
          shortUrl: `https://includdy.com/p/${key}`
        });
      }
    }

    return NextResponse.json({ links });
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des liens' },
      { status: 500 }
    );
  }
} 