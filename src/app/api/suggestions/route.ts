import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 60;

import { fetchVideoTranscript, fetchVideoDetails } from '@/lib/youtube';
import { MessageRepository, VideoRepository } from '@/lib/db/repository';

const prompt = `Act as expert prompt engineer.
Based on the conversation context, suggest 3-5 brief (<60 chars), diverse follow-up responses that:
1. Match the user's communication style
2. Offer different actionable directions (e.g., rewriting, brainstorming, clarifying)
3. Help user answer any questions from last message
4. Maintain natural conversation flow

Present options that the user could realistically say next to move the conversation (think like you are the user) forward productively.`;

export async function POST(req: Request) {
    const { messages, videoId, userVideoId } = await req.json();

    let transcriptText = '';
    let videoTitle = '';
    let videoDescription = '';

    try {
        const transcriptResult = await fetchVideoTranscript(videoId);
        if (transcriptResult?.segments?.length > 0) {
        transcriptText = transcriptResult.segments.map((seg: any) => seg.text).join(' ');
        if (transcriptText.length > 2000) {
            transcriptText = transcriptText.slice(0, 2000) + '...';
        }
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

  if (Array.isArray(messages)) {
    const lastUserMsg = [...messages].reverse().find(msg => msg.role === 'user');
    if (lastUserMsg) {
      try {
        await MessageRepository.create({
          userVideoId: userVideoId,
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
      "# Rule",
      "- Always respond in markdown format",
      "- Speak the language that user also speak to you",
      "- If you don't know the answer, say 'I don't know' instead of making it up",
      "- Highlight the important answer in codeblock with three backticks (```)",
      "- After answering user question please add additional question at the end of your answer to keep conversation going forward"
    ].filter(Boolean).join('\n\n'); 

    enrichedMessages = [
      {
        role: 'system',
        content: systemContent,
      },
      ...messages,
      {
        role: 'user',
        content: prompt
      }
    ];
  }

  const result = streamText({
    model: google('gemini-2.0-flash-001'),
    messages: enrichedMessages,
    onFinish: (data) => {
      // TODO: save suggestions!
    }
  });

  return result.toDataStreamResponse();
}
