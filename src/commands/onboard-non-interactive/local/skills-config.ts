import type { KolbBotConfig } from "../../../config/config.js";
import type { OnboardOptions } from "../../onboard-types.js";

export function applyNonInteractiveSkillsConfig(params: {
  nextConfig: KolbBotConfig;
  opts: OnboardOptions;
  runtime: unknown;
}): KolbBotConfig {
  return params.nextConfig;
}
