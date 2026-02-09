import type { KolbBotConfig } from "../config/config.js";
import type { MemorySearchResult, MemoryProviderStatus } from "./types.js";

export type { MemorySearchResult } from "./types.js";

export interface MemorySearchManager {
  search(
    query: string,
    options?: {
      maxResults?: number;
      minScore?: number;
      sessionKey?: string;
    },
  ): Promise<MemorySearchResult[]>;

  readFile(params: { relPath: string; from?: number; lines?: number }): Promise<{
    path: string;
    text: string;
  }>;

  status(): MemoryProviderStatus;

  sync?(params: {
    reason: string;
    force: boolean;
    progress?: (update: { completed: number; total: number; label?: string }) => void;
  }): Promise<void>;

  probeVectorAvailability(): Promise<boolean>;

  probeEmbeddingAvailability?(): Promise<{
    ok: boolean;
    error?: string;
  }>;

  close?(): Promise<void>;
}

export type MemorySearchManagerResult = {
  manager?: MemorySearchManager;
  error?: string;
};

export async function getMemorySearchManager(_params: {
  cfg: KolbBotConfig;
  agentId: string;
}): Promise<MemorySearchManagerResult> {
  return { error: "Memory module not configured" };
}
