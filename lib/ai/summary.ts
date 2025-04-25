import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function generateSummary(text: string): Promise<string> {
  const systemPrompt = `
Please provide a detailed, well-structured summary of this YouTube video transcript.

Your summary should:

1. Identify the main topic and key themes discussed in the content
2. Break down the information into logical sections with clear headings
3. Highlight important concepts, arguments, or insights presented
4. Include relevant examples, data points, and notable quotes
5. Capture any methodologies, frameworks, or step-by-step processes explained
6. Note significant challenges or opposing viewpoints mentioned
7. Extract practical takeaways or lessons that viewers can apply
8. Maintain the nuance and depth of the original content while making it more accessible
9. Present information in a cohesive narrative flow rather than just bullet points
10. Add recomendations for next steps or actions to take after watching the video

Format your output with this markdown structure:

## Summary

## Outline (make it short just the headline)

## Key Takeaways

## Next Steps
`;

    const { text: summary } = await generateText({
        model: google('gemini-2.0-flash-001'),
        messages: [
            {
                role: 'system',
                content: systemPrompt
            },
            {
                role: 'user',
                content: `INPUT:\n${text}`
            }
        ]
    })
  // const jigsaw = JigsawStack({
  //   apiKey: process.env.JIGSAWSTACK_API_KEY
  // });
  // const response = await jigsaw.summary({
  //   "text": text,
  //   "type": "text",
  // })
  // return response.summary;
  return summary;
}
