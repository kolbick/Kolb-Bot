import type { KolbBotConfig } from "../config/config.js";

export function resolveMemoryBackendConfig(params: { cfg: KolbBotConfig; agentId: string }) {
  void params.agentId;
  const backend = params.cfg.memory?.backend ?? "builtin";
  return {
    backend,
    qmd: {
      limits: {
        maxInjectedChars: params.cfg.memory?.qmd?.limits?.maxInjectedChars,
      },
    },
  };
}
