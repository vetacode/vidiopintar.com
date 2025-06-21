import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { encoding_for_model } from 'tiktoken';

export async function generateSummary(text: string): Promise<string> {
  // Limit the input to about 5000 tokens using tiktoken
  const MAX_TOKENS = 5000;
  // Gemini is not directly supported, use cl100k_base encoding (same as GPT-3.5/4, close approximation)
  const enc = encoding_for_model('gpt-3.5-turbo');
  const tokens = enc.encode(text);
  let truncatedText = text;
  if (tokens.length > MAX_TOKENS) {
    // Decode only the first MAX_TOKENS tokens back to string
    // enc.decode returns Uint8Array, convert to string
    truncatedText = new TextDecoder().decode(enc.decode(tokens.slice(0, MAX_TOKENS)));

  }
  enc.free();

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
                content: `INPUT:\n${truncatedText}`
            }
        ]
    })
  return summary;
}
