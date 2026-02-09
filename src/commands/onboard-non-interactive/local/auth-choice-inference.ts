import type { AuthChoice, OnboardOptions } from "../../onboard-types.js";

type FlagMatch = { label: string; choice: AuthChoice };

export function inferAuthChoiceFromFlags(opts: OnboardOptions): {
  matches: FlagMatch[];
  choice: AuthChoice | undefined;
} {
  const matches: FlagMatch[] = [];

  if (opts.anthropicApiKey)
    matches.push({ label: "--anthropic-api-key", choice: "apiKey" as AuthChoice });
  if (opts.openaiApiKey) matches.push({ label: "--openai-api-key", choice: "openai-api-key" });
  if (opts.openrouterApiKey)
    matches.push({ label: "--openrouter-api-key", choice: "openrouter-api-key" });
  if (opts.aiGatewayApiKey)
    matches.push({ label: "--ai-gateway-api-key", choice: "ai-gateway-api-key" });
  if (opts.cloudflareAiGatewayApiKey)
    matches.push({
      label: "--cloudflare-ai-gateway-api-key",
      choice: "cloudflare-ai-gateway-api-key",
    });
  if (opts.moonshotApiKey)
    matches.push({ label: "--moonshot-api-key", choice: "moonshot-api-key" });
  if (opts.kimiCodeApiKey)
    matches.push({ label: "--kimi-code-api-key", choice: "kimi-code-api-key" });
  if (opts.geminiApiKey) matches.push({ label: "--gemini-api-key", choice: "gemini-api-key" });
  if (opts.zaiApiKey) matches.push({ label: "--zai-api-key", choice: "zai-api-key" });
  if (opts.xiaomiApiKey) matches.push({ label: "--xiaomi-api-key", choice: "xiaomi-api-key" });
  if (opts.minimaxApiKey)
    matches.push({ label: "--minimax-api-key", choice: "minimax-api-key" as AuthChoice });
  if (opts.syntheticApiKey)
    matches.push({ label: "--synthetic-api-key", choice: "synthetic-api-key" });
  if (opts.veniceApiKey) matches.push({ label: "--venice-api-key", choice: "venice-api-key" });
  if (opts.opencodeZenApiKey)
    matches.push({ label: "--opencode-zen-api-key", choice: "opencodeZen" });
  if (opts.xaiApiKey) matches.push({ label: "--xai-api-key", choice: "xai-api-key" });
  if (opts.qianfanApiKey) matches.push({ label: "--qianfan-api-key", choice: "qianfan-api-key" });
  if (opts.token && opts.tokenProvider) matches.push({ label: "--token", choice: "token" });

  return {
    matches,
    choice: matches.length === 1 ? matches[0].choice : undefined,
  };
}
