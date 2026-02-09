import type { AuthChoice, OnboardOptions } from "../../onboard-types.js";

const CANDIDATES: Array<{ choice: AuthChoice; key: keyof OnboardOptions; label: string }> = [
  { choice: "openai-api-key", key: "openaiApiKey", label: "--openai-api-key" },
  { choice: "ai-gateway-api-key", key: "aiGatewayApiKey", label: "--ai-gateway-api-key" },
  {
    choice: "cloudflare-ai-gateway-api-key",
    key: "cloudflareAiGatewayApiKey",
    label: "--cloudflare-ai-gateway-api-key",
  },
  { choice: "gemini-api-key", key: "geminiApiKey", label: "--gemini-api-key" },
  { choice: "moonshot-api-key", key: "moonshotApiKey", label: "--moonshot-api-key" },
  { choice: "zai-api-key", key: "zaiApiKey", label: "--zai-api-key" },
  { choice: "xai-api-key", key: "xaiApiKey", label: "--xai-api-key" },
  { choice: "token", key: "token", label: "--token" },
];

export function inferAuthChoiceFromFlags(opts: OnboardOptions): {
  choice: AuthChoice | null;
  matches: Array<{ choice: AuthChoice; label: string }>;
} {
  const matches = CANDIDATES.filter((c) => Boolean(opts[c.key])).map((c) => ({
    choice: c.choice,
    label: c.label,
  }));
  return { choice: matches.length === 1 ? (matches[0]?.choice ?? null) : null, matches };
}
