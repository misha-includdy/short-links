import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET() {
  try {
    const keys = await redis.keys('*');
    const links = [];

    for (const key of keys) {
      const linkData = await redis.get(key);
      if (linkData) {
        // Handle different data types that might be stored in Redis
        let parsed = null;
        let isJsonString = false;
        
        // First, try to parse as JSON string
        if (typeof linkData === 'string') {
          try {
            parsed = JSON.parse(linkData);
            isJsonString = true;
          } catch (_parseError) {
            // Not a JSON string, continue to other checks
          }
        }
        
        // If it's already an object (not a string), use it directly
        if (!isJsonString && typeof linkData === 'object' && linkData !== null) {
          parsed = linkData;
        }
        
        // Process the parsed data
        if (parsed && typeof parsed.originalUrl === 'string' && parsed.originalUrl.trim() !== '') {
          links.push({
            slug: key,
            originalUrl: parsed.originalUrl,
            shortUrl: `https://includdy.com/p/${key}`,
            createdAt: parsed.createdAt || null
          });
          console.log(`Added link: ${key}`);
        } else if (typeof linkData === 'string' && linkData.trim() !== '') {
          // Handle old format (direct URL string)
          try {
            // Validate it's a proper URL
            new URL(linkData);
            links.push({
              slug: key,
              originalUrl: linkData,
              shortUrl: `https://includdy.com/p/${key}`,
              createdAt: null // No creation date for old entries
            });
            console.log(`Added old format link: ${key}`);
          } catch (_urlError) {
            console.warn(`Skipping invalid URL for key ${key}:`, linkData);
          }
        } else {
          console.warn(`Skipping invalid data for key ${key}:`, linkData);
        }
      }
    }

    // Sort by creation date (newest first) if available
    links.sort((a, b) => {
      if (!a.createdAt && !b.createdAt) return 0;
      if (!a.createdAt) return 1; // Put entries without date at the end
      if (!b.createdAt) return -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    console.log('Returning links:', links.length, 'items');
    return NextResponse.json({ links });
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des liens' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const keys = await redis.keys('*');
    let cleanedCount = 0;

    for (const key of keys) {
      const linkData = await redis.get(key);
      if (linkData) {
        let isValid = false;
        
        // Handle different data types that might be stored in Redis
        let parsed = null;
        let isJsonString = false;
        
        // First, try to parse as JSON string
        if (typeof linkData === 'string') {
          try {
            parsed = JSON.parse(linkData);
            isJsonString = true;
          } catch (_parseError) {
            // Not a JSON string, continue to other checks
          }
        }
        
        // If it's already an object (not a string), use it directly
        if (!isJsonString && typeof linkData === 'object' && linkData !== null) {
          parsed = linkData;
        }
        
        // Check if the data is valid
        if (parsed && typeof parsed.originalUrl === 'string' && parsed.originalUrl.trim() !== '') {
          isValid = true;
        } else if (typeof linkData === 'string' && linkData.trim() !== '') {
          try {
            // Validate it's a proper URL
            new URL(linkData);
            isValid = true;
          } catch (_urlError) {
            // Invalid URL, will be cleaned
          }
        }
        
        if (!isValid) {
          await redis.del(key);
          cleanedCount++;
          console.log(`Cleaned corrupted entry: ${key}`);
        }
      }
    }

    return NextResponse.json({ 
      message: `Nettoyage terminé. ${cleanedCount} entrées corrompues supprimées.` 
    });
  } catch (error) {
    console.error('Error cleaning corrupted data:', error);
    return NextResponse.json(
      { error: 'Erreur lors du nettoyage' },
      { status: 500 }
    );
  }
} 