import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { UserVideoRepository } from '@/lib/db/repository';

export async function POST(req: NextRequest) {
  try {
    const { userVideoId } = await req.json();
    
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userVideo = await UserVideoRepository.getById(userVideoId);
    if (!userVideo || userVideo.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await UserVideoRepository.clearMessages(userVideoId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to clear messages:', error);
    return NextResponse.json({ error: "Failed to clear messages" }, { status: 500 });
  }
}