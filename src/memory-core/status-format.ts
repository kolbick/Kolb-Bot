import type { MemoryCacheStatus, MemoryFtsStatus, MemoryVectorStatus } from "./types.js";

export type Tone = "ok" | "warn" | "muted";

export function resolveMemoryVectorState(vector: MemoryVectorStatus): {
  state: string;
  tone: Tone;
} {
  if (!vector.enabled) {
    return { state: "disabled", tone: "muted" };
  }
  if (vector.loadError) {
    return { state: "error", tone: "warn" };
  }
  if (vector.available === false) {
    return { state: "unavailable", tone: "warn" };
  }
  return { state: "ready", tone: "ok" };
}

export function resolveMemoryFtsState(fts: MemoryFtsStatus): { state: string; tone: Tone } {
  if (!fts.enabled) {
    return { state: "disabled", tone: "muted" };
  }
  if (fts.available === false) {
    return { state: "unavailable", tone: "warn" };
  }
  return { state: "ready", tone: "ok" };
}

export function resolveMemoryCacheSummary(cache: MemoryCacheStatus): { text: string; tone: Tone } {
  if (!cache.enabled) {
    return { text: "cache off", tone: "muted" };
  }
  const max = cache.maxEntries != null ? `/${cache.maxEntries}` : "";
  return { text: `cache ${cache.entries ?? 0}${max}`, tone: "ok" };
}
