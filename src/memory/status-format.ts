import type { MemoryProviderStatus } from "./types.js";

export type Tone = "ok" | "warn" | "muted";

export function resolveMemoryVectorState(vector: NonNullable<MemoryProviderStatus["vector"]>): {
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
  return { state: "ok", tone: "ok" };
}

export function resolveMemoryFtsState(fts: NonNullable<MemoryProviderStatus["fts"]>): {
  state: string;
  tone: Tone;
} {
  if (!fts.enabled) {
    return { state: "disabled", tone: "muted" };
  }
  if (fts.error) {
    return { state: "error", tone: "warn" };
  }
  if (fts.available === false) {
    return { state: "unavailable", tone: "warn" };
  }
  return { state: "ok", tone: "ok" };
}

export function resolveMemoryCacheSummary(cache: NonNullable<MemoryProviderStatus["cache"]>): {
  text: string;
  tone: Tone;
} {
  if (!cache.enabled) {
    return { text: "cache off", tone: "muted" };
  }
  const entries = cache.entries ?? 0;
  const max = cache.maxEntries ?? 0;
  return {
    text: max > 0 ? `cache ${entries}/${max}` : `cache ${entries}`,
    tone: "ok",
  };
}
