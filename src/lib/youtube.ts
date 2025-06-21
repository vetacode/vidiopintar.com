import { VideoRepository, TranscriptRepository, Video } from "@/lib/db/repository";
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { generateSummary } from "@/lib/ai/summary";
import { formatTime } from "@/lib/utils";

import { UserVideoRepository } from "@/lib/db/repository";
import { getCurrentUser } from "./auth";

export async function saveVideoUser(videoId: string, video: Video, segments: any[]) {
  const user = await getCurrentUser();
  const summary = await generateUserVideoSummary(video, segments);

  return await UserVideoRepository.create({
    userId: user.id,
    youtubeId: videoId,
    summary: summary,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function generateUserVideoSummary(video: Video, segments: any[]) {
  const transcriptText = segments.map((seg: {text: string}) => seg.text);
  const textToSummarize = `${video.title}\n${video.description ?? ""}\n${transcriptText}`;
  const summary = await generateSummary(textToSummarize);

  return summary;
}

export async function fetchVideoDetails(videoId: string) {
  try {
    const user = await getCurrentUser();
    const existingVideo = await VideoRepository.getByYoutubeId(videoId);
    const userVideo = await UserVideoRepository.getByUserAndYoutubeId(user.id, videoId);
    
    if (existingVideo) {
      return {
        title: existingVideo.title,
        description: existingVideo.description || "",
        channelTitle: existingVideo.channelTitle || "",
        publishedAt: existingVideo.publishedAt?.toISOString(),
        thumbnails: { high: { url: existingVideo.thumbnailUrl || "" } },
        tags: [],
        userVideo,
        video: existingVideo,
      };
    }

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const encodedUrl = encodeURIComponent(videoUrl);
    
    const response = await fetch(`https://api.ahmadrosid.com/youtube/video?videoUrl=${encodedUrl}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch video details: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();

    await VideoRepository.upsert({
      youtubeId: videoId,
      title: data.title,
      description: data.description,
      channelTitle: data.channelTitle,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      // Prefer highest-resolution thumbnail available
      thumbnailUrl:
        data.thumbnails?.maxres?.url ||
        data.thumbnails?.standard?.url ||
        data.thumbnails?.high?.url ||
        data.thumbnails?.medium?.url ||
        data.thumbnails?.default?.url ||
        '',
    });
    
    return {
      title: data.title,
      description: data.description,
      channelTitle: data.channelTitle,
      publishedAt: data.publishedAt,
      thumbnails: data.thumbnails,
      tags: data.tags,
      userVideo,
    };
  } catch (error) {
    console.error('Error fetching video details:', error);
    
    // Fallback to basic info in case of error
    return {
      title: `Video ${videoId}`,
      description: "Unable to load video description.",
      channelTitle: "Unknown Channel",
      publishedAt: new Date().toISOString(),
      thumbnails: {},
      tags: [],
      userVideo: null,
    };
  }
}

export async function fetchVideoTranscript(videoId: string) {
  try {
    const user = await getCurrentUser();
    const dbSegments = await TranscriptRepository.getByVideoId(videoId);
    if (dbSegments.length > 0) {
      const segments = dbSegments
        .map((item: any) => ({
          start: item.start,
          end: item.end,
          text: item.text,
          isChapterStart: item.isChapterStart,
        }))
        .sort((a, b) => a.start - b.start);
      let userVideo = await UserVideoRepository.getByUserAndYoutubeId(user.id, videoId);
      if (!userVideo) {
        const video = await VideoRepository.getByYoutubeId(videoId);
        userVideo = await saveVideoUser(videoId, video!, segments);
      }
      return { segments, userVideo };
    }

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
    const encodedUrl = encodeURIComponent(videoUrl)
    const response = await fetch(`https://api.ahmadrosid.com/youtube/transcript?videoUrl=${encodedUrl}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch transcript: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    const segments = data.content.map((item: any, index: number) => {
      // Convert start and end times from strings to numbers
      const start = parseInt(item.start, 10) / 1000 // Convert milliseconds to seconds if needed
      const end = parseInt(item.end, 10) / 1000 // Convert milliseconds to seconds if needed
      
      // Check if this might be a chapter start (simple heuristic)
      // We'll consider segments with short text that might be titles as potential chapter starts
      const isChapterStart = item.text.length < 30 && 
                            !item.text.includes('segment') && 
                            item.text !== 'N/A' &&
                            (index === 0 || index % 10 === 0) // Just a heuristic

      return {
        start,
        end,
        text: item.text !== 'N/A' ? item.text : `Segment at ${formatTime(start)}`,
        isChapterStart,
      }
    })

    await TranscriptRepository.upsertSegments(videoId, segments);

    // Generate and update summary for the video
    // Only generate summary if none exists
    const video = await VideoRepository.getByYoutubeId(videoId);
    let userVideo = await UserVideoRepository.getByUserAndYoutubeId(user.id, videoId);
    if (video) {
      if (!userVideo) {
        userVideo = await saveVideoUser(videoId, video, segments);
      }
      await VideoRepository.upsert({
        youtubeId: videoId,
        title: video.title,
        description: video.description,
        channelTitle: video.channelTitle,
        publishedAt: video.publishedAt,
        thumbnailUrl: video.thumbnailUrl,
      });
    }
    return {
      segments,
      userVideo
    }
  } catch (error) {
    console.error('Error fetching transcript:', error)
    return {
      segments: [],
    }
  }
}

export async function generateQuickStartQuestions(summary: string) {
  let prompt = `You are a helpful assistant that analyzes YouTube video transcripts and generates relevant questions to facilitate learning and discussion. When given a transcript, your task is to:

1. Quickly identify the main topics, key concepts, and important points discussed in the video
2. Generate exactly 4 concise, thought-provoking questions that will help the user better understand and engage with the content

Your questions should:
- Be clear and specific to the transcript content
- Cover different aspects of the video (e.g., main concepts, applications, implications, clarifications)
- Range from basic comprehension to deeper analytical thinking
- Be formatted as a numbered list (1-4)
- Be concise (typically one sentence each)

Focus on questions that:
- Clarify key points
- Explore practical applications
- Encourage critical thinking
- Help identify connections between ideas

Present only the 4 questions without additional explanation or preamble - don't include the number.

Here is the transcript:

<transcript>
${summary}
</ranscript>
`;

  const { object } = await generateObject({
    model: openai('gpt-4.1-2025-04-14'),
    prompt: prompt,
    schema: z.object({
      questions: z.array(z.string()),
    }),
  });
  return object?.questions || [];
}
