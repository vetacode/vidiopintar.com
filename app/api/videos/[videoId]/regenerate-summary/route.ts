import { NextRequest, NextResponse } from 'next/server';
import { UserVideoRepository, TranscriptRepository } from '@/lib/db/repository';
import { getCurrentUser } from '@/lib/auth';
import { generateSummary } from '@/lib/ai/summary';

export async function POST(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const { videoId } = params;
    const user = await getCurrentUser();
    const userId = user.id;

    // Get user_video and transcript from database
    const userVideo = await UserVideoRepository.getByUserAndYoutubeId(userId, videoId);
    if (!userVideo) {
      return NextResponse.json({ error: 'User video not found' }, { status: 404 });
    }

    // Fetch video info for title/description
    const video = await import('@/lib/db/repository').then(m => m.VideoRepository.getByYoutubeId(userVideo.youtubeId));
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const dbSegments = await TranscriptRepository.getByVideoId(videoId);
    if (dbSegments.length === 0) {
      return NextResponse.json({ error: 'No transcript available for this video' }, { status: 400 });
    }

    // Generate summary from existing transcript
    const transcriptText = dbSegments
      .sort((a, b) => a.start - b.start)
      .map(seg => seg.text)
      .join(' ');

    const textToSummarize = `${video.title}\n${video.description ?? ""}\n${transcriptText}`;
    const summary = await generateSummary(textToSummarize);

    // Update user_video with new summary
    await UserVideoRepository.updateSummary(userVideo.id, summary);

    return NextResponse.json({ summary });

  } catch (error) {
    console.error('Error regenerating summary:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate summary' },
      { status: 500 }
    );
  }
}