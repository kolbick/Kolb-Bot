import type { KolbBotConfig } from "../../../config/config.js";
import type { RuntimeEnv } from "../../../runtime.js";
import type { OnboardOptions } from "../../onboard-types.js";

export function applyNonInteractiveSkillsConfig(params: {
  nextConfig: KolbBotConfig;
  opts: OnboardOptions;
  runtime: RuntimeEnv;
}): KolbBotConfig {
  if (params.opts.skipSkills) {
    params.runtime.log("Skipping skills setup (--skip-skills).");
  }
  return params.nextConfig;
}
