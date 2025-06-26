// Token pricing per 1M tokens in USD
export const TOKEN_PRICING = {
  openai: {
    'gpt-4o-mini-2024-07-18': {
      input: 0.15,   // $0.15 per 1M input tokens
      output: 0.60,  // $0.60 per 1M output tokens
    },
    'gpt-4.1-2025-04-14': {
      input: 2.50,   // $2.50 per 1M input tokens
      output: 10.00, // $10.00 per 1M output tokens
    },
  },
  google: {
    'gemini-2.0-flash-001': {
      input: 0.075,  // $0.075 per 1M input tokens
      output: 0.30,  // $0.30 per 1M output tokens
    },
  },
} as const;

export function calculateTokenCost(
  provider: keyof typeof TOKEN_PRICING,
  model: string,
  inputTokens: number,
  outputTokens: number
): { inputCost: number; outputCost: number; totalCost: number } {
  const pricing = TOKEN_PRICING[provider]?.[model as keyof typeof TOKEN_PRICING[typeof provider]];
  
  if (!pricing) {
    console.warn(`No pricing found for ${provider}:${model}`);
    return { inputCost: 0, outputCost: 0, totalCost: 0 };
  }
  
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  const totalCost = inputCost + outputCost;
  
  return {
    inputCost: Math.round(inputCost * 1_000_000) / 1_000_000, // Round to 6 decimal places
    outputCost: Math.round(outputCost * 1_000_000) / 1_000_000,
    totalCost: Math.round(totalCost * 1_000_000) / 1_000_000,
  };
}