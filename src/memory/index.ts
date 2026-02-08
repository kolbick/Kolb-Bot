import type { KolbBotConfig } from "../config/config.js";
import type { MemorySearchManagerResult } from "./types.js";
import { resolveMemorySearchConfig } from "../agents/memory-search.js";
import { MemoryIndexManager } from "./manager.js";

export type { MemorySearchManagerResult } from "./types.js";

export async function getMemorySearchManager(params: {
  cfg: KolbBotConfig;
  agentId: string;
}): Promise<MemorySearchManagerResult> {
  const resolved = resolveMemorySearchConfig(params.cfg, params.agentId);
  if (!resolved?.enabled) {
    return { manager: null, error: "memory search disabled" };
  }
  try {
    const manager = await MemoryIndexManager.get(params);
    return { manager };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { manager: null, error: message };
  }
}
