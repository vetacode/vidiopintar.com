import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { videoId, videoUrl } = await request.json();
    
    if (!videoId && !videoUrl) {
      return Response.json(
        { error: 'Either videoId or videoUrl is required in request body' },
        { status: 400 }
      );
    }

    const params = new URLSearchParams();
    if (videoUrl) params.append('videoUrl', videoUrl);
    if (videoId) params.append('videoId', videoId);

    const response = await fetch(
      `https://api.ahmadrosid.com/youtube/comments?${params.toString()}`,
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
    console.error('YouTube comments API error:', error);
    return Response.json(
      { error: 'Failed to fetch YouTube comments' },
      { status: 500 }
    );
  }
}
