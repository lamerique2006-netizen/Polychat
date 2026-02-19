// Cost per 1M tokens (in USD)
export const MODEL_PRICING = {
  'gpt-4o': { input: 2.5, output: 10.0 },
  'gpt-3-5-turbo': { input: 0.5, output: 1.5 },
  'claude-3-5-sonnet': { input: 3.0, output: 15.0 },
  'claude-instant': { input: 0.8, output: 2.4 },
  'grok-2': { input: 2.0, output: 10.0 },
}

// Estimate cost based on tokens (assumes 50/50 input/output split)
export function estimateCost(model, tokens) {
  const pricing = MODEL_PRICING[model]
  if (!pricing) return 0
  
  // Rough estimate: 40% input, 60% output
  const inputTokens = Math.floor(tokens * 0.4)
  const outputTokens = tokens - inputTokens
  
  const inputCost = (inputTokens / 1_000_000) * pricing.input
  const outputCost = (outputTokens / 1_000_000) * pricing.output
  
  return inputCost + outputCost
}

export function formatCost(cost) {
  if (cost < 0.001) return `$${(cost * 1000).toFixed(4)}k`
  if (cost < 1) return `$${cost.toFixed(4)}`
  return `$${cost.toFixed(2)}`
}
