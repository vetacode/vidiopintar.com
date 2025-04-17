import { NextRequest, NextResponse } from 'next/server';
import { getNotesForVideo, saveNote } from '@/lib/storage';

export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get('videoId');
  if (!videoId) {
    return NextResponse.json({ error: 'Missing videoId' }, { status: 400 });
  }
  try {
    const notes = await getNotesForVideo(videoId);
    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { videoId, note } = await req.json();
    if (!videoId || !note) {
      return NextResponse.json({ error: 'Missing videoId or note' }, { status: 400 });
    }
    await saveNote(videoId, note);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save note' }, { status: 500 });
  }
}
