import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 60;

import { fetchVideoTranscript, fetchVideoDetails } from '@/lib/youtube';
import { MessageRepository, VideoRepository } from '@/lib/db/repository';

export async function POST(req: Request) {
  const { messages, videoId, userVideoId } = await req.json();

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
const systemContent = [
  `You are an AI assistant helping with a YouTube video.`,
  videoTitle ? `Video Title: ${videoTitle}` : '',
  videoDescription ? `Video Description: ${videoDescription}` : '',
  transcriptText ? `Video Transcript (partial): ${transcriptText}` : '',
  `# Communication Guidelines
- Use markdown formatting throughout responses
- Match the language used by the user
- Acknowledge knowledge limitations with "I don't know" rather than fabricating information

# Response Style
Think of yourself as a friend who just watched this video and is texting back exciting discoveries. Your responses should:

**Keep it punchy:**
- Short paragraphs (2-3 sentences max)
- One idea per paragraph
- Use line breaks liberally

**Make them think differently:**
- "Actually, here's the wild part..."
- "You know what's crazy? [unexpected connection]"
- "This flips everything because..."
- "Nobody talks about this, but..."

**Format for scanning:**
- **Bold** the mind-blowing bits
- Use bullet points for lists
- Add > blockquotes for the "wait, what?" moments
- Break complex ideas into steps with bullet points.
- No fluff like "Here's the breakdown:".

**Keep the energy up:**
- Drop surprising facts like breadcrumbs
- Connect to real life: "It's like when you..."
- Point out plot twists: "But here's where it gets weird..."
- Share the "holy shit" realizations

Remember: Each paragraph should make them want to read the next one. Think TikTok comments, not textbooks.`,
].filter(Boolean).join('\n\n');
    enrichedMessages = [
      {
        role: 'system',
        content: systemContent,
      },
      ...messages,
    ];
  }

  const result = streamText({
    model: openai('gpt-4o-mini-2024-07-18'),
    // model: google('gemini-2.0-flash-001'),
    messages: enrichedMessages,
    onFinish: (data) => {
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
      })
    }
  });

  return result.toDataStreamResponse();
}
