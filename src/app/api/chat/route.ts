import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

import { fetchVideoTranscript, fetchVideoDetails } from '@/lib/youtube';
import { MessageRepository, VideoRepository, UserRepository } from '@/lib/db/repository';
import { createStreamTokenTracker } from '@/lib/token-tracker';
import { getCurrentUser } from '@/lib/auth';
import { getSystemPrompt } from '@/lib/ai/system-prompts';

export async function POST(req: Request) {
  const { messages, videoId, userVideoId, language } = await req.json();
  
  // Get user for token tracking and language sync
  let user;
  try {
    user = await getCurrentUser();
    
    // Auto-sync language preference to database if provided
    if (user && language && (language === 'en' || language === 'id')) {
      try {
        await UserRepository.updatePreferredLanguage(user.id, language);
      } catch (error) {
        console.error('Failed to sync language preference:', error);
      }
    }
  } catch (error) {
    console.error('Failed to get user for token tracking:', error);
  }

  let transcriptText = '';
  let videoTitle = '';
  let videoDescription = '';

  if (videoId) {
    try {
      const transcriptResult = await fetchVideoTranscript(videoId);
      if (transcriptResult?.segments?.length > 0) {
        transcriptText = transcriptResult.segments.map((seg: any) => seg.text).join('\n');
      }

      let dbVideo = await VideoRepository.getByYoutubeId(videoId);

      if (dbVideo) {
        videoTitle = dbVideo.title || '';
        videoDescription = dbVideo.description || '';
      } else {
        const detailsResult = await fetchVideoDetails(videoId);
        if (detailsResult) {
          videoTitle = detailsResult.title;
          videoDescription = detailsResult.description;
        }
      }

    } catch (err) {
      console.error('Failed to fetch video data:', err);
    }
  }

  if (Array.isArray(messages)) {
    const lastUserMsg = [...messages].reverse().find(msg => msg.role === 'user');
    if (lastUserMsg) {
      try {
        await MessageRepository.create({
          userVideoId,
          content: lastUserMsg.content,
          role: 'user',
          timestamp: Math.floor(Date.now() / 1000),
        });
      } catch (err) {
        console.error('Failed to save user message:', err);
      }
    }
  }

  let enrichedMessages = messages;
  if (transcriptText || videoTitle) {
    const systemContent = getSystemPrompt(language || 'en', {
      videoTitle,
      videoDescription,
      transcriptText,
    });
    
    enrichedMessages = [
      {
        role: 'system',
        content: systemContent,
      },
      ...messages,
    ];
  }

  const tokenTracker = user ? createStreamTokenTracker({
    userId: user.id,
    model: 'gpt-4o-mini-2024-07-18',
    provider: 'openai',
    operation: 'chat',
    videoId,
    userVideoId,
  }) : null;

  const result = streamText({
    model: openai('gpt-4o-mini-2024-07-18'),
    // model: google('gemini-2.0-flash-001'),
    messages: enrichedMessages,
    onFinish: async (data) => {
      // Save assistant messages
      data.steps.forEach(async (item) => {
        try {
          await MessageRepository.create({
            userVideoId,
            content: item.text,
            role: 'assistant',
            timestamp: Math.floor(Date.now() / 1000),
          });
        } catch (err) {
          console.error('Failed to save assistant message:', err);
        }
      });
      
      // Track token usage
      if (tokenTracker) {
        await tokenTracker.onFinish(data);
      }
    }
  });

  return result.toDataStreamResponse();
}
