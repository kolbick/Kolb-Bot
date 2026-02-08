import type { AuthChoice, OnboardOptions } from "../../onboard-types.js";

const MAPPINGS: Array<{ key: keyof OnboardOptions; choice: AuthChoice; label: string }> = [
  { key: "anthropicApiKey", choice: "apiKey", label: "--anthropic-api-key" },
  { key: "openaiApiKey", choice: "openai-api-key", label: "--openai-api-key" },
  { key: "openrouterApiKey", choice: "openrouter-api-key", label: "--openrouter-api-key" },
  { key: "aiGatewayApiKey", choice: "ai-gateway-api-key", label: "--ai-gateway-api-key" },
  {
    key: "cloudflareAiGatewayApiKey",
    choice: "cloudflare-ai-gateway-api-key",
    label: "--cloudflare-ai-gateway-api-key",
  },
  { key: "moonshotApiKey", choice: "moonshot-api-key", label: "--moonshot-api-key" },
  { key: "kimiCodeApiKey", choice: "kimi-code-api-key", label: "--kimi-code-api-key" },
  { key: "geminiApiKey", choice: "gemini-api-key", label: "--gemini-api-key" },
  { key: "zaiApiKey", choice: "zai-api-key", label: "--zai-api-key" },
  { key: "xiaomiApiKey", choice: "xiaomi-api-key", label: "--xiaomi-api-key" },
  { key: "minimaxApiKey", choice: "minimax-api", label: "--minimax-api-key" },
  { key: "syntheticApiKey", choice: "synthetic-api-key", label: "--synthetic-api-key" },
  { key: "veniceApiKey", choice: "venice-api-key", label: "--venice-api-key" },
  { key: "opencodeZenApiKey", choice: "opencode-zen", label: "--opencode-zen-api-key" },
  { key: "xaiApiKey", choice: "xai-api-key", label: "--xai-api-key" },
  { key: "qianfanApiKey", choice: "qianfan-api-key", label: "--qianfan-api-key" },
];

export function inferAuthChoiceFromFlags(opts: OnboardOptions): {
  choice?: AuthChoice;
  matches: Array<{ choice: AuthChoice; label: string }>;
} {
  const matches = MAPPINGS.filter(
    ({ key }) => typeof opts[key] === "string" && opts[key]?.trim(),
  ).map(({ choice, label }) => ({ choice, label }));
  return {
    choice: matches.length === 1 ? matches[0]?.choice : undefined,
    matches,
  };
}
