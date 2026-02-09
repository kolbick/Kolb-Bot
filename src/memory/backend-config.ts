import type { KolbBotConfig } from "../config/config.js";

export type ResolvedMemoryBackendConfig = {
  backend?: "builtin" | "qmd";
  qmd?: {
    limits?: {
      maxInjectedChars?: number;
      maxSnippetChars?: number;
      maxResults?: number;
      timeoutMs?: number;
    };
  };
};

export function resolveMemoryBackendConfig(params: {
  cfg: KolbBotConfig;
  agentId: string;
}): ResolvedMemoryBackendConfig {
  const memory = (params.cfg as Record<string, unknown>).memory as
    | { backend?: string; qmd?: { limits?: Record<string, number> } }
    | undefined;
  const backend = (memory?.backend === "qmd" ? "qmd" : "builtin") as "builtin" | "qmd";
  return {
    backend,
    qmd: memory?.qmd
      ? {
          limits: memory.qmd.limits
            ? {
                maxInjectedChars: memory.qmd.limits.maxInjectedChars,
                maxSnippetChars: memory.qmd.limits.maxSnippetChars,
                maxResults: memory.qmd.limits.maxResults,
                timeoutMs: memory.qmd.limits.timeoutMs,
              }
            : undefined,
        }
      : undefined,
  };
}
