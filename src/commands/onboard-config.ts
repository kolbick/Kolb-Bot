import type { KolbBotConfig } from "../config/config.js";

export function applyOnboardingLocalWorkspaceConfig(
  baseConfig: KolbBotConfig,
  workspaceDir: string,
): KolbBotConfig {
  return {
    ...baseConfig,
    agents: {
      ...baseConfig.agents,
      defaults: {
        ...baseConfig.agents?.defaults,
        workspace: workspaceDir,
      },
    },
    gateway: {
      ...baseConfig.gateway,
      mode: "local",
    },
  };
}
