import type { KolbBotConfig } from "./config.js";

export function ensurePluginAllowlisted(cfg: KolbBotConfig, pluginId: string): KolbBotConfig {
  const allow = cfg.plugins?.allow;
  if (!Array.isArray(allow) || allow.includes(pluginId)) {
    return cfg;
  }
  return {
    ...cfg,
    plugins: {
      ...cfg.plugins,
      allow: [...allow, pluginId],
    },
  };
}
