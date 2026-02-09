import type { KolbBotConfig } from "../../../config/config.js";
import type { RuntimeEnv } from "../../../runtime.js";
import type { WizardPrompter } from "../../../wizard/prompts.js";
import type { AuthChoice, OnboardOptions } from "../../onboard-types.js";
import { applyAuthChoice } from "../../auth-choice.apply.js";

/**
 * Build a non-interactive prompter that resolves text/confirm prompts
 * automatically using the values from CLI options.
 */
function buildNonInteractivePrompter(opts: OnboardOptions): WizardPrompter {
  const apiKeyPool: string[] = [];
  for (const v of [
    opts.token,
    opts.anthropicApiKey,
    opts.openaiApiKey,
    opts.openrouterApiKey,
    opts.aiGatewayApiKey,
    opts.cloudflareAiGatewayApiKey,
    opts.moonshotApiKey,
    opts.kimiCodeApiKey,
    opts.geminiApiKey,
    opts.zaiApiKey,
    opts.xiaomiApiKey,
    opts.minimaxApiKey,
    opts.syntheticApiKey,
    opts.veniceApiKey,
    opts.opencodeZenApiKey,
    opts.xaiApiKey,
    opts.qianfanApiKey,
  ]) {
    if (v) apiKeyPool.push(v);
  }

  let textCallIdx = 0;
  return {
    intro: async () => {},
    outro: async () => {},
    note: async () => {},
    select: async <T>({ options }: { options: Array<{ value: T }> }) => options[0].value,
    multiselect: async () => [],
    text: async (params?: { placeholder?: string }) => {
      if (apiKeyPool.length > 0) {
        return apiKeyPool[textCallIdx++ % apiKeyPool.length];
      }
      if (params?.placeholder) return params.placeholder;
      if (opts.tokenProfileId) return opts.tokenProfileId;
      return "default";
    },
    confirm: async () => true,
    progress: () => ({ update: () => {}, stop: () => {} }),
  } as WizardPrompter;
}

export async function applyNonInteractiveAuthChoice(params: {
  nextConfig: KolbBotConfig;
  authChoice: AuthChoice;
  opts: OnboardOptions;
  runtime: RuntimeEnv;
  baseConfig: KolbBotConfig;
}): Promise<KolbBotConfig | undefined> {
  const { authChoice, opts, runtime } = params;

  if (authChoice === "skip") {
    return params.nextConfig;
  }

  if (authChoice === "token" && opts.token && opts.tokenProvider) {
    const { upsertAuthProfile } = await import("../../../agents/auth-profiles.js");
    const { applyAuthProfileConfig } = await import("../../onboard-auth.js");

    const profileId = opts.tokenProfileId ?? `${opts.tokenProvider}:default`;
    upsertAuthProfile({
      profileId,
      credential: {
        type: "token",
        provider: opts.tokenProvider,
        token: opts.token,
      },
    });
    return applyAuthProfileConfig(params.nextConfig, {
      profileId,
      provider: opts.tokenProvider,
      mode: "token",
    });
  }

  const prompter = buildNonInteractivePrompter(opts);

  const applyOpts: {
    tokenProvider?: string;
    token?: string;
    cloudflareAiGatewayAccountId?: string;
    cloudflareAiGatewayGatewayId?: string;
    cloudflareAiGatewayApiKey?: string;
    xaiApiKey?: string;
  } = {
    tokenProvider: opts.tokenProvider,
    token: opts.token,
    cloudflareAiGatewayAccountId: opts.cloudflareAiGatewayAccountId,
    cloudflareAiGatewayGatewayId: opts.cloudflareAiGatewayGatewayId,
    cloudflareAiGatewayApiKey: opts.cloudflareAiGatewayApiKey,
    xaiApiKey: opts.xaiApiKey,
  };

  if (!applyOpts.token) {
    if (authChoice === "openai-api-key" && opts.openaiApiKey) {
      applyOpts.token = opts.openaiApiKey;
      applyOpts.tokenProvider = "openai";
    } else if (authChoice === "ai-gateway-api-key" && opts.aiGatewayApiKey) {
      applyOpts.token = opts.aiGatewayApiKey;
      applyOpts.tokenProvider = "vercel-ai-gateway";
    } else if (authChoice === "openrouter-api-key" && opts.openrouterApiKey) {
      applyOpts.token = opts.openrouterApiKey;
      applyOpts.tokenProvider = "openrouter";
    } else if (authChoice === "moonshot-api-key" && opts.moonshotApiKey) {
      applyOpts.token = opts.moonshotApiKey;
      applyOpts.tokenProvider = "moonshot";
    } else if (authChoice === "gemini-api-key" && opts.geminiApiKey) {
      applyOpts.token = opts.geminiApiKey;
      applyOpts.tokenProvider = "google";
    } else if (authChoice === "zai-api-key" && opts.zaiApiKey) {
      applyOpts.token = opts.zaiApiKey;
      applyOpts.tokenProvider = "zai";
    } else if (authChoice === "xiaomi-api-key" && opts.xiaomiApiKey) {
      applyOpts.token = opts.xiaomiApiKey;
      applyOpts.tokenProvider = "xiaomi";
    } else if (authChoice === "synthetic-api-key" && opts.syntheticApiKey) {
      applyOpts.token = opts.syntheticApiKey;
      applyOpts.tokenProvider = "synthetic";
    } else if (authChoice === "venice-api-key" && opts.veniceApiKey) {
      applyOpts.token = opts.veniceApiKey;
      applyOpts.tokenProvider = "venice";
    } else if (authChoice === "qianfan-api-key" && opts.qianfanApiKey) {
      applyOpts.token = opts.qianfanApiKey;
      applyOpts.tokenProvider = "qianfan";
    }
  }

  const result = await applyAuthChoice({
    authChoice,
    config: params.nextConfig,
    prompter,
    runtime: runtime as RuntimeEnv,
    setDefaultModel: true,
    opts: applyOpts,
  });

  return result.config;
}
