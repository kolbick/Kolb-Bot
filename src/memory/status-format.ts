export type Tone = "ok" | "warn" | "muted";

export function resolveMemoryVectorState(vector: {
  enabled: boolean;
  available?: boolean;
  loadError?: string;
}) {
  if (!vector.enabled) {
    return { state: "disabled" as const, tone: "muted" as Tone };
  }
  if (vector.available) {
    return { state: "ready" as const, tone: "ok" as Tone };
  }
  return { state: "unavailable" as const, tone: vector.loadError ? "warn" : ("muted" as Tone) };
}

export function resolveMemoryFtsState(fts: {
  enabled: boolean;
  available?: boolean;
  loadError?: string;
}) {
  if (!fts.enabled) {
    return { state: "disabled" as const, tone: "muted" as Tone };
  }
  if (fts.available) {
    return { state: "ready" as const, tone: "ok" as Tone };
  }
  return { state: "unavailable" as const, tone: fts.loadError ? "warn" : ("muted" as Tone) };
}

export function resolveMemoryCacheSummary(cache: {
  enabled: boolean;
  entries?: number;
  maxEntries?: number;
}) {
  if (!cache.enabled) {
    return { text: "cache off", tone: "muted" as Tone };
  }
  const entries = cache.entries ?? 0;
  const cap = cache.maxEntries ? `/${cache.maxEntries}` : "";
  return { text: `cache ${entries}${cap}`, tone: "ok" as Tone };
}
