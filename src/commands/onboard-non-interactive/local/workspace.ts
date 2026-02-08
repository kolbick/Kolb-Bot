import type { KolbBotConfig } from "../../../config/config.js";
import { resolveUserPath } from "../../../utils.js";

export function resolveNonInteractiveWorkspaceDir(params: {
  opts: { workspace?: string };
  baseConfig: KolbBotConfig;
  defaultWorkspaceDir: string;
}): string {
  const explicit = params.opts.workspace?.trim();
  if (explicit) {
    return resolveUserPath(explicit);
  }
  const configured = params.baseConfig.agents?.defaults?.workspace?.trim();
  if (configured) {
    return resolveUserPath(configured);
  }
  return resolveUserPath(params.defaultWorkspaceDir);
}
