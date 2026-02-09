import type { KolbBotConfig } from "../../../config/config.js";
import type { OnboardOptions } from "../../onboard-types.js";

export function resolveNonInteractiveWorkspaceDir(params: {
  opts: OnboardOptions;
  baseConfig: KolbBotConfig;
  defaultWorkspaceDir: string;
}): string {
  return (
    params.opts.workspace ??
    params.baseConfig.agents?.defaults?.workspace ??
    params.defaultWorkspaceDir
  );
}
