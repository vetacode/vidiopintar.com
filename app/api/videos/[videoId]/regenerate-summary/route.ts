import { NextRequest, NextResponse } from 'next/server';
import { VideoRepository, TranscriptRepository } from '@/lib/db/repository';
import { generateSummary } from '@/lib/ai/summary';

export async function POST(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const { videoId } = params;

    // Get video and transcript from database
    const video = await VideoRepository.getByYoutubeId(videoId);
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

    // Update video with new summary
    await VideoRepository.upsert({
      youtubeId: videoId,
      title: video.title,
      description: video.description,
      summary,
      channelTitle: video.channelTitle,
      publishedAt: video.publishedAt,
      thumbnailUrl: video.thumbnailUrl,
    });

    return NextResponse.json({ summary });

  } catch (error) {
    console.error('Error regenerating summary:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate summary' },
      { status: 500 }
    );
  }
}