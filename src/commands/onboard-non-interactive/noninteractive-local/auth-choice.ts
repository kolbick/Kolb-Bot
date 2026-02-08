import type { KolbBotConfig } from "../../../config/config.js";
import type { RuntimeEnv } from "../../../runtime.js";
import type { AuthChoice, OnboardOptions } from "../../onboard-types.js";

export async function applyNonInteractiveAuthChoice(params: {
  nextConfig: KolbBotConfig;
  authChoice: AuthChoice;
  opts: OnboardOptions;
  runtime: RuntimeEnv;
  baseConfig: KolbBotConfig;
}): Promise<KolbBotConfig | null> {
  return params.nextConfig;
}
