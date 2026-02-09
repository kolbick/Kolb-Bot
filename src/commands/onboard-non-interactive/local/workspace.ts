import type { KolbBotConfig } from "../../../config/config.js";
import type { OnboardOptions } from "../../onboard-types.js";

export function resolveNonInteractiveWorkspaceDir(params: {
  opts: OnboardOptions;
  baseConfig: KolbBotConfig;
  defaultWorkspaceDir: string;
}): string {
  if (params.opts.workspace) {
    return params.opts.workspace;
  }
  const existing = params.baseConfig.agents?.defaults?.workspace;
  if (existing) {
    return existing;
  }
  return params.defaultWorkspaceDir;
}
