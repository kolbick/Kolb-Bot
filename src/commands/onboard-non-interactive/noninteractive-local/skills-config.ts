import type { KolbBotConfig } from "../../../config/config.js";
import type { RuntimeEnv } from "../../../runtime.js";
import type { OnboardOptions } from "../../onboard-types.js";

export function applyNonInteractiveSkillsConfig(params: {
  nextConfig: KolbBotConfig;
  opts: OnboardOptions;
  runtime: RuntimeEnv;
}): KolbBotConfig {
  return {
    ...params.nextConfig,
    agents: {
      ...params.nextConfig.agents,
      defaults: {
        ...params.nextConfig.agents?.defaults,
        // Non-interactive onboarding should stay deterministic and avoid template bootstrap prompts.
        skipBootstrap: true,
      },
    },
  };
}
