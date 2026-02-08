import type { KolbBotConfig } from "../../../config/config.js";
import type { RuntimeEnv } from "../../../runtime.js";
import type { AuthChoice, OnboardOptions } from "../../onboard-types.js";
import { upsertAuthProfile } from "../../../agents/auth-profiles.js";
import { upsertSharedEnvVar } from "../../../infra/env-file.js";
import {
  applyAuthProfileConfig,
  setCloudflareAiGatewayConfig,
  setVercelAiGatewayApiKey,
  setXaiApiKey,
  XAI_DEFAULT_MODEL_REF,
  VERCEL_AI_GATEWAY_DEFAULT_MODEL_REF,
  CLOUDFLARE_AI_GATEWAY_DEFAULT_MODEL_REF,
} from "../../onboard-auth.js";
import { OPENAI_DEFAULT_MODEL } from "../../openai-model-default.js";

function setPrimaryModel(cfg: KolbBotConfig, model: string): KolbBotConfig {
  return {
    ...cfg,
    agents: {
      ...cfg.agents,
      defaults: {
        ...cfg.agents?.defaults,
        model: {
          ...(cfg.agents?.defaults?.model ?? {}),
          primary: model,
        },
      },
    },
  };
}

export async function applyNonInteractiveAuthChoice(params: {
  nextConfig: KolbBotConfig;
  authChoice: AuthChoice;
  opts: OnboardOptions;
  runtime: RuntimeEnv;
  baseConfig: KolbBotConfig;
}): Promise<KolbBotConfig | null> {
  void params.runtime;
  void params.baseConfig;
  if (params.authChoice === "skip") {
    return params.nextConfig;
  }

  if (params.authChoice === "token") {
    const provider = params.opts.tokenProvider?.trim() || "anthropic";
    const token = params.opts.token?.trim();
    if (!token) {
      throw new Error("Missing --token for --auth-choice token.");
    }
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

  if (params.authChoice === "openai-api-key") {
    const key = params.opts.openaiApiKey?.trim() ?? params.opts.token?.trim();
    if (!key) {
      throw new Error("Missing --openai-api-key.");
    }
    upsertSharedEnvVar({ key: "OPENAI_API_KEY", value: key });
    process.env.OPENAI_API_KEY = key;
    return setPrimaryModel(
      applyAuthProfileConfig(params.nextConfig, {
        profileId: "openai:default",
        provider: "openai",
        mode: "api_key",
      }),
      OPENAI_DEFAULT_MODEL,
    );
  }

  if (params.authChoice === "xai-api-key") {
    const key = params.opts.xaiApiKey?.trim();
    if (!key) {
      throw new Error("Missing --xai-api-key.");
    }
    setXaiApiKey(key);
    return setPrimaryModel(
      applyAuthProfileConfig(params.nextConfig, {
        profileId: "xai:default",
        provider: "xai",
        mode: "api_key",
      }),
      XAI_DEFAULT_MODEL_REF,
    );
  }

  if (params.authChoice === "ai-gateway-api-key") {
    const key = params.opts.aiGatewayApiKey?.trim();
    if (!key) {
      throw new Error("Missing --ai-gateway-api-key.");
    }
    await setVercelAiGatewayApiKey(key);
    return setPrimaryModel(
      applyAuthProfileConfig(params.nextConfig, {
        profileId: "vercel-ai-gateway:default",
        provider: "vercel-ai-gateway",
        mode: "api_key",
      }),
      VERCEL_AI_GATEWAY_DEFAULT_MODEL_REF,
    );
  }

  if (params.authChoice === "cloudflare-ai-gateway-api-key") {
    const accountId = params.opts.cloudflareAiGatewayAccountId?.trim();
    const gatewayId = params.opts.cloudflareAiGatewayGatewayId?.trim();
    const apiKey = params.opts.cloudflareAiGatewayApiKey?.trim();
    if (!accountId || !gatewayId || !apiKey) {
      throw new Error(
        "Missing Cloudflare settings (--cloudflare-ai-gateway-account-id, --cloudflare-ai-gateway-gateway-id, --cloudflare-ai-gateway-api-key).",
      );
    }
    await setCloudflareAiGatewayConfig(accountId, gatewayId, apiKey);
    return setPrimaryModel(
      applyAuthProfileConfig(params.nextConfig, {
        profileId: "cloudflare-ai-gateway:default",
        provider: "cloudflare-ai-gateway",
        mode: "api_key",
      }),
      CLOUDFLARE_AI_GATEWAY_DEFAULT_MODEL_REF,
    );
  }

  return params.nextConfig;
}
