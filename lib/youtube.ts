import { VideoRepository, TranscriptRepository } from "@/lib/db/repository";
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export async function fetchVideoDetails(videoId: string) {
  try {
    const existingVideo = await VideoRepository.getByYoutubeId(videoId);
    
    if (existingVideo) {
      return {
        title: existingVideo.title,
        description: existingVideo.description || "",
        channelTitle: existingVideo.channelTitle || "",
        publishedAt: existingVideo.publishedAt?.toISOString(),
        thumbnails: { high: { url: existingVideo.thumbnailUrl || "" } },
        tags: [],
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
    };
  }
}

export async function fetchVideoTranscript(videoId: string) {
  try {
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
      return { segments };
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
    
    // Save segments to the database using the repository
    await TranscriptRepository.upsertSegments(videoId, segments);
    return {
      segments,
    }
  } catch (error) {
    console.error('Error fetching transcript:', error)
    return {
      segments: [],
    }
  }
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

export async function generateQuickStartQuestions(transcript: { segments: { start: number; end: number; text: string; isChapterStart: boolean }[] }) {
  let transcriptText = transcript.segments.map((seg: any) => seg.text).join('\n');

  let prompt = `Please analyze this video transcript.

## Transcript

${transcriptText}

## Instructions

After analyzing the video transcript, create 4 thought-provoking questions that:
1. Are concise (under 60 characters each)
2. Prompt personal reflection or critical thinking
3. Help connect the content to real-world applications
4. Encourage deeper exploration of the subject
5. Match the transcript's language style and tone
6. Never use words like "I" or "you" in the questions
7. Prompt a user to start learning like asking what is this video is about etc.

Frame these questions as if you're a curious learner who haven't watched the video and wants to get started learning.
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
