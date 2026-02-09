import type { KolbBotConfig } from "../../../config/config.js";
import type { RuntimeEnv } from "../../../runtime.js";
import type { WizardPrompter } from "../../../wizard/prompts.js";
import type { AuthChoice, OnboardOptions } from "../../onboard-types.js";
import { upsertAuthProfile } from "../../../agents/auth-profiles.js";
import { applyAuthChoice } from "../../auth-choice.js";
import { applyAuthProfileConfig } from "../../onboard-auth.js";

function createNonInteractivePrompter(): WizardPrompter {
  return {
    intro: async () => {},
    outro: async () => {},
    note: async () => {},
    select: async <T>(params: { options: Array<{ value: T }> }) => {
      const first = params.options[0];
      if (!first) {
        throw new Error("No select options available in non-interactive mode");
      }
      return first.value;
    },
    multiselect: async <T>() => [] as T[],
    text: async (params) => params.initialValue ?? "",
    confirm: async (params) => params.initialValue ?? true,
    progress: () => ({
      update: () => {},
      stop: () => {},
    }),
  };
}

export async function applyNonInteractiveAuthChoice(params: {
  nextConfig: KolbBotConfig;
  authChoice: AuthChoice;
  opts: OnboardOptions;
  runtime: RuntimeEnv;
  baseConfig: KolbBotConfig;
}): Promise<KolbBotConfig | null> {
  if (params.authChoice === "skip") {
    return params.nextConfig;
  }

  if (params.authChoice === "token") {
    const provider = params.opts.tokenProvider?.trim() || "anthropic";
    const token = params.opts.token?.trim() || "";
    const profileId = params.opts.tokenProfileId?.trim() || `${provider}:default`;
    upsertAuthProfile({
      profileId,
      credential: { type: "token", provider, token },
    });
    return applyAuthProfileConfig(params.nextConfig, {
      profileId,
      provider,
      mode: "token",
    });
  }

  const derivedTokenProvider =
    params.authChoice === "ai-gateway-api-key" ? "vercel-ai-gateway" : params.opts.tokenProvider;
  const derivedToken =
    params.authChoice === "ai-gateway-api-key" ? params.opts.aiGatewayApiKey : params.opts.token;

  const result = await applyAuthChoice({
    authChoice: params.authChoice,
    config: params.nextConfig,
    runtime: params.runtime,
    prompter: createNonInteractivePrompter(),
    setDefaultModel: true,
    opts: {
      tokenProvider: derivedTokenProvider,
      token: derivedToken,
      cloudflareAiGatewayAccountId: params.opts.cloudflareAiGatewayAccountId,
      cloudflareAiGatewayGatewayId: params.opts.cloudflareAiGatewayGatewayId,
      cloudflareAiGatewayApiKey: params.opts.cloudflareAiGatewayApiKey,
      xaiApiKey: params.opts.xaiApiKey,
    },
  });
  return result.config;
}
