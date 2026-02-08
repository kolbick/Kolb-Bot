import type { KolbBotConfig } from "../config/config.js";

export function resolveMemoryBackendConfig(params: { cfg: KolbBotConfig; agentId: string }) {
  const maxInjectedChars = params.cfg.memory?.qmd?.limits?.maxInjectedChars;
  return {
    qmd: {
      limits: {
        maxInjectedChars,
      },
    },
  } as const;
}
