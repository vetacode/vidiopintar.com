import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 60;

import { fetchVideoTranscript } from '@/lib/youtube';
import { MessageRepository } from '@/lib/db/repository';

export async function POST(req: Request) {
  const { messages, videoId } = await req.json();

  let transcriptText = '';
  if (videoId) {
    try {
      const transcriptResult = await fetchVideoTranscript(videoId);
      if (transcriptResult && transcriptResult.segments && transcriptResult.segments.length > 0) {
        transcriptText = transcriptResult.segments.map((seg: any) => seg.text).join(' ');
        if (transcriptText.length > 2000) {
          transcriptText = transcriptText.slice(0, 2000) + '...';
        }
      }
    } catch (err) {
      console.error('Failed to fetch transcript:', err);
    }
  }

  // Save only the latest user message to DB to avoid duplicates
  if (Array.isArray(messages)) {
    const lastUserMsg = [...messages].reverse().find(msg => msg.role === 'user');
    if (lastUserMsg) {
      try {
        await MessageRepository.create({
          videoId,
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
  if (transcriptText) {
    enrichedMessages = [
      {
        role: 'system',
        content: `You are an AI assistant. Here is the video transcript context: ${transcriptText}`,
      },
      ...messages,
    ];
  }

  const result = streamText({
    model: openai('gpt-4.1-mini'),
    messages: enrichedMessages,
    onFinish: (data) => {
      data.steps.forEach(async (item) => {
        console.log('onFinish', item.response);
        try {
          await MessageRepository.create({
            videoId,
            content: item.text,
            role: 'assistant',
            timestamp: Math.floor(Date.now() / 1000),
          });
        } catch (err) {
          console.error('Failed to save assistant message:', err);
        }
      })
    }
  });

  return result.toDataStreamResponse();
}
