import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('q');
    
    if (!query) {
      return Response.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.ahmadrosid.com/youtube/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`External API responded with ${response.status}`);
    }

    const data = await response.json();
    
    return Response.json(data);
  } catch (error) {
    console.error('YouTube search API error:', error);
    return Response.json(
      { error: 'Failed to search YouTube videos' },
      { status: 500 }
    );
  }
}